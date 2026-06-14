from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.schema.auth import CreateUser, LoginUser
from app.schema.response import ResponseModel
from app.schema.user_response import UserResponse

from app.services.auth_service import create_user, login_user

from app.core.database import get_db
from app.core.security import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post("/register", response_model=ResponseModel)
async def register(
    payload: CreateUser,
    db: AsyncSession = Depends(get_db),
):
    user = await create_user(
        db=db,
        name=payload.name,
        username=payload.username,
        email=payload.email,
        password=payload.password,
    )

    if not user:
        return ResponseModel(
            success=False,
            message="Cannot create user",
        )

    user_data = UserResponse.model_validate(user)

    return ResponseModel(
        success=True,
        message="User registered successfully",
        data=user_data,
    )


@router.post("/login", response_model=ResponseModel)
async def login(
    payload: LoginUser,
    db: AsyncSession = Depends(get_db),
):
    user = await login_user(
        db=db,
        email=payload.email,
        password=payload.password,
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
        }
    )

    user_data = UserResponse.model_validate(user)

    response_data = {
        "user": user_data,
        "token": token,
    }

    return ResponseModel(
        success=True,
        message="User logged in successfully",
        data=response_data,
    )
