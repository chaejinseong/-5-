from sklearn.linear_model import LinearRegression
import pandas as pd
import os
import joblib
import pymysql
from dotenv import load_dotenv

# --- 환경 변수 로드 (.env에서 DB 정보 읽기) ---
load_dotenv()

# --- 상수 정의 ---
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'root'),
    'database': os.getenv('DB_NAME', 'hackerton')
}

def get_db_connection():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        print("✅ DB 연결 성공")
        return conn
    except Exception as e:
        print("❌ DB 연결 실패:", e)
        return None

def load_expense_data(conn):
    try:
        sql = "SELECT user_id, category, amount, year, month FROM expenses"
        df = pd.read_sql(sql, conn)

        # 정수 변환 및 유효성 검사
        df['year'] = pd.to_numeric(df['year'], errors='coerce')
        df['month'] = pd.to_numeric(df['month'], errors='coerce')
        df = df.dropna(subset=['year', 'month'])
        df['year'] = df['year'].astype(int)
        df['month'] = df['month'].astype(int)

        # 🔥 여기 추가
        df = df[(df['year'] > 0) & (df['month'] > 0)]

        # 연월 문자열 생성
        df['year_month'] = df['year'].astype(str) + '-' + df['month'].astype(str).str.zfill(2)
        return df

    except Exception as e:
        print("❌ 데이터 가공 중 오류:", e)
        return None

def train_and_save_models():
    print("🚀 모델 학습 스크립트 시작")
    conn = get_db_connection()
    if not conn:
        return

    df = load_expense_data(conn)
    if df is None or df.empty:
        print("❗ 학습할 데이터가 없습니다.")
        return

    try:
        # 월별 카테고리 합계 집계
        monthly = df.groupby(['user_id', 'year_month', 'category'])['amount'].sum().reset_index()
        pivot = monthly.pivot_table(index=['user_id', 'year_month'], columns='category', values='amount', fill_value=0).reset_index()

        # 시간 정렬 및 순차 인덱스 추가
        pivot['year_month_dt'] = pd.to_datetime(pivot['year_month'])
        pivot.sort_values(by=['user_id', 'year_month_dt'], inplace=True)
        pivot['month_index'] = pivot.groupby('user_id').cumcount()

        users = pivot['user_id'].unique()
        categories = [col for col in pivot.columns if col not in ['user_id', 'year_month', 'year_month_dt', 'month_index']]

        for user_id in users:
            user_df = pivot[pivot['user_id'] == user_id]
            for category in categories:
                X = user_df[['month_index']]
                y = user_df[category]
                if y.count() < 2:
                    continue

                model = LinearRegression()
                model.fit(X, y)
                model_path = os.path.join(MODEL_DIR, f"user{user_id}_{category}.pkl")
                joblib.dump((model, y.count()), model_path)

        print("✅ 모든 모델 저장 완료")

    except Exception as e:
        print("❌ 모델 학습 오류:", e)

if __name__ == '__main__':
    train_and_save_models()