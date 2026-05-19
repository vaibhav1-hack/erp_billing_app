from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_connection
from middleware import get_current_user
from typing import Optional

router = APIRouter()

class CustomerBody(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

@router.get("/")
def get_customers(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM customers ORDER BY name")
    customers = cur.fetchall()
    conn.close()
    return customers

@router.post("/")
def create_customer(body: CustomerBody, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO customers (name, email, phone, address) VALUES (%s, %s, %s, %s) RETURNING *",
        (body.name, body.email, body.phone, body.address)
    )
    customer = cur.fetchone()
    conn.commit()
    conn.close()
    return customer

@router.put("/{customer_id}")
def update_customer(customer_id: int, body: CustomerBody, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE customers SET name=%s, email=%s, phone=%s, address=%s WHERE id=%s RETURNING *",
        (body.name, body.email, body.phone, body.address, customer_id)
    )
    customer = cur.fetchone()
    conn.commit()
    conn.close()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM customers WHERE id=%s", (customer_id,))
    conn.commit()
    conn.close()
    return {"success": True}