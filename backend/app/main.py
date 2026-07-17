from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, SessionLocal
from .models import Base, Category
from .config import settings
from .api import auth, transactions, budgets, goals, categories

# Créer les tables de la base de données
Base.metadata.create_all(bind=engine)

# Catégories par défaut, alignées sur celles du frontend (app.js)
DEFAULT_CATEGORIES = [
    {"name": "Salaire", "icon": "💰", "color": "#28a745", "type": "revenu"},
    {"name": "Bonus", "icon": "🎁", "color": "#ffc107", "type": "revenu"},
    {"name": "Freelance", "icon": "💼", "color": "#17a2b8", "type": "revenu"},
    {"name": "Investissement", "icon": "📈", "color": "#6f42c1", "type": "revenu"},
    {"name": "Nourriture", "icon": "🍽️", "color": "#dc3545", "type": "depense"},
    {"name": "Transport", "icon": "🚗", "color": "#fd7e14", "type": "depense"},
    {"name": "Logement", "icon": "🏠", "color": "#20c997", "type": "depense"},
    {"name": "Communication", "icon": "📱", "color": "#e83e8c", "type": "depense"},
    {"name": "Santé", "icon": "🏥", "color": "#6610f2", "type": "depense"},
    {"name": "Loisirs", "icon": "🎮", "color": "#343a40", "type": "depense"},
    {"name": "Vêtements", "icon": "👕", "color": "#6c757d", "type": "depense"},
    {"name": "Éducation", "icon": "📚", "color": "#28a745", "type": "depense"},
    {"name": "Aide familiale", "icon": "👨‍👩‍👧", "color": "#e83e8c", "type": "depense"},
    {"name": "Divers", "icon": "📦", "color": "#6c757d", "type": "depense"},
]

def seed_default_categories():
    """Insère les catégories par défaut si la table est vide."""
    db = SessionLocal()
    try:
        if db.query(Category).count() == 0:
            for data in DEFAULT_CATEGORIES:
                db.add(Category(**data))
            db.commit()
    finally:
        db.close()

seed_default_categories()

# Créer l'application FastAPI
app = FastAPI(
    title=settings.app_name,
    description="API pour l'application Mon Jeton",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routers
app.include_router(auth.router, prefix="/auth", tags=["authentification"])
app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
app.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
app.include_router(goals.router, prefix="/goals", tags=["objectifs"])
app.include_router(categories.router, prefix="/categories", tags=["catégories"])

@app.get("/")
def read_root():
    """Point d'entrée de l'API"""
    return {
        "message": "Bienvenue sur l'API Mon Jeton",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    """Point de terminaison pour vérifier la santé de l'API"""
    return {"status": "healthy", "message": "API opérationnelle"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 