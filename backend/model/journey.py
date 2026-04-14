
from datetime import date, time
from typing import Optional
from sqlmodel import JSON, Column, Field, SQLModel


class Journey(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    train_number: int 
    train_name: str
    from_station: str
    to_station: str
    departure_time: str
    departure_date: date
    arrival_time: str
    arrival_date: date
    seats: list[int] = Field(
        default_factory= lambda : [0,0,0],
        sa_column=Column(JSON)
    )
    fare: list[int] = Field(
        default_factory= lambda : [0,0,0],
        sa_column=Column(JSON)
    )
    takkal: bool
    closing_time: time
    opening_date: date
    opening_time: time
    duration: int
    closing_date: date