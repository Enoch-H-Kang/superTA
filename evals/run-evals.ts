import { pluginEntry } from '../plugins/superta/src/index.js';

export function runEvals() {
  console.log('eval scaffold pending', pluginEntry().name);
}

runEvals();
