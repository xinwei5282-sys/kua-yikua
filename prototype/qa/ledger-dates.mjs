import {authenticatedFixture} from './auth-fixture.mjs';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/xinwei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await authenticatedFixture(page);
await page.goto('http://127.0.0.1:8896/#home');await page.waitForSelector('.page');
 await page.evaluate(async()=>{
  const {createStore}=await import('/prototype/model.js');let t=new Date(2026,8,28,10,20).getTime();
  const s=createStore(localStorage,()=>t);
  for(const [i,delta] of [[0,-86400000],[1,0],[2,3600000]]){t=new Date(2026,8,28,10,20).getTime()+delta;s.setDraft({text:`记录${i}`,photos:['sample:0']});const j=s.submitJob();s.finishJob(j.id,{title:'值得记住',body:'属于自己的好时光'},1);}
 });
 await page.goto('http://127.0.0.1:8896/#ledger');await page.reload();await page.waitForSelector('.ledger-day');
 assert.deepEqual(await page.locator('.ledger-day h3').allTextContents(),['2026.09.28','2026.09.27']);
 assert.deepEqual(await page.locator('.ledger-time').allTextContents(),['11:20','10:20','10:20']);
 assert.equal(await page.locator('.ledger-row').count(),3);
 assert.ok(!/提交制作|预占|免费体验/.test(await page.locator('#app').innerText()));
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'prototype/qa/ledger-dates.png',fullPage:true,animations:'disabled'});
 console.log('PASS: 按日期倒序分组，同日时间倒序，只有时间与次数变化，无旧标题或横向溢出。');
}finally{await browser.close();}
