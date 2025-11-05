# Epic 9/yes

y: Voice Assistant Integration using PipeCat, SARVAM AI, Deepgram, and Criteria

## Epic Goal

The goal of this epic is to enhance the existing AI chatbot with a multilingual voice interface. This will be achieved by integrating PipeCat for voice session management, Deepgram for Speech-to-Text (STT), SARVAM AI for multilingual capabilities, and Criteria for Text-to-Speech (TTS). This will allow users to interact with the agent via voice in multiple languages, improving accessibility and user experience.

## Epic Description

### Existing System Context:

- **Current relevant functionality:** The AI-Powered Civic Voice Assistant currently supports a "Tap and Speak" interface for issue reporting and a chat-based interface for the Civic Information Agent. It aims for multilingual support and uses an NLP service for understanding queries.
- **Technology stack:** The project utilizes a microservices architecture with separate databases for complaints and live information. It has a preference for open-source backend frameworks and a robust multilingual engine (like SARVAM AI).
- **Integration points:** The new voice capabilities will integrate with the existing mobile application's UI, the `agent-service` for processing queries, and the underlying NLP/multilingual engine.

### Enhancement Details:

- **What's being added/changed:** This epic will introduce a full-fledged voice interaction capability for the Civic Information Agent, allowing users to speak their queries and receive spoken responses. It will also enhance the existing multilingual support.
- **How it integrates:**
  - **PipeCat:** Will be integrated to manage the voice session and facilitate real-time bidirectional audio streaming between the user and the agent.
  - **Deepgram STT:** Will replace or augment the existing voice-to-text mechanism for the agent's interactions, providing highly accurate Speech-to-Text capabilities.
  - **SARVAM AI:** Will be utilized as the core multilingual engine, ensuring that both STT and TTS can handle multiple languages effectively, as per the existing project's preference.
  - **Criteria TTS:** Will be integrated to provide natural-sounding Text-to-Speech for the agent's responses.
- **Success criteria:**
  - Users can initiate a voice conversation with the Civic Information Agent.
  - Users can speak queries in supported languages (e.g., English, Hindi, Chhattisgarhi) and have them accurately transcribed by Deepgram STT.
  - The agent can process these voice queries, retrieve information, and generate responses.
  - The agent's responses are converted into natural-sounding speech by Criteria TTS in the user's chosen language.
  - The voice interaction is seamless and responsive, managed by PipeCat.

## Stories

1.  **Story 1: Voice Session Management with PipeCat & Core Integration**

    - **Goal:** As a user, I want to initiate and maintain a voice conversation with the AI agent, so I can interact hands-free.
    - **Description:** Integrate PipeCat into the mobile application and the `agent-service` to establish and manage real-time, bidirectional audio streams. This story focuses on setting up the core voice communication channel.

2.  **Story 2: Multilingual Speech-to-Text with Deepgram & SARVAM AI**

    - **Goal:** As a user, I want to speak my queries in multiple languages and have them accurately converted to text, so the agent can understand me.
    - **Description:** Integrate Deepgram STT with PipeCat's audio stream to transcribe user speech. Leverage SARVAM AI for language detection and to ensure accurate transcription across supported languages (English, Hindi, Chhattisgarhi).

3.  **Story 3: Multilingual Text-to-Speech with Criteria TTS & SARVAM AI**
    - **Goal:** As a user, I want to receive spoken responses from the AI agent in my preferred language, so the interaction feels natural and accessible.
    - **Description:** Integrate Criteria TTS with the `agent-service` to convert the agent's text responses into natural-sounding speech. Utilize SARVAM AI to ensure the TTS output is in the correct language, matching the user's input or preference.

## Compatibility Requirements

- [ ] Existing APIs for issue reporting remain unchanged.
- [ ] The new voice services do not negatively impact the performance of the existing chat-based agent or the issue reporting functionality.
- [ ] UI changes for the voice interface follow existing design patterns and do not disrupt the user experience for non-voice features.
- [ ] The integration of new services (PipeCat, Deepgram, Criteria, SARVAM AI) is backward compatible and does not break the existing application if the voice services are unavailable.

## Risk Mitigation

- **Primary Risk:** The primary risk is the complexity of integrating multiple new services and ensuring they work together seamlessly, especially with multilingual support. There's also a risk of performance degradation on low-end devices.
- **Mitigation:**
  - Develop a proof-of-concept (PoC) for the end-to-end voice flow with one language first.
  - Use feature flags to enable/disable the voice functionality during development and initial rollout.
  - Conduct thorough performance testing on a range of devices.
- **Rollback Plan:** If significant issues arise, we can disable the voice feature via the feature flag, reverting to the text-based agent interaction without requiring a full app redeployment.

## Definition of Done

- [ ] All stories (Voice Session Management, Multilingual STT, Multilingual TTS) are completed, and their acceptance criteria are met.
- [ ] The end-to-end voice interaction flow is successfully tested in all supported languages (English, Hindi, Chhattisgarhi).
- [ ] Existing functionality (issue reporting, text-based agent) is verified through regression testing to ensure no new issues have been introduced.
- [ ] The integration points with PipeCat, Deepgram, Criteria, and SARVAM AI are stable and working correctly.
- [ ] Documentation for the new voice services and their integration is created or updated.
- [ ] The voice feature is controlled by a feature flag.
