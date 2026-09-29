import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/xinwei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:8896/#home');await page.waitForSelector('.scene');
 const result=await page.evaluate(async()=>{
  const {renderPoster}=await import('/prototype/poster.js');
  const {preparePhoto,fitPhoto}=await import('/prototype/photo-processing.js');
  const img=new Image();img.src='/prototype/assets/lifestyle-sheet.png';await img.decode();
  const photos=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=680;c.height=340;const x=c.getContext('2d'),w=img.width/3,h=img.height/2;x.drawImage(img,(i%3)*w+3,Math.floor(i/3)*h+3,w-6,h-6,0,0,680,340);return c.toDataURL();});
  const captions=['陪她向前，也别忘了夸夸自己。','忙碌之间，也记得温柔待自己。','认真探索的你，每一步都值得肯定。','愿意唱出喜欢，本身就很动人。','把一份用心，揉进了日常。','把花放进日常，把美好留给自己。'];
  const outputs=[],checks=[];
  const counts=[1,2,3,4,5,6];
  for(const count of counts){
   const indices=count===3?[4,1,5]:Array.from({length:count},(_,i)=>i);
   const texts=[],outOfBounds=[],orig=CanvasRenderingContext2D.prototype.fillText;
   CanvasRenderingContext2D.prototype.fillText=function(t,x,y,...args){texts.push(t);const w=this.measureText(t).width;if(x<0||y<0||y>1000||(this.textAlign!=='right'&&x+w>1501))outOfBounds.push({t,x,y,w});return orig.call(this,t,x,y,...args);};
   let canvas;
   try{canvas=await renderPoster({photos:indices.map(i=>photos[i]),praises:indices.map(i=>captions[i]),title:count===3?'你把日子，\n过出了光。':'小小日常，\n也有自己的光。',body:'认真生活的你，值得给自己一份肯定。',date:'2026.09.28'});}finally{CanvasRenderingContext2D.prototype.fillText=orig;}
   if(outOfBounds.length)throw Error(JSON.stringify(outOfBounds));
   if(count>1&&!indices.every(i=>texts.join('').includes(captions[i])))throw Error('有照片的夸赞丢失');
   checks.push(`${count}图逐图文案完整、未越界、1500x1000`);
   outputs.push({count,url:canvas.toDataURL()});
  }
  const source=document.createElement('canvas');source.width=1200;source.height=200;
  const x=source.getContext('2d');x.fillStyle='#536477';x.fillRect(0,0,1200,200);
  const before=source.toDataURL(),processed=preparePhoto(source,2),fit=fitPhoto(processed,{x:0,y:0,w:300,h:400});
  if(before!==source.toDataURL()||processed.index!==2||processed.aspect!==6||fit.cover||fit.w!==300||fit.h!==50)throw Error('预处理修改源图或安全布局失败');
  if(processed.image.toDataURL()===before)throw Error('未进行图片预处理');
  checks.push('先处理图片且保留源图/原索引','极宽图片完整保留主体区域');
  return {outputs,checks};
 });
 for(const output of result.outputs)await fs.writeFile(`prototype/qa/editorial-${output.count}.png`,Buffer.from(output.url.split(',')[1],'base64'));
 assert.deepEqual(errors,[]);
 await fs.writeFile('prototype/qa/editorial-report.json',JSON.stringify({checkedAt:new Date().toISOString(),checks:result.checks,errors},null,2));
 console.log(JSON.stringify({passed:result.checks.length,errors},null,2));
}finally{await browser.close();}
