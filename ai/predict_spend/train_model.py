# -*- coding: utf-8 -*-

import pandas as pd
import os
import joblib
from sklearn.linear_model import LinearRegression
import numpy as np
import pymysql.connections # MySQL 연결 라이브러리
import dotenv # 환경 변수 로딩 라이브러리

# .env 파일에서 환경 변수 로드
dotenv.load_dotenv()

MIN_DATA_POINTS = 2

# --- DB 연결 설정 ---
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

def get_db_connection():
    """데이터베이스 연결 객체를 반환합니다."""
    try:
        conn = pymysql.connections.Connection(**DB_CONFIG)
        print("데이터베이스 연결 성공.")
        return conn
    except pymysql.err.OperationalError as e:
        print(f"데이터베이스 연결 실패: {e}")
        print("환경 변수(.env 파일 또는 시스템 환경 변수) 및 DB 설정 확인이 필요합니다.")
        return None

def load_and_prepare_spending_data(conn):
    """
    DB에서 지출 데이터를 읽어와 예측 학습에 필요한 형태로 가공합니다.

    Args:
        conn: PyMySQL 데이터베이스 연결 객체.

    Returns:
        pd.DataFrame or None: 가공된 데이터프레임 또는 오류 발생 시 None.
    """
    print("--- 데이터베이스에서 지출 데이터 로딩 및 준비 ---")
    if conn is None:
        return None

    try:
        # --- 1. 원본 데이터 로딩 ---
        # expenses 테이블 데이터 로딩
        expenses_sql = "SELECT user_id, spent_at, category, amount FROM expenses"
        expenses_df = pd.read_sql(expenses_sql, conn)
        print(f"expenses 데이터 로드 완료: {len(expenses_df)} 건")

        # fixed_expenses 테이블 데이터 로딩
        fixed_expenses_sql = "SELECT user_id, year_month, category, amount FROM fixed_expenses"
        fixed_expenses_df = pd.read_sql(fixed_expenses_sql, conn)
        print(f"fixed_expenses 데이터 로드 완료: {len(fixed_expenses_df)} 건")

        # --- 2. 데이터 가공 및 집계 ---
        # expenses 데이터에 year_month 컬럼 추가
        if not expenses_df.empty:
             expenses_df['year_month'] = pd.to_datetime(expenses_df['spent_at']).dt.strftime('%Y-%m')
             # 필요한 컬럼만 선택 및 원본 카테고리 저장
             expenses_processed = expenses_df[['user_id', 'year_month', 'category', 'amount']].copy()
             expenses_processed['source'] = 'expense' # 출처 구분 컬럼 추가
        else:
             expenses_processed = pd.DataFrame(columns=['user_id', 'year_month', 'category', 'amount', 'source'])


        if not fixed_expenses_df.empty:
             # 필요한 컬럼만 선택 및 원본 카테고리 저장
             fixed_expenses_processed = fixed_expenses_df[['user_id', 'year_month', 'category', 'amount']].copy()
             fixed_expenses_processed['source'] = 'fixed' # 출처 구분 컬럼 추가
        else:
             fixed_expenses_processed = pd.DataFrame(columns=['user_id', 'year_month', 'category', 'amount', 'source'])

        # 두 데이터를 합치기
        combined_df = pd.concat([expenses_processed, fixed_expenses_processed], ignore_index=True)

        if combined_df.empty:
            print("경고: 로드된 지출 데이터가 없습니다.")
            return pd.DataFrame(columns=['user_id', 'year_month', 'year_month_index'] + CATEGORIES_TO_PREDICT)


        # 카테고리 명칭 통일 또는 구분 (예: '기타' 처리)
        # 예시: '기타' 카테고리가 expenses와 fixed_expenses에서 의미가 다르다면 이름을 변경
        # 여기서는 간단히 원본 category 컬럼을 그대로 사용하고, 피벗 테이블이 알아서 컬럼을 만들도록 합니다.
        # 만약 '기타' 구분이 필요하다면, 이 부분에서 combined_df['category'] 값을 '기타_일반', '기타_고정' 등으로 변경해야 합니다.
        # combined_df['category'] = combined_df.apply(
        #     lambda row: f"{row['category']}_fixed" if row['category'] == '기타' and row['source'] == 'fixed'
        #     else f"{row['category']}_expense" if row['category'] == '기타' and row['source'] == 'expense'
        #     else row['category'], axis=1
        # )
        # CATEGORIES_TO_PREDICT 리스트도 이에 맞춰 업데이트 필요.

        # user_id, year_month, category 별로 amount 합계
        monthly_agg = combined_df.groupby(['user_id', 'year_month', 'category'])['amount'].sum().reset_index()

        # 카테고리 컬럼을 피벗 (가로로 펼치기)
        pivot_df = monthly_agg.pivot_table(
            index=['user_id', 'year_month'],
            columns='category',
            values='amount',
            fill_value=0 # 지출이 없는 월/카테고리는 0으로 채움
        ).reset_index()

        # --- 3. 시간 인덱스 생성 ---
        # user_id와 year_month 기준으로 정렬하여 시간 순서 확보
        pivot_df['year_month_dt'] = pd.to_datetime(pivot_df['year_month'])
        pivot_df = pivot_df.sort_values(by=['user_id', 'year_month_dt']).copy()

        # 각 사용자 내에서 월별 순서(0부터 시작)를 나타내는 year_month_index 생성
        pivot_df['year_month_index'] = pivot_df.groupby('user_id').cumcount()

        # 예측에 사용할 최종 데이터프레임 준비
        # 필요한 컬럼만 선택: user_id, year_month_index, 그리고 카테고리 컬럼들
        # CATEGORIES_TO_PREDICT에 정의된 컬럼만 선택하되, 데이터에 실제 있는 컬럼만 포함
        actual_category_cols = [col for col in CATEGORIES_TO_PREDICT if col in pivot_df.columns]
        df_for_training = pivot_df[['user_id', 'year_month_index'] + actual_category_cols]

        print("데이터 로드 및 준비 완료.")
        # print(df_for_training.head()) # 디버깅 시 주석 해제

        return df_for_training

    except Exception as e:
        print(f"데이터 로딩 및 준비 중 오류 발생: {e}")
        return None
    finally:
        if conn:
            conn.close()
            print("데이터베이스 연결 해제.")


# 파일 이름에 안전하지 않은 문자를 대체하는 헬퍼 함수
def safe_filename(name: str) -> str:
    """파일 이름에 사용 불가능한 문자를 대체합니다."""
    # Windows 및 Unix에서 안전하지 않은 문자들 포함
    unsafe_chars = '/\\:*?"<>|'
    safe_name = name
    for char in unsafe_chars:
        safe_name = safe_name.replace(char, '_')
    return safe_name

def train_and_save_models():
    """
    데이터베이스에서 집계된 지출 데이터를 읽어 각 사용자별, 카테고리별 예측 모델을 학습하고 저장합니다.
    """
    conn = get_db_connection()
    if conn is None:
        print("DB 연결 실패로 모델 학습을 시작할 수 없습니다.")
        return

    df_for_training = load_and_prepare_spending_data(conn)

    if df_for_training is None or df_for_training.empty:
        print("학습할 데이터가 없습니다. 모델 학습을 건너뜍니다.")
        return

    print("\n--- 모델 학습 시작 ---")

    # 모델 저장 디렉토리 생성
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        print(f"모델 저장 디렉토리 생성: {MODEL_DIR}")

    user_ids = df_for_training['user_id'].unique()
    print(f"총 {len(user_ids)} 명의 사용자에 대해 모델 학습 시작.")

    trained_model_count = 0
    skipped_user_categories = []

    # 학습 데이터프레임의 실제 컬럼 이름 가져오기 (데이터 준비 단계에서 결정됨)
    actual_category_cols = [col for col in df_for_training.columns if col not in ['user_id', 'year_month_index']]
    print(f"데이터에서 찾은 카테고리 컬럼: {actual_category_cols}")


    for user_id in user_ids:
        user_df = df_for_training[df_for_training['user_id'] == user_id].copy()
        # print(f"\n사용자 {user_id} 모델 학습 중...") # 디버깅 시 주석 해제

        for category in actual_category_cols: # 실제 데이터에 있는 카테고리 컬럼들 순회
            # 파일 이름에 안전한 카테고리 이름 생성
            safe_category = safe_filename(category)

            # 해당 사용자의 해당 카테고리 지출 시계열 데이터 추출
            # year_month_index를 X로, 지출 금액을 y로 사용
            X_train = user_df[['year_month_index']] # scikit-learn 입력은 2차원
            y_train = user_df[category]

            # NaN 값 제거 (데이터 준비에서 fill_value=0 했으므로 필요 없을 수도 있습니다)
            valid_indices = y_train.dropna().index
            X_train_valid = X_train.loc[valid_indices]
            y_train_valid = y_train.loc[valid_indices]

            if len(y_train_valid) < MIN_DATA_POINTS:
                skipped_user_categories.append(f"User {user_id}, Category '{category}' (데이터 포인트 부족: {len(y_train_valid)}개)")
                continue # 모델 저장 스킵

            try:
                # 선형 회귀 모델 학습
                model = LinearRegression()
                model.fit(X_train_valid, y_train_valid)

                # 학습에 사용된 데이터 포인트 수 저장 (예측 시 다음 인덱스 계산에 필요)
                num_data_points = len(y_train_valid)

                # 모델과 데이터 포인트 수를 함께 저장
                model_filename = f'user_{user_id}_category_{safe_category}_model.pkl' # 안전한 이름 사용
                model_filepath = os.path.join(MODEL_DIR, model_filename)
                joblib.dump((model, num_data_points), model_filepath)
                # print(f"  - '{category}': 모델 저장 완료 ({model_filename})") # 디버깅 시 주석 해제
                trained_model_count += 1

            except Exception as e:
                 skipped_user_categories.append(f"User {user_id}, Category '{category}' (학습 오류: {e})")


    print("\n--- 학습 요약 ---")
    print(f"총 학습된 모델 수: {trained_model_count} 개")
    if skipped_user_categories:
        print(f"모델 학습 건너뛰거나 오류 발생한 경우 ({len(skipped_user_categories)}건):")
        for item in skipped_user_categories:
            print(f"  - {item}")

    print(f"학습된 모델은 '{MODEL_DIR}' 폴더에 저장되었습니다.")


# --- 예측 함수 ---

def predict_spending(user_id: int, category: str, model_dir: str = MODEL_DIR):
    """
    저장된 모델을 사용하여 특정 사용자의 특정 카테고리 다음 지출 금액을 예측합니다.

    Args:
        user_id (int): 예측할 사용자 ID (숫자).
        category (str): 예측할 카테고리 이름.
        model_dir (str): 모델 파일이 저장된 디렉토리 경로.

    Returns:
        int or None: 예측된 지출 금액 (정수) 또는 예측 불가능 시 None.
    """
    # 파일 이름에 안전한 카테고리 이름 생성 (저장할 때와 동일한 로직 사용)
    safe_category = safe_filename(category)
    model_filename = f'user_{user_id}_category_{safe_category}_model.pkl' # 안전한 이름 사용
    model_filepath = os.path.join(model_dir, model_filename)

    if not os.path.exists(model_filepath):
        # print(f"정보: 사용자 {user_id}, 카테고리 '{category}'에 대한 모델 파일이 없습니다: {model_filepath}")
        # 모델이 없다는 것은 학습 데이터가 부족했거나 해당 카테고리에 지출이 거의 없었을 수 있습니다.
        return None # 예측 불가능

    try:
        # 모델과 학습에 사용된 데이터 포인트 수 로드
        model, num_data_points = joblib.load(model_filepath)

        if num_data_points < MIN_DATA_POINTS:
            # print(f"경고: 로드된 모델의 데이터 포인트({num_data_points})가 최소 학습 기준({MIN_DATA_POINTS}) 미달입니다. 예측 신뢰성이 낮습니다.")
            return None # 데이터 부족으로 예측 불가능

        # 다음 시점의 year_month_index는 학습에 사용된 데이터 포인트 수와 같습니다.
        next_index = num_data_points

        # 예측 수행
        predicted_amount = model.predict([[next_index]])[0]

        # 예측 결과가 음수일 경우 0 또는 작은 양수로 처리 (지출이 음수일 수는 없으므로)
        predicted_amount = max(0, int(predicted_amount))

        return predicted_amount

    except Exception as e:
        print(f"예측 중 오류 발생: 사용자 {user_id}, 카테고리 '{category}': {e}")
        return None

# --- 스크립트 직접 실행 및 테스트 ---
if __name__ == "__main__":
    # 스크립트 실행 시 모델 학습 및 테스트 예측 수행

    print("--- 지출 예측 스크립트 (DB 연동) 실행 ---")
    print(f"모델 저장 경로: {MODEL_DIR}")

    # 1. 모델 학습 실행 (DB에서 데이터 로딩)
    # .env 파일에 DB 설정이 되어 있어야 합니다.
    train_and_save_models()

    # 2. 학습된 모델을 이용한 예측 테스트
    print("\n--- 예측 테스트 시작 ---")

    # 테스트할 사용자 ID (DB에 실제 존재하는 user_id 값 사용) 및 카테고리 (CATEGORIES_TO_PREDICT 리스트에 있는 이름 사용)
    # 예시에서는 user_id 1, 2, 3이 있다고 가정합니다.
    test_cases = [
        {'user_id': 1, 'category': '식비'},
        {'user_id': 1, 'category': '교통'},
        {'user_id': 2, 'category': '술/유흥'}, # 데이터에 따라 학습되지 않았을 수 있음
        {'user_id': 3, 'category': '주거'},
        {'user_id': 3, 'category': '여행'}, # 데이터에 따라 학습되지 않았을 수 있음
        {'user_id': 1, 'category': '없는카테고리'} # 존재하지 않는 카테고리 테스트
    ]

    for case in test_cases:
        user_id = case['user_id']
        category = case['category']

        print(f"\n사용자 ID {user_id}의 '{category}' 다음 지출 예측:")
        predicted_value = predict_spending(user_id, category, MODEL_DIR)

        if predicted_value is not None:
            print(f"  예측 금액: {predicted_value} 원")
        else:
            print(f"  '{category}'에 대한 예측 모델이 없거나 예측에 실패했습니다. (데이터 부족 가능성)")


    print("\n--- 예측 테스트 완료 ---")
