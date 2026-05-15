
from datetime import date, time
from typing import Optional
from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


class Journey(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    train_number: int 
    train_name: str
    from_station: str = Field(index=True)
    to_station: str = Field(index=True)
    departure_time: str
    departure_date: date = Field(index=True)
    arrival_time: str
    arrival_date: date
    seats: list[int] = Field(
        sa_column=Column(JSON, default=[0, 0, 0])
    )
    fare: list[int] = Field(
        sa_column=Column(JSON, default=[0, 0, 0])
    )
    takkal: bool
    closing_time: time
    opening_date: date
    opening_time: time
    duration: int
    closing_date: date