"""
Configuration management for Pipecat Voice AI
Loads environment variables for all services
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class VoiceAIConfig(BaseSettings):
    """Configuration for Voice AI services"""
    
    # Daily.co WebRTC Transport
    DAILY_API_KEY: str = os.getenv("DAILY_API_KEY", "")
    DAILY_ROOM_URL: Optional[str] = os.getenv("DAILY_ROOM_URL")
    DAILY_DOMAIN: Optional[str] = os.getenv("DAILY_DOMAIN")
    
    # Speech-to-Text (Deepgram)
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")
    STT_LANGUAGE: str = os.getenv("STT_LANGUAGE", "en")
    
    # Language Model
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Sarvam AI (for Hindi/Indian languages)
    SARVAM_AI_API_KEY: Optional[str] = os.getenv("SARVAM_AI_API_KEY")
    
    # Text-to-Speech (Cartesia)
    CARTESIA_API_KEY: str = os.getenv("CARTESIA_API_KEY", "")
    TTS_VOICE_ID: str = os.getenv("TTS_VOICE_ID", "79a125e8-cd45-4c13-8a67-188112f4dd22")  # British Lady
    TTS_MODEL: str = os.getenv("TTS_MODEL", "sonic-english")
    
    # Database (Supabase)
    SUPABASE_URL: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    
    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8001"))
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8001"))
    
    # Voice Activity Detection (VAD)
    VAD_CONFIDENCE: float = 0.5
    VAD_MIN_VOLUME: float = 0.6
    VAD_START_SECS: float = 0.2
    VAD_STOP_SECS: float = 0.8
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_DIR: str = os.getenv("LOG_DIR", "logs")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env file

# Global config instance
config = VoiceAIConfig()

def validate_config() -> tuple[bool, list[str]]:
    """
    Validate that all required API keys are set
    Returns: (is_valid, list of missing keys)
    """
    missing_keys = []
    
    if not config.DAILY_API_KEY:
        missing_keys.append("DAILY_API_KEY")
    if not config.DEEPGRAM_API_KEY:
        missing_keys.append("DEEPGRAM_API_KEY")
    if not config.GROQ_API_KEY and not config.GEMINI_API_KEY:
        missing_keys.append("GROQ_API_KEY or GEMINI_API_KEY")
    if not config.CARTESIA_API_KEY:
        missing_keys.append("CARTESIA_API_KEY")
    
    return len(missing_keys) == 0, missing_keys
