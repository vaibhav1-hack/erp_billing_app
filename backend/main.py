from fastapi import FastAPI
from database import get_connection
from auth import router as auth_router
from items import router as items_router
from fastapi.security import HTTPBearer
from fastapi.openapi.utils import get_openapi
from customers import router as customers_router
from bills import router as bills_router
from profits import router as profits_router

from stock import router as stock_router

security = HTTPBearer()

app = FastAPI(
    title="BillingERP",
    docs_url="/docs",
    swagger_ui_parameters={"persistAuthorization": True}
)
app.include_router(profits_router, prefix="/api/profits")
app.include_router(stock_router, prefix="/api/stock")
app.include_router(customers_router, prefix="/api/customers")
app.include_router(bills_router, prefix="/api/bills")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(items_router, prefix="/api/items")
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/db-test")
def db_test():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users")
    rows = cur.fetchall()
    conn.close()
    return {"users": rows}
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(title="BillingERP", version="0.1.0", routes=app.routes)
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = schema
    return schema

app.openapi = custom_openapi