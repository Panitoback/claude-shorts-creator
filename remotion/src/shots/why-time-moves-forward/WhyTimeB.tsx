import React from 'react';
import { WhyTime } from './WhyTime';

// Variant B (trial reel: deck hook + bridge, deck loop). durationInSeconds = DURATION_S in the vo module (literal: gen-registry reads numbers only).
export const compositionConfig = { id: 'WhyTimeB', durationInSeconds: 79.633, fps: 30, width: 1080, height: 1920 };

const Shot: React.FC = () => <WhyTime variant="b" />;
export default Shot;
