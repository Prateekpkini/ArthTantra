"""
ArthTantra Configuration — Environment & Settings
"""
import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # LLM Provider
    llm_provider: str = "gemini"
    google_api_key: str = ""
    openai_api_key: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""

    # Financial APIs
    plaid_client_id: str = "mock"
    plaid_secret: str = "mock"
    polygon_api_key: str = "mock"

    # Voice
    retell_api_key: str = "mock"

    # App Settings
    mock_mode: bool = True
    hitl_threshold: float = 50.00
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_mock(self) -> bool:
        return self.mock_mode or self.plaid_client_id == "mock"
        
    def model_post_init(self, __context) -> None:
        if not self.is_mock:
            if self.llm_provider == "gemini" and not self.google_api_key:
                raise ValueError("Google API key is missing. Set GOOGLE_API_KEY or use mock mode.")
            if self.llm_provider == "openai" and not self.openai_api_key:
                raise ValueError("OpenAI API key is missing. Set OPENAI_API_KEY or use mock mode.")

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
