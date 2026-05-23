from fastapi import APIRouter, Depends
from database import get_connection
from middleware import get_current_user

router = APIRouter()

@router.get("/")
def get_profits(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT 
            p.*,
            b.created_at AS bill_date,
            b.status AS bill_status
        FROM profits p
        LEFT JOIN bills b ON b.id = p.bill_id
        ORDER BY p.created_at DESC
    """)
    profits = cur.fetchall()
    conn.close()
    return profits

@router.get("/summary")
def get_profit_summary(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT
            SUM(p.profit) AS total_profit,
            SUM(p.quantity * p.purchase_price) AS total_cost,
            SUM(p.quantity * p.sales_price) AS total_revenue,
            COUNT(DISTINCT p.bill_id) AS total_bills
        FROM profits p
        LEFT JOIN bills b ON b.id = p.bill_id
        WHERE b.status = 'paid'
    """)
    summary = cur.fetchone()
    conn.close()
    return summary