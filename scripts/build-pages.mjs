import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {syncPrdPrompts} from './sync-prd-prompts.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const base=process.env.PAGES_BASE_PATH||'/kua-yikua';
if(!/^\/[a-zA-Z0-9_/-]*$/.test(base))throw Error('Invalid Pages base path');
const prefix=base.replace(/\/$/,'');
await syncPrdPrompts();
// Only generated output is replaced. Source files and local preview stay unchanged.
await fs.rm(out,{recursive:true,force:true});
await fs.mkdir(out,{recursive:true});
async function copyTree(from,to){
 for(const entry of await fs.readdir(from,{withFileTypes:true})){
  if(['qa','tests'].includes(entry.name))continue;
  const source=path.join(from,entry.name),target=path.join(to,entry.name);
  if(entry.isDirectory()){await fs.mkdir(target,{recursive:true});await copyTree(source,target);}
  else if(entry.isFile()){
   if(/\.(html|css|js)$/.test(entry.name)){
    const text=await fs.readFile(source,'utf8');
    await fs.writeFile(target,text.replace(/(["'`(])\/(prototype|docs|design)\//g,`$1${prefix}/$2/`));
   }else await fs.copyFile(source,target);
  }
 }
}
await fs.mkdir(path.join(out,'prototype'),{recursive:true});
await copyTree(path.join(root,'prototype'),path.join(out,'prototype'));
await fs.mkdir(path.join(out,'docs'),{recursive:true});
for(const name of ['产品方案-v1.0.md','kua_yi_kua_poster_prompts.md']){
 await fs.copyFile(path.join(root,'docs',name),path.join(out,'docs',name));
}
await fs.copyFile(path.join(out,'prototype/index.html'),path.join(out,'index.html'));
await fs.writeFile(path.join(out,'.nojekyll'),'');
await fs.writeFile(path.join(out,'version.json'),JSON.stringify({commit:process.env.GITHUB_SHA||'local',prd:'1.1'})+'\n');
console.log(`Pages built: ${out} (base ${prefix||'/'})`);
