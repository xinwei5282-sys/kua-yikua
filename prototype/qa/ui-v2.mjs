import {authenticatedFixture} from './auth-fixture.mjs';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/xinwei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const root='http://127.0.0.1:8896',dir='prototype/qa/ui-v2';
await fs.mkdir(dir,{recursive:true});
const page=await browser.newPage({viewport:{width:390,height:844},timezoneId:'Asia/Shanghai'});
const errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const check=(name,v)=>{assert.ok(v,name);checks.push(name);};
const shot=async name=>{await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${dir}/${name}.png`,animations:'disabled',style:'.toast{visibility:hidden!important}'});};
const route=async name=>{await page.evaluate(n=>{location.hash=n;},name);await page.waitForSelector(`.${name==='records'?'records':name}-page`);};
await authenticatedFixture(page);
try{
 await page.clock.install({time:new Date('2026-09-28T06:33:00Z')});
 await page.goto(`${root}/#home`);await page.waitForSelector('.scene');
 await page.evaluate(async()=>{
  const {createStore}=await import('/prototype/model.js');let t=new Date('2026-09-28T06:20:00Z').getTime();
  const s=createStore(localStorage,()=>t);
  s.setDraft({category:'daily',photos:['sample:4','sample:1','sample:5'],text:'今天做了面包，泡了咖啡，也给窗边添了一束花。'});
  const j=s.submitJob();s.finishJob(j.id,{title:'你把日子，过出了光。',body:'平凡的日常，也藏着珍贵的用心。',praises:['亲手做的，格外香。','忙碌之间，也记得照顾自己。','把花放进日常，把美好留给自己。']},1);
  t=new Date('2026-09-28T06:32:00Z').getTime();s.setDraft({category:'mama',text:'今天陪女儿学会了骑车',photos:['sample:0']});s.submitJob();
  s.setDraft({category:'daily',photos:['sample:4','sample:1','sample:5'],text:'今天做了面包，泡了咖啡，也给窗边添了一束花。'});
 });
 await page.reload();await page.waitForSelector('.thumbnail');
 check('首页我的入口有可见文字',await page.locator('.profile-entry').innerText().then(t=>t.includes('我的')));
 check('三图首页生成按钮位于首屏',await page.locator('[data-action="generate"]').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight));
 await shot('home');
 await page.locator('.profile-entry').click();await page.waitForSelector('.profile-page');await shot('profile');
 check('我的仅保留两个列表入口',await page.locator('.profile-page .row-button').count()===2);
 await page.locator('.quota-card[data-route="plan"]').click();await page.waitForSelector('.plan-page');await shot('plan');
 check('套餐无被删除的说明和列表',! /次数怎么用|查看次数使用记录|全场景可用|套餐与次数/.test(await page.locator('#app').innerText()));
 await route('ledger');await shot('ledger');
 check('记录按日期展示时间',await page.locator('.ledger-time').allTextContents().then(x=>x.join(',')==='14:32,14:20'));
 await route('records');await page.waitForSelector('.record-photo canvas');await shot('records');
 await page.locator('.record-photo[data-action="preview-poster"]').click();await page.waitForSelector('.poster-preview-image img');await shot('modal');
 check('预览无标题且保持横版',await page.locator('dialog h2').count()===0&&await page.locator('.poster-preview-image img').evaluate(i=>i.naturalWidth/i.naturalHeight===1.5));
 await page.locator('dialog .modal-close').click();
 for(const width of [360,390,430]){
  await page.setViewportSize({width,height:844});
  for(const name of ['home','records','profile','plan','ledger']){
   await route(name);
   check(`${width}px ${name} 无横向溢出`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
 }
 await page.setViewportSize({width:360,height:800});await route('home');
 await page.evaluate(()=>window.KuaPrototype.store.setDraft({photos:Array.from({length:6},(_,i)=>`sample:${i}`)}));await page.reload();await page.waitForSelector('.thumbnail');
 check('六图仍可查看与删除末张',await page.locator('.thumbnail').count()===6);
 await page.locator('.thumbnail button').last().click();
 check('删除末张保留其他五张',await page.locator('.thumbnail').count()===5);
 await shot('home-360-five-photos');
 check('页面无运行异常',errors.length===0);
 await fs.writeFile(`${dir}/report.json`,JSON.stringify({viewport:'390x844',checks,errors},null,2));
 // Real browser composition: source phone crop and rendered screenshot share one input.
 const compare=await browser.newPage({viewport:{width:800,height:880}});
 for(const [name,board,col] of [['home','creation-and-records',0],['records','creation-and-records',1],['modal','creation-and-records',2],['profile','account-and-plan',0],['plan','account-and-plan',1],['ledger','account-and-plan',2]]){
  const left=[38,540,1032][col],source=await fs.readFile(`design/ui-v2-${board}.png`),actual=await fs.readFile(`${dir}/${name}.png`);
  await compare.setContent(`<style>*{box-sizing:border-box}body{margin:0;background:#e9e8e0;font:12px sans-serif}.labels,.pair{display:flex;gap:10px;padding:0 5px}.labels span{width:390px;height:25px;padding-top:5px}.ref{width:390px;height:844px;overflow:hidden;position:relative}.ref img{position:absolute;width:1280px;max-width:none;left:${-left/1.2}px;top:${-10/1.2}px}.actual{width:390px;height:844px}</style><div class="labels"><span>UI 设计稿</span><span>浏览器实际渲染 · ${name}</span></div><div class="pair"><div class="ref"><img src="data:image/png;base64,${source.toString('base64')}"></div><img class="actual" src="data:image/png;base64,${actual.toString('base64')}"></div>`);
  await compare.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  await compare.screenshot({path:`${dir}/compare-${name}.png`});
 }
 console.log(JSON.stringify({passed:checks.length,errors,evidence:dir},null,2));
}finally{await browser.close();}
