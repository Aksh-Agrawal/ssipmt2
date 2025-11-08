"""
Ultra-Simplified Voice AI API
Direct integration without Pipecat services (to avoid dependency issues)
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import WebSocketRequestValidationError
import asyncio
import json
import sys
from loguru import logger
from groq import AsyncGroq

from config import config, validate_config

# Configure logging
logger.remove()
logger.add(
    sys.stderr,
    level="INFO",
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>"
)

# Validate configuration on startup
try:
    validate_config()
    logger.success("✅ All required API keys configured")
except Exception as e:
    logger.error(f"❌ Configuration validation failed: {e}")

# Create FastAPI app
app = FastAPI(
    title="SSIPMT Voice AI API",
    description="Ultra-simplified WebSocket-based voice AI",
    version="3.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception handler for WebSocket validation errors
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"⚠️ Unhandled exception: {type(exc).__name__}: {exc}")
    logger.exception(exc)
    return {"error": str(exc)}

# Add middleware to log all requests
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"📥 HTTP Request: {request.method} {request.url}")
    logger.info(f"   Headers: {dict(request.headers)}")
    response = await call_next(request)
    logger.info(f"📤 Response: {response.status_code}")
    return response

# Store active sessions
active_sessions = {}

# Initialize Groq client
groq_client = AsyncGroq(api_key=config.GROQ_API_KEY)


def create_system_prompt(language: str = "en") -> str:
    """Create system prompt for civic engagement assistant"""
    prompts = {
        "en": """You are a helpful civic engagement assistant for a Smart City platform.

Help citizens report and track civic issues (potholes, garbage, traffic, etc.), provide information about government services, and answer questions about local regulations.

Keep responses concise (under 3 sentences when possible) and action-oriented.""",

        "hi": """आप एक स्मार्ट सिटी प्लेटफ़ॉर्म के लिए सहायक हैं। नागरिकों को नागरिक मुद्दों की रिपोर्ट करने में मदद करें।""",

        "cg": """तुम एक स्मार्ट सिटी मनला सहायक हो। नागरिक मन ला मदद करव।"""
    }
    return prompts.get(language, prompts["en"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "SSIPMT Voice AI",
        "version": "3.0.0",
        "type": "WebSocket (Ultra-Simplified)",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        is_valid, missing_keys = validate_config()
        return {
            "status": "healthy" if is_valid else "degraded",
            "configuration": "valid" if is_valid else f"missing: {missing_keys}",
            "active_sessions": len(active_sessions),
            "api_keys": {
                "deepgram": bool(config.DEEPGRAM_API_KEY),
                "groq": bool(config.GROQ_API_KEY),
                "cartesia": bool(config.CARTESIA_API_KEY),
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@app.get("/test-route")
async def test_route():
    """Test route to verify routing works"""
    logger.info("✅ Test route called!")
    return {"message": "Routing works!"}


@app.websocket("/test-ws")
async def test_websocket(websocket: WebSocket):
    """Simple WebSocket endpoint without path parameters"""
    logger.info("🔌 Test WebSocket - connection attempt!")
    try:
        await websocket.accept()
        logger.success("✅ Test WebSocket - accepted!")
        await websocket.send_json({"message": "Test WebSocket connected!"})
        
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        logger.info("Test WebSocket disconnected")


@app.websocket("/voice/ws/{language}")
async def voice_websocket(websocket: WebSocket, language: str = "en"):
    """
    WebSocket endpoint for voice communication
    
    Protocol:
    - Client sends: {"type": "text", "content": "user message"}
    - Server responds: {"type": "text", "content": "AI response"}
    - Client sends: {"type": "ping"} → Server responds: {"type": "pong"}
    - Client sends: {"type": "end"} → Server closes connection
    """
    session_id = str(id(websocket))  # Convert to string for JSON serialization
    logger.info(f"🔌 New WebSocket connection request")
    logger.info(f"   Session ID: {session_id}")
    logger.info(f"   Language: {language}")
    logger.info(f"   Client: {websocket.client}")
    logger.info(f"   Headers: {dict(websocket.headers)}")
    
    try:
        logger.info(f"   Attempting to accept WebSocket...")
        await websocket.accept()
        logger.success(f"✅ WebSocket accepted (session: {session_id})")
        
        # Initialize conversation history
        conversation_history = [
            {"role": "system", "content": create_system_prompt(language)}
        ]
        
        # Store session
        active_sessions[session_id] = {
            "language": language,
            "conversation": conversation_history
        }
        
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": "Voice AI connected! Send text messages to chat.",
            "session_id": session_id
        })
        
        # Message loop
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            
            elif data.get("type") == "text":
                user_message = data.get("content", "")
                logger.info(f"[{session_id}] User: {user_message}")
                
                # Add to conversation
                conversation_history.append({"role": "user", "content": user_message})
                
                try:
                    # Get AI response
                    response = await groq_client.chat.completions.create(
                        model=config.GROQ_MODEL,
                        messages=conversation_history,
                        max_tokens=200,
                        temperature=0.7
                    )
                    
                    ai_message = response.choices[0].message.content
                    conversation_history.append({"role": "assistant", "content": ai_message})
                    
                    logger.info(f"[{session_id}] AI: {ai_message}")
                    
                    # Send response
                    await websocket.send_json({
                        "type": "text",
                        "content": ai_message
                    })
                
                except Exception as e:
                    logger.error(f"[{session_id}] LLM error: {e}")
                    await websocket.send_json({
                        "type": "error",
                        "message": f"AI error: {str(e)}"
                    })
            
            elif data.get("type") == "end":
                logger.info(f"[{session_id}] Client requested end")
                break
    
    except WebSocketDisconnect:
        logger.info(f"[{session_id}] WebSocket disconnected")
    
    except Exception as e:
        logger.error(f"[{session_id}] Error in WebSocket handler: {type(e).__name__}: {e}")
        logger.exception(e)  # This will print the full stack trace
    
    finally:
        # Cleanup
        if session_id in active_sessions:
            del active_sessions[session_id]
        logger.info(f"[{session_id}] Session ended. Active: {len(active_sessions)}")


@app.get("/voice/sessions")
async def list_sessions():
    """List all active voice sessions"""
    return {
        "total": len(active_sessions),
        "sessions": [
            {"session_id": sid, "language": info["language"]}
            for sid, info in active_sessions.items()
        ]
    }


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting Ultra-Simplified Voice AI API on {config.API_HOST}:{config.API_PORT}")
    logger.info("WebSocket endpoint: /voice/ws/{language}")
    logger.info("Note: This version uses text-based WebSocket (audio processing not implemented)")
    
    uvicorn.run(
        app,
        host=config.API_HOST,
        port=config.API_PORT,
        log_level="info",
        ws="websockets",  # Explicitly enable WebSocket support
        access_log=True
    )
