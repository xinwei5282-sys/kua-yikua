import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base='http://127.0.0.1:8896';
async function ready(){try{const r=await fetch(base+'/__health');const x=await r.json();if(x.root!==root)throw Error('8896 端口被其他项目占用');return true;}catch(e){if(e.message.includes('占用'))throw e;return false;}}
if(!await ready()){
  const log=fs.openSync(path.join(root,'prototype/qa/server.log'),'a');
  const p=spawn(process.execPath,['scripts/server.mjs'],{cwd:root,detached:true,stdio:['ignore',log,log]});p.unref();
  for(let i=0;i<30&&!await ready();i++)await new Promise(r=>setTimeout(r,100));
}
if(!await ready())throw Error('预览服务未启动');
const index=process.argv.indexOf('--route');const route=index<0?'home':process.argv[index+1];
if(!['home','profile','knowledge','records','plan','guide'].includes(route))throw Error('未知页面');
const url=base+'/'+(process.argv.includes('--prd')?'?prd=1':'')+'#'+route;
console.log(JSON.stringify({root,url,source:'prototype/index.html',status:'server-and-source-verified'}));
if(!process.argv.includes('--no-open'))spawn('open',[url],{stdio:'ignore'});
