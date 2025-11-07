# 🎤 TTS Audio Playback - Testing Guide

## ✅ What Was Implemented

### Backend (API Route)
**File**: `apps/web-platform/app/api/voice-chat/route.ts`

Added Cartesia TTS integration:
- Converts AI text responses to speech using Cartesia API
- Uses different voice IDs based on language (EN/HI/CG)
- Returns base64-encoded MP3 audio
- Automatic fallback if TTS fails (text-only response)

### Frontend (Chatbot Page)
**File**: `apps/web-platform/app/user/help/page.tsx`

Added audio playback features:
- Hidden `<audio>` element for playing TTS
- Auto-play TTS responses when received
- Replay button on each assistant message
- Base64 audio decoding and playback

## 🎯 How to Test TTS

### Step 1: Navigate to Chatbot
```
http://localhost:3000/user/help
```

### Step 2: Use Voice Input
1. Click the **microphone button** 🎤
2. Speak a question (e.g., "Where is the police station?")
3. Click **Stop Recording**

### Step 3: Listen for Response
- ✅ Your speech will be transcribed (Deepgram STT)
- ✅ AI will generate a text response (Groq LLM)
- ✅ **Audio will automatically play** (Cartesia TTS)
- ✅ You'll hear the AI speaking the response!

### Step 4: Replay Audio
- Each assistant message has a 🎤 **replay button**
- Click it to hear the response again

## 🔊 Voice Configuration

### Language-Specific Voices

| Language | Voice ID | Description |
|----------|----------|-------------|
| English | `79a125e8-cd45-4c13-8a67-188112f4dd22` | Default English voice |
| Hindi | `a0e99841-438c-4a64-b679-ae501e7d6091` | Indian English accent |
| Chhattisgarhi | `a0e99841-438c-4a64-b679-ae501e7d6091` | Indian English accent |

### Audio Format
- **Format**: MP3
- **Sample Rate**: 44,100 Hz
- **Encoding**: Base64 (for transmission)
- **Playback**: Native HTML5 `<audio>` element

## 🛠️ Technical Flow

```
User speaks → MediaRecorder captures audio
              ↓
Audio sent to /api/voice-chat
              ↓
Deepgram STT transcribes → Groq LLM responds
              ↓
Cartesia TTS generates MP3 → Base64 encoded
              ↓
Frontend receives audio → Auto-plays through <audio> element
              ↓
User hears AI speaking! 🎉
```

## ✅ Expected Behavior

### Successful Voice Interaction
1. **You speak**: "Where is Rajnandgaon police station?"
2. **You see**: Text transcription appears in chat
3. **AI responds**: Text message with location details
4. **You hear**: AI voice speaking the response automatically
5. **You can**: Click replay button to hear it again

### With TTS Enabled
- 🎤 Mic icon appears on assistant messages
- 🔊 Audio plays automatically
- ↻ Replay available anytime

### Without TTS (fallback)
- Text response only
- No audio icon
- Still fully functional

## 🐛 Troubleshooting

### No Audio Playing
1. **Check API Key**: Ensure `CARTESIA_API_KEY` is in `.env.local`
2. **Check Browser**: Some browsers block autoplay - click replay button
3. **Check Console**: Look for TTS errors in browser DevTools
4. **Check Network**: Verify `/api/voice-chat` returns `audioResponse`

### Audio Quality Issues
- Change voice ID in API route
- Adjust sample rate (try 22050 or 48000)
- Check internet connection for API calls

### Browser Autoplay Blocked
- Click the replay button manually
- Enable autoplay in browser settings
- User must interact with page first (click/tap)

## 📊 API Response Format

```json
{
  "transcription": "Where is the police station?",
  "response": "The main police station is located at...",
  "language": "en",
  "audioResponse": "SUQzBAAAAAAAI1RTU0UAAAAP..." // Base64 MP3
}
```

## 🎨 UI Elements

### Replay Button
- Location: Inside assistant message cards
- Icon: 🎤 Microphone
- Color: Primary blue
- Tooltip: "Click to replay"

### Audio Player
- Hidden element (`display: none`)
- Controlled programmatically
- Plays base64 data URLs
- Standard HTML5 audio controls disabled

## 🚀 Next Steps

### Enhancements You Can Add
1. **Volume Control**: Add slider for TTS volume
2. **Playback Speed**: 0.75x, 1x, 1.25x, 1.5x options
3. **Stop Button**: Cancel playback mid-response
4. **Download Audio**: Save TTS as MP3 file
5. **Visual Waveform**: Show audio visualization
6. **Loading Indicator**: Show "Generating audio..." while TTS processes

### Voice Improvements
1. **Better Hindi/CG voices**: Upgrade to Indic language models
2. **Emotion/Tone**: Add voice parameters for friendliness
3. **Speaking Rate**: Adjust tempo for clarity
4. **Prosody**: Add emphasis on important words

## 🎉 Success Metrics

### Voice Pipeline Now 100% Complete!
- ✅ Voice Recording (MediaRecorder API)
- ✅ Speech-to-Text (Deepgram STT)
- ✅ Language Detection (SARVAM AI)
- ✅ AI Processing (Groq LLM)
- ✅ Text-to-Speech (Cartesia TTS)
- ✅ Audio Playback (HTML5 Audio)

### Full Voice Conversation Loop
```
Speak → Transcribe → Process → Respond → Speak
   🎤  →    📝    →   🤖   →   💬   →   🔊
```

## 📝 Code References

### Play Audio Function
```typescript
const playAudio = (audioBase64: string) => {
  const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
  if (audioPlayerRef.current) {
    audioPlayerRef.current.src = audioUrl;
    audioPlayerRef.current.play();
  }
};
```

### Auto-Play on Response
```typescript
if (result.audioResponse) {
  playAudio(result.audioResponse);
}
```

### Replay Button
```tsx
<IconButton onClick={() => playAudio(message.audioData!)}>
  <Mic fontSize="small" />
</IconButton>
```

---

**Status**: ✅ TTS AUDIO PLAYBACK FULLY IMPLEMENTED

**Test Now**: Go to http://localhost:3000/user/help and try voice chat!
