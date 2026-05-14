# Smart Rail — Lottery-Based Railway Booking System

Smart Rail is a modern railway booking application designed to solve the "Tatkal" booking problem by replacing the first-come-first-served race with a fair, weighted lottery-based selection process.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (3.10+)
- SQLite3

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python server.py
```
*Note: The backend runs on `http://localhost:8000`.*

### 3. Frontend Setup (Next.js)
```bash
cd my-app
npm install
npm run dev
```
*Note: The frontend runs on `http://localhost:3000`.*

## 🛠️ Key Features
- **Fair Lottery Algorithm**: Uses weighted priority scoring based on previous booking failures.
- **Bot Protection**: Aadhaar verification and timing analysis for submissions.
- **Admin Dashboard**: Comprehensive tools to add trains, manage schedules, and publish results.
- **Payment Integration**: Seamless checkout via Razorpay.

## 👤 Role-Based Access
- **User**: Search trains, enter lotteries, track status, and view tickets.
- **Admin**: Configure routes, set quotas, trigger lottery selection, and audit passengers.
  - *To grant admin access, add the user email to `ADMIN_EMAILS` in `backend/server.py`.*

## 📄 Project Documentation
The complete application flow, including user and admin workflows, is documented in `report.html`.

---
© 2026 Smart Rail Project
