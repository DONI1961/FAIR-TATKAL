from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class Publish(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    journey_id: int = Field(index=True)
    published: bool = Field(default=False)
    published_at: datetime = Field(default=datetime.now())