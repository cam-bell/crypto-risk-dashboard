"""
Database base configuration
"""
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import AsyncAttrs

# Create declarative base
Base = declarative_base()
