from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List
import secrets

class Settings(BaseSettings):
    # Configuration de base
    app_name: str = "Mon Jeton API"
    debug: bool = True
    environment: str = "development"

    # Configuration de la base de données
    database_url: str = "sqlite:///./mon_jeton.db"

    # Configuration de sécurité
    # Sans SECRET_KEY dans l'environnement (ou .env), une clé aléatoire est
    # générée à chaque démarrage : les tokens émis sont alors invalidés au
    # redémarrage. Définissez SECRET_KEY en production.
    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(64))
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Configuration CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080", 
        "http://127.0.0.1:8080",
        "http://127.0.0.1:3000"
    ]
    
    # Configuration Redis (optionnel)
    redis_url: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Instance globale des paramètres
settings = Settings() 