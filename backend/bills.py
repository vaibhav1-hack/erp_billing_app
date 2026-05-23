from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_connection
from middleware import get_current_user
from typing import Optional, List

router = APIRouter()

class BillItem(BaseModel):
    item_id: Optional[int] = None
    name: str
    price: float
    purchase_price: float = 0
    quantity: int

class BillBody(BaseModel):
    customer_id: Optional[int] = None
    notes: Optional[str] = None
    items: List[BillItem]

@router.get("/")
def get_bills(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT b.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
        FROM bills b
        LEFT JOIN customers c ON c.id = b.customer_id
        ORDER BY b.created_at DESC
    """)
    bills = cur.fetchall()
    conn.close()
    return bills

@router.get("/{bill_id}")
def get_bill(bill_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT b.*, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
        FROM bills b
        LEFT JOIN customers c ON c.id = b.customer_id
        WHERE b.id = %s
    """, (bill_id,))
    bill = cur.fetchone()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    cur.execute("SELECT * FROM bill_items WHERE bill_id = %s", (bill_id,))
    items = cur.fetchall()
    conn.close()
    return {**bill, "items": items}

@router.post("/")
def create_bill(body: BillBody, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("BEGIN")
        cur.execute(
            "INSERT INTO bills (customer_id, created_by, notes) VALUES (%s, %s, %s) RETURNING *",
            (body.customer_id, user["id"], body.notes)
        )
        bill = cur.fetchone()
        total = 0
        for li in body.items:
            cur.execute(
                "INSERT INTO bill_items (bill_id, item_id, name, price, quantity) VALUES (%s, %s, %s, %s, %s)",
                (bill["id"], li.item_id, li.name, li.price, li.quantity)
            )
            if li.item_id:
                cur.execute(
                    "UPDATE items SET stock = stock - %s WHERE id = %s RETURNING stock",
                    (li.quantity, li.item_id)
                )
                result = cur.fetchone()
                if not result or result["stock"] < 0:
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for item {li.item_id}")
                cur.execute(
                    "INSERT INTO stock_log (item_id, change, reason, created_by) VALUES (%s, %s, %s, %s)",
                    (li.item_id, -li.quantity, "bill created", user["id"])
                )

            profit = (li.price - li.purchase_price) * li.quantity
            cur.execute(
                "INSERT INTO profits (bill_id, item_id, item_name, quantity, purchase_price, sales_price, profit) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (bill["id"], li.item_id, li.name, li.quantity, li.purchase_price, li.price, profit)
            )

            total += li.price * li.quantity

        cur.execute("UPDATE bills SET total = %s WHERE id = %s", (total, bill["id"]))
        conn.commit()
        cur.execute("SELECT * FROM bills WHERE id = %s", (bill["id"],))
        updated = cur.fetchone()
        return updated
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.patch("/{bill_id}/status")
def update_status(bill_id: int, status: str, user=Depends(get_current_user)):
    if status not in ["draft", "paid", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE bills SET status=%s WHERE id=%s RETURNING *", (status, bill_id))
    bill = cur.fetchone()
    conn.commit()
    conn.close()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill