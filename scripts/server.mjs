import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/__health'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({project:'kua-yikua',root}));return;}
    const file=path.resolve(root,'.'+(pathname==='/'?'/prototype/index.html':pathname));
    if(!file.startsWith(root+path.sep)) {res.writeHead(403);res.end();return;}
    const data=await fs.readFile(file);res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(8896,'127.0.0.1',()=>console.log('夸夸原型 http://127.0.0.1:8896/'));
