from pydantic import BaseModel

class MusicPost(BaseModel):
    format:str
    link:str

class CommentPost(BaseModel):
    text:str

class ProfileGet(BaseModel):
    id:int
    email:str
