import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { TextDecoder, TextEncoder } from 'node:util';

setupZoneTestEnv();

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;
