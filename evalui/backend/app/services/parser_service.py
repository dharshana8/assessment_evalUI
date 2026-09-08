import fitz  # PyMuPDF
import re
from typing import Tuple

class PDFParserException(Exception):
    pass

class ParserService:
    @staticmethod
    def normalize_text(text: str) -> str:
        """Clean and normalize extracted text whitespace and formatting artifacts."""
        if not text:
            return ""
        # Replace multiple whitespace/newlines with single space
        cleaned = re.sub(r'\r\n|\r|\n', ' ', text)
        cleaned = re.sub(r'\s+', ' ', cleaned)
        return cleaned.strip()

    @staticmethod
    def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> Tuple[str, bool]:
        """
        Extract text from PDF file bytes using PyMuPDF.
        Returns (extracted_text, is_scanned_or_empty).
        """
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            extracted_pages = []
            MAX_PAGES = 500  # Memory safety bound for institutional submissions
            for i, page in enumerate(doc):
                if i >= MAX_PAGES:
                    break
                text = page.get_text()
                if text:
                    extracted_pages.append(text)
            doc.close()
            
            raw_text = "\n".join(extracted_pages)
            normalized = ParserService.normalize_text(raw_text)
            
            is_scanned_or_empty = len(normalized.strip()) == 0
            return normalized, is_scanned_or_empty

        except Exception as e:
            raise PDFParserException(f"Failed to parse PDF document: {str(e)}")
