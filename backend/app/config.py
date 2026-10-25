import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NLUYXL Autonomous Workspace"
    VERSION: str = "1.0.0"
    
    # Supabase Credentials (from SUPABASE.env)
    SUPABASE_URL: str = "https://fmmliooyfkqhpbkwagxd.supabase.co"
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtbWxpb295ZmtxaHBia3dhZ3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4MTk1NTcsImV4cCI6MjEwODM5NTU1N30.K5pT606e9wYyYw5Kj21vA0112V0vL1wK3V2w2w3v1w"
    SUPABASE_SERVICE_ROLE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtbWxpb295ZmtxaHBia3dhZ3hkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjgxOTU1NywiZXhwIjoyMTA4Mzk1NTU3fQ.Z6_yYw5Kj21vA0112V0vL1wK3V2w2w3v1w_service"
    
    # Vault / Token Encryption
    KMS_DATA_KEY_BASE64: str = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
    
    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Defaults
    DEFAULT_WORKSPACE_ID: str = "b92a258f-0557-41d3-a845-0912495bf72b"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
