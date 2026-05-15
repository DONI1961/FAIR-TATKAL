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

db_path = os.path.join(os.path.dirname(__file__), "tatkal.db")
dataBase_url = f"sqlite:///{db_path}"

engine = create_engine(url=str(dataBase_url), echo=False, pool_pre_ping=True)

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
        published_count = auto_publish_expired_lotteries(session)
        if published_count > 0:
            print(f"[{datetime.datetime.now()}] Automatically published {published_count} lotteries.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_create_db()
    # Start background payment expiry task
    task = asyncio.create_task(background_scheduler_loop())
    yield
    task.cancel()

app = FastAPI(lifespan=lifespan)

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
        # Single JOIN query — replaces the old N+1 loop that caused timeouts
        from sqlalchemy import func
        statement = (
            select(Journey, model.Publish)
            .join(model.Publish, Journey.id == model.Publish.journey_id)
            .where(
                Journey.departure_date == date,
                func.lower(Journey.from_station) == func.lower(from_station),
                func.lower(Journey.to_station) == func.lower(to_station),
            )
        )
        results = session.exec(statement).all()
        journeys = []
        for itrian, publish in results:
            train_dict = itrian.model_dump() if hasattr(itrian, 'model_dump') else itrian.dict()
            train_dict['published'] = publish.published
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
        print(train)
        return {
            'ok': True,
            'train': train
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
        publish_id = run_winner_selection(journey_id, session)
        if publish_id:
            return {
                'ok': True,
                'publish_id': publish_id
            }
        return {
            'ok': False,
            'message': "Lottery already published or not found."
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
        publish = session.exec(
            select(model.Publish).where(model.Publish.published == False)
        ).all()
        trains = []
        if len(publish) == 0:
            return {
                'ok': True,
                'trains': []
            }
        for p in publish:
            train = session.exec(
                select(Journey).where(Journey.id == p.journey_id)
            ).one() 
            if train:
                trains.append(train)
        return {
            'ok': True,
            'trains': trains
        }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }
@app.get('/my_ticket')
async def myTicket(email:str, session: Session = Depends(get_session)):

    try:
        print(email)
        booking = session.exec(
            select(model.Booking).where(model.Booking.user_email == email)
        ).all()
        trains = []
        print(booking)
        if booking:
            for b in booking:
                train = session.exec(
                    select(Journey).where(Journey.id == b.journey_id)
                ).one() 
                if train:
                    trains.append(train)
            print(
                {
                    'ok': True,
                    'booking': booking,
                    'trains': trains
                }
            )
            return {
                'ok': True,
                'booking': booking,
                'trains': trains
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
        train = session.exec(
            select(Journey).where(Journey.id == journey_id)
        ).one()

        now = datetime.datetime.now()

        # Combine date + time properly
        opening_dt = datetime.datetime.combine(train.opening_date, train.opening_time)
        closing_dt = datetime.datetime.combine(train.closing_date, train.closing_time)

        # Before opening
        if now < opening_dt:
            diff = (opening_dt - now)
            print(diff)
            return {
                'ok': True,
                'seconds': diff.total_seconds()+2,
                'status': 'opening',
            }

        # After closing
        if now > closing_dt:
            return {
                'ok': True,
                'status': 'closed',
            }

        # Currently open
        diff = (closing_dt - now)

        return {
            'ok': True,
            'seconds': diff.total_seconds()+2,
            'status': 'open',
        }

    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }