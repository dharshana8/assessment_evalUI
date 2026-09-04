import sys
from sqlalchemy import create_engine, inspect, text
from app.core.config import settings
from app.models.db_models import Base

def test_postgres_connection():
    print("=" * 60)
    print("      EVALUI POSTGRESQL CONNECTION & SCHEMA VERIFICATION")
    print("=" * 60)
    print(f"\n[+] DATABASE_URL from .env: {settings.DATABASE_URL}")

    if "sqlite" in settings.DATABASE_URL:
        print("\n[!] DATABASE_URL is set to SQLite.")
        print("    To use PostgreSQL, set DATABASE_URL in backend/.env to:")
        print("    DATABASE_URL=\"postgresql://<user>:<password>@<host>:<port>/<dbname>\"")
        return

    try:
        connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
        engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();")).fetchone()
            print(f"\n[OK] Successfully connected to PostgreSQL!")
            print(f"     Database Version: {result[0] if result else 'Unknown'}")

        print("\n[+] Creating/verifying database tables (init_db)...")
        Base.metadata.create_all(bind=engine)

        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"[OK] Tables found in PostgreSQL database: {tables}")
        
        expected_tables = ["assignments", "rubric_criteria", "submissions", "evaluations", "criterion_evaluations"]
        missing = [t for t in expected_tables if t not in tables]
        if not missing:
            print("[OK] All 5 core tables verified successfully!")
        else:
            print(f"[!] Warning: Missing tables: {missing}")

    except Exception as e:
        print(f"\n[X] PostgreSQL connection failed!")
        print(f"    Error details: {e}")
        print("\n--- Troubleshooting Steps ---")
        print("1. Update 'DATABASE_URL' in evalui/backend/.env with your PostgreSQL credentials:")
        print("   DATABASE_URL=\"postgresql://<user>:<password>@localhost:5432/<dbname>\"")
        print("2. If using Docker PostgreSQL, run:")
        print("   docker-compose up -d postgres")
        print("3. Ensure the target database exists in your PostgreSQL instance.")
        sys.exit(1)

if __name__ == "__main__":
    test_postgres_connection()
