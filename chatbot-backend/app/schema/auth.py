from pydantic import BaseModel, EmailStr, Field


class CreateUser(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=40)
    password: str
    name: str


class LoginUser(BaseModel):
    email: str
    password: str
