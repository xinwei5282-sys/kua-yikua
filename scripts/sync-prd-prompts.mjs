import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const start='<!-- poster-prompts:start -->';
const end='<!-- poster-prompts:end -->';
const titles=['总提示词','孩子成长场景提示词','工作日常场景提示词','学习探索场景提示词','兴趣生活场景提示词','日常美好场景提示词','提示词统一调用方式'];

export async function syncPrdPrompts(){
 const prompt=await fs.readFile(path.join(root,'docs/kua_yi_kua_poster_prompts.md'),'utf8');
 const sections=prompt.split(/^# [一二三四五六七]、[^\n]*\n/gm).slice(1);
 if(sections.length!==titles.length)throw Error('提示词章节不完整，必须包含总提示词、五个场景及统一调用方式');
 const blocks=sections.map((body,i)=>{
  // Retain prompt text and fenced code; shift only Markdown headings for the PRD hierarchy.
  let fenced=false;
  const text=body.trim().split('\n').map((line,index,lines)=>{
   if(/^```/.test(line)){fenced=!fenced;return line;}
   return !fenced?line.replace(/^(#{2,3}) /,'##$1 ').replace(/ {2,}$/,lines[index+1]?.trim()?'\\':''):line;
  }).join('\n');
  return `### 10.${i+5} ${titles[i]}（完整原文）\n\n${text}`;
 });
 const block=`${start}\n\n${blocks.join('\n\n')}\n\n${end}`;
 const prdPath=path.join(root,'docs/产品方案-v1.0.md');
 const prd=await fs.readFile(prdPath,'utf8');
 const a=prd.indexOf(start),b=prd.indexOf(end);
 if((a<0)!==(b<0)||b<a||prd.indexOf(start,a+1)>=0||prd.indexOf(end,b+1)>=0)throw Error('PRD提示词同步标记异常');
 let next;
 if(a>=0)next=prd.slice(0,a)+block+prd.slice(b+end.length);
 else{
  const anchor='## 十一、数据、接口与验收组织';
  const at=prd.indexOf(anchor);
  if(at<0)throw Error('未找到PRD提示词插入位置');
  next=prd.slice(0,at)+block+'\n\n'+prd.slice(at);
 }
 if(next!==prd)await fs.writeFile(prdPath,next);
 return {sections:sections.length,updated:next!==prd};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 console.log(JSON.stringify(await syncPrdPrompts()));
}
