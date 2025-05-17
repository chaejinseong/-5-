from flask import Flask, request, jsonify
import openai
import os
import pymysql
from dotenv import load_dotenv
from datetime import date, timedelta
import json
import joblib

# --- 환경변수 로드 ---
load_dotenv()

# --- Flask 앱 생성 ---
app = Flask(__name__)

# --- OpenAI 키 설정 ---
openai.api_key = os.getenv("OPENAI_API_KEY")

# --- DB 접속 정보 ---
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME = os.getenv("DB_NAME", "hackerton")
MODEL_DIR = "./models"

# --- DB 연결 함수 ---
def get_db_connection():
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
        return conn
    except Exception as e:
        print("DB 연결 오류:", e)
        return None

# --- GPT 요청 함수 ---
def ask_gpt(message, categories):
    prompt = f"""
    아래 문장에서 지출 내용을 분석해서 JSON으로 반환해줘. 

    ✅ 필수 추출 항목 (없으면 null 금지):
    - intent: 지출기록 / 수입기록 / 소비분석 / 지출예측 등
    - amount: 숫자 (원 단위)
    - category: {categories} 중 하나. 없으면 '기타'
    - title: 소비처 명칭 또는 '지출'
    - date: '오늘', '어제', 'YYYY-MM-DD' 중 하나

    🔁 선택 추출 항목 (없으면 기본값 처리):
    - payment_method: 카드, 현금, 계좌. 없으면 '카드'
    - memo: 없으면 공백

    문장: "{message}"
    결과는 반드시 JSON 하나로만 줘.
    """
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    content = response.choices[0].message.content.strip()
    if content.startswith("```json"):
        content = content[7:]
    if content.endswith("```"):
        content = content[:-3]
    return json.loads(content)

# --- 지출 저장 함수 ---
def save_expense(user_id, parsed):
    conn = get_db_connection()
    if not conn:
        return False
    try:
        with conn.cursor() as cursor:
            amount = parsed.get("amount")
            category = parsed.get("category", "기타")
            title = parsed.get("title", "지출")
            payment_method = parsed.get("payment_method") or "카드"
            memo = parsed.get("memo", "")
            date_str = parsed.get("date", "오늘")

            spent_date = date.today()
            if date_str == "어제":
                spent_date -= timedelta(days=1)
            elif len(date_str) == 10:
                spent_date = date.fromisoformat(date_str)

            sql = """
                INSERT INTO expenses (user_id, category, title, amount, payment_method, memo, year, month, day, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """
            cursor.execute(sql, (
                user_id, category, title, amount, payment_method, memo,
                spent_date.year, spent_date.month, spent_date.day
            ))
            conn.commit()
            return True
    except Exception as e:
        print("지출 저장 오류:", e)
        return False
    finally:
        conn.close()

# --- 소비 분석 함수 ---
def analyze_user_expense(user_id):
    conn = get_db_connection()
    if not conn:
        return "소비유형 분석 실패 (DB 연결 오류)"
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT category, SUM(amount) as total
                FROM expenses
                WHERE user_id = %s
                GROUP BY category
                ORDER BY total DESC
                LIMIT 1
            """, (user_id,))
            row = cursor.fetchone()
            if row:
                return f"당신은 '{row['category']}' 카테고리에 가장 많이 소비하고 있습니다. 총 {row['total']}원 사용했습니다."
            else:
                return "소비 데이터가 부족하여 분석할 수 없습니다."
    except Exception as e:
        print("소비유형 분석 오류:", e)
        return "소비유형 분석 중 오류가 발생했습니다."
    finally:
        conn.close()

# --- 예측 함수 ---
def predict_spending(user_id, category):
    filename = f"user_{user_id}_category_{category}_model.pkl"
    filepath = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(filepath):
        return None
    try:
        model, data_count = joblib.load(filepath)
        next_index = data_count
        prediction = model.predict([[next_index]])[0]
        return max(0, int(prediction))
    except Exception as e:
        print("예측 오류:", e)
        return None

# --- API 엔드포인트 ---
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_id = data.get("userId")
    message = data.get("message")

    if not user_id or not message:
        return jsonify({"response": "userId와 message를 모두 입력해주세요.", "success": False}), 400

    categories = ["식비", "교통", "생활", "쇼핑", "기타"]

    try:
        parsed = ask_gpt(message, categories)
        intent = parsed.get("intent", "알수없음")

        if intent == "지출기록":
            success = save_expense(user_id, parsed)
            if success:
                return jsonify({"response": "지출이 성공적으로 저장되었습니다.", "success": True})
            else:
                return jsonify({"response": "지출 저장 실패", "success": False}), 500

        elif intent == "소비분석":
            summary = analyze_user_expense(user_id)
            return jsonify({"response": summary, "success": True})

        elif intent == "지출예측":
            category = parsed.get("category", "기타")
            result = predict_spending(user_id, category)
            if result is not None:
                return jsonify({"response": f"다음 달 '{category}' 예상 지출은 {result}원입니다.", "success": True})
            else:
                return jsonify({"response": "예측 데이터를 찾을 수 없습니다.", "success": False})

        else:
            return jsonify({"response": f"{intent} 의도는 아직 지원되지 않습니다.", "success": True})

    except Exception as e:
        print("처리 중 오류 발생:", e)
        return jsonify({"response": "처리 중 오류가 발생했습니다.", "success": False}), 500

if __name__ == '__main__':
    print("\ud83d\ude80 Flask \uc11c\ubc84 \uc2e4\ud589 \uc911...")
    app.run(debug=True, port=5000)