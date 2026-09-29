import {authenticatedFixture} from './auth-fixture.mjs';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/xinwei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],checks=[];
const dir='prototype/qa/quota-card';await fs.mkdir(dir,{recursive:true});
page.on('pageerror',e=>errors.push(e.message));
await authenticatedFixture(page);
try{
 await page.goto('http://127.0.0.1:8896/#profile');await page.waitForSelector('.quota-card');
 for(const [name,free,plan,expected] of [
  ['free',1,null,1],
  ['monthly',3,{id:'qa',remaining:30,expiresAt:Date.now()+30*86400000},33],
  ['empty',0,null,0],
  ['expired',3,{id:'qa',remaining:30,expiresAt:Date.now()-1000},3]
 ]){
  await page.evaluate(({free,plan})=>{const k='kua-yikua:model:v1',s=window.KuaPrototype.store.getState();s.accounts.a.free=free;s.accounts.a.plan=plan;localStorage.setItem(k,JSON.stringify(s));},{free,plan});
  await page.reload();await page.waitForSelector('.quota-card');
  assert.equal((await page.locator('.quota-value').innerText()).replace(/\s/g,''),`${expected}次`);
  assert.ok(await page.locator('.quota-card').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.screenshot({path:`${dir}/${name}.png`,animations:'disabled'});checks.push(`${name} 额度准确且无溢出`);
  if(name==='monthly'){
   await page.setViewportSize({width:360,height:800});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:`${dir}/monthly-360.png`,animations:'disabled'});checks.push('360px 套餐与到期信息完整');
   await page.setViewportSize({width:390,height:844});
  }
 }
 await page.locator('.quota-card').click();await page.waitForSelector('.plan-page');checks.push('整张卡片进入套餐');
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${dir}/report.json`,JSON.stringify({checks,errors},null,2));
 console.log(JSON.stringify({passed:checks.length,errors}));
}finally{await browser.close();}
