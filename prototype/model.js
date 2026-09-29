export const CATEGORIES = ['mama', 'work', 'student', 'elder', 'daily'];
const MAX_TEXT = 500;
const clone = value => JSON.parse(JSON.stringify(value));
const id = (prefix, n) => `${prefix}_${n}_${Math.random().toString(36).slice(2, 8)}`;
const clean = (value, max = MAX_TEXT) => String(value ?? '').trim().slice(0, max);
const photo = value => { const p = String(value ?? ''); if (/^sample:[0-5]$/.test(p)) return p; if (/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p) && p.length <= 1500000) return p; fail('照片格式或大小无效'); };
const fail = message => { throw new Error(message); };
const DAY = 86400000;
const shanghaiDate = timestamp => {
  const d = new Date(Number(timestamp) + 8 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
};
const shiftDate = (date, offset) => {
  const [y, m, d] = date.split('-').map(Number);
  return shanghaiDate(Date.UTC(y, m - 1, d) + offset * DAY - 8 * 60 * 60 * 1000);
};

const initialAccount = (name) => ({
  name, free: 3, plan: null,
  draft: { category: 'mama', allScenes: false, text: '', photos: [], useKnowledge: true },
  knowledge: [], subjects: [{ id: 'self', name: '我' }], jobs: [], ledger: [], knowledgeEnabled: true
});

export function createStore(storage = globalThis.localStorage, now = () => Date.now()) {
  if (!storage) fail('storage is required');
  const key = 'kua-yikua:model:v1';
  let state;
  try {
    const raw = storage.getItem(key);
    state = raw ? JSON.parse(raw) : { schema: 1, activeAccount: 'a', accounts: { a: initialAccount('体验账号'), b: initialAccount('另一账号') } };
  } catch (e) { fail(`无法读取数据: ${e.message}`); }
  const persist = next => { try { storage.setItem(key, JSON.stringify(next)); } catch (e) { throw new Error(`无法保存数据: ${e.message}`); } };
  const normalize = () => {
    if (!state || state.schema !== 1 || !state.accounts || !state.accounts[state.activeAccount]) fail('数据格式无效');
    let migrated = false;
    Object.values(state.accounts).forEach(a => {
      if (a.draft.allScenes === true) { a.draft.category = 'mama'; a.draft.allScenes = false; migrated = true; }
      a.draft.allScenes ??= false; a.knowledgeEnabled ??= true; a.plan ??= null; a.knowledge ??= []; a.subjects ??= [{ id: 'self', name: '我' }]; a.jobs ??= []; a.ledger ??= [];
      const prior = Array.isArray(a.checkinDays) ? a.checkinDays : Object.keys(a.checkinDays || {});
      const merged = new Set(prior.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)));
      a.jobs.filter(j => j.status === 'done' && j.finishedAt).forEach(j => merged.add(shanghaiDate(j.finishedAt)));
      const days = [...merged].sort();
      if (JSON.stringify(days) !== JSON.stringify(prior.sort?.() ?? prior)) migrated = true;
      a.checkinDays = days;
    });
    if (migrated) persist(state);
  };
  normalize();
  const commit = updater => { const next = clone(state); const result = updater(next); persist(next); state = next; return result === undefined ? clone(state) : clone(result); };
  const account = (s = state) => s.accounts[s.activeAccount];
  const allowance = () => { const a = account(); const valid = a.plan && a.plan.expiresAt > now(); return { free: a.free, plan: valid ? a.plan.remaining : 0, total: a.free + (valid ? a.plan.remaining : 0), expiresAt: valid ? a.plan.expiresAt : null }; };
  const reserve = a => { const valid = a.plan && a.plan.expiresAt > now(); if (valid && a.plan.remaining > 0) { a.plan.remaining--; return 'plan'; } if (a.free > 0) { a.free--; return 'free'; } fail('次数不足，请购买包月套餐'); };
  const relevantKnowledge = (a, input) => input.useKnowledge && a.knowledgeEnabled ? a.knowledge.filter(k => k.enabled && k.scope !== 'off' && (k.type === 'preference' && k.subjectId === 'self' || a.subjects.some(s => s.id === k.subjectId && s.name !== '我' && input.text.includes(s.name)))) .map(k => k.id) : [];
  const sameInput = (j, d) => j.category === d.category && j.text === d.text && j.useKnowledge === d.useKnowledge && JSON.stringify(j.photos) === JSON.stringify(d.photos);
  const checkinSummary = () => {
    const days = new Set(account().checkinDays || []);
    const today = shanghaiDate(now());
    const todayDone = days.has(today);
    let cursor = todayDone ? today : shiftDate(today, -1);
    let streak = 0;
    while (days.has(cursor) && cursor <= today) { streak++; cursor = shiftDate(cursor, -1); }
    const sorted = [...days].filter(d => d <= today).sort();
    let longest = 0, run = 0, previous = null;
    sorted.forEach(d => { run = previous && shiftDate(previous, 1) === d ? run + 1 : 1; longest = Math.max(longest, run); previous = d; });
    const recentDays = Array.from({ length: 7 }, (_, i) => shiftDate(today, i - 6)).map(date => ({ date, done: days.has(date), isToday: date === today }));
    return { today, todayDone, streak, total: sorted.length, longest, days: sorted, recentDays };
  };
  return {
    getState: () => clone(state), getAccount: () => clone(account()), allowance, checkinSummary,
    switchAccount: accountId => commit(s => { if (!s.accounts[accountId]) fail('账号不存在'); s.activeAccount = accountId; }),
    setDraft: patch => commit(s => { const d = account(s).draft; if (patch.category && CATEGORIES.includes(patch.category)) { d.category = patch.category; d.allScenes = false; } if (patch.allScenes !== undefined) { d.allScenes = Boolean(patch.allScenes); if (d.allScenes) d.category = 'daily'; } if (patch.text !== undefined) d.text = clean(patch.text); if (patch.photos !== undefined) { if (!Array.isArray(patch.photos) || patch.photos.length > 6) fail('照片数量需为1至6张'); d.photos = patch.photos.map(photo); } if (patch.useKnowledge !== undefined) d.useKnowledge = Boolean(patch.useKnowledge); }),
    addSubject: name => commit(s => { const n = clean(name, 40); if (!n) fail('称呼不能为空'); account(s).subjects.push({ id: id('subject', now()), name: n }); }),
    saveKnowledge: item => commit(s => { const a = account(s); const content = clean(item?.content, 300); if (!content) fail('知识内容不能为空'); if (!['experience', 'preference'].includes(item.type)) fail('知识类型无效'); const subjectId = item.subjectId || 'self'; if (!a.subjects.some(x => x.id === subjectId)) fail('对象不存在'); const record = { id: item.id || id('knowledge', now()), subjectId, type: item.type, content, scope: ['background', 'public', 'off'].includes(item.scope) ? item.scope : 'background', enabled: item.enabled !== false, updatedAt: now() }; const i = a.knowledge.findIndex(x => x.id === record.id); if (i >= 0) a.knowledge[i] = { ...a.knowledge[i], ...record }; else a.knowledge.push(record); }),
    deleteKnowledge: kid => commit(s => { const a = account(s); a.knowledge = a.knowledge.filter(k => k.id !== kid); }),
    toggleKnowledge: kid => commit(s => { const k = account(s).knowledge.find(x => x.id === kid); if (!k) fail('知识不存在'); k.enabled = !k.enabled; }),
    setKnowledgeEnabled: enabled => commit(s => { account(s).knowledgeEnabled = Boolean(enabled); }),
    submitJob: () => commit(s => { const a = account(s), d = a.draft; if (!d.text.trim()) fail('请写一句话'); if (!d.photos.length) fail('请至少上传一张照片'); const existing = a.jobs.find(j => j.status === 'working' && sameInput(j, d)); if (existing) return existing; const source = reserve(a), planId = source === 'plan' ? a.plan.id : null; const ids = relevantKnowledge(a, d); const knowledgeSnapshot = ids.map(kid => { const k=a.knowledge.find(x=>x.id===kid); return { id:k.id, content:k.content, scope:k.scope, type:k.type, subjectId:k.subjectId }; }); const job = { id: id('job', now()), category: d.category, text: d.text, photos: clone(d.photos), useKnowledge: d.useKnowledge, status: 'working', attempt: 1, createdAt: now(), startedAt: now(), source, planId, retryCredit:false, knowledgeIds: ids, knowledgeSnapshot }; a.jobs.push(job); a.ledger.push({ type: 'reserve', source, planId, count: 1, date: now(), jobId: job.id }); return job; }),
    finishJob: (jobId, result, attempt) => commit(s => { const a = account(s), j = a.jobs.find(x => x.id === jobId); if (!j || j.status !== 'working' || j.attempt !== attempt) fail('任务已失效'); const changed = (j.knowledgeIds.length > 0 && !a.knowledgeEnabled) || j.knowledgeSnapshot?.some(old => { const k=a.knowledge.find(x=>x.id===old.id); return !k || !k.enabled || k.content!==old.content || k.scope!==old.scope || k.type!==old.type || k.subjectId!==old.subjectId || k.scope==='off'; }); if (changed) fail('资料已更新，请重新制作'); const title = clean(result?.title, 120), body = clean(result?.body, 1000); if (!title || !body) fail('海报内容不能为空'); const praises = result?.praises === undefined ? [] : result.praises; if (!Array.isArray(praises) || (result?.praises !== undefined && praises.length !== j.photos.length) || praises.some(p => !clean(p, 120))) fail('每张照片需要对应一条夸赞'); j.status = 'done'; j.title = title; j.body = body; j.praises = praises.map(p => clean(p, 120)); j.finishedAt = now(); a.checkinDays = [...new Set([...(a.checkinDays || []), shanghaiDate(j.finishedAt)])].sort(); }),
    failJob: (jobId, attempt) => commit(s => { const a = account(s), j = a.jobs.find(x => x.id === jobId); if (!j || j.status !== 'working' || j.attempt !== attempt) fail('任务已失效'); if (j.source === 'plan' && a.plan?.id === j.planId && a.plan.expiresAt > now()) a.plan.remaining++; else if (j.source === 'plan') j.retryCredit = true; else a.free++; j.status = 'failed'; a.ledger.push({ type: 'release', source: j.source, planId:j.planId, count: 1, date: now(), jobId: j.id }); }),
    retryJob: jobId => commit(s => { const a = account(s), j = a.jobs.find(x => x.id === jobId); if (!j || j.status !== 'failed') fail('任务不可重试'); let source=j.source; if (j.retryCredit) { j.retryCredit=false; } else { source = reserve(a); j.planId = source === 'plan' ? a.plan.id : null; } j.status = 'working'; j.startedAt = now(); j.attempt++; j.source = source; j.knowledgeIds = relevantKnowledge(a, j); j.knowledgeSnapshot = j.knowledgeIds.map(kid => { const k=a.knowledge.find(x=>x.id===kid); return {id:k.id,content:k.content,scope:k.scope,type:k.type,subjectId:k.subjectId}; }); a.ledger.push({ type: 'reserve', source, planId:j.planId, count: 1, date: now(), jobId: j.id }); return j; }),
    deleteJob: jobId => commit(s => { const a = account(s), j = a.jobs.find(x => x.id === jobId); if (!j) fail('任务不存在'); if (j.status === 'working') fail('制作中的任务不可删除'); a.jobs = a.jobs.filter(x => x.id !== jobId); }),
    purchasePlan: () => commit(s => { const a = account(s); if (a.plan && a.plan.expiresAt > now() && a.plan.remaining > 0) fail('当前套餐仍有可用次数'); a.plan = { id:id('plan',now()), remaining: 30, expiresAt: now() + 30 * 86400000 }; a.ledger.push({ type: 'purchase', source: 'plan', planId:a.plan.id, count: 30, date: now() }); return a.plan; })
  };
}
