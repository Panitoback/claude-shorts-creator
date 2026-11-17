import React from 'react';
import { WhyTime } from './WhyTime';

// Variant A (main: egg hook, egg loop). durationInSeconds = DURATION_S in the vo module (literal: gen-registry reads numbers only).
export const compositionConfig = { id: 'WhyTimeA', durationInSeconds: 80.1, fps: 30, width: 1080, height: 1920 };

const Shot: React.FC = () => <WhyTime variant="a" />;
export default Shot;
