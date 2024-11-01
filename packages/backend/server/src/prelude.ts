import 'reflect-metadata';

import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { config } from 'dotenv';
import { omit } from 'lodash-es';

import {
  applyEnvToConfig,
  getDefaultslaxConfig,
} from './fundamentals/config';

const configDir = join(fileURLToPath(import.meta.url), '../config');
async function loadRemote(remoteDir: string, file: string) {
  const filePath = join(configDir, file);
  if (configDir !== remoteDir) {
    cpSync(join(remoteDir, file), filePath, {
      force: true,
    });
  }

  await import(pathToFileURL(filePath).href);
}

async function load() {
  const slax_CONFIG_PATH = process.env.slax_CONFIG_PATH ?? configDir;
  // Initializing slax config
  //
  // 1. load dotenv file to `process.env`
  // load `.env` under pwd
  config();
  // load `.env` under user config folder
  config({
    path: join(slax_CONFIG_PATH, '.env'),
  });

  // 2. generate slax default config and assign to `globalThis.slax`
  globalThis.slax = getDefaultslaxConfig();

  // TODO(@forehalo):
  //   Modules may contribute to ENV_MAP, figure out a good way to involve them instead of hardcoding in `./config/slax.env`
  // 3. load env => config map to `globalThis.slax.ENV_MAP
  await loadRemote(slax_CONFIG_PATH, 'slax.env.js');

  // 4. load `config/slax` to patch custom configs
  await loadRemote(slax_CONFIG_PATH, 'slax.js');

  // 5. load `config/slax.self` to patch custom configs
  // This is the file only take effect in [slax Cloud]
  if (!slax.isSelfhosted) {
    await loadRemote(slax_CONFIG_PATH, 'slax.self.js');
  }

  // 6. apply `process.env` map overriding to `globalThis.slax`
  applyEnvToConfig(globalThis.slax);

  if (slax.node.dev) {
    console.log(
      'slax Config:',
      JSON.stringify(omit(globalThis.slax, 'ENV_MAP'), null, 2)
    );
  }
}

await load();
