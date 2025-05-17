import pandas as pd
import os
import joblib
from sklearn.linear_model import LinearRegression
import numpy as np

# 설정
DATA_FILE_PATH = '../data/aggregated_spending_data.csv' # 학습 데이터 파일 경로
MODEL_DIR = '../model' # 학습된 모델을 저장할 디렉토리
CATEGORIES_TO_PREDICT = ['식비', '교통', '생활', '쇼핑', '기타', '전기세', '가스비', '관리비'] # 예측할 지출 카테고리 목록
MIN_DATA_POINTS = 2 # 모델 학습을 위한 최소 데이터 포인트 수 (선형 회귀는 최소 2개 필요)

def train_and_save_models():
    """
    집계된 지출 데이터를 읽어 각 사용자별, 카테고리별 예측 모델을 학습하고 저장합니다.
    """
    print(f"데이터 파일 읽는 중: {DATA_FILE_PATH}")
    if not os.path.exists(DATA_FILE_PATH):
        print(f"오류: 데이터 파일이 존재하지 않습니다: {DATA_FILE_PATH}")
        print("데이터베이스에서 추출하여 'data' 폴더에 'aggregated_spending_data.csv' 파일을 생성해주세요.")
        return

    try:
        df = pd.read_csv(DATA_FILE_PATH)
        print("데이터 로드 성공.")
    except Exception as e:
        print(f"데이터 로드 중 오류 발생: {e}")
        return

    # 필수 컬럼 확인
    required_cols = ['user_id', 'year_month_index'] + CATEGORIES_TO_PREDICT
    if not all(col in df.columns for col in required_cols):
        missing = [col for col in required_cols if col not in df.columns]
        print(f"오류: 데이터 파일에 필수 컬럼이 누락되었습니다: {missing}")
        print("필요한 컬럼: user_id, year_month_index, 그리고 예측할 카테고리 컬럼들")
        return

    # 모델 저장 디렉토리 생성
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        print(f"모델 저장 디렉토리 생성: {MODEL_DIR}")

    user_ids = df['user_id'].unique()
    print(f"총 {len(user_ids)} 명의 사용자에 대해 모델 학습 시작.")

    trained_model_count = 0
    skipped_user_categories = []

    for user_id in user_ids:
        user_df = df[df['user_id'] == user_id].sort_values(by='year_month_index').copy()
        print(f"\n사용자 {user_id} 모델 학습 중...")

        for category in CATEGORIES_TO_PREDICT:
            # 해당 사용자의 해당 카테고리 지출 시계열 데이터 추출
            # month_index를 X로, 지출 금액을 y로 사용
            X_train = user_df[['year_month_index']] # scikit-learn 입력은 2차원
            y_train = user_df[category]

            # NaN 값 제거 (aggregated_spending_data.csv 생성 시 0으로 채웠다면 필요 없을 수도 있습니다)
            valid_indices = y_train.dropna().index
            X_train_valid = X_train.loc[valid_indices]
            y_train_valid = y_train.loc[valid_indices]

            if len(y_train_valid) < MIN_DATA_POINTS:
                # print(f"  - {category}: 데이터 포인트 부족 ({len(y_train_valid)}개). 모델 학습 건너뛰거나 기본값 사용.")
                skipped_user_categories.append(f"User {user_id}, Category {category} ({len(y_train_valid)} data points)")
                # 데이터 부족 시 예측 함수에서 평균값 등을 반환하도록 처리할 수 있습니다.
                continue # 모델 저장 스킵

            try:
                # 선형 회귀 모델 학습
                model = LinearRegression()
                model.fit(X_train_valid, y_train_valid)

                # 학습에 사용된 데이터 포인트 수 저장 (예측 시 다음 인덱스 계산에 필요)
                num_data_points = len(y_train_valid)

                # 모델과 데이터 포인트 수를 함께 저장
                model_filename = f'user_{user_id}_category_{category}_model.pkl'
                model_filepath = os.path.join(MODEL_DIR, model_filename)
                joblib.dump((model, num_data_points), model_filepath)
                # print(f"  - {category}: 모델 저장 완료 ({model_filename})")
                trained_model_count += 1

            except Exception as e:
                 print(f"  - 오류: 사용자 {user_id}, 카테고리 {category} 모델 학습 중 오류 발생: {e}")
                 skipped_user_categories.append(f"User {user_id}, Category {category} (Training Error: {e})")


    print("\n--- 학습 요약 ---")
    print(f"총 학습된 모델 수: {trained_model_count} 개")
    if skipped_user_categories:
        print(f"모델 학습 건너뛰거나 오류 발생한 경우 ({len(skipped_user_categories)}건):")
        for item in skipped_user_categories:
            print(f"  - {item}")

    print(f"학습된 모델은 '{MODEL_DIR}' 폴더에 저장되었습니다.")
    print("이제 백엔드에서 이 모델들을 로드하여 예측에 사용할 수 있습니다.")


# --- 백엔드에서 호출될 예측 함수 예시 ---
# 이 함수는 train_prediction_models.py 파일 안에 함께 있거나,
# 별도의 predict_spending.py 파일에 정의될 수 있습니다.
# 백엔드(Node.js)에서는 Python 실행 또는 Python 예측 서버를 만들어 통신해야 합니다.

def predict_spending(user_id: int, category: str, model_dir: str = MODEL_DIR):
    """
    저장된 모델을 사용하여 특정 사용자의 특정 카테고리 다음 지출 금액을 예측합니다.

    Args:
        user_id (int): 예측할 사용자 ID.
        category (str): 예측할 카테고리 이름.
        model_dir (str): 모델 파일이 저장된 디렉토리 경로.

    Returns:
        int or None: 예측된 지출 금액 (정수) 또는 예측 불가능 시 None.
    """
    model_filename = f'user_{user_id}_category_{category}_model.pkl'
    model_filepath = os.path.join(model_dir, model_filename)

    if not os.path.exists(model_filepath):
        # print(f"오류: 사용자 {user_id}, 카테고리 {category} 모델 파일이 존재하지 않습니다: {model_filepath}")
        # 모델이 없다는 것은 학습 데이터가 부족했거나 해당 카테고리에 지출이 거의 없었을 수 있습니다.
        # 이 경우 0을 반환하거나, 해당 사용자의 해당 카테고리 평균 지출을 반환하는 등의 대체 로직 필요
        # 여기서는 간단히 None 반환
        return None

    try:
        # 모델과 학습에 사용된 데이터 포인트 수 로드
        model, num_data_points = joblib.load(model_filepath)

        if num_data_points < MIN_DATA_POINTS:
            # print(f"경고: 로드된 모델의 데이터 포인트({num_data_points})가 최소 학습 기준({MIN_DATA_POINTS}) 미달입니다. 예측 신뢰성이 낮습니다.")
            # 데이터 부족으로 학습은 건너뛰었지만, 혹시 로드된다면 (예: 이전 학습 결과) 경고
             return None # 또는 0이나 평균값 반환

        # 다음 시점의 year_month_index는 학습에 사용된 데이터 포인트 수와 같습니다.
        next_index = num_data_points

        # 예측 수행
        predicted_amount = model.predict([[next_index]])[0]

        # 예측 결과가 음수일 경우 0 또는 작은 양수로 처리 (지출이 음수일 수는 없으므로)
        predicted_amount = max(0, int(predicted_amount))

        return predicted_amount

    except Exception as e:
        print(f"예측 중 오류 발생: 사용자 {user_id}, 카테고리 {category}: {e}")
        return None

# --- 스크립트 직접 실행 시 ---
if __name__ == "__main__":
    # 모델 학습 실행
    train_and_save_models()

    # --- 학습된 모델을 이용한 예측 테스트 예시 ---
    print("\n--- 예측 테스트 ---")

    test_user_id = 1 # 예측할 사용자 ID
    test_category = '식비' # 예측할 카테고리

    print(f"사용자 {test_user_id}의 '{test_category}' 다음 지출 예측:")
    predicted_value = predict_spending(test_user_id, test_category)

    if predicted_value is not None:
        print(f"예측 금액: {predicted_value} 원")
    else:
        print(f"사용자 {test_user_id}의 '{test_category}'에 대한 예측 모델이 없거나 예측에 실패했습니다.")

    # 다른 사용자/카테고리 테스트
    test_user_id_2 = 2
    test_category_2 = '교통'
    print(f"\n사용자 {test_user_id_2}의 '{test_category_2}' 다음 지출 예측:")
    predicted_value_2 = predict_spending(test_user_id_2, test_category_2)
    if predicted_value_2 is not None:
        print(f"예측 금액: {predicted_value_2} 원")
    else:
        print(f"사용자 {test_user_id_2}의 '{test_category_2}'에 대한 예측 모델이 없거나 예측에 실패했습니다.")

    test_user_id_3 = 3
    test_category_3 = '여행' # 여행 지출이 거의 없는 사용자에게는 모델이 학습되지 않았을 수 있습니다.
    print(f"\n사용자 {test_user_id_3}의 '{test_category_3}' 다음 지출 예측:")
    predicted_value_3 = predict_spending(test_user_id_3, test_category_3)
    if predicted_value_3 is not None:
        print(f"예측 금액: {predicted_value_3} 원")
    else:
        print(f"사용자 {test_user_id_3}의 '{test_category_3}'에 대한 예측 모델이 없거나 예측에 실패했습니다.")
