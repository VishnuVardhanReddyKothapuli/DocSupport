import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator, AliasChoices

class Settings(BaseSettings):
    # Server
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/docsupport",
        validation_alias="DATABASE_URL"
    )
    SYNC_DATABASE_URL: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/docsupport",
        validation_alias="SYNC_DATABASE_URL"
    )
    
    # Redis
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        validation_alias="REDIS_URL"
    )
    
    # LLM Inference (Groq & Gemini Dual Engine with Mutual Failover)
    PRIMARY_LLM_PROVIDER: str = Field(default="groq", validation_alias="PRIMARY_LLM_PROVIDER")
    GROQ_API_KEY: str = Field(default="", validation_alias="GROQ_API_KEY")
    GROQ_MODEL: str = Field(default="openai/gpt-oss-120b", validation_alias="GROQ_MODEL")
    GROQ_GUARD_MODEL: str = Field(default="qwen/qwen3.8-27b", validation_alias="GROQ_GUARD_MODEL")
    
    GEMINI_API_KEY: str = Field(
        default="",
        validation_alias=AliasChoices("GEMINI_API_KEY", "GOOGLE_API_KEY")
    )
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash", validation_alias="GEMINI_MODEL")
    GEMINI_FALLBACK_MODEL: str = Field(default="gemini-1.5-flash", validation_alias="GEMINI_FALLBACK_MODEL")
    
    # Embedding Configuration
    EMBEDDING_MODEL_NAME: str = "BAAI/bge-base-en-v1.5"
    EMBEDDING_DIMENSION: int = 768
    HUGGINGFACE_API_KEY: str = Field(default="", validation_alias="HUGGINGFACE_API_KEY")
    
    # Clerk Auth
    CLERK_PUBLISHABLE_KEY: str = Field(default="", validation_alias="CLERK_PUBLISHABLE_KEY")
    CLERK_SECRET_KEY: str = Field(default="", validation_alias="CLERK_SECRET_KEY")
    CLERK_JWKS_URL: str = Field(
        default="https://api.clerk.com/v1/jwks",
        validation_alias="CLERK_JWKS_URL"
    )

    # Langfuse Observability & Tracing
    LANGFUSE_PUBLIC_KEY: str = Field(default="", validation_alias="LANGFUSE_PUBLIC_KEY")
    LANGFUSE_SECRET_KEY: str = Field(default="", validation_alias="LANGFUSE_SECRET_KEY")
    LANGFUSE_HOST: str = Field(default="https://cloud.langfuse.com", validation_alias="LANGFUSE_HOST")
    LANGFUSE_ENABLED: bool = True
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://localhost",
        "*"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = {
        "env_file": [".env", "../.env"],
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

settings = Settings()
