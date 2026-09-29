import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['--test','prototype/tests/model.test.mjs'],{stdio:'inherit'});process.exitCode=r.status??1;
