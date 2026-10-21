import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['--test','prototype/tests/model.test.mjs','prototype/tests/community.test.mjs','prototype/tests/community-ui.test.mjs','prototype/tests/publication.test.mjs','prototype/tests/scene-routing.test.mjs'],{stdio:'inherit'});process.exitCode=r.status??1;
