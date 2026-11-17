import React from 'react';
import { WhatIsAQuasar } from './WhatIsAQuasar';

// Hook variant B (guion.md NOTES / HOOK VARIANTS). durationInSeconds = DURATION_S in vo.gen.ts.
export const compositionConfig = { id: 'WhatIsAQuasarB', durationInSeconds: 73.8, fps: 30, width: 1080, height: 1920 };

const Shot: React.FC = () => <WhatIsAQuasar variant="b" />;
export default Shot;
