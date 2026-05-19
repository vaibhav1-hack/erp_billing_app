import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    conn = psycopg2.connect(
        host="db",
        port=5432,
        database="billing_erp",
        user="admin",
        password="admin123",
        cursor_factory=RealDictCursor
    )
    return conn