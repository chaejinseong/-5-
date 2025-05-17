# seed_expenses.py
import pymysql
import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# DB 연결 정보
conn = pymysql.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", "root"),
    database=os.getenv("DB_NAME", "hackerton"),
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor
)

# 샘플 카테고리 및 제목
categories = ["식비", "교통", "쇼핑", "생활", "기타"]
titles = {
    "식비": ["맥도날드", "스타벅스", "편의점", "김밥천국", "배달의민족"],
    "교통": ["지하철", "버스", "택시", "기차"],
    "쇼핑": ["쿠팡", "마켓컬리", "올리브영"],
    "생활": ["세탁소", "문구점", "이마트"],
    "기타": ["기부", "간식", "기타"]
}

payment_methods = ["카드", "현금", "계좌"]

try:
    with conn.cursor() as cursor:
        base_date = datetime.today() - timedelta(days=120)

        for i in range(100):  # 100개 생성
            user_id = 1
            category = random.choice(categories)
            title = random.choice(titles[category])
            amount = random.randint(3000, 30000)
            payment_method = random.choice(payment_methods)
            memo = f"테스트용 {category} 지출"
            spent_at = base_date + timedelta(days=random.randint(0, 120))

            year = spent_at.year
            month = spent_at.month
            day = spent_at.day

            sql = """
            INSERT INTO expenses (user_id, category, title, amount, payment_method, memo, year, month, day, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """
            cursor.execute(sql, (
                user_id, category, title, amount, payment_method, memo, year, month, day
            ))

        conn.commit()
        print("✅ 테스트용 지출 데이터 100개 삽입 완료")

finally:
    conn.close()