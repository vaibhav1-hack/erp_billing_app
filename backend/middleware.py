from fastapi import HTTPException, Header
from jose import jwt, JWTError

SECRET_KEY = "erp_1st_app"
ALGORITHM = "HS256"

def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except:
        raise HTTPException(status_code=401, detail="No token provided")

def admin_only(user):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

def admin_or_staff(user):
    if user["role"] not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Access denied")