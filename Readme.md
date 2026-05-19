BillingERP — Dockerized Billing & Inventory System

A fully containerized ERP system built with FastAPI, PostgreSQL, and React.

📌 Overview

BillingERP is a 3-container ERP application designed for billing, inventory management, and customer handling. Everything runs using one command:

docker compose up -d --build

The system includes:

JWT authentication (bcrypt hashing)
Role-based access (Admin / Staff)
Full CRUD: Items, Customers, Bills
Automatic stock deduction + stock logs
React dashboard with Tailwind UI
Persistent PostgreSQL volume
📦 Tech Stack
Component	Technology	Purpose
Frontend	React 18 + Vite + Tailwind → Nginx	UI + proxy to backend
Backend	Python FastAPI	REST API + business logic
Database	PostgreSQL 15-alpine	Persistent storage
Containers	Docker Compose	Service orchestration
📂 Project Structure
billing-erp/
│   docker-compose.yml
│
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── items.py
│   ├── customers.py
│   ├── bills.py
│   ├── stock.py
│   ├── database.py
│   ├── middleware.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
│
└── database/
    └── schema/
        ├── 01_users.sql
        ├── 02_items.sql
        ├── 03_customers.sql
        ├── 04_bills.sql
        └── 05_stock_log.sql
🚀 How to Run
1. Start All Containers
docker compose up -d --build
2. Access Frontend
http://localhost/
3. First-Time Setup

Visit:

http://localhost/setup

Enter secret key:

itsbillingpage

Create the first admin user → login → done.

🧰 Development Commands
Docker
docker compose up -d
docker compose down
docker compose down -v      # fresh DB
docker logs billing_backend
docker exec -it billing_db psql billing_erp -U billadmin
Backend (FastAPI)
pip install -r requirements.txt
uvicorn main:app --reload
Frontend (React)
npm install
npm run dev
npm run build
🔐 Authentication
Passwords hashed using bcrypt
JWT token expiry: 8 hours
Auth flow:
Login → JWT issued
Every request → Authorization: Bearer <token>
Middleware verifies + injects user
🛂 Role Permissions
Feature	Admin	Staff
View Dashboard	✔	✔
Bills(Create/View)	✔	✔
Items CRUD	    ✔	✖
Adjust Stock	✔	✖
Customers CRUD	✔	✔
Manage Users	✔	✖
Access /setup	✔	✖
🧬 Database Auto-Schema

All .sql files inside:

database/schema/

are auto-executed only on first DB startup using:

/docker-entrypoint-initdb.d

To re-initialize DB:

docker compose down -v
docker compose up -d
🌐 Frontend Container (Nginx)
Multi-stage build: Node → Nginx
/api/* requests automatically proxied to backend
SPA routing fixed using try_files
📋 Features Completed
Fully containerized ERP
PostgreSQL volume persistence
Auto schema creation
FastAPI backend with JWT
React + Tailwind UI
Role-based access
Stock deduction + logs
Nginx-served SPA
One-command deployment
