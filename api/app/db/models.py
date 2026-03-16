from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.db.database_sql import Base

from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, unique=True)
    email = Column(String, index=True, unique=True)
    password_hash = Column(String)

    playlist_link = relationship("UserPlayList", back_populates="user")

    music_added = relationship("Music", back_populates="added_by")

    video_added = relationship("Video", back_populates="added_by")

    playlist_created = relationship("PlayList", back_populates="author")

    liked_video = relationship("Like", back_populates="user")

    commented_video = relationship("Comment", back_populates="user")

    followings = relationship("Follow", back_populates="follower", foreign_keys="Follow.follower_id")

    followers = relationship("Follow", back_populates="following", foreign_keys="Follow.following_id")

class Music(Base):
    __tablename__ = "musics"

    id = Column(String, primary_key=True, index=True, unique=True)

    added_by_id = Column(Integer, ForeignKey("users.id"))
    added_by = relationship("User", back_populates="music_added")

    added_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    playlist_link = relationship("PlayListMusic", back_populates="music")

class PlayList(Base):
    __tablename__ = "playlists"

    id = Column(Integer, primary_key=True, index=True, unique=True)

    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="playlist_created")

    creation_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user_link = relationship("UserPlayList", back_populates="playlist")

    music_link = relationship("PlayListMusic", back_populates="playlist")

class UserPlayList(Base):
    __tablename__ = "userplaylists"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    user = relationship("User", back_populates="playlist_link")

    playlist_id = Column(Integer, ForeignKey("playlists.id"), primary_key=True, index=True)
    playlist = relationship("PlayList", back_populates="user_link")

class PlayListMusic(Base):
    __tablename__ = "playlistmusic"

    playlist_id = Column(Integer, ForeignKey("playlists.id"), primary_key=True, index=True)
    playlist = relationship("PlayList", back_populates="music_link")

    music_id = Column(String, ForeignKey("musics.id"), primary_key=True, index=True)
    music = relationship("Music", back_populates="playlist_link")


class Video(Base):
    __tablename__ = "videos"

    id = Column(String, primary_key=True, index=True, unique=True)

    added_by_id = Column(Integer, ForeignKey("users.id"))
    added_by = relationship("User", back_populates="video_added")

    added_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    likes = relationship("Like", back_populates="video")

    comments = relationship("Comment", back_populates="video")

class Like(Base):
    __tablename__ = "likes"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    user = relationship("User", back_populates="liked_video")

    video_id = Column(String, ForeignKey("videos.id"), primary_key=True, index=True)
    video = relationship("Video", back_populates="likes")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, autoincrement=True)

    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    user = relationship("User", back_populates="commented_video")

    video_id = Column(String, ForeignKey("videos.id"), index=True)
    video = relationship("Video", back_populates="comments")

    text = Column(String)

class Follow(Base):
    __tablename__ = "follows"

    follower_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    follower = relationship("User", back_populates="followings", foreign_keys=[follower_id])

    following_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    following = relationship("User", back_populates="followers", foreign_keys=[following_id])