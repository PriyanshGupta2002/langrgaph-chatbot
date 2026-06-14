from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth_router, chat_router, thread_router

from app.ai.graph_builder import build_graph
import app.ai.graph as graph_store
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from app.core.config import settings

from psycopg_pool import AsyncConnectionPool
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

app = FastAPI()


@app.on_event("startup")
async def startup():
    pool = AsyncConnectionPool(
        conninfo=settings.CHECKPOINT_DB_URL, max_size=20, open=False
    )

    await pool.open()
    saver = AsyncPostgresSaver(pool)
    await saver.setup()
    graph_store.graph = build_graph(saver)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


app.include_router(auth_router.router)
app.include_router(thread_router.router)
app.include_router(chat_router.router)
