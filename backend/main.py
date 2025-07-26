from fastapi import FastAPI
from api.routes import router

app = FastAPI(title="Candlestick Pattern Detection API")

app.include_router(router)
