from fastapi import APIRouter
from app.core.config import settings
from app.core.model_manager import model_manager

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def check_health():
    models_ready = model_manager.is_ready()
    
    if models_ready:
        ai_engine_status = "ready"
    elif model_manager.is_loading:
        ai_engine_status = "initializing"
    elif model_manager.error_message:
        ai_engine_status = "error"
    else:
        ai_engine_status = "initializing"
        
    return {
        "api": "online",
        "status": "healthy",
        "ai_engine": ai_engine_status,
        "models_loaded": models_ready,
        "models": {
            "spacy": model_manager.spacy_nlp is not None,
            "embedder": model_manager.semantic_model is not None,
            "nli": model_manager.nli_model is not None
        },
        "offline_mode": True,
        "execution": "Local CPU",
        "external_apis": "None",
        "privacy": "100% Local",
        "db_type": settings.DB_TYPE,
        "load_times": model_manager.load_times,
        "nli_label_mapping": model_manager.nli_label_mapping,
        "error_detail": model_manager.error_message
    }
