import React from 'react';
import { WhatIsAQuasarV2 } from './WhatIsAQuasarV2';

// v2, hook A (the published v1 hook take). durationInSeconds = DURATION_S in vo.gen.ts.
export const compositionConfig = { id: 'WhatIsAQuasarV2A', durationInSeconds: 73.8, fps: 30, width: 1080, height: 1920 };

const Shot: React.FC = () => <WhatIsAQuasarV2 />;
export default Shot;
