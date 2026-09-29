import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../model.js';
const make = () => { const db = new Map(), storage = { getItem:k=>db.get(k) ?? null, setItem:(k,v)=>db.set(k,v) }; let t=1000; return { storage, now:()=>t, tick:n=>t+=n }; };
const DAY = 86400000;
const ready = s => { s.setDraft({ text:'今天做了面包', photos:['sample:0'] }); };
test('account isolation and reload', () => { const x=make(), a=createStore(x.storage,x.now); ready(a); a.saveKnowledge({subjectId:'self',type:'preference',content:'喜欢自然表达'}); a.switchAccount('b'); assert.equal(a.getAccount().knowledge.length,0); const b=createStore(x.storage,x.now); assert.equal(b.getAccount().name,'另一账号'); });
test('reserve, fail release, retry, stale and no double completion', () => { const x=make(), s=createStore(x.storage,x.now); ready(s); const j=s.submitJob(); assert.equal(s.allowance().free,2); assert.throws(()=>s.finishJob(j.id,{title:'x',body:'y'},2)); s.failJob(j.id,1); assert.equal(s.allowance().free,3); const r=s.retryJob(j.id); s.finishJob(r.id,{title:'好棒',body:'具体的一天'},2); assert.throws(()=>s.finishJob(r.id,{title:'x',body:'y'},2)); });
test('data urls round trip and duplicate submit is idempotent', () => { const x=make(), s=createStore(x.storage,x.now), p='data:image/jpeg;base64,'+'a'.repeat(32); s.setDraft({text:'照片',photos:[p]}); const a=s.submitJob(), b=s.submitJob(); assert.equal(a.id,b.id); assert.equal(s.allowance().free,2); assert.equal(s.getAccount().jobs[0].photos[0],p); });
test('plan expiration falls back to free', () => { const x=make(), s=createStore(x.storage,x.now); s.purchasePlan(); assert.equal(s.allowance().plan,30); x.tick(31*86400000); assert.equal(s.allowance().plan,0); ready(s); const j=s.submitJob(); assert.equal(j.source,'free'); });
test('knowledge lifecycle and scoped selection', () => { const x=make(), s=createStore(x.storage,x.now); ready(s); s.saveKnowledge({type:'preference',content:'喜欢自然表达'}); s.saveKnowledge({type:'experience',content:'不应泛用'}); const j=s.submitJob(); assert.equal(j.knowledgeIds.length,1); s.toggleKnowledge(j.knowledgeIds[0]); assert.equal(s.getAccount().knowledge[0].enabled,false); s.deleteKnowledge(s.getAccount().knowledge[1].id); });
test('deleted referenced knowledge blocks stale completion', () => { const x=make(), s=createStore(x.storage,x.now); ready(s); s.saveKnowledge({type:'preference',content:'喜欢自然表达'}); const j=s.submitJob(); s.deleteKnowledge(j.knowledgeIds[0]); assert.throws(()=>s.finishJob(j.id,{title:'x',body:'y'},1), /资料已更新/); });
test('expired plan refund does not touch replacement plan and retains retry', () => { const x=make(), s=createStore(x.storage,x.now); s.purchasePlan(); ready(s); const old=s.submitJob(); x.tick(31*86400000); s.purchasePlan(); const replacement=s.getAccount().plan.id; s.failJob(old.id,1); assert.equal(s.getAccount().plan.id,replacement); assert.equal(s.getAccount().plan.remaining,30); const retry=s.retryJob(old.id); assert.equal(retry.planId,old.planId); assert.equal(s.getAccount().plan.remaining,30); });
test('expired plan keeps retry even with no free or replacement plan', () => { const x=make(), s=createStore(x.storage,x.now); s.purchasePlan(); s.setDraft({text:'一件事',photos:['sample:1']}); const old=s.submitJob(); x.tick(31*86400000); for(let i=0;i<3;i++){ s.setDraft({text:'另一件事'+i}); const current=s.submitJob(); s.finishJob(current.id,{title:'完成',body:'一次记录'},1); } assert.equal(s.allowance().free,0); s.failJob(old.id,1); assert.doesNotThrow(()=>s.retryJob(old.id)); });
test('global knowledge off and edited scope invalidate pending job', () => { const x=make(), s=createStore(x.storage,x.now); ready(s); s.saveKnowledge({type:'preference',content:'喜欢自然表达',scope:'public'}); const j=s.submitJob(); s.setKnowledgeEnabled(false); assert.throws(()=>s.finishJob(j.id,{title:'x',body:'y'},1), /资料已更新/); s.setKnowledgeEnabled(true); s.saveKnowledge({id:j.knowledgeIds[0],type:'preference',content:'喜欢自然表达',scope:'background'}); assert.throws(()=>s.finishJob(j.id,{title:'x',body:'y'},1), /资料已更新/); });
test('storage failure rolls back', () => { const storage={getItem:()=>null,setItem:()=>{throw new Error('quota')}}; const s=createStore(storage,()=>1); assert.throws(()=>s.setDraft({text:'x'})); assert.equal(s.getAccount().draft.text,''); });
test('knowledge disabled still permits knowledge-free generation and refreshed retry', () => {
 const x=make(),s=createStore(x.storage,x.now);ready(s);s.saveKnowledge({type:'preference',content:'喜欢简短'});const j=s.submitJob();s.setKnowledgeEnabled(false);s.failJob(j.id,1);const retry=s.retryJob(j.id);assert.equal(retry.knowledgeIds.length,0);assert.doesNotThrow(()=>s.finishJob(j.id,{title:'这一刻',body:'来自当前配文'},retry.attempt));
 s.setDraft({text:'下一件事'});const fresh=s.submitJob();assert.doesNotThrow(()=>s.finishJob(fresh.id,{title:'好好生活',body:'无个人资料也可使用'},1));
});
test('edited knowledge snapshot refreshes on retry', () => {
 const x=make(),s=createStore(x.storage,x.now);ready(s);s.saveKnowledge({type:'preference',content:'自然表达'});const j=s.submitJob();s.saveKnowledge({id:j.knowledgeIds[0],type:'preference',content:'简短表达'});s.failJob(j.id,1);const r=s.retryJob(j.id);assert.doesNotThrow(()=>s.finishJob(r.id,{title:'新的偏好',body:'短一点'},r.attempt));
});

test('retry starts a new waiting period and preserves it after reload', () => {
 const x=make(),s=createStore(x.storage,x.now);ready(s);const j=s.submitJob();
 x.tick(120000);s.failJob(j.id,j.attempt);const r=s.retryJob(j.id);
 assert.equal(r.createdAt,j.createdAt);assert.equal(r.startedAt,x.now());
 assert.equal(createStore(x.storage,x.now).getAccount().jobs[0].startedAt,r.startedAt);
});

test('multi-photo praises preserve order and still consume one use', () => {
 const x=make(),s=createStore(x.storage,x.now);s.setDraft({text:'今天的记录',photos:['sample:0','sample:1','sample:2']});
 const j=s.submitJob();assert.equal(s.allowance().free,2);
 assert.throws(()=>s.finishJob(j.id,{title:'今天',body:'记录',praises:['漏掉两张']},1),/每张照片/);
 assert.equal(s.getAccount().jobs[0].status,'working');
 const praises=['第一张的夸赞','第二张的夸赞','第三张的夸赞'];
 s.finishJob(j.id,{title:'今天',body:'记录',praises},1);
 assert.deepEqual(createStore(x.storage,x.now).getAccount().jobs[0].praises,praises);
 assert.equal(s.allowance().free,2);
});

test('all scenes compatibility maps to daily prompts, survives reload and preserves user draft',()=>{
 const x=make(),s=createStore(x.storage,x.now);assert.equal(s.getAccount().draft.allScenes,false); assert.equal(s.getAccount().draft.category,'mama');
 s.setDraft({category:'mama',text:'自己的故事',photos:['sample:1']});assert.equal(s.getAccount().draft.allScenes,false);
 s.setDraft({allScenes:true});const d=s.getAccount().draft;
 assert.equal(d.category,'daily');assert.equal(d.allScenes,true);assert.equal(d.text,'自己的故事');assert.deepEqual(d.photos,['sample:1']);
});
test('新账号默认宝妈，旧全部场景草稿迁移且保留内容，明确分类不变',()=>{
 const x=make(), fresh=createStore(x.storage,x.now); assert.equal(fresh.getAccount().draft.category,'mama'); assert.equal(fresh.getAccount().draft.allScenes,false);
 const legacy = fresh.getState(); legacy.accounts.a.draft={category:'daily',allScenes:true,text:'家人的故事',photos:['sample:2'],useKnowledge:true}; legacy.accounts.b.draft={category:'work',text:'工作进步',photos:['sample:1'],useKnowledge:true}; x.storage.setItem('kua-yikua:model:v1',JSON.stringify(legacy));
 const s=createStore(x.storage,x.now); assert.deepEqual(s.getAccount().draft,{category:'mama',allScenes:false,text:'家人的故事',photos:['sample:2'],useKnowledge:true}); s.switchAccount('b'); assert.equal(s.getAccount().draft.category,'work'); assert.equal(s.getAccount().draft.allScenes,false); assert.equal(createStore(x.storage,x.now).getAccount().draft.category,'work');
});

const finish = (s, text = '今天的记录') => { s.setDraft({ text, photos: ['sample:0'] }); const j = s.submitJob(); s.finishJob(j.id, { title: '这一刻', body: '值得记录' }, j.attempt); return j; };
test('美好打卡按上海日期去重，并返回连续天数', () => {
 const x=make(), s=createStore(x.storage,x.now);
 finish(s); assert.equal(s.checkinSummary().total,1); assert.equal(s.checkinSummary().todayDone,true); assert.equal(s.checkinSummary().streak,1);
 s.setDraft({text:'同一天第二次'}); const j=s.submitJob(); s.finishJob(j.id,{title:'再次',body:'仍然美好'},j.attempt);
 assert.equal(s.checkinSummary().total,1); assert.equal(s.checkinSummary().longest,1);
});
test('失败不打卡，重试成功后计入且删除记录不影响打卡', () => {
 const x=make(), s=createStore(x.storage,x.now); s.setDraft({text:'失败的一次',photos:['sample:0']}); const j=s.submitJob(); s.failJob(j.id,j.attempt); assert.equal(s.checkinSummary().total,0);
 const r=s.retryJob(j.id); s.finishJob(r.id,{title:'重试成功',body:'终于完成'},r.attempt); assert.equal(s.checkinSummary().total,1); s.deleteJob(j.id); assert.equal(s.checkinSummary().total,1);
});
test('跨上海午夜计算连续打卡，未来日期不计入', () => {
 const x=make(); x.tick(15*60*60*1000 + 50*60*1000); const s=createStore(x.storage,x.now); finish(s,'前一天');
 x.tick(20*60*1000); finish(s,'新一天'); const summary=s.checkinSummary(); assert.equal(summary.streak,2); assert.equal(summary.days.length,2); assert.equal(summary.recentDays.at(-1).isToday,true);
});
test('昨日有记录且今日未生成时连续天数仍为1，断档后归零', () => {
 const x=make(); x.tick(8*60*60*1000 + 2*DAY); const s=createStore(x.storage,x.now); finish(s,'两天前'); x.tick(2*DAY); assert.equal(s.checkinSummary().todayDone,false); assert.equal(s.checkinSummary().streak,0);
});
test('打卡数据按账号隔离并可从旧完成任务迁移', () => {
 const x=make(); const old={schema:1,activeAccount:'a',accounts:{a:{...createStore(x.storage,x.now).getAccount(),jobs:[{id:'old',status:'done',finishedAt:1000,title:'旧',body:'记录',photos:['sample:0'],category:'daily',text:'旧',useKnowledge:true}]},b:createStore(x.storage,x.now).getState().accounts.b}};
 x.storage.setItem('kua-yikua:model:v1',JSON.stringify(old)); const s=createStore(x.storage,x.now); assert.equal(s.checkinSummary().total,1); assert.equal(createStore(x.storage,x.now).checkinSummary().total,1); s.switchAccount('b'); assert.equal(s.checkinSummary().total,0);
});
