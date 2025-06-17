from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API Keys
    openai_api_key: str
    huggingface_api_key: str
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Model settings
    model_name: str = "gpt-4"
    temperature: float = 0.7
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings() 