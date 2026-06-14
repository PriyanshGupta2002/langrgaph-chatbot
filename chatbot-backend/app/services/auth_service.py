from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.models.User import User
from app.core.security import hash_password, verify_password


async def create_user(
    db: AsyncSession,
    name: str,
    username: str,
    email: str,
    password: str,
):
    user = User(
        username=username,
        name=name,
        email=email,
        password=hash_password(password),
    )

    db.add(user)

    await db.commit()
    await db.refresh(user)

    return user


async def login_user(
    db: AsyncSession,
    email: str,
    password: str,
):
    result = await db.execute(select(User).where(User.email == email))

    user = result.scalar_one_or_none()

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user
