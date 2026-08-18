from sqlalchemy import create_engine, text
from config import Config

engine = create_engine(
    Config.DATABASE_URL,
    pool_pre_ping=True
)

def execute(query, params=None, fetch=False):
    with engine.begin() as conn:
        result = conn.execute(
            text(query),
            params or {}
        )

        if fetch:
              return result.mappings().all()
           

        return None