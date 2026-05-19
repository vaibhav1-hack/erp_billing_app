from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_connection
from middleware import get_current_user
from typing import Optional

router = APIRouter()

class ItemBody(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    unit: str = "pcs"

@router.get("/")
def get_items(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM items ORDER BY name")
    items = cur.fetchall()
    conn.close()
    return items

@router.post("/")
def create_item(body: ItemBody, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO items (name, description, price, stock, unit) VALUES (%s, %s, %s, %s, %s) RETURNING *",
        (body.name, body.description, body.price, body.stock, body.unit)
    )
    item = cur.fetchone()
    conn.commit()
    conn.close()
    return item

@router.put("/{item_id}")
def update_item(item_id: int, body: ItemBody, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE items SET name=%s, description=%s, price=%s, unit=%s WHERE id=%s RETURNING *",
        (body.name, body.description, body.price, body.unit, item_id)
    )
    item = cur.fetchone()
    conn.commit()
    conn.close()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.delete("/{item_id}")
def delete_item(item_id: int, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM items WHERE id=%s", (item_id,))
    conn.commit()
    conn.close()
    return {"success": True}