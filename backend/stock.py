from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_connection
from middleware import get_current_user
from typing import Optional

router = APIRouter()

class StockAdjust(BaseModel):
    change: int
    reason: Optional[str] = "manual"

@router.get("/low")
def get_low_stock(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM items WHERE stock < 10 ORDER BY stock ASC")
    items = cur.fetchall()
    conn.close()
    return items

@router.get("/log")
def get_stock_log(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT sl.*, i.name AS item_name, u.name AS user_name
        FROM stock_log sl
        LEFT JOIN items i ON i.id = sl.item_id
        LEFT JOIN users u ON u.id = sl.created_by
        ORDER BY sl.created_at DESC
        LIMIT 100
    """)
    logs = cur.fetchall()
    conn.close()
    return logs

@router.patch("/{item_id}/adjust")
def adjust_stock(item_id: int, body: StockAdjust, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("BEGIN")
        cur.execute(
            "UPDATE items SET stock = stock + %s WHERE id = %s RETURNING *",
            (body.change, item_id)
        )
        item = cur.fetchone()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        if item["stock"] < 0:
            raise HTTPException(status_code=400, detail="Stock cannot go negative")
        cur.execute(
            "INSERT INTO stock_log (item_id, change, reason, created_by) VALUES (%s, %s, %s, %s)",
            (item_id, body.change, body.reason, user["id"])
        )
        conn.commit()
        return item
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()