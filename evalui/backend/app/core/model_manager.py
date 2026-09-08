import os
import gc
import time
import threading
from typing import Dict, Tuple, Optional, Any
from app.core.config import settings
from app.core.logging_config import logger

class ModelManager:
    _instance: Optional['ModelManager'] = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ModelManager, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.device = "cpu"
        self.spacy_nlp: Optional[Any] = None
        self.semantic_model: Optional[Any] = None
        self.nli_tokenizer: Optional[Any] = None
        self.nli_model: Optional[Any] = None

        self.nli_label_mapping: Dict[str, int] = {}
        self.load_times: Dict[str, float] = {}

        self.is_loading: bool = False
        self.is_loaded: bool = False
        self.error_message: Optional[str] = None
        self._initialized = True

    @property
    def nlp(self) -> Optional[Any]:
        return self.spacy_nlp

    @property
    def embedder(self) -> Optional[Any]:
        return self.semantic_model

    @property
    def nli(self) -> Tuple[Optional[Any], Optional[Any]]:
        return self.nli_tokenizer, self.nli_model

    def is_ready(self) -> bool:
        """Returns True if all required local CPU models are loaded and ready."""
        return (
            self.spacy_nlp is not None and
            self.semantic_model is not None and
            self.nli_model is not None and
            self.nli_tokenizer is not None
        )

    def initialize_models(self) -> None:
        """Non-blocking background initialization with lazy heavy package imports."""
        if self.is_ready() or self.is_loading:
            return

        with self._lock:
            self.is_loading = True
            logger.info("Initializing Local CPU NLP Models in background...")
            start_total = time.time()

            try:
                os.environ["TOKENIZERS_PARALLELISM"] = "false"
                # Lazy import heavy ML dependencies inside background thread
                import torch
                torch.set_num_threads(2)
                import spacy
                from sentence_transformers import SentenceTransformer
                from transformers import AutoTokenizer, AutoModelForSequenceClassification

                # 1. spaCy NLP model initialization
                if self.spacy_nlp is None:
                    logger.info(f"Loading spaCy NLP Model: {settings.SPACY_MODEL_NAME}")
                    start = time.time()
                    try:
                        self.spacy_nlp = spacy.load(settings.SPACY_MODEL_NAME)
                    except Exception as ex:
                        logger.warning(f"Failed to load {settings.SPACY_MODEL_NAME}, fallback to spacy.blank('en'): {ex}")
                        self.spacy_nlp = spacy.blank("en")
                        if "sentencizer" not in self.spacy_nlp.pipe_names:
                            self.spacy_nlp.add_pipe("sentencizer")
                    self.load_times['spacy'] = time.time() - start
                    logger.info(f"Loaded spaCy in {self.load_times['spacy']:.2f}s")

                # 2. Semantic Similarity Transformer model initialization
                if self.semantic_model is None:
                    logger.info(f"Loading Semantic Similarity Model: {settings.SEMANTIC_MODEL_NAME}")
                    start = time.time()
                    self.semantic_model = SentenceTransformer(settings.SEMANTIC_MODEL_NAME, device="cpu")
                    self.load_times['semantic'] = time.time() - start
                    logger.info(f"Loaded Semantic Model in {self.load_times['semantic']:.2f}s")

                # 3. NLI Cross-Encoder Transformer model initialization
                if self.nli_model is None or self.nli_tokenizer is None:
                    logger.info(f"Loading NLI Model: {settings.NLI_MODEL_NAME}")
                    start = time.time()
                    self.nli_tokenizer = AutoTokenizer.from_pretrained(settings.NLI_MODEL_NAME, use_fast=False)
                    self.nli_model = AutoModelForSequenceClassification.from_pretrained(settings.NLI_MODEL_NAME)
                    self.nli_model.to(torch.device("cpu"))
                    self.nli_model.eval()
                    self.load_times['nli'] = time.time() - start

                    # Dynamic NLI label mapping
                    id2label = self.nli_model.config.id2label
                    self.nli_label_mapping = {label.lower(): idx for idx, label in id2label.items()}
                    logger.info(f"Discovered NLI Label Mapping: {self.nli_label_mapping} in {self.load_times['nli']:.2f}s")

                self.load_times['total'] = time.time() - start_total
                self.is_loaded = True
                self.is_loading = False
                logger.info(f"All Local AI Models successfully initialized in {self.load_times['total']:.2f}s!")

            except Exception as e:
                self.is_loading = False
                self.error_message = str(e)
                logger.error(f"Failed to initialize local AI models: {e}")

    def load_models(self) -> None:
        self.initialize_models()

    def get_models(self) -> Tuple[Any, Any, Tuple[Any, Any, Dict[str, int]]]:
        if not self.is_ready():
            self.initialize_models()
        return self.spacy_nlp, self.semantic_model, (self.nli_tokenizer, self.nli_model, self.nli_label_mapping)

    def get_semantic_model(self) -> Any:
        if self.semantic_model is None:
            self.initialize_models()
        return self.semantic_model

    def get_nli(self) -> Tuple[Any, Any, Dict[str, int]]:
        if self.nli_model is None or self.nli_tokenizer is None:
            self.initialize_models()
        return self.nli_tokenizer, self.nli_model, self.nli_label_mapping

    def get_spacy(self) -> Any:
        if self.spacy_nlp is None:
            self.initialize_models()
        return self.spacy_nlp

    def cleanup_memory(self) -> None:
        """Explicit memory garbage collection and cache clearing."""
        gc.collect()
        try:
            import torch
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except ImportError:
            pass


model_manager = ModelManager()