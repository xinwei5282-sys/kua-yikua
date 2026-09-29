import {authenticatedFixture} from './auth-fixture.mjs';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/xinwei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
const errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const check=(name,value)=>{assert.ok(value,name);checks.push(name);};
const ready=()=>page.waitForFunction(()=>!!document.querySelector('.poster-preview-image img')&&!document.querySelector('[data-action="preview-download"]').disabled);
await authenticatedFixture(page);
try{
 await page.goto('http://127.0.0.1:8896/#home');await page.waitForSelector('.scene');
 await page.evaluate(()=>{
  const s=window.KuaPrototype.store;
  for(let i=0;i<2;i++){s.setDraft({text:`记录${i}`,photos:[`sample:${i}`]});const j=s.submitJob();s.finishJob(j.id,{title:i?'认真生活，\n也值得一份肯定。':'陪她向前，\n也别忘了夸夸自己。',body:'愿你也看见自己的好。',praises:['这一刻值得被记住。']},j.attempt);}
  s.setDraft({text:'还在制作',photos:['sample:2']});s.submitJob();location.hash='records';
 });
 await page.waitForSelector('.record');
 await page.locator('[data-record-filter="done"]').click();
 await page.locator('.record-photo[data-action="preview-poster"]').first().click();await ready();
 check('已完成图片打开弹窗且不离开列表',page.url().endsWith('#records')&&await page.locator('dialog[open].poster-preview-modal').count()===1);
 const firstImage=await page.locator('.poster-preview-image img').getAttribute('src');
 check('弹窗显示横版原图',await page.locator('.poster-preview-image img').evaluate(i=>i.naturalWidth===1500&&i.naturalHeight===1000));
 await page.screenshot({path:'prototype/qa/records-preview-mobile.png',fullPage:true,animations:'disabled'});
 const dl=page.waitForEvent('download');await page.locator('[data-action="preview-download"]').click();
 const download=await dl;await download.saveAs('prototype/qa/records-preview-download.png');
 const png=await fs.readFile('prototype/qa/records-preview-download.png');
 check('下载内容与当前预览完全一致',png.equals(Buffer.from(firstImage.split(',')[1],'base64')));
 await page.evaluate(()=>Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false}));
 await page.locator('[data-action="preview-share"]').click();
 check('不支持原生分享时保留图片与下载按钮',await page.locator('.preview-share-hint').innerText().then(t=>t.includes('先下载图片'))&&await page.locator('[data-action="preview-download"]').isEnabled());
 await page.evaluate(()=>{
  Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});
  Object.defineProperty(navigator,'share',{configurable:true,value:async payload=>{window.sharedPoster={name:payload.files[0].name,type:payload.files[0].type,size:payload.files[0].size};}});
 });
 await page.locator('[data-action="preview-share"]').click();
 check('原生分享传入真实PNG文件',await page.evaluate(()=>window.sharedPoster?.type==='image/png'&&window.sharedPoster.size>1000));
 await page.keyboard.press('Escape');
 check('关闭弹窗保持列表筛选',await page.locator('dialog[open]').count()===0&&await page.locator('[data-record-filter="done"]').getAttribute('class')==='active');
 await page.locator('.record-photo[data-action="preview-poster"]').nth(1).click();await ready();
 check('不同记录预览不串图',await page.locator('.poster-preview-image img').getAttribute('src')!==firstImage);
 await page.setViewportSize({width:1440,height:1000});
 await page.screenshot({path:'prototype/qa/records-preview-desktop.png',fullPage:true,animations:'disabled'});
 check('桌面弹窗始终位于手机画面内',await page.locator('dialog').evaluate(d=>{const r=d.getBoundingClientRect(),p=document.querySelector('.phone').getBoundingClientRect();return r.left>=p.left+12&&r.right<=p.right-12&&r.top>=Math.max(0,p.top)+12&&r.bottom<=Math.min(innerHeight,p.bottom)-12;}));
 await page.locator('dialog .modal-close').click();
 await page.setViewportSize({width:360,height:800});
 await page.locator('.record-info[data-action="preview-poster"]').first().click();await ready();
 check('点击记录文案同样打开预览且360px无溢出',await page.locator('dialog').evaluate(d=>d.getBoundingClientRect().width<=innerWidth&&d.scrollWidth<=d.clientWidth));
 for(const [width,height] of [[360,540],[1440,600]]){
  await page.setViewportSize({width,height});
  await page.waitForFunction(()=>{const r=document.querySelector('dialog').getBoundingClientRect(),p=document.querySelector('.phone').getBoundingClientRect();return r.left>=p.left+12&&r.right<=p.right-12&&r.top>=Math.max(0,p.top)+12&&r.bottom<=Math.min(innerHeight,p.bottom)-12;});
  check(`${width}x${height}短屏按钮与图片均在手机可见范围`,await page.locator('dialog').evaluate(d=>{const r=d.getBoundingClientRect(),b=d.querySelector('.buttons').getBoundingClientRect(),i=d.querySelector('img').getBoundingClientRect();return b.bottom<=r.bottom&&i.top>=r.top&&i.bottom<=b.top;}));
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('dialog .modal-close').click();
 await page.locator('[data-record-filter="working"]').click();await page.locator('.record-photo').click();
 check('制作中记录仍提示等待',await page.locator('dialog[open]').count()===0&&page.url().endsWith('#records'));
 check('无页面异常',errors.length===0);
 await fs.writeFile('prototype/qa/records-preview-report.json',JSON.stringify({checkedAt:new Date().toISOString(),checks,errors},null,2));
 console.log(JSON.stringify({passed:checks.length,errors},null,2));
}finally{await browser.close();}
