from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional


# --- Authentification ---

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# --- Utilisateurs ---

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None


class User(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime


# --- Transactions ---

class TransactionBase(BaseModel):
    amount: float
    type: str  # 'revenu' ou 'depense'
    category: str
    description: str = ""
    payment_method: str = "espèces"
    date: Optional[datetime] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
    date: Optional[datetime] = None


class Transaction(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime


# --- Budgets ---

class BudgetBase(BaseModel):
    category: str
    amount: float
    month: str  # YYYY-MM


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = None
    month: Optional[str] = None


class Budget(BudgetBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime


# --- Objectifs ---

class GoalBase(BaseModel):
    title: str
    description: str = ""
    target_amount: float
    current_amount: float = 0
    deadline: Optional[datetime] = None
    is_active: bool = True


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[datetime] = None
    is_active: Optional[bool] = None


class Goal(GoalBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime


# --- Catégories ---

class CategoryBase(BaseModel):
    name: str
    icon: str = "📦"
    color: str = "#6c757d"
    type: str  # 'revenu' ou 'depense'


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
