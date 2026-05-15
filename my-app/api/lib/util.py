import model
from model.user import User
from model.booking import Booking
def segregate_user(users ,booking):
    b = {
        'economy': [],
        'business': [],
        'first': []
    }
    u = {
        'economy': [],
        'business': [],
        'first': []
    }
    for book in booking:
        # Use lowercase for consistent matching
        b[book.seat_class.value if hasattr(book.seat_class, 'value') else book.seat_class].append(book.user_email.lower())
    
    for user in users:
        email_lower = user.email.lower()
        if email_lower in b['economy']:
            u['economy'].append(user)
        elif email_lower in b['business']:
            u['business'].append(user)
        elif email_lower in b['first']:
            u['first'].append(user)
    return u

