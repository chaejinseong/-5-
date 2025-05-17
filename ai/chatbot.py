# app_backend.py

from flask import Flask, request, jsonify
import google.generativeai as genai
import os
import json
import mysql.connector # MySQL 데이터베이스 연동을 위해 필요
from datetime import date, timedelta # 날짜 처리를 위해 필요

# --- 디버깅용 코드 ---
print(f"스크립트 현재 작업 디렉토리: {os.getcwd()}")
try:
    print(f"현재 디렉토리 내용: {os.listdir()}")
except Exception as e:
    print(f"디렉토리 내용 확인 오류: {e}")

# API 키 및 MySQL 데이터베이스 접속 정보 (실제 정보로 변경 필요)
GEMINI_API_KEY = "YOUR_API_KEY" # 여기에 발급받은 API 키를 직접 입력합니다.
DB_HOST = "localhost" # 예: localhost, 127.0.0.1, 또는 DB 서버 주소
DB_USER = "root" # 실제 DB 사용자 이름으로 변경
DB_PASSWORD = "password" # 실제 DB 비밀번호로 변경
DB_NAME = "mydatabase" # 실제 DB 이름으로 변경


# 필수 API 키 확인 (이제 항상 True일 것입니다)
if not GEMINI_API_KEY:
    print("\n" + "="*50)
    print(">>> 오류: GEMINI_API_KEY가 코드에 설정되지 않았습니다.")
    print(">>> API 키 값을 GEMINI_API_KEY 변수에 직접 입력해주세요.")
    print("="*50 + "\n")
    exit()

# DB 접속 정보는 코드에 직접 설정되었으므로 별도 확인은 생략합니다.
db_config_ok = True # 코드에 직접 설정되었으므로 True로 간주합니다.


# Gemini API 설정 (하드코딩된 GEMINI_API_KEY 값을 사용합니다)
try:
    genai.configure(api_key=GEMINI_API_KEY)
    # 사용할 모델 이름 변수 정의
    model_name_to_use = 'gemini-1.5-flash' # 또는 'gemini-1.5-pro' 등

    # --- 디버깅용 코드 추가 ---
    print(f">>> GenerativeModel 생성 시도 모델 이름: {model_name_to_use} <<<")
    # --- 디버깅용 코드 끝 ---

    model = genai.GenerativeModel(model_name_to_use)
    print(f">>> Gemini 모델 설정 완료: {model_name_to_use} <<<")

except Exception as e:
    print(f"\n" + "="*50)
    print(f">>> 오류: Gemini 모델 설정 중 오류 발생 <<<")
    print(f">>> 오류 상세: {e}")
    print(">>> - API 키가 유효하지 않거나, 인터넷 연결에 문제가 있을 수 있습니다.")
    print(">>> - 사용하려는 모델 이름이 올바른지 확인하세요.")
    print("="*50 + "\n")
    exit()

# ✅ Flask 앱 생성
app = Flask(__name__)

# TODO: 프론트엔드와의 CORS 문제 해결을 위해 Flask-Cors 라이브러리 사용 고려
# from flask_cors import CORS
# CORS(app)

# MySQL 데이터베이스 연결 함수
def get_db_connection():
    if not db_config_ok:
        print(">>> DB 설정 정보 부족으로 연결할 수 없습니다.")
        return None
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        # print(">>> 데이터베이스 연결 성공") # 연결 성공 메시지는 너무 자주 출력될 수 있어 주석 처리
        return connection
    except mysql.connector.Error as e:
        print(f">>> 데이터베이스 연결 오류: {e}")
        print(">>> DB 연결 정보를 확인하거나 DB 서버 상태를 점검해주세요.")
        return None

# ✅ DB에서 가계부 카테고리 목록을 로드하는 함수
def load_categories_from_db():
    """
    데이터베이스에서 유효한 가계부 카테고리 목록을 가져옵니다.
    오류 발생 시 기본 목록을 반환합니다.
    """
    default_categories = ['식비', '교통', '생활', '쇼핑', '기타'] # DB 로드 실패 시 사용할 기본 목록

    if not db_config_ok:
        print(">>> DB 설정 정보 부족으로 카테고리를 로드할 수 없습니다. 기본 목록 사용.")
        return default_categories

    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        try:
            # TODO: 실제 카테고리 테이블 이름과 컬럼 이름으로 수정하세요.
            # 예시: categories 테이블에 name 컬럼이 있다고 가정
            sql = "SELECT name FROM categories"
            cursor.execute(sql)
            # 조회 결과를 리스트 형태로 변환
            categories = [row[0] for row in cursor.fetchall()]
            print(f">>> DB에서 카테고리 로드 성공: {categories}")
            return categories if categories else default_categories # DB에 카테고리가 없을 경우 기본 목록 반환

        except mysql.connector.Error as e:
            print(f">>> 데이터베이스에서 카테고리 로드 오류: {e}. 기본 목록 사용.")
            return default_categories
        except Exception as e:
            print(f">>> 카테고리 로드 중 알 수 없는 오류: {e}. 기본 목록 사용.")
            return default_categories
        finally:
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            if connection is not None:
                connection.close()
    else:
        print(">>> DB 연결 실패로 카테고리를 로드할 수 없습니다. 기본 목록 사용.")
        return default_categories

# ✅ 애플리케이션 시작 시 카테고리 로드
# 서버 시작 전에 카테고리 목록을 미리 로드해 둡니다.
VALID_EXPENSE_CATEGORIES = load_categories_from_db()


# TODO: 이 함수 안에 Gemini 파싱 결과를 DB에 저장하는 로직 구현
def save_transaction_to_db(user_id, parsed_data):
    """
    Gemini가 파싱한 가계부 데이터를 DB에 저장하는 함수 (예시)

    Args:
        user_id (int): 데이터를 저장할 사용자 ID
        parsed_data (dict): Gemini가 파싱한 데이터 (예: {"intent": "지출기록", "amount": 10000, ...})
    """
    if not db_config_ok:
        print(">>> DB 설정 정보 부족으로 저장할 수 없습니다.")
        return False

    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        try:
            # --- TODO: 여기에 실제 DB 저장 로직 구현 ---
            # parsed_data 딕셔너리에서 'intent', 'amount', 'category', 'date' 등을 추출
            intent = parsed_data.get('intent')
            amount = parsed_data.get('amount')
            category = parsed_data.get('category')
            date_str = parsed_data.get('date') # 예: '오늘', '어제', 'YYYY-MM-DD'
            memo = parsed_data.get('memo')

            print(f">>> DB 저장 시도 (예시): 사용자 {user_id}, 의도: {intent}, 데이터: {parsed_data}")

            # 예시: 지출 기록일 경우 expenses 테이블에 삽입 (스키마에 맞춰 수정 필요)
            if intent == '지출기록' and amount is not None:
                 # 날짜 파싱 로직 (간단 예시)
                 spent_date = date.today()
                 if date_str == '어제':
                     spent_date = date.today() - timedelta(days=1)
                 # TODO: 'YYYY-MM-DD' 형식 등 다양한 날짜 파싱 로직 추가

                 # SQL 쿼리 (사용자 스키마에 맞춰 수정 필수!)
                 # 예시: INSERT INTO expenses (user_id, category, title, amount, spent_at, memo) VALUES (%s, %s, %s, %s, %s, %s)
                 # values = (user_id, category, title, amount, spent_date, memo)
                 # cursor.execute(sql, values)
                 # connection.commit()

                 print(">>> DB 저장 쿼리 실행 (실제로는 주석 처리됨)")
                 return True # 저장 성공 (예시)

            elif intent == '수입기록' and amount is not None:
                 # TODO: monthly_summary 테이블에 수입 기록 로직 구현
                 print(">>> DB 저장 시도 (수입 기록): 로직 미구현")
                 return False # 저장 실패 (미구현)

            else:
                 print(">>> DB 저장 시도: 파싱된 데이터가 저장 가능한 형식이 아님")
                 return False # 저장할 데이터가 아님

            # --- TODO: 실제 DB 저장 로직 구현 끝 ---

        except mysql.connector.Error as e:
            # connection.rollback() # 오류 발생 시 롤백
            print(f">>> 데이터베이스 저장 오류: {e}")
            return False
        except Exception as e:
             print(f">>> DB 저장 로직 실행 중 오류: {e}")
             return False
        finally:
            # cursor가 성공적으로 생성되었을 경우에만 닫습니다.
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            # connection이 성공적으로 생성되었을 경우에만 닫습니다.
            if connection is not None:
                connection.close()
    else:
        print(">>> DB 연결 실패로 저장할 수 없습니다.")
        return False

# TODO: DB에서 데이터를 조회하는 함수 구현 (예시)
def get_data_from_db(user_id, query_params):
    """
    DB에서 가계부 데이터를 조회하는 함수 (예시)

    Args:
        user_id (int): 데이터를 조회할 사용자 ID
        query_params (dict): 조회 조건 (예: {"period": "이번 달", "category": "식비"})

    Returns:
        list: 조회된 데이터 목록 또는 None
    """
    if not db_config_ok:
        print(">>> DB 설정 정보 부족으로 조회할 수 없습니다.")
        return None

    connection = get_db_connection()
    if connection:
        cursor = connection.cursor(dictionary=True) # 결과를 딕셔너리 형태로 받기 위해 dictionary=True 설정
        try:
            print(f">>> DB 조회 시도 (예시): 사용자 {user_id}, 조건: {query_params}")

            # --- TODO: 여기에 실제 DB 조회 로직 구현 ---
            # query_params를 바탕으로 SQL SELECT 쿼리 구성
            # 예시: SELECT * FROM expenses WHERE user_id = %s AND ...
            # sql = "SELECT * FROM expenses WHERE user_id = %s LIMIT 10" # 간단 예시
            # cursor.execute(sql, (user_id,))
            # results = cursor.fetchall()

            results = [{"example_data": "조회 기능 미구현"}] # 미구현 예시 결과
            print(f">>> DB 조회 결과 (예시): {results}")
            return results

            # --- TODO: 실제 DB 조회 로직 구현 끝 ---

        except mysql.connector.Error as e:
            print(f">>> 데이터베이스 조회 오류: {e}")
            return None
        except Exception as e:
             print(f">>> DB 조회 로직 실행 중 오류: {e}")
             return None
        finally:
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            if connection is not None:
                connection.close()
    else:
        print(">>> DB 연결 실패로 조회할 수 없습니다.")
        return None


# ✅ 챗봇 메시지 처리 API 엔드포인트
# 프론트엔드에서 사용자 메시지를 POST 요청으로 보냅니다.
# 예: POST /api/chat, Body: { "userId": 123, "message": "오늘 점심 만원 썼어" }
@app.route('/api/chat', methods=['POST'])
def handle_chat_message():
    # 요청 본문에서 JSON 데이터 가져오기
    request_data = request.get_json()
    user_id = request_data.get('userId') # TODO: 실제 사용자 인증 로직에서 user_id 가져오도록 수정
    user_message = request_data.get('message')

    if not user_id or not user_message:
        # 필수 데이터 누락 시 오류 응답
        return jsonify({"response": "잘못된 요청입니다. userId와 message를 포함해주세요.", "success": False}), 400

    print(f"\n--- 사용자 {user_id} 메시지 수신: {user_message} ---")

    try:
        # --- 1. Gemini 모델에게 사용자 입력 파싱 요청 ---
        # 가계부 챗봇으로 사용하려면 여기에 가계부 데이터 파싱 프롬프트를 넣어야 합니다.
        # DB에서 로드한 카테고리 목록을 프롬프트에 동적으로 추가합니다.
        category_list_str = ", ".join(VALID_EXPENSE_CATEGORIES) # 카테고리 목록을 문자열로 변환

        parsing_prompt = f"""
        다음 사용자 문장을 분석하여 가계부 관련 의도와 데이터를 추출해줘. 응답은 반드시 JSON 형식으로 해줘.
        의도는 다음 중 하나야: "지출기록", "수입기록", "잔액조회", "지출요약", "고정지출조회", "비교분석요청", "기타질문", "알수없음".
        각 의도별 추가 데이터 필드는 다음과 같아:
        - 지출기록: {{ "intent": "지출기록", "amount": 금액(숫자), "category": 항목({category_list_str} 중 하나), "memo": 메모(문자열, 선택), "date": 날짜(YYYY-MM-DD 형식 또는 '오늘', '어제', 선택) }}
        - 수입기록: {{ "intent": "수입기록", "amount": 금액(숫자), "date": 날짜(YYYY-MM-DD 형식 또는 '오늘', '이번 달', 선택) }}
        - 지출요약: {{ "intent": "지출요약", "period": "오늘", "이번 주", "이번 달", "YYYY-MM", "전체" 등 }}
        - 비교분석요청: {{ "intent": "비교분석요청", "category": {category_list_str} 중 하나 (선택), "filter": {{ "gender": "male/female", "age_group": "20대" 등 }} (선택) }}
        - 기타질문: {{ "intent": "기타질문", "query": 원문 질문 }}
        - 잔액조회, 고정지출조회, 알수없음: 추가 데이터 필드 없음.

        만약 의도를 명확히 파악하기 어렵다면 "알수없음"으로 응답해줘.
        카테고리는 주어진 목록 외에는 "{VALID_EXPENSE_CATEGORIES[-1]}"으로 분류해줘. # 목록의 마지막 카테고리를 기본값으로 사용
        날짜가 명시되지 않으면 '오늘'로 간주해줘. 금액은 반드시 숫자로만 추출해줘.

        사용자 입력: "{user_message}"
        """

        gemini_response = model.generate_content(parsing_prompt)
        gemini_output_text = gemini_response.text.strip()

        print(f">>> Gemini 파싱 응답 원문:\n{gemini_output_text}\n---")

        # 파싱된 JSON 데이터 추출
        parsed_data = {}
        try:
            # 응답에서 JSON 블록 추출 (```json\n...\n``` 형태일 수 있음)
            if gemini_output_text.startswith("```json"):
                gemini_output_text = gemini_output_text[7:]
            if gemini_output_text.endswith("```"):
                gemini_output_text = gemini_output_text[:-3]

            parsed_data = json.loads(gemini_output_text)
            print(">>> 파싱된 데이터:", parsed_data)

        except json.JSONDecodeError as e:
            print(f">>> JSON 파싱 오류: {e}")
            print(">>> Gemini 응답이 올바른 JSON 형식이 아닙니다. 프롬프트를 조정해보세요.")
            # 파싱 실패 시 기타 질문으로 처리하거나 오류 메시지 반환
            parsed_data = {"intent": "기타질문", "query": user_message}
        except Exception as e:
             print(f">>> 파싱된 데이터 처리 중 오류: {e}")
             parsed_data = {"intent": "기타질문", "query": user_message}


        # --- 2. 파싱된 의도에 따라 DB 저장 또는 조회/분석 로직 수행 및 응답 생성 ---
        intent = parsed_data.get("intent", "알수없음")

        # 챗봇 최종 응답 메시지
        chatbot_final_response = "요청을 처리했습니다."

        if intent in ["지출기록", "수입기록"]:
             # DB 저장 시도 (save_transaction_to_db 함수 호출)
             # save_transaction_to_db 함수는 현재 예시 로직만 포함하고 있습니다.
             if save_transaction_to_db(user_id, parsed_data):
                 # 저장 성공 시 사용자에게 보여줄 메시지 생성 (parsed_data 활용)
                 # Gemini 파싱 프롬프트 결과에 type 필드가 있다면 사용 (없다면 '기록' 기본값)
                 entry_type = parsed_data.get('type', '기록')
                 amount = parsed_data.get('amount')
                 category = parsed_data.get('category')
                 date_str = parsed_data.get('date')

                 if amount is not None:
                      chatbot_final_response = f"{date_str or '오늘'} {category or ''} {amount}원 {entry_type}을 기록했습니다."
                 else:
                      chatbot_final_response = "기록 의도를 파악했지만, 금액 정보가 부족합니다."

             else:
                 # 저장 실패 시 메시지 (save_transaction_to_db 함수 내에서 오류 메시지 출력)
                 chatbot_final_response = "가계부 기록 중 오류가 발생했습니다. 다시 시도해주세요."

        elif intent in ["잔액조회", "지출요약", "고정지출조회", "비교분석요청"]:
             # TODO: DB에서 데이터 조회/분석 후 응답 생성 로직 구현
             # get_data_from_db 함수 호출 예시:
             # query_results = get_data_from_db(user_id, parsed_data)
             # 필요한 경우 조회된 데이터를 Gemini에게 다시 보내 응답 문장 생성 요청 가능
             print(f">>> '{intent}' 의도 파악. 조회/분석 기능 미구현.")
             chatbot_final_response = f"'{intent}' 의도를 파악했습니다. (조회/분석 기능 미구현)"

        elif intent == "기타질문":
             # TODO: Gemini에게 일반적인 질문에 대한 답변 요청 로직 구현
             # user_message 또는 parsed_data.get('query')를 사용하여 질문
             general_question = parsed_data.get('query', user_message)
             print(f">>> 기타 질문 처리: {general_question}")
             # 예시: general_response = model.generate_content(general_question)
             # chatbot_final_response = general_response.text.strip()
             chatbot_final_response = "일반 질문 의도를 파악했습니다. (답변 기능 미구현)"


        else: # 알수없음 또는 기타 파싱 오류
             print(f">>> 알수없음 의도 파악. 원문: {user_message}")
             chatbot_final_response = "죄송해요. 어떤 것을 도와드릴까요? (예: '오늘 점심 만원 썼어', '이번 달 식비 알려줘')"


        # --- 3. 최종 응답을 JSON 형태로 프론트엔드에 반환 ---
        # 챗봇의 응답 메시지를 JSON 응답의 'response' 필드에 담아 보냅니다.
        return jsonify({"response": chatbot_final_response, "success": True}), 200

    except Exception as e:
        # 전체 처리 과정 중 예상치 못한 오류 발생 시
        print(f">>> 전체 처리 과정 중 오류 발생: {e}")
        return jsonify({"response": "챗봇 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "success": False}), 500


# ✅ 서버 실행
if __name__ == '__main__':
    print(">>> Flask 서버 시작 시도 중...")
    # debug=True로 설정하면 코드 수정 시 자동 재시작
    # 실제 배포 시에는 debug=False로 설정해야 합니다.
    # host='0.0.0.0'으로 설정하면 외부 접속 허용 (개발 시 주의)
    app.run(debug=True, port=5000) # 포트 번호는 필요에 따라 변경 가능
