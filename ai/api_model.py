import sys
import subprocess
from datetime import datetime
import google.generativeai as genai

# 여기에 새로 발급받은 Gemini API 키를 직접 입력하세요.
GEMINI_API_KEY = "AIzaSyDYqDDyIxV3X7o1uvz0QzYFfCNlR56cUzg"  # 새 API 키로 업데이트했는지 확인!

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')  # 모델 이름 업데이트

okt = None
try:
    import konlpy
    print("konlpy가 import 되었습니다.")
    from konlpy.tag import Okt
    okt = Okt()
    print("Okt 형태소 분석기를 사용할 수 있습니다.")
except ImportError:
    print("konlpy import에 실패했습니다. 설치를 시도합니다...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "konlpy"])
        print("konlpy 설치가 완료되었습니다.")
        try:
            from konlpy.tag import Okt
            okt = Okt()
            print("Okt 형태소 분석기를 사용할 수 있습니다.")
        except ImportError:
            print("Okt 형태소 분석기를 불러오는 데 실패했습니다. Java 환경을 확인해 주세요.")
    except subprocess.CalledProcessError as e:
        print(f"konlpy 설치에 실패했습니다: {e}")
        print("형태소 분석 기능을 사용할 수 없습니다.")
    except FileNotFoundError:
        print("pip 명령어를 찾을 수 없습니다. Python 설치를 확인해 주세요.")
        print("형태소 분석 기능을 사용할 수 없습니다.")

# -- 가상의 가계부 데이터베이스 연동 함수 (실제 구현 필요) --
financial_records = [  # 가상 데이터 유지
    {"date": "2025-05-10", "category": "식료품", "amount": -50000, "description": "마트 장보기"},
    {"date": "2025-05-12", "category": "수입", "amount": 1000000, "description": "월급"},
    {"date": "2025-05-15", "category": "교통", "amount": -15000, "description": "지하철"},
    {"date": "2025-04-28", "category": "식료품", "amount": -30000, "description": "온라인 식료품 구매"},
    {"date": "2025-04-15", "category": "수입", "amount": 950000, "description": "월급"},
    {"date": "2025-05-01", "category": "주거비", "amount": -500000, "description": "월세"},
    {"date": "2025-05-20", "category": "여가", "amount": -30000, "description": "영화 관람"},
    {"date": "2025-05-18", "category": "식료품", "amount": -25000, "description": "오늘 점심"},
]

def search_financial_data(query):
    """
    가상의 가계부 데이터베이스에서 주어진 쿼리와 관련된 정보를 검색합니다.
    형태소 분석을 통해 키워드를 추출하고, 데이터에서 해당 키워드가 포함된 레코드를 찾습니다.
    """
    results = []
    query = query.lower()
    keywords = []
    if okt:
        keywords = okt.nouns(query)  # 질문에서 명사(주요 키워드) 추출
    else:
        keywords = query.split() # 형태소 분석 실패 시 단순 공백 분리

    for record in financial_records:
        found = False
        for keyword in keywords:
            if keyword in record['category'].lower() or keyword in record['description'].lower():
                found = True
                break
            try:
                date_obj = datetime.strptime(record['date'], '%Y-%m-%d')
                if keyword in date_obj.strftime('%Y') or keyword in date_obj.strftime('%m') or keyword in date_obj.strftime('%d'):
                    found = True
                    break
            except ValueError:
                pass
            if keyword in str(abs(record['amount'])):
                found = True
                break
        if found:
            results.append(record)

def generate_gemini_response(prompt):
    """
    Gemini 모델을 사용하여 주어진 프롬프트에 대한 응답을 생성합니다.
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"오류가 발생했습니다: {e}"

def ask_chatbot(user_question):
    relevant_data = search_financial_data(user_question)
    context = "\n".join([f"{record['date']} - {record['category']}: {record['amount']} ({record['description']})" for record in relevant_data])

    prompt = f"""다음은 사용자의 가계부 관련 질문입니다: "{user_question}"

당신은 가계부 데이터를 기반으로 이 질문에 답변하는 친절한 챗봇입니다.
아래의 가계부 데이터를 참고하여 답변하되, 데이터에 직접적으로 명시되지 않은 내용은 '관련된 정보가 없습니다.'라고 답변해주세요.

[가계부 데이터]
{context}

질문에 대한 답변: """

    return generate_gemini_response(prompt)

if __name__ == "__main__":
    while True:
        user_input = input("질문을 입력하세요 (종료하려면 '종료' 입력): ")
        if user_input.lower() == '종료':
            break
        response = ask_chatbot(user_input)
        print(f"챗봇: {response}")
