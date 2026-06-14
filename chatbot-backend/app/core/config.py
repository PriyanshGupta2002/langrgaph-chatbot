from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    SECRET_KEY: str = "super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str
    ALEMBIC_DATABASE_URL: str
    OPENROUTER_API_KEY: str
    CHECKPOINT_DB_URL: str

    class Config:
        env_file = ".env"


settings = Settings()
