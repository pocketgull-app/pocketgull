---
name: simulate_voice
description: Test the Web Speech API and Gemini audio streaming without requiring a physical microphone.
---

# Simulate Voice Interaction

Use this skill when testing or developing the bi-directional voice chat features (using the Web Speech API) in Pocket-Gull.

## Problem

Testing `window.SpeechRecognition` and `window.speechSynthesis` usually requires a physical microphone, browser permissions, and active speaking, which makes automated or rapid agentic testing difficult.

## Solution: Mocking Web Speech API

To test the voice integration without a microphone, you can inject a mock `SpeechRecognition` class into the browser window.

### Playwright / Puppeteer Mock

If you are writing E2E tests for the voice flow, inject this script before the page loads:

```javascript
await page.addInitScript(() => {
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  class MockSpeechRecognition {
    constructor() {
      this.continuous = false;
      this.interimResults = false;
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
    }
    start() {
      // Simulate a successful speech recognition after 500ms
      setTimeout(() => {
        if (this.onresult) {
          const mockEvent = {
            results: [[{ transcript: "I have a headache and feel dizzy." }]]
          };
          this.onresult(mockEvent);
        }
        if (this.onend) this.onend();
      }, 500);
    }
    stop() {}
    abort() {}
  }
  
  // Override the native implementation
  window.SpeechRecognition = MockSpeechRecognition;
  window.webkitSpeechRecognition = MockSpeechRecognition;
});
```

### Manual Console Testing

If you are testing manually in the Chrome DevTools, you can run a similar mock script in the console to override the `SpeechRecognition` constructor.

## Testing Gemini Streaming Responses

When testing the AI response side (`AdkLiveService`), ensure that your mock or test environment properly chunks the text or audio stream exactly as Gemini would over a real WebSocket connection. Handle network interruptions defensively by maintaining conversational state in the `PatientStateService`.
