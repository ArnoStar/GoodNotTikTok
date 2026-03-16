FROM python:3.12.7

COPY ./app ./app
COPY ./requirements.txt .

RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]