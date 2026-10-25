"""
Tests for ElevenLabs TTS integration.
Uses mocked responses - no real API quota consumed.
"""

import os
import sys
import json
import asyncio
from unittest.mock import patch, AsyncMock, MagicMock

sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_tts_status_unconfigured():
    """Test TTS status when API key is not set."""
    with patch.dict(os.environ, {"ELEVENLABS_API_KEY": ""}, clear=False):
        res = client.get("/api/tts/status")
        assert res.status_code == 200
        data = res.json()
        assert data["configured"] == False
        print("✓ TTS status (unconfigured):", data["message"])


def test_tts_status_configured():
    """Test TTS status when API key is set."""
    with patch.dict(os.environ, {"ELEVENLABS_API_KEY": "sk_test_key_12345"}, clear=False):
        res = client.get("/api/tts/status")
        assert res.status_code == 200
        data = res.json()
        assert data["configured"] == True
        assert "characters" in data
        assert "interviewer" in data["characters"]
        print("✓ TTS status (configured):", data["message"])
        print("  Characters:", list(data["characters"].keys()))


def test_tts_no_api_key():
    """Test TTS endpoint returns 503 when API key is missing."""
    with patch.dict(os.environ, {"ELEVENLABS_API_KEY": ""}, clear=False):
        res = client.post("/api/tts", json={
            "text": "Hello, welcome to the interview.",
            "character": "Interviewer",
        })
        assert res.status_code == 503
        print("✓ TTS without API key returns 503:", res.json()["detail"])


def test_tts_empty_text():
    """Test TTS endpoint rejects empty text."""
    res = client.post("/api/tts", json={
        "text": "",
        "character": "Interviewer",
    })
    assert res.status_code == 422  # Pydantic validation
    print("✓ TTS empty text rejected (422)")


def test_character_voice_mapping():
    """Test character-to-voice key resolution."""
    from tts_service import _resolve_character_key
    
    assert _resolve_character_key("CEO / Executive", 6) == "executive"
    assert _resolve_character_key("Direct Manager", 3) == "manager"
    assert _resolve_character_key("Client / Stakeholder", 5) == "client"
    assert _resolve_character_key("Team Leader", 2) == "team_leader"
    assert _resolve_character_key("Coworker / Teammate", 1) == "coworker"
    assert _resolve_character_key("HR Recruiter", 3) == "interviewer"
    assert _resolve_character_key("Upset Client - Frustrated", 5) == "upset_client"
    assert _resolve_character_key("Unknown Role", 6) == "executive"
    assert _resolve_character_key("Unknown Role", 1) == "interviewer"
    print("✓ Character voice mapping works correctly for all character types")


def test_voice_config_env_override():
    """Test that voice IDs can be overridden via environment variables."""
    from tts_service import _get_voice_config
    
    custom_voice = "custom_voice_id_123"
    with patch.dict(os.environ, {"ELEVENLABS_VOICE_MANAGER": custom_voice}, clear=False):
        config = _get_voice_config("manager")
        assert config["voice_id"] == custom_voice
        print(f"✓ Voice config env override works: manager -> {custom_voice}")


def test_available_characters():
    """Test getting available character list."""
    from tts_service import get_available_characters
    
    chars = get_available_characters()
    assert len(chars) >= 7
    for key, info in chars.items():
        assert "description" in info
        assert "stability" in info
    print(f"✓ Available characters: {list(chars.keys())}")


def test_tts_configured_check():
    """Test is_tts_configured helper with different API key formats."""
    from tts_service import is_tts_configured
    
    with patch.dict(os.environ, {"ELEVENLABS_API_KEY": ""}, clear=False):
        assert is_tts_configured() == False
    
    with patch.dict(os.environ, {"ELEVENLABS_API_KEY": "your_elevenlabs_api_key_here"}, clear=False):
        assert is_tts_configured() == False

    # sk_ style key
    with patch.dict(os.environ, {"ELEVENLABS_API_KEY": "sk_test_key_123456789"}, clear=False):
        assert is_tts_configured() == True

    # 32-character hexadecimal key (traditional ElevenLabs key format)
    with patch.dict(os.environ, {"ELEVENLABS_API_KEY": "21m00tcm4tlvdq8ikwam1234567890ab"}, clear=False):
        assert is_tts_configured() == True

    # 64-character key
    with patch.dict(os.environ, {"ELEVENLABS_API_KEY": "a" * 64}, clear=False):
        assert is_tts_configured() == True
    
    print("✓ is_tts_configured handles sk_, 32-hex, 64-char, and empty keys correctly")


def test_mock_tts_stream_endpoint():
    """Test /api/tts streaming endpoint with mocked audio chunks."""
    async def mock_stream(*args, **kwargs):
        yield b"fake_mp3_chunk_1"
        yield b"fake_mp3_chunk_2"

    with patch.dict(os.environ, {"ELEVENLABS_API_KEY": "test_key_123456789"}, clear=False):
        with patch("tts_service.generate_speech_stream", side_effect=mock_stream):
            res = client.post("/api/tts", json={
                "text": "Hello, welcome to PrepRoom.",
                "character": "Interviewer",
                "character_authority_level": 3,
                "priority": "P2",
            })
            assert res.status_code == 200
            assert res.headers["content-type"] == "audio/mpeg"
            assert res.content == b"fake_mp3_chunk_1fake_mp3_chunk_2"
            print("✓ /api/tts streaming endpoint succeeds with audio/mpeg")


def test_health_still_works():
    """Verify existing health endpoint still works after TTS integration."""
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    print("✓ Health check still works:", data)


if __name__ == "__main__":
    test_health_still_works()
    test_tts_status_unconfigured()
    test_tts_status_configured()
    test_tts_no_api_key()
    test_tts_empty_text()
    test_character_voice_mapping()
    test_voice_config_env_override()
    test_available_characters()
    test_tts_configured_check()
    test_mock_tts_stream_endpoint()
    print("\n✅ ALL TTS TESTS PASSED!")
