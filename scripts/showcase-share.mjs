import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {showcaseDocument} from '../prototype/community-showcase.js';
export function createShowcaseShare(directory){
 return async(req,res,pathname)=>{
  if(pathname!=='/api/showcase-shares'&&!pathname.startsWith('/showcase/'))return false;
  const send=(status,body,type='application/json; charset=utf-8')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(type.startsWith('application/json')?JSON.stringify(body):body);};
  try{
   if(pathname==='/api/showcase-shares'){
    if(req.method!=='POST'){send(405,{error:'请使用分享按钮生成链接'});return true;}
    if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){send(403,{error:'无法生成分享链接'});return true;}
    if(!req.headers['content-type']?.startsWith('application/json')){send(415,{error:'分享格式无效'});return true;}
    let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>30*1024*1024){send(413,{error:'作品较多，请选择单个群聊后分享'});return true;}chunks.push(chunk);}
    const {title,items}=JSON.parse(Buffer.concat(chunks).toString());
    if(typeof title!=='string'||title.length>100||!Array.isArray(items)||!items.length||items.length>100)throw Error('请选择 1 至 100 件作品分享');
    const clean=items.map(x=>{if(typeof x.image!=='string'||!/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(x.image))throw Error('作品图片无效');const text=v=>String(v??'').slice(0,1000);if(!Array.isArray(x.likes)||!Array.isArray(x.comments))throw Error('作品互动格式无效');return {image:x.image,title:text(x.title),caption:text(x.caption),group:text(x.group),author:text(x.author),likes:x.likes.slice(0,500).map(text),comments:x.comments.slice(0,500).map(c=>({author:text(c.author),reply:text(c.reply),body:text(c.body)}))};});
    const id=randomUUID();await fs.mkdir(directory,{recursive:true});await fs.writeFile(path.join(directory,id+'.html'),showcaseDocument(clean,title),{flag:'wx'});send(201,{path:'/showcase/'+id});return true;
   }
   const id=pathname.slice('/showcase/'.length);if(req.method!=='GET'||! /^[a-f0-9-]{36}$/.test(id)){send(404,'分享链接无效','text/plain; charset=utf-8');return true;}
   const html=await fs.readFile(path.join(directory,id+'.html'),'utf8');send(200,html,'text/html; charset=utf-8');return true;
  }catch(error){send(error.code==='ENOENT'?404:400,{error:error.code==='ENOENT'?'分享不存在或已失效':error.message==='Unexpected end of JSON input'?'分享格式无效':'分享未成功，请重试'});return true;}
 };
}
