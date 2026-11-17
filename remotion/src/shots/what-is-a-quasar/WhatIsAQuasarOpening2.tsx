import React from 'react';
import { OpeningPrototype } from './OpeningPrototypes';

// Opening prototype 2 (Pullback), brand v2.0. Preview only: the full short is rebuilt once one is picked.
export const compositionConfig = { id: 'WhatIsAQuasarOpening2', durationInSeconds: 6.5, fps: 30, width: 1080, height: 1920 };

const Shot: React.FC = () => <OpeningPrototype opening={2} />;
export default Shot;
