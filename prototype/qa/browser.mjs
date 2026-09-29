import {authenticatedFixture} from './auth-fixture.mjs';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/xinwei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'/Users/xinwei/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.97/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,acceptDownloads:true});
const page=await context.newPage();const errors=[];const checks=[];
page.on('pageerror',e=>errors.push(e.message));
const shot=async name=>{await page.screenshot({path:`prototype/qa/${name}.png`,fullPage:true,animations:'disabled',style:'.toast { visibility: hidden !important; }'});};
const app=()=>page.locator('#app');
const state=()=>page.evaluate(()=>window.KuaPrototype.store.getAccount());
const route=async r=>{await page.goto('http://127.0.0.1:8896/#'+r);await page.waitForSelector('.page');};
const check=(name,condition)=>{assert.ok(condition,name);checks.push(name);};
const completeLatest=async()=>{const j=(await state()).jobs.at(-1);await page.clock.fastForward(301000);await route(`job/${j.id}`);await page.waitForSelector('#poster-host canvas');};
await page.clock.install();
await authenticatedFixture(page);
try{
 await route('home');await page.waitForSelector('.scene');await shot('home-daily');
 check('五类入口全部可用',await page.locator('[data-category]').count()===5);
 check('无底部导航或珍藏',!await app().getByText('珍藏',{exact:true}).count());
 for(const id of ['mama','work','student','elder','daily']){await page.locator(`[data-category="${id}"]`).click();check(`${id} 示例与分类匹配`,(await state()).draft.category===id);}
 await page.locator('#moment').fill('属于我的一次尝试');await page.locator('[data-category="work"]').click();check('切换分类保留自写配文',(await state()).draft.text==='属于我的一次尝试');
 await page.locator('[data-category="mama"]').click();await page.evaluate(()=>window.KuaPrototype.store.setDraft({category:'mama',photos:['sample:0'],text:'今天陪女儿学会了骑车，跑得我满头汗。'}));await page.reload();await page.waitForSelector('.photo-area img');await shot('home-mama');
 await page.locator('[data-action="generate"]').click();await page.waitForSelector('dialog[open]');await page.locator('dialog [data-route="records"]').click();check('提交预占一次',(await state()).free===2);const job=(await state()).jobs[0];
 await page.reload();await page.waitForSelector('.record-estimate');check('刷新恢复制作任务',(await state()).jobs[0].id===job.id);await shot('working');
 await page.evaluate(()=>{const s=window.KuaPrototype.store;const j=s.getAccount().jobs.at(-1);s.failJob(j.id,j.attempt);});await route(`job/${job.id}`);await page.waitForSelector('[data-action="retry"]');check('失败释放次数',(await state()).free===3);await shot('failed');
 await page.locator('[data-action="retry"]').click();check('失败可重试',(await state()).jobs[0].attempt===2);await completeLatest();await shot('result');
 check('生成海报不会自动记忆',(await state()).knowledge.length===0);
 const dlPromise=page.waitForEvent('download');await page.locator('[data-action="download"]').click();const dl=await dlPromise;await dl.saveAs('prototype/qa/export-poster.png');const png=await fs.readFile('prototype/qa/export-poster.png');check('下载为真实 PNG',png[0]===137&&png.subarray(1,4).toString()==='PNG');
 await page.locator('[data-action="share"]').click();check('分享前完整预览',await page.locator('dialog img.download-preview').count()===1);await page.locator('[data-action="close"]').click();
 await page.locator('[data-action="remember"]').click();check('候选记忆来自原始配文',await page.locator('#memory-content').inputValue()===job.text);await page.locator('#memory-content').fill('今天陪女儿学会了骑车。');await page.locator('#memory-form .primary').click();check('确认后才保存记忆',(await state()).knowledge.length===1);
 await route('knowledge');await page.locator('[data-action="subject"]').click();await page.locator('#subject-name').fill('女儿');await page.locator('#subject-form .primary').click();check('可添加家人主体',(await state()).subjects.length===2);
 await page.locator('[data-action="new-memory"]').click();await page.locator('#memory-type').selectOption('preference');await page.locator('#memory-content').fill('喜欢自然、简短一点的表达。');await page.locator('#memory-form .primary').click();await shot('knowledge');
 await page.locator('[data-action="edit-memory"]').first().click();await page.locator('#memory-content').fill('女儿开始学习骑车，我陪她练习。');await page.locator('#subject').selectOption((await state()).subjects[1].id);await page.locator('#memory-form .primary').click();
 await page.locator('[data-action="toggle-memory"]').first().click();check('资料可停用',(await state()).knowledge[0].enabled===false);await page.locator('[data-action="toggle-memory"]').first().click();
 await page.reload();await page.waitForSelector('.knowledge-card');check('资料刷新保留',(await state()).knowledge[0].content==='女儿开始学习骑车，我陪她练习。');
 await route('profile');await shot('profile');await route('records');await shot('records');
 await route('plan');await shot('plan');await page.locator('[data-action="purchase"]').click();check('套餐确认展示次数和周期',await page.locator('dialog').innerText().then(t=>t.includes('30 次')&&t.includes('30 天')));await page.locator('[data-action="confirm-purchase"]').click();check('演示开通30次套餐',(await state()).plan.remaining===30);check('开通不修改既有免费次数',(await state()).free===2);
 await route('guide');await page.locator('[data-account="b"]').click();check('账号隔离资料与套餐',(await state()).knowledge.length===0&&(await state()).plan===null);await route('home');check('第二账号无第一账号草稿',(await state()).draft.text==='');
 await page.locator('#upload').setInputFiles('prototype/assets/lifestyle-sheet.png');await page.waitForFunction(()=>window.KuaPrototype.store.getAccount().draft.photos.length===1);check('真实照片上传可保存',(await state()).draft.photos[0].startsWith('data:image/jpeg;base64,'));await page.locator('#moment').fill('这是我自己上传的照片。');await page.reload();await page.waitForSelector('.photo-area img');check('上传图片刷新可恢复',(await state()).draft.photos[0].length>2000);
 await page.locator('[data-action="generate"]').click();await page.waitForSelector('dialog[open]');await completeLatest();check('上传照片可生成实际海报',await page.locator('#poster-host canvas').evaluate(c=>c.width===1500&&c.height===1000));

 for(const count of [3,6]){
  await route('home');
  await page.evaluate(n=>{const s=window.KuaPrototype.store;s.setDraft({photos:Array.from({length:n},(_,i)=>`sample:${i}`),text:`记录今天的 ${n} 个小瞬间。`});},count);
  await page.reload();await page.waitForSelector('[data-action="generate"]');await page.locator('[data-action="generate"]').click();await page.waitForSelector('dialog[open]');await completeLatest();
  check(`${count} 图逐张配夸赞`,(await state()).jobs.at(-1).praises.length===count&&new Set((await state()).jobs.at(-1).praises).size===count);
  check(`${count} 图海报完整渲染`,await page.locator('#poster-host canvas').evaluate(c=>c.width===1500&&c.height===1000));await shot(`result-${count}-photos`);
 }
 await route('home');await page.locator('[data-action="generate"]').click();check('次数耗尽保留输入并提示套餐',await page.locator('dialog').innerText().then(t=>t.includes('照片和文字都已保留')));await page.locator('dialog .modal-close').click();
 await route('guide');await page.locator('[data-account="a"]').click();check('切回原账号保留资料',(await state()).knowledge.length===2);

 await route('home');await page.locator('[data-action="generate"]').click();await page.waitForSelector('dialog[open]');const revoked=(await state()).jobs.at(-1);await route('knowledge');await page.locator('[data-action="knowledge-global"]').click();await page.clock.fastForward(301000);await route(`job/${revoked.id}`);check('制作中撤回资料可恢复重试',(await state()).jobs.at(-1).status==='failed');await page.locator('[data-action="retry"]').click();await completeLatest();check('撤回后重试不再引用资料',(await state()).jobs.at(-1).knowledgeIds.length===0);
 await page.setViewportSize({width:360,height:800});
 for(const r of ['home','knowledge','records','plan','profile']){await route(r);check(`${r} 360px 无横向溢出`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.setViewportSize({width:1440,height:1080});await route('home');await shot('desktop');
 for(const r of ['home','profile','knowledge','records','plan','ledger','guide']){await route(r);check(`${r} 仅含业务文案`,!(/原型|演示|模拟|本机|示例|体验账号/.test(await page.locator('body').innerText())));}
 await route('home');check('页面无运行时异常',errors.length===0);
 await fs.writeFile('prototype/qa/report.json',JSON.stringify({checkedAt:new Date().toISOString(),checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,errors,screenshots:'prototype/qa'},null,2));
}finally{await browser.close();}
