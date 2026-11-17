import React from 'react';
import { WhatIsAQuasar } from './WhatIsAQuasar';

// Hook variant C (guion.md NOTES / HOOK VARIANTS). durationInSeconds = DURATION_S in vo.gen.ts.
export const compositionConfig = { id: 'WhatIsAQuasarC', durationInSeconds: 73.8, fps: 30, width: 1080, height: 1920 };

const Shot: React.FC = () => <WhatIsAQuasar variant="c" />;
export default Shot;
