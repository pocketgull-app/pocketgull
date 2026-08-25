/// <reference lib="webworker" />
import { WebWorkerMLCEngineHandler } from '@mlc-ai/web-llm';

const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (msg: MessageEvent) => {
  if (msg.origin && msg.origin !== self.location.origin && self.location.origin !== 'null') {
    return;
  }
  handler.onmessage(msg);
};
