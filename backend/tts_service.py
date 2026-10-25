"""
ElevenLabs TTS Service for AI Job Simulator
Handles text-to-speech generation with character voice mapping,
streaming support, official ElevenLabs SDK integration, and comprehensive error handling.
"""

import os
import logging
from typing import Optional, AsyncIterator

logger = logging.getLogger(__name__)

# ── Character Voice Configuration ──────────────────────────────────────────────

# Default voice and model IDs - configurable via environment variables
# "EXAVITQu4vr4xnSDxMaL" is "Sarah" (Sara), a standard premade voice available on all ElevenLabs accounts
DEFAULT_VOICE_ID = os.getenv("ELEVENLABS_DEFAULT_VOICE_ID", "EXAVITQu4vr4xnSDxMaL")
DEFAULT_MODEL_ID = os.getenv("ELEVENLABS_MODEL_ID", "eleven_flash_v2_5")

# Character voice mapping - maps character roles to voice configurations
# Voice IDs can be overridden via environment variables
# Format: ELEVENLABS_VOICE_{CHARACTER_KEY}=voice_id
CHARACTER_VOICES = {
    "interviewer": {
        "voice_id_env": "ELEVENLABS_VOICE_INTERVIEWER",
        "default_voice_id": DEFAULT_VOICE_ID,
        "stability": 0.71,
        "similarity_boost": 0.75,
        "style": 0.0,
        "description": "Calm, professional, neutral delivery",
    },
    "coworker": {
        "voice_id_env": "ELEVENLABS_VOICE_COWORKER",
        "default_voice_id": DEFAULT_VOICE_ID,
        "stability": 0.55,
        "similarity_boost": 0.78,
        "style": 0.15,
        "description": "Friendly, conversational delivery",
    },
    "team_leader": {
        "voice_id_env": "ELEVENLABS_VOICE_TEAM_LEADER",
        "default_voice_id": DEFAULT_VOICE_ID,
        "stability": 0.65,
        "similarity_boost": 0.72,
        "style": 0.05,
        "description": "Direct, focused delivery",
    },
    "manager": {
        "voice_id_env": "ELEVENLABS_VOICE_MANAGER",
        "default_voice_id": DEFAULT_VOICE_ID,
        "stability": 0.68,
        "similarity_boost": 0.75,
        "style": 0.0,
        "description": "Confident, professional delivery",
    },
    "executive": {
        "voice_id_env": "ELEVENLABS_VOICE_EXECUTIVE",
        "default_voice_id": DEFAULT_VOICE_ID,
        "stability": 0.75,
        "similarity_boost": 0.70,
        "style": 0.0,
        "description": "Concise, formal delivery",
    },
    "client": {
        "voice_id_env": "ELEVENLABS_VOICE_CLIENT",
        "default_voice_id": DEFAULT_VOICE_ID,
        "stability": 0.60,
        "similarity_boost": 0.75,
        "style": 0.10,
        "description": "Natural, business-oriented delivery",
    },
    "upset_client": {
        "voice_id_env": "ELEVENLABS_VOICE_UPSET_CLIENT",
        "default_voice_id": DEFAULT_VOICE_ID,
        "stability": 0.45,
        "similarity_boost": 0.80,
        "style": 0.25,
        "description": "Firm, urgent delivery",
    },
}


class TTSError(Exception):
    """Base exception for TTS service errors."""
    def __init__(self, message: str, user_message: str = "Voice generation temporarily unavailable.", retry: bool = True):
        super().__init__(message)
        self.user_message = user_message
        self.retry = retry


def _get_api_key() -> str:
    """Get and validate the ElevenLabs API key from environment."""
    key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    if not key or key in {"your_elevenlabs_api_key_here", "your_api_key_here"}:
        raise TTSError(
            "ELEVENLABS_API_KEY is not configured",
            user_message="Voice feature is not configured. Text is still available.",
            retry=False,
        )
    return key


def _resolve_character_key(character: str, authority_level: int = 3, priority: str = "P2") -> str:
    """Map a character description and context to a character voice key."""
    char_lower = (character or "").lower()
    
    # Direct keyword matching
    if any(kw in char_lower for kw in ["ceo", "executive", "vp", "president", "cto", "cfo", "coo"]):
        return "executive"
    if any(kw in char_lower for kw in ["upset", "angry", "frustrated", "dissatisfied", "unhappy", "complain"]):
        return "upset_client"
    if any(kw in char_lower for kw in ["client", "customer", "stakeholder", "external"]):
        return "client"
    if any(kw in char_lower for kw in ["manager", "director", "head"]):
        return "manager"
    if any(kw in char_lower for kw in ["lead", "senior", "team lead"]):
        return "team_leader"
    if any(kw in char_lower for kw in ["coworker", "teammate", "colleague", "peer"]):
        return "coworker"
    if any(kw in char_lower for kw in ["interview", "hiring", "recruiter", "hr"]):
        return "interviewer"
    
    # Fallback by authority level
    if authority_level >= 6:
        return "executive"
    if authority_level >= 5:
        return "client"
    if authority_level >= 3:
        return "manager"
    if authority_level >= 2:
        return "team_leader"
    
    return "interviewer"


def _get_voice_config(character_key: str) -> dict:
    """Get voice configuration for a character key."""
    config = CHARACTER_VOICES.get(character_key, CHARACTER_VOICES["interviewer"])
    
    # Check for environment variable override for voice ID
    env_voice_id = os.getenv(config["voice_id_env"], "").strip()
    voice_id = env_voice_id if env_voice_id else config["default_voice_id"]
    
    return {
        "voice_id": voice_id,
        "stability": config["stability"],
        "similarity_boost": config["similarity_boost"],
        "style": config["style"],
    }


async def generate_speech_stream(
    text: str,
    character: str = "Interviewer",
    authority_level: int = 3,
    priority: str = "P2",
    model_id: Optional[str] = None,
) -> AsyncIterator[bytes]:
    """
    Generate speech audio as an async byte stream using official ElevenLabs SDK.
    
    Args:
        text: The text to convert to speech.
        character: Character role description (e.g., "Manager", "Client").
        authority_level: Authority level 1-6.
        priority: Priority level P1-P4.
        model_id: Override the default ElevenLabs model ID.
    
    Yields:
        Audio data chunks (MP3 format).
    
    Raises:
        TTSError: If speech generation fails.
    """
    api_key = _get_api_key()
    character_key = _resolve_character_key(character, authority_level, priority)
    voice_config = _get_voice_config(character_key)
    
    effective_model = model_id or DEFAULT_MODEL_ID
    voice_id = voice_config["voice_id"]
    
    clean_text = text.strip()
    if not clean_text:
        raise TTSError("No text provided for speech generation", user_message="No text to speak.", retry=False)
    
    # Truncate very long text to avoid quota overflow
    if len(clean_text) > 5000:
        clean_text = clean_text[:5000]

    try:
        from elevenlabs.client import AsyncElevenLabs
        from elevenlabs import VoiceSettings
        from elevenlabs.core.api_error import ApiError

        client = AsyncElevenLabs(api_key=api_key)
        voice_settings = VoiceSettings(
            stability=voice_config["stability"],
            similarity_boost=voice_config["similarity_boost"],
            style=voice_config["style"],
            use_speaker_boost=True,
        )

        audio_stream = client.text_to_speech.convert(
            voice_id=voice_id,
            text=clean_text,
            model_id=effective_model,
            voice_settings=voice_settings,
            output_format="mp3_44100_128",
        )

        async for chunk in audio_stream:
            if chunk:
                yield chunk

    except TTSError:
        raise
    except Exception as e:
        # Check for ElevenLabs ApiError
        error_name = type(e).__name__
        if "ApiError" in error_name:
            status_code = getattr(e, "status_code", 500)
            if status_code == 401:
                raise TTSError(
                    "Invalid ElevenLabs API key",
                    user_message="Voice service authentication failed. Please check your ELEVENLABS_API_KEY.",
                    retry=False,
                )
            elif status_code == 429:
                raise TTSError(
                    "ElevenLabs rate limit or quota exceeded",
                    user_message="Voice quota reached or service busy. Text is still available.",
                    retry=True,
                )
            elif status_code == 422:
                raise TTSError(
                    f"Invalid voice configuration: voice_id={voice_id}, model={effective_model}",
                    user_message="Voice configuration error. Using text fallback.",
                    retry=False,
                )
            else:
                raise TTSError(
                    f"ElevenLabs API error {status_code}",
                    user_message="Voice generation failed. Text is still available.",
                    retry=True,
                )
        
        # Fallback to direct HTTP stream if SDK fails for network / compatibility reasons
        import httpx
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"
        headers = {
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        }
        payload = {
            "text": clean_text,
            "model_id": effective_model,
            "voice_settings": {
                "stability": voice_config["stability"],
                "similarity_boost": voice_config["similarity_boost"],
                "style": voice_config["style"],
                "use_speaker_boost": True,
            },
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as http_client:
                async with http_client.stream("POST", url, json=payload, headers=headers) as response:
                    if response.status_code == 401:
                        raise TTSError(
                            "Invalid ElevenLabs API key",
                            user_message="Voice service authentication failed.",
                            retry=False,
                        )
                    if response.status_code == 429:
                        raise TTSError(
                            "ElevenLabs rate limit exceeded",
                            user_message="Voice service is busy or quota exhausted. Please try again later.",
                            retry=True,
                        )
                    if response.status_code == 422:
                        raise TTSError(
                            f"Invalid voice ID or model: {voice_id} / {effective_model}",
                            user_message="Voice configuration error. Using text fallback.",
                            retry=False,
                        )
                    if response.status_code != 200:
                        raise TTSError(
                            f"ElevenLabs API error {response.status_code}",
                            user_message="Voice generation failed. Text is still available.",
                            retry=True,
                        )
                    async for chunk in response.aiter_bytes(chunk_size=4096):
                        if chunk:
                            yield chunk
        except TTSError:
            raise
        except (httpx.TimeoutException, TimeoutError):
            raise TTSError(
                "ElevenLabs API request timed out",
                user_message="Voice generation timed out. Text is still available.",
                retry=True,
            )
        except Exception:
            raise TTSError(
                f"Unexpected TTS error: {error_name}",
                user_message="Voice generation encountered an error. Text is still available.",
                retry=True,
            )


async def generate_speech_bytes(
    text: str,
    character: str = "Interviewer",
    authority_level: int = 3,
    priority: str = "P2",
    model_id: Optional[str] = None,
) -> bytes:
    """
    Generate complete speech audio as bytes.
    Returns MP3 audio bytes.
    """
    chunks = []
    async for chunk in generate_speech_stream(text, character, authority_level, priority, model_id):
        chunks.append(chunk)
    return b"".join(chunks)


def get_available_characters() -> dict:
    """Return available character voice configurations (without exposing voice IDs or keys)."""
    return {
        key: {
            "description": config["description"],
            "stability": config["stability"],
            "style": config["style"],
        }
        for key, config in CHARACTER_VOICES.items()
    }


def is_tts_configured() -> bool:
    """
    Check if TTS service is configured with a valid ElevenLabs API key.
    Accepts standard 32-char hex keys, 64-char keys, or sk_ prefixed keys.
    """
    key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    placeholder_keys = {
        "",
        "your_elevenlabs_api_key_here",
        "your_api_key_here",
        "your_key_here",
    }
    return bool(key and key not in placeholder_keys and len(key) >= 10)
