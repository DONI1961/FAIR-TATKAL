import datetime
from sqlmodel import Session, select
import model
from model.journey import Journey
from model.booking import Booking, Status
from model.publish import Publish
from model.user import User
from lib.util import segregate_user
from lib.sampling import sample_objects

def run_winner_selection(journey_id: int, session: Session):
    """
    Core logic to select winners and waitlist users for a specific journey.
    """
    publish = session.exec(
        select(Publish).where(Publish.journey_id == journey_id)
    ).first()

    if not publish or publish.published:
        return None

    train = session.exec(select(Journey).where(Journey.id == journey_id)).one()
    bookings = session.exec(
        select(Booking).where(Booking.journey_id == journey_id)
    ).all()

    if not bookings:
        # No bookings to process, just mark as published
        publish.published = True
        session.add(publish)
        session.commit()
        return publish.id

    # Fetch users associated with bookings
    user_emails = [b.user_email for b in bookings]
    users = session.exec(
        select(User).where(User.email.in_(user_emails))
    ).all()
    
    seg_user = segregate_user(users, bookings)
    now = datetime.datetime.now()

    for i, seat_class in enumerate(['economy', 'business', 'first']):
        if seat_class in seg_user and len(seg_user[seat_class]) != 0:
            # Capacity for this class
            capacity = train.seats[i] if i < len(train.seats) else 0
            
            selected_users = sample_objects(
                seg_user[seat_class], 
                capacity, 
                lambda u: u.points, 
                replace=False
            )
            
            # Mark Selected
            for user in selected_users:
                user.points = max(0, user.points - 20)
                session.add(user)
                for b in bookings:
                    if b.user_email == user.email and b.seat_class.value == seat_class:
                        b.status = Status.SELECTED.value
                        b.selected_at = now
                        session.add(b)

            # Mark Remaining as Not Selected (Waitlisted)
            not_selected = [u for u in seg_user[seat_class] if u not in selected_users]
            for user in not_selected:
                user.points += 50
                session.add(user)
                for b in bookings:
                    if b.user_email == user.email and b.seat_class.value == seat_class:
                        b.status = Status.NOTSELECTED.value
                        session.add(b)

    publish.published = True
    publish.published_at = now
    session.add(publish)
    session.commit()
    session.refresh(publish)
    return publish.id

def auto_publish_expired_lotteries(session: Session):
    """
    Finds all unpublished lotteries that have passed their closing window and picks winners.
    """
    now = datetime.datetime.now()
    
    # Find active (unpublished) publish records
    pending_publishes = session.exec(
        select(Publish).where(Publish.published == False)
    ).all()
    
    published_count = 0
    for p in pending_publishes:
        journey = session.exec(
            select(Journey).where(Journey.id == p.journey_id)
        ).first()
        
        if not journey:
            continue
            
        # Check if window has closed
        # journey.closing_date is date obj, journey.closing_time is time obj
        closing_dt = datetime.datetime.combine(journey.closing_date, journey.closing_time)
        
        if now >= closing_dt:
            print(f"Auto-publishing lottery for journey {journey.id} ({journey.train_name})")
            run_winner_selection(journey.id, session)
            published_count += 1
            
    return published_count
