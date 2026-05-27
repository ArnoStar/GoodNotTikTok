from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordRequestForm

from app.shemas.auth import UserSignIn
from app.db.models import User, Video
from app.db.database_sql import get_db
from app.db.database_redis import redis
from app.core.security import hash_password
from app.core.config import settings
from app.services.email import send_confirmation_email
from app.shemas.auth import ConfirmationIn, NewPassword

from random import randint
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta
import json
import string
import random

oauth2shema = OAuth2PasswordBearer("/auth/login")

SECRET_KEY = settings.jwt_secret_key
ALGORITHM = settings.jwt_algorithm

REGISTER_EXPIRATION_TIME = settings.register_expiration_time

def create_token(data: dict, delta_exp_time: timedelta | None = None):
    to_encode = data.copy()

    if delta_exp_time:
        to_encode["exp"] = datetime.now() + delta_exp_time
    else:
        to_encode["exp"] = datetime.now() + timedelta(minutes=15)

    encoded = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded

def create_user(username:str, email:str, password_hash:str, db:Session = Depends(get_db)):
    user = User(username = username, email = email, password_hash = password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user(email:str, db:Session = Depends(get_db)):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(id:int, db:Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if user is None:
        raise HTTPException(400, "User doesn't exist")
    return user

def user_exist(email:str, db:Session = Depends(get_db)) -> bool:
    return get_user(email, db) != None

def generate_random_code(lenght:int = 8):
    code = ""
    for _ in range(lenght):
        code+=str(randint(0,9))
    return code

async def add_email_to_confirmation(username, email:str, password_hash:str, code:int):
    user_info = {"code":code,"password_hash":password_hash, "email":email, "username":username}
    await redis.set(name = email, value = json.dumps(user_info), ex=REGISTER_EXPIRATION_TIME)

async def add_email_to_confirmation_reset(email:str, code:int):
    user_info = {"code":code, "email":email}
    await redis.set(name = email, value = json.dumps(user_info), ex=REGISTER_EXPIRATION_TIME)

async def verify_validation_code(confirmation:ConfirmationIn) -> dict[str:str]:
    user_info = await redis.get(confirmation.email)
    if user_info is None:
        raise HTTPException(401, "Email not signed in")
    user_info = json.loads(user_info)
    if user_info["code"] != confirmation.code:
        raise HTTPException(401, "Wrong code")
    
    return user_info

def change_password(new_password:NewPassword, user_info: dict = Depends(verify_validation_code), db:Session = Depends(get_db)):
    user = get_user(user_info["email"], db)
    new_hash_password = hash_password(new_password.password)

    user.password_hash = new_hash_password
    db.commit()
    db.refresh(user)

    return user

def generate_useable_id(db: Session) -> str:
    video = True
    charset = string.ascii_letters + string.digits  # A-Z a-z 0-9
    while video:
        id = "".join(random.choices(charset, k=16))
        video = db.query(Video).filter(Video.id == id).first()
    return id

def add_profile_pic(user, img, db):
    ALLOWED_MIME_TYPES = {"image/png", "image/jpeg"}
    if img.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {img.content_type}. Only PNG and JPG/JPEG are allowed."
        )
    
    frmt = img.filename.split(".")[-1]
    img.filename = f"{generate_useable_id(db)}.{frmt}"

    user.image = img.filename
    db.commit()
    return img
