"""
Tatkal Railway Lottery Booking System — FastAPI Server
======================================================
Includes: Train search, Lottery, Winner selection, Payment integration,
           Webhook handling, Background payment expiry scheduler.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import Depends, FastAPI, HTTPException, Request
from sqlmodel import SQLModel, Session, create_engine, select
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from datetime import date
import model
from model.booking import Status
from model.journey import Journey
from model.payment import Payment, PaymentStatus
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from model.user import User
from services.payment_service import expire_unpaid_winners
from services.lottery_service import run_winner_selection, auto_publish_expired_lotteries
from lib.sampling import sample_objects
from lib.util import segregate_user
from services.payment_service import (
    create_razorpay_order,
    verify_and_confirm_payment,
    mark_payment_failed,
    expire_unpaid_winners,
    calculate_total_fare,
    seconds_remaining,
    is_payment_window_active,
    SEAT_INDEX_MAP,
)
import traceback
import datetime
import asyncio
import hmac
import hashlib
import json

import razorpay

load_dotenv()

RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')
RAZORPAY_WEBHOOK_SECRET = os.getenv('RAZORPAY_WEBHOOK_SECRET', '')

if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
else:
    razorpay_client = None

SECRET_KEY = str(os.getenv('SECRET_KEY'))
ALGORITHM = str(os.getenv('ALGORITHM'))

import shutil

# Database Configuration
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    dataBase_url = DATABASE_URL
else:
    # Vercel Read-only Filesystem Workaround
    bundled_db_path = os.path.join(os.path.dirname(__file__), "tatkal.db")
    writable_db_path = "/tmp/tatkal.db"

    # Only copy if it doesn't exist in /tmp or if the bundled one is newer
    if not os.path.exists(writable_db_path):
        try:
            shutil.copy2(bundled_db_path, writable_db_path)
            os.chmod(writable_db_path, 0o666)
        except Exception as e:
            print(f"Error copying database to /tmp: {e}")
            writable_db_path = bundled_db_path # Fallback to read-only

    dataBase_url = f"sqlite:///{writable_db_path}"

engine = create_engine(
    url=str(dataBase_url), 
    echo=False, 
    pool_pre_ping=True,
    # Needed for SQLite on multiple threads
    connect_args={"check_same_thread": False} if "sqlite" in str(dataBase_url) else {}
)

def connect_create_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session


# ──────────────────────────────────────────────
# Background Scheduler: Expire Unpaid Bookings
# ──────────────────────────────────────────────
async def background_scheduler_loop():
    """Runs every 60 seconds to handle administrative background tasks."""
    while True:
        try:
            # Wrap synchronous DB operations in a thread to keep the event loop responsive
            await asyncio.to_thread(perform_background_tasks)
        except Exception as e:
            print(f"Background scheduler error: {e}")
            traceback.print_exc()
        await asyncio.sleep(60)

def perform_background_tasks():
    """The actual synchronous DB logic for background processing."""
    with Session(engine) as session:
        # 1. Expire unpaid winners and promote waitlist
        expiry_results = expire_unpaid_winners(session)
        if expiry_results['expired'] > 0:
            print(f"[{datetime.datetime.now()}] Expired {expiry_results['expired']} bookings, promoted {expiry_results['promoted']} waitlisted users.")
            
        # 2. Auto-publish expired lotteries
        # published_count = auto_publish_expired_lotteries(session)
        # if published_count > 0:
        #     print(f"[{datetime.datetime.now()}] Automatically published {published_count} lotteries.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_create_db()
    # Start background payment expiry task
    task = asyncio.create_task(background_scheduler_loop())
    yield
    task.cancel()

app = FastAPI(lifespan=lifespan, root_path="/api")

origins = [
    str(os.getenv('FRONTEND_URL')),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  
    allow_headers=["*"],   
)

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # 🔥 payload = what you stored in jwt()
        return payload

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
@app.post('/add_user')
async def addUser(user: model.User, session: Session = Depends(get_session)):
    try:
        existing_user = session.exec(
            select(model.User).where(model.User.email == user.email)
        ).first()
        if existing_user:
            return {
                'ok': True,
                'user_id': existing_user.id,
                'points': existing_user.points,
                'role': existing_user.role
            }
        
        # Assign admin role to first admin email
        admin_email = os.getenv("ADMIN_EMAIL", "momson1961@gmail.com")
        if user.email == admin_email:
            user.role = "admin"
            
        session.add(user)
        session.commit()
        session.refresh(user)
        return{
            'ok': True,
            'user_id': user.id,
            'user_points': user.points,
            'role': user.role
        }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }

@app.get('/published_trains')
async def publishedTrains(filter_date: str = None, session: Session = Depends(get_session)):
    """Return all published journeys (for admin passenger list view)."""
    try:
        print(f"[published_trains] Received filter_date param: '{filter_date}'")
        query = select(model.Publish, Journey).join(Journey, model.Publish.journey_id == Journey.id).where(model.Publish.published == True)
        
        parsed_date = None
        if filter_date and filter_date.strip():
            # Try multiple formats, including 2-digit year and common separators
            formats = ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%m/%d/%y", "%d/%m/%y")
            clean_date = filter_date.strip().replace(',', '/').replace(' ', '')
            
            for fmt in formats:
                try:
                    d_obj = datetime.datetime.strptime(clean_date, fmt).date()
                    query = query.where(Journey.departure_date == d_obj)
                    parsed_date = str(d_obj)
                    print(f"[published_trains] Filter applied for date: {d_obj}")
                    break
                except ValueError:
                    continue
            
            if not parsed_date:
                print(f"[published_trains] FAILED to parse date: '{filter_date}'")
                return {'ok': True, 'trains': [], 'message': f'Could not parse date: {filter_date}.'}
        else:
            print("[published_trains] No date filter provided.")
            
        results = session.exec(query.distinct()).all()
        trains = []
        for p, train in results:
            trains.append({
                'id': train.id,
                'train_name': train.train_name,
                'train_number': train.train_number,
                'from_station': train.from_station,
                'to_station': train.to_station,
                'departure_date': str(train.departure_date),
                'departure_time': train.departure_time,
                'published_at': str(p.published_at) if p.published_at else None,
            })
        return {'ok': True, 'trains': trains, 'applied_filter': parsed_date}
    except Exception as e:
        traceback.print_exc()
        return {'ok': False, 'message': str(e)}

@app.get('/passengers')
async def getPassengers(journey_id: int, session: Session = Depends(get_session)):
    """Return all passengers (winners) for a published journey."""
    try:
        publish = session.exec(
            select(model.Publish).where(
                model.Publish.journey_id == journey_id,
                model.Publish.published == True
            )
        ).first()
        if not publish:
            return {'ok': False, 'message': 'Journey not published yet'}

        bookings = session.exec(
            select(model.Booking).where(
                model.Booking.journey_id == journey_id,
                model.Booking.status.in_(['selected', 'confirmed', 'payment_pending', 'payment_failed'])
            )
        ).all()

        passengers = []
        for b in bookings:
            user = session.exec(
                select(model.User).where(model.User.email == b.user_email)
            ).first()
            passengers.append({
                'booking_id': b.id,
                'name': user.name if user else 'Unknown',
                'email': b.user_email,
                'seat_class': b.seat_class,
                'status': b.status,
                'paid': b.paid,
                'selected_at': str(b.selected_at) if b.selected_at else None,
            })

        return {'ok': True, 'passengers': passengers, 'total': len(passengers)}
    except Exception as e:
        traceback.print_exc()
        return {'ok': False, 'message': str(e)}

@app.post('/add_train')

async def addTrain(train: Journey, session: Session = Depends(get_session)):
    session.add(train)
    session.commit()
    session.refresh(train)
    publish = model.Publish(
        journey_id=train.id, # type: ignore
    )
    session.add(publish)
    session.commit()
    session.refresh(publish)
    return{
        'ok': True,
        'journey_id': train.id 
    }

@app.get('/get_trains')
async def getTrains(from_station: str, to_station: str, date: date, session: Session = Depends(get_session)):
    try:
        from sqlalchemy import func
        statement = (
            select(Journey, model.Publish)
            .join(model.Publish, Journey.id == model.Publish.journey_id)
            .where(
                func.lower(Journey.from_station) == func.lower(from_station),
                func.lower(Journey.to_station) == func.lower(to_station),
            )
            .group_by(Journey.train_number)
        )
        results = session.exec(statement).all()
        journeys = []
        import json
        for itrian, publish in results:
            train_dict = itrian.model_dump() if hasattr(itrian, 'model_dump') else itrian.dict()
            train_dict['published'] = publish.published
            
            # Ensure seats and fare are lists (sometimes SQLite JSON comes as strings)
            if isinstance(train_dict.get('seats'), str):
                try: train_dict['seats'] = json.loads(train_dict['seats'])
                except: train_dict['seats'] = [0, 0, 0]
            if isinstance(train_dict.get('fare'), str):
                try: train_dict['fare'] = json.loads(train_dict['fare'])
                except: train_dict['fare'] = [0, 0, 0]

            # Dynamically update the dates and times to ensure the window is OPEN for testing
            train_dict['departure_date'] = date
            train_dict['arrival_date'] = date
            train_dict['opening_date'] = date
            train_dict['closing_date'] = date
            train_dict['opening_time'] = "00:00:00"
            train_dict['closing_time'] = "23:59:59"
            
            journeys.append(train_dict)

        return {'ok': True, 'journeys': journeys}
    except Exception as e:
        return {'ok': False, 'message': str(e)}

@app.get('/one_train')
async def getOneTrain(journey_id: int, session: Session = Depends(get_session)):
    try:
        train = session.exec(
            select(Journey).where(Journey.id == journey_id)
        ).one()
        
        train_dict = train.model_dump() if hasattr(train, 'model_dump') else train.dict()
        
        # Ensure seats and fare are lists
        import json
        if isinstance(train_dict.get('seats'), str):
            try: train_dict['seats'] = json.loads(train_dict['seats'])
            except: train_dict['seats'] = [0, 0, 0]
        if isinstance(train_dict.get('fare'), str):
            try: train_dict['fare'] = json.loads(train_dict['fare'])
            except: train_dict['fare'] = [0, 0, 0]

        # Mock dates for the detail view too
        today = datetime.date.today()
        train_dict['departure_date'] = today
        train_dict['arrival_date'] = today
        train_dict['opening_date'] = today
        train_dict['closing_date'] = today
        train_dict['opening_time'] = "00:00:00"
        train_dict['closing_time'] = "23:59:59"
        
        return {
            'ok': True,
            'train': train_dict
        }
    except Exception as e:
        return {
            'ok': False,
            'message': 'Train not found'
        }

@app.get('/check_lottery')
async def checkLottery(email: str, journey_id: int, session: Session = Depends(get_session)):
    try:
        booking = session.exec(
            select(model.Booking).where(model.Booking.user_email == email, model.Booking.journey_id == journey_id)
        ).first()
        if booking:
            return {
                'ok': True,
                'booking_id': booking.id
            }
        return {
            'ok': False,
            'message': 'Booking not found'
        }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }

@app.post('/lottery')
async def lottery(booking: model.Booking, session: Session = Depends(get_session)):
    try:
        # 1. Enforce Status
        booking.status = Status.PENDING.value
        
        # 2. Check Train Existence
        train = session.exec(
            select(Journey).where(Journey.id == booking.journey_id)
        ).first()
        if not train:
            return {"ok": False, "message": "Journey does not exist"}
            
        # 3. Check if Lottery is already Published
        publish = session.exec(
            select(model.Publish).where(model.Publish.journey_id == booking.journey_id)
        ).first()
        if publish and publish.published:
            return {"ok": False, "message": "Lottery has already been completed for this train"}
            
        # 4. Check Duplicate Entries
        existing_booking = session.exec(
            select(model.Booking).where(model.Booking.user_email == booking.user_email, model.Booking.journey_id == booking.journey_id)
        ).first()
        if existing_booking:
            return {"ok": False, "message": "You have already entered the lottery for this journey"}
            
        session.add(booking)
        session.commit()
        session.refresh(booking)
        print(booking)
        return {
            'ok': True,
            'booking_id': booking.id
        }
    except Exception as e:
        traceback.print_exc()
        return {
            'ok': False,
            'message': str(e)
        }



@app.post('/publish_lottery')
async def publishLottery(journey_id: int, session: Session = Depends(get_session)):
    try:
        # 1. Get the train number for this journey to identify duplicates/backlog
        journey = session.exec(select(Journey).where(Journey.id == journey_id)).first()
        if not journey:
            return {'ok': False, 'message': "Journey not found."}
        
        train_num = journey.train_number
        
        # 2. Run selection for the SPECIFIC journey requested
        publish_id = run_winner_selection(journey_id, session)
        
        if publish_id:
            # Aggressively mark ALL journeys for this same train as published
            # This ensures they don't reappear in the backlog even if they didn't have a publish record
            all_journeys = session.exec(select(Journey).where(Journey.train_number == train_num)).all()
            for j in all_journeys:
                p = session.exec(select(model.Publish).where(model.Publish.journey_id == j.id)).first()
                if not p:
                    p = model.Publish(journey_id=j.id, published=True, published_at=datetime.datetime.now())
                    session.add(p)
                else:
                    p.published = True
                    p.published_at = datetime.datetime.now()
                    session.add(p)
            
            session.commit()

            return {
                'ok': True,
                'publish_id': publish_id,
                'message': f"All lotteries for train {train_num} have been processed."
            }
        
        return {
            'ok': False,
            'message': "Lottery already published or could not be processed."
        }
    except Exception as e:
        traceback.print_exc()
        return {
            'ok': False,
            'message': str(e)
        }

@app.get('/dev/reset_train')
async def resetTrainDev(journey_id: int, session: Session = Depends(get_session)):
    """Developer endpoint to reset a train so the lottery can be tested again."""
    try:
        publish = session.exec(
            select(model.Publish).where(model.Publish.journey_id == journey_id)
        ).first()

        if publish:
            publish.published = False
            session.add(publish)
            
            # Delete associated bookings and payments to start fresh
            bookings = session.exec(
                select(model.Booking).where(model.Booking.journey_id == journey_id)
            ).all()
            
            for b in bookings:
                payments = session.exec(
                    select(Payment).where(Payment.booking_id == b.id)
                ).all()
                for p in payments:
                    session.delete(p)
                session.delete(b)
            
            session.commit()
            return {'ok': True, 'message': f'Train {journey_id} reset successfully!'}
            
        return {'ok': False, 'message': 'Publish record not found'}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {'ok': False, 'message': str(e)}


@app.get('/un_published_trains')
async def unPublishedTrains(session: Session = Depends(get_session)):
    try:
        # Get journeys that have an unpublished record, grouped by train number for a clean view
        statement = (
            select(Journey)
            .join(model.Publish, Journey.id == model.Publish.journey_id)
            .where(model.Publish.published == False)
            .group_by(Journey.train_number)
            .order_by(Journey.train_number) # Stable sorting
            .limit(20)
        )
        trains = session.exec(statement).all()
        
        results = []
        for journey in trains:
            train_dict = journey.model_dump() if hasattr(journey, 'model_dump') else journey.dict()
            results.append(train_dict)
            
        return {
            'ok': True,
            'trains': results
        }
    except Exception as e:
        traceback.print_exc()
        return {
            'ok': False,
            'message': str(e)
        }

@app.get('/my_ticket')
async def myTicket(email:str, session: Session = Depends(get_session)):
    try:
        from sqlalchemy import func
        # Case-insensitive email search
        bookings_found = session.exec(
            select(model.Booking).where(func.lower(model.Booking.user_email) == email.lower())
        ).all()
        
        trains = []
        valid_bookings = []
        
        if bookings_found:
            for b in bookings_found:
                train = session.exec(
                    select(Journey).where(Journey.id == b.journey_id)
                ).first() 
                if train:
                    train_dict = train.model_dump() if hasattr(train, 'model_dump') else train.dict()
                    # Apply the same date mocking for consistency in view
                    today = datetime.date.today()
                    train_dict['departure_date'] = today
                    train_dict['arrival_date'] = today
                    
                    trains.append(train_dict)
                    valid_bookings.append(b)
            
            return {
                'ok': True,
                'booking': valid_bookings,
                'trains': trains
            }
        
        return {
            'ok': False,
            'message': 'No bookings found for this email.'
        }
    except Exception as e:
        traceback.print_exc()
        return {
            'ok': False,
            'message': str(e)
        }

@app.get('/booking')
async def booking(bookingId: int, session: Session = Depends(get_session)):
    try:
        booking = session.exec(
            select(model.Booking).where(model.Booking.id == bookingId)
        ).one()
        jorney_id = booking.journey_id
        seat_class = booking.seat_class
        train = session.exec(
            select(Journey).where(Journey.id == jorney_id)
        ).one()
        index = SEAT_INDEX_MAP.get(seat_class.value if hasattr(seat_class, 'value') else seat_class, 0)
        fare = calculate_total_fare(train.fare[index])
            
        return {
            'ok': True,
            'amount': fare['total'],
            'base_fare': fare['base_fare'],
            'convenience_fee': fare['convenience_fee'],
            'gst': fare['gst'],
            'paid': booking.paid,
            'status': booking.status,
            'seconds_remaining': seconds_remaining(booking),
        }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }


# ═══════════════════════════════════════════════
# PAYMENT ROUTES
# ═══════════════════════════════════════════════

@app.post('/create_order')
async def create_order(request: Request, session: Session = Depends(get_session)):
    """Create a Razorpay order for a selected lottery winner."""
    try:
        data = await request.json()
        bookingId = data.get('bookingId')
        user_email = data.get('user_email')
        
        # 1. Cast and Verify Booking ID
        if not bookingId:
            return {"ok": False, "message": "Missing booking ID"}
        b_id = int(bookingId)

        # 2. Check Razorpay Setup
        if not razorpay_client:
            return {"ok": False, "message": "Razorpay client not initialized. Check .env keys."}

        booking = session.exec(
            select(model.Booking).where(model.Booking.id == b_id)
        ).one()
        train = session.exec(
            select(Journey).where(Journey.id == booking.journey_id)
        ).one()
        
        # Delegate to payment service
        success, result = create_razorpay_order(
            razorpay_client, booking, train, user_email or booking.user_email, session
        )
        
        return {'ok': success, **result}

    except Exception as e:
        traceback.print_exc()
        return {
            'ok': False,
            'message': str(e)
        }

@app.post('/pay')
async def pay(request: Request, session: Session = Depends(get_session)):
    """Verify Razorpay payment signature and confirm booking."""
    data = await request.json()
    bookingId = data.get('bookingId')
    razorpay_payment_id = data.get('razorpay_payment_id')
    razorpay_order_id = data.get('razorpay_order_id')
    razorpay_signature = data.get('razorpay_signature')
    user_email = data.get('user_email', '')
    
    try:
        if not razorpay_client:
            return {"ok": False, "message": "Razorpay client not initialized"}
            
        # Fetch booking to get user_email if not provided
        booking = session.exec(
            select(model.Booking).where(model.Booking.id == int(bookingId))
        ).first()
        if not booking:
            return {"ok": False, "message": "Booking not found"}
        
        email = user_email or booking.user_email
        
        success, result = verify_and_confirm_payment(
            razorpay_client,
            int(bookingId),
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            email,
            session,
        )
        return {'ok': success, **result}

    except Exception as e:
        traceback.print_exc()
        return {
            'ok': False,
            'message': 'Payment verification failed: ' + str(e)
        }


@app.post('/payment/webhook')
async def payment_webhook(request: Request, session: Session = Depends(get_session)):
    """
    Razorpay Webhook endpoint.
    Supports: payment.captured, payment.failed
    Verifies webhook signature for security.
    """
    try:
        body = await request.body()
        signature = request.headers.get('X-Razorpay-Signature', '')

        # Verify webhook signature
        if RAZORPAY_WEBHOOK_SECRET:
            expected = hmac.new(
                RAZORPAY_WEBHOOK_SECRET.encode('utf-8'),
                body,
                hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(expected, signature):
                raise HTTPException(status_code=400, detail='Invalid webhook signature')

        payload = json.loads(body)
        event = payload.get('event', '')

        if event == 'payment.captured':
            payment_entity = payload['payload']['payment']['entity']
            order_id = payment_entity.get('order_id')
            payment_id = payment_entity.get('id')

            payment = session.exec(
                select(Payment).where(Payment.razorpay_order_id == order_id)
            ).first()
            if payment and payment.status != PaymentStatus.SUCCESS.value:
                payment.razorpay_payment_id = payment_id
                payment.status = PaymentStatus.SUCCESS.value
                payment.updated_at = datetime.datetime.now()
                session.add(payment)

                booking = session.exec(
                    select(model.Booking).where(model.Booking.id == payment.booking_id)
                ).first()
                if booking:
                    booking.paid = True
                    booking.status = Status.CONFIRMED.value
                    session.add(booking)

                session.commit()

        elif event == 'payment.failed':
            payment_entity = payload['payload']['payment']['entity']
            order_id = payment_entity.get('order_id')

            mark_payment_failed(order_id, session)

        return {'status': 'ok'}

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return {'status': 'error', 'message': str(e)}


@app.get('/payment/status')
async def payment_status(booking_id: int, session: Session = Depends(get_session)):
    """Get payment status for a booking."""
    try:
        payments = session.exec(
            select(Payment).where(Payment.booking_id == booking_id)
        ).all()
        return {
            'ok': True,
            'payments': [
                {
                    'id': p.id,
                    'status': p.status,
                    'amount': p.amount,
                    'razorpay_order_id': p.razorpay_order_id,
                    'razorpay_payment_id': p.razorpay_payment_id,
                    'created_at': str(p.created_at),
                }
                for p in payments
            ],
        }
    except Exception as e:
        return {'ok': False, 'message': str(e)}

@app.get('/get_time')
async def getTime(journey_id: int, session: Session = Depends(get_session)):
    try:
        # For testing, always return 'open' with a healthy countdown
        return {
            'ok': True,
            'seconds': 3600, # 1 hour remaining
            'status': 'open',
        }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }