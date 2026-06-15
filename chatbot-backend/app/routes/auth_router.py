from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.schema.auth import CreateUser, LoginUser
from app.schema.response import ResponseModel
from app.schema.user_response import UserResponse

from app.services.auth_service import (
    create_user,
    login_user,
    generate_access_token_from_refresh_token,
)
from fastapi import APIRouter, Depends, HTTPException

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token

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
    response: Response,
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

    access_token = create_access_token(
        {"sub": str(user.id), "email": user.email, "type": "access"}
    )
    refresh_token = create_refresh_token(
        {"sub": str(user.id), "email": user.email, "type": "refresh"}
    )

    response.set_cookie(
        key="accessToken",
        value=access_token,
        httponly=True,
        secure=False,  # True in production HTTPS
        samesite="lax",
        max_age=60 * 60,  # 1 hour
    )

    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True,
        secure=False,  # True in production HTTPS
        samesite="lax",
        max_age=60 * 60 * 24,  # 24 hours
    )

    user_data = UserResponse.model_validate(user)

    response_data = {
        "user": user_data,
        "access_token": access_token,
        "refresh_token": refresh_token,
    }

    return ResponseModel(
        success=True,
        message="User logged in successfully",
        data=response_data,
    )


@router.post("/refresh-token")
async def generate_access_token(
    refresh_token: str,
):
    access_token = await generate_access_token_from_refresh_token(
        refresh_token=refresh_token
    )
    if not access_token:
        return HTTPException(status_code=404, detail="Cannot generate token")
    response_data = {
        "access_token": access_token,
    }
    return ResponseModel(
        data=response_data,
        message="Refresh token generated successdfully",
        success=True,
    )
