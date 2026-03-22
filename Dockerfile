FROM python:3.11

WORKDIR /app

COPY . .

RUN pip install fastapi uvicorn pymongo python-dotenv validators tldextract requests

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]