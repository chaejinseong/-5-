import joblib
import numpy as np
import pandas as pd
import sys
import os

categories = ['교통', '식비', '술/유흥', '여행', '의료', '간식', '쇼핑', '주거']

# 모델 불러오기
model = joblib.load('model.pkl')

def predict_from_file(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"❌ 파일이 존재하지 않습니다: {file_path}")

    df = pd.read_csv(file_path)

    # 유효성 체크
    if df.shape != (3, len(categories)):
        raise ValueError(f"❌ 입력 CSV는 반드시 3행 {len(categories)}열이어야 합니다.")

    if not all(cat in df.columns for cat in categories):
        raise ValueError(f"❌ 다음 카테고리가 누락됨: {set(categories) - set(df.columns)}")

    x = df[categories].values.flatten().reshape(1, -1)
    y_pred = model.predict(x)[0]

    # 결과 반환
    result = dict(zip(categories, map(int, y_pred)))
    return result

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("[CSV_파일_경로]")
        sys.exit(1)

    file_path = sys.argv[1]
    try:
        prediction = predict_from_file(file_path)
        print(" 다음 달 카테고리별 예측 소비:")
        for cat, amount in prediction.items():
            print(f"{cat}: {amount:,}원")
    except Exception as e:
        print(f" 오류 발생: {e}")
