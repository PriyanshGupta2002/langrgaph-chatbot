from sqlalchemy import Column, Integer, String, CheckConstraint
from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)

    email = Column(String, unique=True, nullable=False, index=True)

    password = Column(String, nullable=False)
    __table_args__ = (
        CheckConstraint("length(username) >= 3", name="username_min_length"),
    )
