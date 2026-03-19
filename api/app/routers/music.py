from fastapi import APIRouter, Depends, Request, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse

from app.db.database_sql import get_db
from app.db.models import User
from app.shemas.music import CommentPost, ProfileGet
from app.deps.auth import get_current_user
from app.services.music import (add_music, get_metadata_music, verify_video, download_video, generate_useable_id, add_metadata_video, get_metadata_video,
                                like_video, dislike_video, comment_video, get_like_count, get_comments_video, follow, unfollow, get_random_video,
                                get_like_state)
from app.services.auth import get_user_by_id
from app.core.config import settings

from sqlalchemy.orm import Session
from typing import Annotated

router = APIRouter(prefix="/video", tags=["Video"])

@router.get("/")
def find_random_video(db:Session = Depends(get_db)):
    return get_random_video(db)

@router.post("/")
def create_upload_file(file = Depends(verify_video), user:User = Depends(get_current_user), db:Session = Depends(get_db)):
    video_id = generate_useable_id(db)
    file.filename = f"{video_id}.{file.filename.split(".")[-1]}"
    add_metadata_video(video_id, user, db)
    download_video(file)
    return {"filename": file.filename, "content_type": file.content_type}

@router.get("/{video_id}")
def get_video(video_id:str, db:Session = Depends(get_db)):
    return get_metadata_video(video_id, db)

@router.get("/{video_id}/like")
def get_like_amount(video_id:str, db:Session = Depends(get_db)):
    return get_like_count(video_id, db)

@router.get("/{video_id}/like_state")
def lik_state_video(video_id:str, user:User = Depends(get_current_user),  db:Session = Depends(get_db)):
    video = get_metadata_video(video_id, db)
    return get_like_state(video, user, db)

@router.put("/{video_id}/like")
def lik_video(video_id:str, user:User = Depends(get_current_user),  db:Session = Depends(get_db)):
    video = get_metadata_video(video_id, db)
    return like_video(video, user, db)

@router.put("/{video_id}/dislike")
def dislik_video(video_id:str, user:User = Depends(get_current_user),  db:Session = Depends(get_db)):
    video = get_metadata_video(video_id, db)
    return dislike_video(video, user, db)

@router.get("/{video_id}/comment")
def get_all_comments_from_video(video_id:str, db:Session = Depends(get_db)):
    return get_comments_video(video_id, db)

@router.post("/{video_id}/comment")
def com_video(video_id:str, comment:CommentPost, user:User = Depends(get_current_user), db:Session = Depends(get_db)):
    video = get_metadata_video(video_id, db)
    return comment_video(video, user, comment.text, db)

@router.get("/profile/{user_id}")
def get_user_v(user_id:int, db:Session = Depends(get_db)):
    user:User = get_user_by_id(user_id, db)
    return ProfileGet(id=user.id, email=user.email)

@router.get("/profile/{user_id}/followers")
def get_all_followers_user(user_id:int, db:Session = Depends(get_db)):
    user = get_user_by_id(user_id, db)
    return user.followers

@router.get("/profile/{user_id}/followings")
def get_all_followings_user(user_id:int, db:Session = Depends(get_db)):
    user = get_user_by_id(user_id, db)
    return user.followings

@router.get("/profile/{user_id}/videos")
def get_all_video_from_user(user_id:int, db:Session = Depends(get_db)):
    user = get_user_by_id(user_id, db)
    return user.video_added

@router.put("/profile/{user_id}/follow")
def follow_profile(user_id:int, user:User = Depends(get_current_user), db:Session = Depends(get_db)):
    profile = get_user_by_id(user_id, db)
    return follow(user, profile, db)

@router.put("/profile/{user_id}/unfollow")
def follow_profile(user_id:int, user:User = Depends(get_current_user), db:Session = Depends(get_db)):
    profile = get_user_by_id(user_id, db)
    return unfollow(user, profile, db)