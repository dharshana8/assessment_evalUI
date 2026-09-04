import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "EvalUI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database Settings
    DB_TYPE: str = os.getenv("DB_TYPE", "mongodb")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./evalui.db")
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "evalui_db")
    
    # NLP Models
    SEMANTIC_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    NLI_MODEL_NAME: str = "cross-encoder/nli-distilroberta-base"
    SPACY_MODEL_NAME: str = "en_core_web_sm"
    
    # Scoring Weights
    WEIGHT_SEMANTIC: float = 0.45
    WEIGHT_ENTAILMENT: float = 0.45
    WEIGHT_LEXICAL: float = 0.10
    
    # Thresholds
    CONTRADICTION_THRESHOLD: float = 0.60
    KEYWORD_STUFFING_SEMANTIC_MAX: float = 0.45
    KEYWORD_STUFFING_LEXICAL_MIN: float = 0.70
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()