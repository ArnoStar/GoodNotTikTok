from fastapi import HTTPException, Depends, UploadFile, File

from app.shemas.music import MusicPost
from app.core.config import settings
from app.db.database_sql import get_db
from app.db.models import Music, User, Video, Like, Comment, Follow
from app.deps.auth import get_current_user
from app.services.deps import register_function

from pytubefix import AsyncYouTube
from pytubefix.exceptions import VideoUnavailable, RegexMatchError
from sqlalchemy.orm import Session
from typing import Callable, Annotated
from sqlalchemy.sql.expression import func
import random
import string
import shutil

AUDIO_DIR = settings.audio_dir
UPLOADS = settings.img_dir

downloaders:dict[str, Callable[[str], str]] = dict()

def add_metadata_video(video_id:str, user:User, db:Session):
    video = Video(id=video_id, added_by=user)
    db.add(video)
    db.commit()
    db.refresh(video)

    return video

def add_metadata_music(music_id:str, user:User, db:Session):
    music = Music(id=music_id, added_by=user)
    db.add(music)
    db.commit()
    db.refresh(music)

    return music

def get_metadata_music(music_id:str, db:Session = Depends(get_db)) -> Music:
    return db.query(Music).filter(Music.id == music_id).first()

def get_metadata_video(video_id:str, db:Session = Depends(get_db)) -> Video:
    return db.query(Video).filter(Video.id == video_id).first()

def music_exist(music_id:str,  db:Session):
    return get_metadata_music(music_id, db) != None

def verify_music(music_id:str, db:Session):
    if music_exist(music_id, db):
        raise HTTPException(400, "The song already exist")

def verify_video(file: Annotated[UploadFile, File(...)]) -> Annotated[UploadFile, File(...)]:
    if not file.content_type.startswith("video/"):
        raise HTTPException(
            status_code=400,
            detail=f"File '{file.filename}' is not a video. Type: {file.content_type}"
        )
    
    return file

def download_video(file):
    with open(f"{UPLOADS}/{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)


def get_video_from_youtube(url:str) -> AsyncYouTube:
    try:
        video = AsyncYouTube(url)
    except RegexMatchError:
        raise HTTPException(400, "Wrong link, you need a valid youtube link")

    return video

@register_function(downloaders, "youtube")
async def download_music_youtube(video:AsyncYouTube):
    try:
        streams = await video.streams()
    except VideoUnavailable:
        raise HTTPException(404, "Video not found or unavailable")
    
    filename = f"{video.video_id}.mp3"

    audio = streams.get_audio_only()
    audio.download(filename=filename, output_path=AUDIO_DIR)

    return AUDIO_DIR+filename
        
async def add_music(music_information:MusicPost, user:User = Depends(get_current_user), db:Session = Depends(get_db)):
    format:str = music_information.format
    url:str = music_information.link
    video = get_video_from_youtube(url)
    download = downloaders.get(format)
    music_id = video.video_id

    if download is None:
        raise HTTPException(400, "Invalid format")

    verify_music(music_id, db)
    await download(video)
    music_metadata = add_metadata_music(music_id, user, db)

    return music_metadata

def get_like_count(video_id:str, db: Session):
    return len(db.query(Like).filter(Like.video_id == video_id).all())

def generate_useable_id(db: Session) -> str:
    video = True
    charset = string.ascii_letters + string.digits  # A-Z a-z 0-9
    while video:
        id = "".join(random.choices(charset, k=16))
        video = db.query(Video).filter(Video.id == id).first()
    return id

def get_like_state(video:Video, user:User, db:Session) -> bool:
    like = db.query(Like).filter(Like.user_id == user.id, Like.video_id == video.id).first()
    return like != None

def like_video(video:Video, user:User, db:Session) -> Like:
    if db.query(Like).filter(Like.user_id == user.id, Like.video_id == video.id).first():
        raise HTTPException(400, "You already liked this video")
    like = Like(user = user, video = video)
    db.add(like)
    db.commit()
    db.refresh(like)
    return like

def dislike_video(video:Video, user:User, db:Session) -> Like:
    like = db.query(Like).filter(Like.user_id == user.id, Like.video_id == video.id).first()
    if like is None:
        raise HTTPException(400, "You didn't liked this video")
    
    db.delete(like)
    db.commit()

    return like

def comment_video(video:Video, user:User, text:str, db:Session) -> Comment:
    comment = Comment(video = video, user = user, text = text)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

def get_comments_video(video_id:str, db:Session):
    return db.query(Comment).filter(Comment.video_id == video_id).all()

def follow(follower:User, following:User, db:Session) -> Follow:
    if db.query(Follow).filter(Follow.follower == follower, Follow.following == following).first():
        raise HTTPException(400, "You're already following this account")
    fol = Follow(follower = follower, following = following)
    db.add(fol)
    db.commit()
    db.refresh(fol)
    return fol

def unfollow(follower:User, following:User, db:Session) -> Follow:
    fol = db.query(Follow).filter(Follow.follower == follower, Follow.following == following).first()
    if fol is None:
        raise HTTPException(400, "You're already not following this account")
    db.delete(fol)
    db.commit()
    return fol

def get_random_video(db:Session) -> Video:
    return db.query(Video).order_by(func.random()).first()