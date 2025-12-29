import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';
import { ENV } from '../config/env.js';

export const aj = arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'],
    }),
    slidingWindow({
      mode: 'LIVE',
      interval: '2s',
      max: 5,
    }),
  ],
});
