from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_connection
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from fastapi import Depends
from middleware import get_current_user
router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "erp_1st_app"
ALGORITHM = "HS256"

@router.get("/setup-required")
def setup_required():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as count FROM users")
    result = cur.fetchone()
    conn.close()
    return {"required": result["count"] == 0}


@router.get("/users")
def get_users(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC")
    users = cur.fetchall()
    conn.close()
    return users

@router.get("/me")
def me(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, role FROM users WHERE id = %s", (user["id"],))
    u = cur.fetchone()
    conn.close()
    return u

class RegisterBody(BaseModel):
    name: str
    email: str
    password: str
    role: str = "staff"

class LoginBody(BaseModel):
    email: str
    password: str
@router.post("/setup")
def setup(body: RegisterBody):
    conn = get_connection()
    cur = conn.cursor()
    hashed = pwd_context.hash(body.password)
    try:
        cur.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s) RETURNING id, name, email, role",
            (body.name, body.email, hashed, "admin")
        )
        user = cur.fetchone()
        conn.commit()
        return user
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
@router.post("/register")
def register(body: RegisterBody):
    conn = get_connection()
    cur = conn.cursor()
    hashed = pwd_context.hash(body.password)
    try:
        cur.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s) RETURNING id, name, email, role",
            (body.name, body.email, hashed, body.role)
        )
        user = cur.fetchone()
        conn.commit()
        return user
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Email already exists")
    finally:
        conn.close()

@router.post("/login")
def login(body: LoginBody):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = %s", (body.email,))
    user = cur.fetchone()
    conn.close()
    if not user or not pwd_context.verify(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode(
        {"id": user["id"], "email": user["email"], "role": user["role"], "exp": datetime.utcnow() + timedelta(hours=8)},
        SECRET_KEY, algorithm=ALGORITHM
    )
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}}