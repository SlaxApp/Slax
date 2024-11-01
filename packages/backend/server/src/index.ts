/// <reference types="./global.d.ts" />
import './prelude';

import { Logger } from '@nestjs/common';

import { createApp } from './app';

const app = await createApp();
const listeningHost = slax.deploy ? '0.0.0.0' : 'localhost';
await app.listen(slax.port, listeningHost);

const logger = new Logger('App');

logger.log(`slax Server is running in [${slax.type}] mode`);
logger.log(`Listening on http://${listeningHost}:${slax.port}`);
logger.log(`And the public server should be recognized as ${slax.baseUrl}`);
