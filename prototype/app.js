import {createStore} from './model.js';
import {renderPoster,downloadCanvas,canvasToBlob} from './poster.js';

const C={
  mama:{name:'宝妈',photo:0,hint:'今天和孩子发生了什么？',example:'今天陪女儿学会了骑车，跑得我满头汗。',title:'她学会了向前，\n你也值得被夸一夸。',body:'她的勇敢里，也有你陪着跑的那些路。满头汗的这一天，值得被好好记住。'},
  work:{name:'职场人',photo:1,hint:'今天哪件事值得给自己一个肯定？',example:'忙了两周，方案终于通过了，想给自己好好放个假。',title:'认真付出的你，\n也值得好好休息。',body:'这两周的用心，终于走到了一个小小的终点。合上电脑，把今天留一点给自己。'},
  student:{name:'学生',photo:2,hint:'今天有什么小进步？',example:'反复看了好多遍，今天终于把这道题弄懂了。',title:'终于懂了的这一刻，\n就是你的进步。',body:'从不明白到想通，那些反复尝试没有白费。值得开心的，是你又多懂了一点。'},
  elder:{name:'长辈',photo:3,hint:'今天有什么开心或新鲜的事？',example:'第一次登台唱歌，有点紧张，但唱完特别开心。',title:'把喜欢的歌，\n唱成今天的快乐。',body:'带着一点紧张走上台，也带着满心开心走下来。愿意尝试喜欢的事，本身就很动人。'},
  daily:{name:'日常',photo:4,hint:'这一刻，你想留下什么？',example:'第一次做面包，样子一般，但全家都说很好吃。',title:'生活的香气，\n是你亲手做出来的。',body:'第一次的面包，不必长得完美。那句“很好吃”，已经让今天有了值得回味的温暖。'}
};
const paths={back:'m14 5-7 7 7 7',arrow:'m9 5 7 7-7 7',camera:'M5 6h3l2-3h4l2 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',image:'M4 3h16v18H4z M4 16l5-5 4 4 3-3 4 5 M9 7h.01',leaf:'M20 3C8 3 3 7 4 14c1 8 15 9 16-11ZM5 20 15 10',person:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-3a8 8 0 0 1 16 0v3',download:'M12 3v12 m-5-5 5 5 5-5 M3 15v5h18v-5',share:'M12 16V3 m-5 5 5-5 5 5 M5 12H3v9h18v-9h-2',book:'M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3z M12 6v15',clock:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M12 6v6l4 2',sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M12 1v2 m0 18v2 M1 12h2 m18 0h2 M4 4l2 2 m12 12 2 2 M20 4l-2 2 M6 18l-2 2',gift:'M3 8h18v4H3z M5 12v9h14v-9 M12 8v13 M12 8C3 8 5 1 9 3l3 5Zm0 0c9 0 7-7 3-5l-3 5Z',message:'M3 3h18v14H9l-6 4z M7 8h10 M7 12h6',check:'m5 12 4 4L20 5',info:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M12 11v6 M12 7h.01'};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.info}"/></svg>`;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
const app=$('#app'), modal=$('#modal');
let store, samples=[], recordFilter='all',knowledgeFilter='all',uploadMode='add',posterCanvas=null,renderEpoch=0, toastTimer,previewPoster=null,previewEpoch=0;
try{store=createStore(localStorage);}catch(e){app.innerHTML=`<div class="page"><h1 class="page-heading">暂时无法读取资料</h1><p>${esc(e.message)}</p><p>请检查浏览器的存储设置后重试。</p></div>`;throw e;}
window.KuaPrototype={store};
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
function attempt(fn){try{return fn();}catch(e){toast(e.message||'操作未完成，请重试');return null;}}
async function sampleAssets(){const img=new Image();img.src='/prototype/assets/lifestyle-sheet.png';await img.decode();return Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=680;c.height=340;const ctx=c.getContext('2d');const w=img.width/3,h=img.height/2;ctx.drawImage(img,(i%3)*w+3,Math.floor(i/3)*h+3,w-6,h-6,0,0,680,340);return c.toDataURL('image/jpeg',.87);});}
const photoSrc=p=>String(p).startsWith('sample:')?samples[Number(p.split(':')[1])]:p;
const photo=(p,cls='')=>`<img class="scene ${cls}" src="${esc(photoSrc(p))}" alt="记录照片">`;
const date=n=>new Date(n).toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}).replaceAll('/','.');
const fullDate=n=>`${date(n)} ${new Date(n).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}`;
const category=id=>C[id]||C.daily;
const accountName=name=>({'体验账号':'小叶','另一账号':'小光'}[name]||name);
const capsule='<div class="mini-capsule" aria-hidden="true"><span>•••</span><span>⊙</span></div>';
function nav(title,back='home'){return `<div class="nav">${back?`<button class="icon-btn" data-route="${back}" aria-label="返回">${icon('back')}</button>`:'<span class="nav-spacer"></span>'}<h2>${title}</h2>${capsule}</div>`;}
function foot(){return '';}
const toggle=(on,action,label)=>`<button class="toggle ${on?'on':''}" data-action="${action}" role="switch" aria-checked="${on}" aria-label="${label}"></button>`;
function go(route){cancelLogin();modal.close();if(location.hash.slice(1)===route)render();else location.hash=route;}
function positionModal(){
  const phone=document.querySelector('.phone'),r=phone.getBoundingClientRect(),v=window.visualViewport;
  const viewportTop=v?.offsetTop||0,viewportBottom=viewportTop+(v?.height||innerHeight);
  const left=Math.max(0,r.left+phone.clientLeft),right=Math.min(innerWidth,r.left+phone.clientLeft+phone.clientWidth);
  const top=Math.max(viewportTop,r.top+phone.clientTop),bottom=Math.min(viewportBottom,r.bottom-phone.clientTop);
  modal.style.setProperty('--modal-x',`${(left+right)/2}px`);
  modal.style.setProperty('--modal-y',`${(top+bottom)/2}px`);
  modal.style.setProperty('--modal-width',`${Math.max(0,right-left-24)}px`);
  modal.style.setProperty('--modal-max-height',`${Math.max(0,bottom-top-24)}px`);
}
function showModal(html,cls=''){previewEpoch++;previewPoster=null;modal.className=cls;modal.innerHTML=html;positionModal();modal.showModal();}
const updateModalPosition=()=>{if(modal.open)positionModal();};
window.addEventListener('resize',updateModalPosition);
window.addEventListener('scroll',updateModalPosition,{passive:true});
window.visualViewport?.addEventListener('resize',updateModalPosition);
window.visualViewport?.addEventListener('scroll',updateModalPosition);
new ResizeObserver(updateModalPosition).observe(document.querySelector('.phone'));
const modalHead=title=>`<div class="modal-head"><h2>${title}</h2><button class="modal-close" data-action="close" aria-label="关闭">×</button></div>`;
// Interaction-only login adapter. Replace with wx.login + server session in the miniapp.
const LOGIN_KEY='kua-yikua:login:v1';
let loginRequest=null;
function signedIn(){try{return JSON.parse(localStorage.getItem(LOGIN_KEY)||'{}')[store.getState().activeAccount]===true;}catch{return false;}}
function cancelLogin(){loginRequest=null;}
function loginLanding(){return `<div class="page login-page">${nav(location.hash==='#records'?'夸夸集':'我的',null)}<div class="login-intro"><div class="login-avatar">${icon('person')}</div><h1>让每一份夸赞，<br>都有处安放。</h1><p>微信登录后，保存你的海报、<br>制作记录和可用次数。</p></div><p class="login-error" role="alert" hidden></p><button class="primary" data-action="login">微信登录</button><button class="login-later" data-route="home">先去记录这一刻</button></div>`;}
function requestLogin(after=()=>{}){
  showModal(`${modalHead('生成前，先微信授权')}<p class="description">授权登录后，这张海报和制作记录会保存在你的账号里。</p><div class="login-purpose">${icon('person')}使用微信身份建立账号，无需填写手机号</div><p class="login-error" role="alert" hidden></p><button class="primary" data-action="confirm-login">微信授权并生成</button><button class="login-later" data-action="close">暂不生成</button>`,'login-modal');
  loginRequest={account:store.getState().activeAccount,after,surface:modal};
}
async function confirmLogin(button){
  const request=loginRequest;if(!request||button.disabled)return;
  const error=request.surface.querySelector('.login-error');
  button.disabled=true;button.textContent=request.surface===modal?'正在授权…':'正在登录…';error.hidden=true;
  try{
    if(!navigator.onLine)throw Error('网络暂时不可用，请连接后重试。');
    await new Promise(resolve=>setTimeout(resolve,450));
    if(request!==loginRequest||(request.surface===modal&&!modal.open)||request.account!==store.getState().activeAccount)return;
    if(!navigator.onLine)throw Error('网络暂时不可用，请连接后重试。');
    const sessions=JSON.parse(localStorage.getItem(LOGIN_KEY)||'{}');sessions[request.account]=true;
    localStorage.setItem(LOGIN_KEY,JSON.stringify(sessions));
    loginRequest=null;modal.close();await render();request.after();
  }catch(e){if(request!==loginRequest||(request.surface===modal&&!modal.open))return;error.textContent=e.message.includes('网络')?e.message:'暂时未能登录，请重试。照片和文字已保留。';error.hidden=false;button.disabled=false;button.textContent=request.surface===modal?'重新授权并生成':'重新登录';}
}
function submitGeneration(){
  const d=store.getAccount().draft;
  if(!d.photos.length){toast('先放一张照片吧');return;}
  if(!d.text.trim()){toast('写一句话，说说这一刻');$('#moment')?.focus();return;}
  if(!signedIn()){requestLogin(submitGeneration);return;}
  if(store.allowance().total<1){showModal(`${modalHead('再给日常一点肯定')}<p class="description">当前可用次数已用完。照片和文字都已保留，可以了解包月套餐后继续。</p><div class="buttons"><button class="secondary" data-action="close">再想想</button><button class="primary" data-route="plan">查看套餐</button></div>`);return;}
  const job=attempt(()=>store.submitJob());if(job)submitted();
}
const homeIcon=name=>`<i class="ri-${name}" aria-hidden="true"></i>`;
const categoryIcons={mama:'user-smile-fill',work:'briefcase-4-fill',student:'graduation-cap-fill',elder:'heart-fill',daily:'function-fill'};
function home(){const a=store.getAccount(),d=a.draft;return `<div class="page home-page"><div class="nav">${capsule}</div>
<div class="home-hero"><img src="/prototype/assets/home-reference-hero.png" alt="发现美好 记录美好，生活里的小确幸，值得被看见"></div>
<div class="home-content"><div class="home-composer"><div class="textarea-wrap"><textarea id="moment" aria-label="分享此刻的故事" maxlength="300" placeholder="分享此刻的故事…">${esc(d.text)}</textarea></div><div class="composer-bottom"><span class="count">${d.text.length}/300</span></div>
${d.photos.length?`<div class="photo-area has-photos composer-photos">${d.photos.map((p,i)=>`<div class="composer-photo">${photo(p)}<button data-action="remove-photo" data-index="${i}" aria-label="移除第 ${i+1} 张照片">${homeIcon('close-line')}</button></div>`).join('')}</div>`:''}
<button class="composer-upload" data-action="upload" ${d.photos.length>=6?'disabled':''}>${homeIcon('image-add-line')}<span>${d.photos.length>=6?'已添加 6 张照片':d.photos.length?`继续添加照片 · ${d.photos.length}/6`:'添加照片'}</span>${homeIcon('arrow-right-s-line')}</button></div>
${signedIn()&&a.knowledge.length?`<div class="knowledge-line"><span>${icon('leaf')}结合我的资料，让回应更懂我</span>${toggle(d.useKnowledge&&a.knowledgeEnabled,'draft-knowledge','结合我的资料')}</div>`:''}
<button class="primary" data-action="generate">夸一夸，生成海报</button>
${recentPraises()}
</div></div>`;}

function menu(iconName,title,sub,route){return `<button class="row row-button" data-route="${route}"><span class="row-icon">${icon(iconName)}</span><span class="row-copy"><strong>${title}</strong>${sub?`<small>${sub}</small>`:''}</span>${icon('arrow','chevron')}</button>`;}
function recentPraises(){const jobs=signedIn()?store.getAccount().jobs.slice().reverse().sort((a,b)=>b.createdAt-a.createdAt).slice(0,10):[];return `<section class="recent-praises" aria-label="最近的夸夸"><div class="recent-heading"><h2>最近的夸夸</h2><button data-route="records">查看全部 ${homeIcon('arrow-right-s-line')}</button></div>${jobs.length?`<div class="recent-list">${jobs.map(j=>`<button class="recent-card" ${j.status==='done'?`data-action="preview-poster" data-id="${j.id}"`:j.status==='working'?'data-action="job-progress"':`data-route="job/${j.id}"`} aria-label="${j.status==='done'?'查看并分享海报':j.status==='working'?'查看制作进度':'查看生成失败记录'}：${esc(j.title||j.text)}"><span class="recent-photo">${photo(j.photos[0])}${j.status!=='done'?`<span class="recent-state ${j.status}">${j.status==='working'?'制作中':'生成失败'}</span>`:''}</span><span class="recent-details"><strong>${esc((j.title||j.text).replaceAll('\n',''))}</strong><time datetime="${new Date(j.createdAt).toISOString()}">${date(j.createdAt)}</time></span></button>`).join('')}</div>`:`<div class="recent-empty">${homeIcon('gallery-line')}<div><strong>还没有夸夸海报</strong><p>生成后，在这里回看与分享</p></div></div>`}</section>`;}

function checkinCard(compact=false){const c=store.checkinSummary();const headline=c.streak?`连续记录 <strong>${c.streak}</strong> 天`:'从今天，记录美好';const status=c.todayDone?'今日已打卡':c.streak?'今天生成，延续美好':'今天还未打卡';
 if(compact)return `<button class="checkin-summary" data-route="records">${homeIcon('calendar-check-line')}<span><b>美好打卡</b><small>${c.streak?`连续记录 ${c.streak} 天 · `:''}${status}</small></span>${homeIcon('arrow-right-s-line')}</button>`;
 return `<section class="checkin-card" aria-label="美好打卡"><div class="checkin-head"><span>${homeIcon('calendar-check-line')}美好打卡</span><span class="checkin-status ${c.todayDone?'done':''}">${status}</span></div><div class="checkin-progress"><h1>${headline}</h1>${!c.todayDone?'<button data-route="home">去记录 '+homeIcon('arrow-right-line')+'</button>':''}</div><div class="checkin-days">${c.recentDays.map(d=>`<div class="checkin-day ${d.done?'done':''} ${d.isToday?'today':''}" aria-label="${d.date} ${d.done?'已打卡':'未打卡'}"><span>${d.isToday?'今天':d.date.slice(5).replace('-','/')}</span><i class="ri-${d.done?'check-line':'subtract-line'}" aria-hidden="true"></i></div>`).join('')}</div></section>`;}
function tabbar(route){return `<nav class="app-tabbar" aria-label="主导航">${[['home','首页','home-5'],['records','夸夸集','gallery'],['profile','我的','user-3']].map(([r,t,i])=>`<button data-route="${r}" class="${route===r?'active':''}" ${route===r?'aria-current="page"':''}>${homeIcon(i+(route===r?'-fill':'-line'))}<span>${t}</span></button>`).join('')}</nav>`;}
function mountTabs(route){const visible=['home','records','profile'].includes(route);document.querySelector('.phone').classList.toggle('with-tabs',visible);if(visible)app.insertAdjacentHTML('beforeend',tabbar(route));positionTabs();}
function positionTabs(){const tab=app.querySelector('.app-tabbar');if(!tab)return;const keyboard=window.visualViewport&&innerHeight-window.visualViewport.height>160&&/INPUT|TEXTAREA/.test(document.activeElement?.tagName);tab.hidden=Boolean(keyboard);}
window.addEventListener('resize',positionTabs);window.addEventListener('scroll',positionTabs,{passive:true});window.visualViewport?.addEventListener('resize',positionTabs);new ResizeObserver(positionTabs).observe(document.querySelector('.phone'));
function profile(){const a=store.getAccount(),n=store.allowance();return `<div class="page profile-page">${nav('我的',null)}<div class="profile-head"><div class="avatar">${store.getState().activeAccount==='a'?'叶':'光'}</div><div><h1>${esc(accountName(a.name))}</h1><p>平凡的日子，也有闪闪发光的时刻</p></div></div><button class="quota-card" data-route="plan" aria-label="可用 ${n.total} 次，查看套餐"><span class="quota-label">可用次数</span><span class="quota-main"><span class="quota-value">${n.total}<span>次</span></span><span class="quota-entry">查看套餐 ${icon('arrow')}</span></span><span class="quota-detail"><span>${n.expiresAt?`包月 ${n.plan} 次 · 免费 ${n.free} 次`:a.plan?'套餐已到期 · 免费体验':n.free?'免费体验':'免费体验已用完'}</span>${n.expiresAt?`<span class="quota-expiry">${date(n.expiresAt)} 到期</span>`:''}</span></button>${checkinCard(true)}<button class="scene-preference" data-action="choose-scene"><span>${homeIcon('apps-2-line')}<b>夸赞场景</b></span><span>${category(a.draft.category).name}${homeIcon('arrow-right-s-line')}</span></button>${menu('clock','使用记录','','ledger')}${foot()}</div>`;}
function knowledge(){const a=store.getAccount(),items=a.knowledge.filter(k=>knowledgeFilter==='all'||k.type===knowledgeFilter);return `<div class="page">${nav('关于我','profile')}<h1 class="page-heading">慢慢认识，<br>每一个真实的你。</h1><p class="lead">记住你的经历与偏好，让下一次夸夸更贴心。<br>你决定记住什么，也可以随时修改或删除。</p><div class="kb-summary"><div><strong>允许生成时参考我的资料</strong><p>关闭后，只根据本次照片和配文回应</p></div>${toggle(a.knowledgeEnabled,'knowledge-global','使用个人资料')}</div><div class="section-title">我与家人<button class="plain-link" style="font-size:11px;padding:0" data-action="subject">＋ 添加家人</button></div><div class="people">${a.subjects.map(s=>`<span class="person-pill">${esc(s.name)}</span>`).join('')}</div><div class="filter-row" aria-label="资料分类">${[['all','全部'],['experience','经历'],['preference','偏好']].map(([k,v])=>`<button class="${knowledgeFilter===k?'active':''}" data-knowledge-filter="${k}">${v}</button>`).join('')}</div>${items.length?items.map(k=>`<div class="knowledge-card ${!k.enabled?'off':''}"><div class="knowledge-top"><span class="subject">${esc(a.subjects.find(s=>s.id===k.subjectId)?.name||'我')} · ${k.type==='preference'?'表达偏好':'一段经历'}</span><button class="toggle ${k.enabled?'on':''}" data-action="toggle-memory" data-id="${k.id}" role="switch" aria-checked="${k.enabled}" aria-label="启用这条资料"></button></div><p>${esc(k.content)}</p><div class="knowledge-bottom"><span>${!k.enabled?'已停用':{background:'仅作理解背景',public:'允许写进海报',off:'不用于生成'}[k.scope]}</span><span><button data-action="edit-memory" data-id="${k.id}">编辑</button><button data-action="delete-memory" data-id="${k.id}">删除</button></span></div></div>`).join(''):`<div class="empty">${icon('leaf')}<h3>${a.knowledge.length?'这里还没有资料':'从一件小事，开始认识你'}</h3><p>可以写下喜欢的事、希望被怎样回应，<br>也可以在生成海报后，选择记住那次经历。</p></div>`}<div class="action-spacer"><button class="secondary" data-action="new-memory">＋ 添加一条资料</button></div><p class="subnote">资料只属于当前账号 · 入库不等于公开分享</p>${foot()}</div>`;}
function submitted(){
  recordFilter='all';
  showModal(`${modalHead('已收到，正在为你制作')}<p class="description">海报预计 5 分钟做好。可以先离开，稍后在「夸夸集」查看。</p><div class="buttons"><button class="secondary" data-action="continue-recording">继续记录</button><button class="primary" data-route="records">查看进度</button></div>`);
}
// Local prototype timing; production completion must come from the server.
const PRODUCTION_DELAY=5*60*1000;
function settleJobs(){
  let changed=false;
  for(const j of store.getAccount().jobs){
    if(j.status!=='working'||Date.now()-(j.startedAt??j.createdAt)<PRODUCTION_DELAY)continue;
    try{store.finishJob(j.id,demoCopy(j),j.attempt);changed=true;}
    catch(e){if(e.message.includes('资料已')){store.failJob(j.id,j.attempt);changed=true;}else toast(e.message);}
  }
  return changed;
}
let lastCheckinDay=store.checkinSummary().today;
function refreshJobs(){
  if(!signedIn())return;
  const day=store.checkinSummary().today,dayChanged=day!==lastCheckinDay;lastCheckinDay=day;
  if(settleJobs()||dayChanged){
    if(/^(home|records|profile|job)(\/|$)/.test(location.hash.slice(1)))render();
    else toast('制作状态已更新，可在「夸夸集」查看');
  }
}
async function openPosterPreview(j){
  showModal(`<div class="modal-head poster-preview-close"><button class="modal-close" data-action="close" aria-label="关闭">×</button></div><div class="poster-preview-image" aria-live="polite"><p class="description">正在加载海报…</p></div><div class="buttons"><button class="secondary" data-action="preview-download" disabled>${icon('download')}下载图片</button><button class="primary" data-action="preview-share" disabled>${icon('share')}分享</button></div><p class="preview-share-hint" role="status" hidden></p>`,'poster-preview-modal');
  const epoch=previewEpoch;
  try{
    const canvas=await renderPoster({photos:j.photos.map(photoSrc),title:j.title,body:j.body,date:date(j.createdAt),praises:j.praises});
    const blob=await canvasToBlob(canvas);
    if(epoch!==previewEpoch||!modal.open)return;
    previewPoster={id:j.id,canvas,file:new File([blob],`夸一夸-${date(j.createdAt)}.png`,{type:'image/png'})};
    const img=new Image();img.alt='已完成的夸夸海报';img.src=canvas.toDataURL('image/png');
    $('.poster-preview-image').replaceChildren(img);
    modal.querySelectorAll('.buttons button').forEach(b=>b.disabled=false);
  }catch(e){if(epoch===previewEpoch&&modal.open){$('.poster-preview-image').innerHTML='<p class="description">图片暂时无法加载，请关闭后重试。</p>';toast(e.message);}}
}
function records(){const all=store.getAccount().jobs.slice().reverse(),jobs=all.filter(j=>recordFilter==='all'||j.status===recordFilter);return `<div class="page records-page"><div class="nav">${capsule}</div><section class="records-hero" aria-label="夸夸集"><div class="records-hero-content"><h1>夸夸集</h1><p>收藏生活里被看见的美好</p></div></section>${checkinCard()}<div class="filter-row record-filter">${[['all','全部'],['working','制作中'],['done','已完成'],['failed','生成失败']].map(([k,v])=>`<button class="${recordFilter===k?'active':''}" data-record-filter="${k}">${v}</button>`).join('')}</div>${jobs.length?jobs.map(j=>`<div class="record"><button class="record-photo" ${j.status==='done'?`data-poster-preview="${j.id}"`:''} ${j.status==='working'?'data-action="job-progress"':j.status==='done'?`data-action="preview-poster" data-id="${j.id}"`:`data-route="job/${j.id}"`} aria-label="${j.status==='working'?'查看制作状态':'查看海报'}">${photo(j.photos[0])}</button><button class="record-info" ${j.status==='working'?'data-action="job-progress"':j.status==='done'?`data-action="preview-poster" data-id="${j.id}"`:`data-route="job/${j.id}"`}><h3>${esc(j.title||j.text)}</h3><span class="date">${fullDate(j.createdAt)} 提交</span><span class="record-tags"><span class="state-pill ${j.status}">${homeIcon(j.status==='done'?'checkbox-circle-fill':j.status==='working'?'time-line':'error-warning-line')}${{working:'正在制作',done:'已完成',failed:'生成失败'}[j.status]}</span><span class="state-pill scene">${category(j.category).name}</span></span>${j.status==='working'?'<span class="record-estimate">预计约 5 分钟，可先离开</span>':''}</button>${j.status!=='working'?`<button class="record-more" data-action="record-more" data-id="${j.id}" aria-label="更多操作">${homeIcon('more-line')}</button>`:''}</div>`).join(''):`<div class="empty">${icon('image')}<h3>让今天，成为第一张</h3><p>选一张照片，说说发生了什么。<br>普通的一天，也值得留下。</p><button class="secondary" data-route="home">去记录这一刻</button></div>`}${foot()}</div>`;}
function jobPage(id){const j=store.getAccount().jobs.find(x=>x.id===id);if(!j)return `<div class="page">${nav('夸夸集','records')}<div class="empty"><h3>这份记录暂时找不到</h3><p>它可能已删除，或不属于当前账号。</p><button class="secondary" data-route="records">返回记录</button></div></div>`;if(j.status==='done')return `<div class="page result-page">${nav('做好啦','records')}<div class="poster" id="poster-host"><p class="subnote">正在排版海报…</p></div><div class="result-toolbar"><button class="secondary" data-action="download" data-id="${j.id}">${icon('download')}保存图片</button><button class="primary" data-action="share" data-id="${j.id}">${icon('share')}分享</button></div><div class="memory-nudge">${icon('leaf')}<div><strong>这一刻，也值得被记住</strong><p>由你确认后，再加入个人资料</p></div><button data-action="remember" data-id="${j.id}">记住它 ↗</button></div><div class="result-other"><button data-action="reuse" data-id="${j.id}">修改后再做一张</button><button data-action="feedback">这次夸得怎么样？</button></div>${foot()}</div>`;
return `<div class="page">${nav('这次还没做好','records')}<div class="working-photo">${photo(j.photos[0])}</div><h1 class="working-title">别着急，你的记录还在。</h1><p class="working-desc">这次生成失败，次数已释放。<br>照片和原话都已保留，可以重新试试。</p><div class="quote-input">${esc(j.text)}</div><button class="primary" data-action="retry" data-id="${j.id}">重新制作</button><p class="subnote">${category(j.category).name} · ${j.photos.length} 张照片 · 重试不会重复计次</p>${foot()}</div>`;}

function plan(){
  const n=store.allowance(), account=store.getAccount(), p=account.plan;
  const active=Boolean(p&&p.expiresAt>Date.now()&&p.remaining>0);
  const exhausted=Boolean(p&&p.expiresAt>Date.now()&&p.remaining<=0);
  const expired=Boolean(p&&p.expiresAt<=Date.now());
  const used=active?'使用中':exhausted?'次数已用完':expired?'已到期':'未开通';
  const count=p?n.plan:30;
  const period=p&&p.expiresAt?`${date(p.expiresAt)} 到期 · 包含 30 次`:'开通后 30 天有效 · 手动续购';
  const cta=active?'当前套餐可继续使用':p?'再次开通包月套餐':'开通包月套餐';
  const canBuy=!active;
  const benefits=[
    ['image-2-line','多图上传','留住瞬间'],
    ['sparkling-2-line','场景夸夸','贴近生活'],
    ['landscape-line','横版海报','一键分享'],
    ['download-2-line','保存分享','随时回看'],
    ['calendar-check-line','美好打卡','连续记录']
  ];
  return `<div class="page plan-page">
    ${nav('套餐','profile')}
    <div class="plan-hero"><h1>给每一天，<br>多一点肯定。</h1></div>
    <section class="plan-card" aria-label="包月套餐">
      <div class="plan-label"><span>夸一夸 · 包月套餐</span><span class="badge">${used}</span></div>
      <p class="plan-card-caption">让美好记录，成为一种习惯</p><div class="plan-number">${count}<span>${p?'次剩余':'次'} / 30 天</span></div>
      <div class="plan-period">${period}</div>
      <div class="plan-benefits">${benefits.map(([name,title,desc])=>`<div class="plan-benefit"><span class="icon-wrap">${homeIcon(name)}</span><b>${title}</b></div>`).join('')}</div>
    </section>
    <div class="plan-price"><span>套餐价格</span><strong>价格待公布 ${homeIcon('arrow-right-s-line')}</strong></div>
    <button class="primary" data-action="purchase" ${canBuy?'':'disabled'}>${cta}</button>
    <p class="subnote">30 天有效 · 不自动续费</p>
    
    <img class="plan-footer" src="/prototype/assets/plan-reference-footer.png" alt="发现美好 记录美好">
    ${foot()}
  </div>`;
}
function ledger(){const a=store.getAccount(),groups=new Map();for(const item of a.ledger.slice().sort((a,b)=>b.date-a.date)){const day=date(item.date);if(!groups.has(day))groups.set(day,[]);groups.get(day).push(item);}return `<div class="page ledger-page">${nav('使用记录','profile')}${groups.size?[...groups].map(([day,items])=>`<section class="ledger-day"><h3>${day}</h3>${items.map(x=>`<div class="ledger-row"><time class="ledger-time" datetime="${new Date(x.date).toISOString()}">${new Date(x.date).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false})}</time><strong>${x.type==='reserve'?'−':x.type==='complete'?'': '+'}${x.count} 次</strong></div>`).join('')}</section>`).join(''):'<div class="empty"><p>还没有次数变化记录。</p></div>'}${foot()}</div>`;}

function guide(){const s=store.getState();return `<div class="page">${nav('使用帮助','profile')}<h1 class="page-heading">把日常，<br>留成一份温暖。</h1><p class="lead">从一张照片、一句话开始，<br>记住每一个值得被看见的瞬间。</p><div class="section-title">怎样制作海报？</div><p class="lead">选择适合这次记录的分类，上传 1–6 张照片，再写下发生的事。提交后可在「夸夸集」查看制作进度和成果。</p><div class="section-title">怎样分享？</div><p class="lead">打开海报，选择「保存图片」。保存后，可以把海报发给朋友，或分享自己的生活。</p><div class="section-title">关于我，会记住什么？</div><p class="lead">只记住你确认保存的经历与偏好。可以分开记录自己与家人的事情，并随时修改、停用或删除资料。</p><div class="section-title">次数怎么计算？</div><p class="lead">成功生成一张海报计 1 次。制作失败释放次数，保存与分享不扣次。包月套餐有效期 30 天，不自动续费。</p><div class="section-title">切换账号</div><div class="account-switch">${Object.entries(s.accounts).map(([id,a])=>`<button data-account="${id}" class="${s.activeAccount===id?'active':''}">${esc(accountName(a.name))}</button>`).join('')}</div><p class="subnote" style="text-align:left">每个账号分别管理自己的资料、记录与次数。</p><div class="action-spacer"><button class="secondary" data-route="home">记录这一刻</button></div></div>`;}
async function render(){const epoch=++renderEpoch,route=location.hash.slice(1)||'home';if(!signedIn()&&!['home','guide'].includes(route)){posterCanvas=null;app.innerHTML=loginLanding();mountTabs(route);document.title='夸一夸 · 微信登录';return;}if(signedIn())settleJobs();if(route.startsWith('job/')&&store.getAccount().jobs.find(j=>j.id===route.slice(4))?.status==='working'){recordFilter='all';location.replace('#records');return;}posterCanvas=null;const [page,id]=route.split('/');app.innerHTML=page==='home'?home():page==='profile'?profile():page==='knowledge'?knowledge():page==='records'?records():page==='plan'?plan():page==='ledger'?ledger():page==='job'?jobPage(id):guide();mountTabs(page);document.querySelectorAll('.review-nav [data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===page));document.title=`夸一夸 · ${{home:'记录这一刻',profile:'我的',knowledge:'关于我',records:'夸夸集',plan:'包月套餐',job:'我的海报'}[page]||'使用帮助'}`;
  if(page==='job'){const j=store.getAccount().jobs.find(x=>x.id===id);if(j?.status==='done'){try{const canvas=await renderPoster({photos:j.photos.map(photoSrc),title:j.title,body:j.body,date:date(j.createdAt),praises:j.praises});if(epoch!==renderEpoch)return;posterCanvas=canvas;$('#poster-host').replaceChildren(canvas);}catch(e){if(epoch===renderEpoch){$('#poster-host').innerHTML='<p class="subnote">海报暂时无法显示，请重新打开记录。</p>';toast(e.message);}}}}
  if(page==='records'||page==='home')for(const host of app.querySelectorAll('[data-poster-preview]')){
    const j=store.getAccount().jobs.find(x=>x.id===host.dataset.posterPreview);
    try{const canvas=await renderPoster({photos:j.photos.map(photoSrc),title:j.title,body:j.body,date:date(j.createdAt),praises:j.praises});if(epoch!==renderEpoch)return;host.replaceChildren(canvas);}catch{ /* Keep the original photo if the preview cannot load. */ }
  }
}

function askConfirm(title,description,action,label='确认'){showModal(`${modalHead(title)}<p class="description">${description}</p><div class="buttons"><button class="secondary" data-action="close">取消</button><button class="primary" id="confirm-action">${label}</button></div>`);$('#confirm-action').onclick=()=>{try{action();modal.close();render();}catch(e){toast(e.message);}};}
function openMemory(item={},sourceJob=null){const a=store.getAccount();showModal(`${modalHead(item.id?'编辑这条资料':sourceJob?'记住这一刻':'添加一条资料')}<p class="description">${sourceJob?'整理自你写下的原话。确认属于谁、记住什么，再保存。':'只记住你愿意留下的事，以后也可以随时修改。'}</p><form id="memory-form"><label for="subject">这是谁的事？</label><select id="subject">${a.subjects.map(s=>`<option value="${s.id}" ${s.id===(item.subjectId||'self')?'selected':''}>${esc(s.name)}</option>`).join('')}</select><label for="memory-type">资料类型</label><select id="memory-type"><option value="experience" ${item.type!=='preference'?'selected':''}>一段经历</option><option value="preference" ${item.type==='preference'?'selected':''}>兴趣或表达偏好</option></select><label for="memory-content">想记住什么？</label><textarea id="memory-content" maxlength="300" required placeholder="例如：我喜欢自然一点的表达，不需要夸张的称呼。">${esc(item.content||sourceJob?.text||'')}</textarea><label for="memory-scope">以后可以怎么用？</label><select id="memory-scope"><option value="background" ${!item.scope||item.scope==='background'?'selected':''}>仅帮助理解，不主动写出具体事实</option><option value="public" ${item.scope==='public'?'selected':''}>允许引用到海报文案</option><option value="off" ${item.scope==='off'?'selected':''}>先记下来，暂不用于生成</option></select><p class="fineprint">AI 夸赞不会自动成为个人事实。保存资料不会消耗制作次数。</p><div class="buttons"><button class="secondary" type="button" data-action="close">先不保存</button><button class="primary" type="submit">确认保存</button></div></form>`);$('#memory-form').onsubmit=e=>{e.preventDefault();const value={...item,subjectId:$('#subject').value,type:$('#memory-type').value,content:$('#memory-content').value,scope:$('#memory-scope').value};if(attempt(()=>store.saveKnowledge(value))){modal.close();toast('已经记住，由你随时管理');render();}};}
function demoCopy(j){const c=category(j.category);let result;if(j.text===c.example)result={title:c.title,body:c.body};else if(/累|难过|疲惫|委屈|失落|压力/.test(j.text))result={title:'此刻的感受，\n也值得被认真对待。',body:`你写下的“${j.text.slice(0,48)}”，不必急着把它变成励志故事。给自己一点空间，就很好。`};else result={title:{mama:'陪伴里的用心，\n也值得被看见。',work:'走过的每一小步，\n都值得给自己肯定。',student:'一点一点地尝试，\n就是你自己的成长。',elder:'喜欢的生活，\n由你慢慢写出来。',daily:'普通的一刻，\n也有属于你的光。'}[j.category],body:`“${j.text.slice(0,70)}”——愿意认真记录这一刻的你，已经给日常留下一份特别的心意。`};const a=store.getAccount();const short=a.knowledge.filter(k=>j.knowledgeIds.includes(k.id)&&k.type==='preference'&&k.enabled&&k.scope!=='off').some(k=>/简短|短一点|少一点/.test(k.content));if(short)result.body=result.body.split(/[。！]/)[0]+'。';
const photoPraise={
  mama:['陪伴里的用心，值得被温柔地看见。','把平凡的日子认真记下，也是珍贵的心意。','照顾日常的你，也值得被好好肯定。','留住这一刻，别忘了也夸一夸自己。','那些细小的付出，都有自己的分量。','有你认真记录的日常，就有值得珍惜的温暖。'],
  work:['认真对待日常的你，值得一份肯定。','每一份用心，都有自己的分量。','愿你也看见，自己的努力与坚持。','把这个瞬间留给自己，好好夸一夸。','愿意记录，就是在珍惜走过的每一步。','忙碌之外，也给自己一点温柔。'],
  student:['一点一点地探索，就是自己的成长。','认真记录的这个瞬间，值得被看见。','每一次用心，都值得为自己鼓掌。','用自己的节奏走，也很好。','珍惜每个小小瞬间，是很可贵的认真。','愿你看见，每一步都有意义。'],
  elder:['认真记录生活的你，自有一份动人。','把喜欢的瞬间留下，也是一种快乐。','平常的日子，同样值得好好珍惜。','属于自己的生活节奏，就很好。','这一刻的心意，值得被好好记住。','愿这些日常，陪你留下更多温暖。'],
  daily:['认真留下的这一刻，值得被温柔以待。','普通的日子，也有让你停下记录的美好。','愿意留意生活，是一份可贵的认真。','把这个小瞬间，送给用心生活的自己。','日常里的细碎片段，也有自己的光。','值得记住的不只这一刻，还有认真记录的你。']
};
result.praises=j.photos.map((_,i)=>photoPraise[j.category][i]);return result;}
async function uploadFiles(files){const a=store.getAccount(),original=store.getState().activeAccount;const keep=uploadMode==='replace'?a.draft.photos.slice(1):a.draft.photos.slice();if(files.length+keep.length>6){toast('最多添加 6 张照片，请减少选择');return;}if(!files.length)return;try{toast('正在读取照片…');const loaded=[];for(const f of files){if(!['image/jpeg','image/png','image/webp'].includes(f.type))throw Error('请选择 JPG、PNG 或 WebP 照片');if(f.size>20*1024*1024)throw Error('单张照片请小于 20 MB');const bitmap=await createImageBitmap(f);const scale=Math.min(1,1000/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fffdf6';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();loaded.push(canvas.toDataURL('image/jpeg',.76));}if(store.getState().activeAccount!==original)throw Error('账号已切换，请在当前账号重新选择照片');store.setDraft({photos:uploadMode==='replace'?[...loaded,...keep]:[...keep,...loaded]});render();toast('照片已添加');}catch(e){toast(e.message);}finally{$('#upload').value='';$('#camera').value='';}}

document.addEventListener('input',e=>{if(e.target.id==='moment'){const value=e.target.value;attempt(()=>store.setDraft({text:value}));const count=$('.count');if(count)count.textContent=`${value.length}/300`;}});
$('#upload').addEventListener('change',e=>uploadFiles([...e.target.files]));
$('#camera').addEventListener('change',e=>uploadFiles([...e.target.files]));
document.addEventListener('click',async e=>{
  const b=e.target.closest('button,[data-route]');if(!b||b.disabled)return;
  if(b.dataset.route){go(b.dataset.route);return;}
  if(b.dataset.scene){if(attempt(()=>store.setDraft({category:b.dataset.scene}))){modal.close();render();toast('已设置为'+category(b.dataset.scene).name+'，下次生成会沿用');}return;}
  if(b.dataset.recordFilter){recordFilter=b.dataset.recordFilter;render();return;}
  if(b.dataset.knowledgeFilter){knowledgeFilter=b.dataset.knowledgeFilter;render();return;}
  if(b.dataset.account){cancelLogin();if(attempt(()=>store.switchAccount(b.dataset.account))){render();toast('已切换，资料与记录相互独立');}return;}
  const action=b.dataset.action,id=b.dataset.id,j=id&&store.getAccount().jobs.find(x=>x.id===id);
  if(action==='choose-scene'){showModal(`${modalHead('夸赞场景')}<p class="description">选择更贴近你的场景，生成时会使用对应的夸赞方式。</p><div class="scene-options">${Object.entries(C).map(([id,c])=>`<button data-scene="${id}" aria-pressed="${store.getAccount().draft.category===id}">${homeIcon(categoryIcons[id])}<span>${c.name}</span>${store.getAccount().draft.category===id?homeIcon('check-line'):''}</button>`).join('')}</div>`,'scene-modal');return;}
  if(action==='login'){loginRequest={account:store.getState().activeAccount,after:()=>{},surface:app};await confirmLogin(b);return;}
  if(action==='confirm-login'){await confirmLogin(b);return;}
  if(action==='preview-poster'&&j?.status==='done'){openPosterPreview(j);return;}
  if(action==='preview-download'){
    const current=previewPoster;if(!current)return;
    try{await downloadCanvas(current.canvas,current.file.name);toast('图片已下载');}catch(e){toast('下载失败，请重试');}return;
  }
  if(action==='preview-share'){
    const current=previewPoster;if(!current)return;
    const hint=$('.preview-share-hint');
    if(navigator.share&&navigator.canShare?.({files:[current.file]})){
      try{await navigator.share({files:[current.file],title:'夸一夸 · 值得记住的这一刻'});}
      catch(e){if(e.name!=='AbortError'&&hint?.isConnected){hint.hidden=false;hint.textContent='暂时无法打开分享，可以先下载图片，再发给朋友。';}}
    }else{hint.hidden=false;hint.textContent='先下载图片，再发给朋友，分享这一刻的美好。';}
    return;
  }
  if(action==='close'){cancelLogin();modal.close();return;}
  if(action==='upload'||action==='replace-photo'){uploadMode=action==='replace-photo'?'replace':'add';showModal(`${modalHead('添加照片')}<div class="photo-source-options"><button data-action="choose-album">${homeIcon('image-line')}<span>从相册选择</span>${homeIcon('arrow-right-s-line')}</button><button data-action="take-photo">${homeIcon('camera-line')}<span>拍照</span>${homeIcon('arrow-right-s-line')}</button></div><button class="photo-source-cancel" data-action="close">取消</button>`,'photo-source-modal');return;}
  if(action==='choose-album'||action==='take-photo'){modal.close();const input=$(action==='take-photo'?'#camera':'#upload');input.value='';input.click();return;}
  if(action==='remove-photo'){const photos=store.getAccount().draft.photos;photos.splice(Number(b.dataset.index),1);if(attempt(()=>store.setDraft({photos})))render();return;}
  if(action==='draft-knowledge'){const a=store.getAccount();if(!a.knowledgeEnabled){toast('请先在「关于我」开启资料使用');return;}if(attempt(()=>store.setDraft({useKnowledge:!a.draft.useKnowledge})))render();return;}
  if(action==='knowledge-global'){if(attempt(()=>store.setKnowledgeEnabled(!store.getAccount().knowledgeEnabled)))render();return;}
  if(action==='generate'){submitGeneration();return;}
  if(action==='continue-recording'){if(attempt(()=>store.setDraft({text:'',photos:[]})))go('home');return;}
  if(action==='job-progress'){toast('正在制作，预计约 5 分钟。做好后可在这里查看。');return;}
  if(action==='retry'&&j){const x=attempt(()=>store.retryJob(j.id));if(x){go('records');setTimeout(submitted,0);}return;}
  if(action==='reuse'&&j){if(attempt(()=>store.setDraft({category:j.category,text:j.text,photos:j.photos,useKnowledge:j.useKnowledge})))go('home');return;}
  if(action==='remember'&&j){openMemory({},j);return;}
  if(action==='new-memory'){openMemory();return;}
  if(action==='edit-memory'){openMemory(store.getAccount().knowledge.find(k=>k.id===id));return;}
  if(action==='toggle-memory'){if(attempt(()=>store.toggleKnowledge(id)))render();return;}
  if(action==='delete-memory'){askConfirm('删除这条资料？','删除后不会用于新的夸夸。已经保存或分享的海报不会因此撤回。',()=>store.deleteKnowledge(id),'删除资料');return;}
  if(action==='record-more'&&j&&j.status!=='working'){showModal(`${modalHead('更多操作')}<div class="record-menu">${j.status==='done'?`<button data-action="preview-poster" data-id="${j.id}">${homeIcon('image-line')}查看海报</button>`:''}<button class="danger" data-action="delete-job" data-id="${j.id}">${homeIcon('delete-bin-line')}删除记录</button><button data-action="close">取消</button></div>`);return;}
  if(action==='delete-job'){askConfirm('删除这份记录？','删除后不能从记录中找回。已经消耗的制作次数不会退回。',()=>store.deleteJob(id),'删除记录');return;}
  if(action==='subject'){showModal(`${modalHead('添加一位家人')}<p class="description">用你熟悉的称呼，分清每一段经历属于谁。</p><form id="subject-form"><label for="subject-name">称呼</label><input id="subject-name" maxlength="30" required placeholder="例如：女儿、爸爸、小满"><div class="buttons"><button class="secondary" type="button" data-action="close">取消</button><button class="primary">添加</button></div></form>`);$('#subject-form').onsubmit=ev=>{ev.preventDefault();if(attempt(()=>store.addSubject($('#subject-name').value))){modal.close();render();toast('家人已添加');}};return;}
  if(action==='purchase'){showModal(`${modalHead('开通包月套餐')}<p class="description">你将获得 30 次海报制作，有效期 30 天。次数耗尽或到期后可主动续购，不自动续费。</p><div class="kb-summary"><div><strong>30 次海报制作</strong><p>有效期 30 天 · 价格待公布</p></div><span class="badge">30 次</span></div><div class="buttons"><button class="secondary" data-action="close">取消</button><button class="primary" data-action="confirm-purchase">确认开通</button></div>`);return;}
  if(action==='confirm-purchase'){if(attempt(()=>store.purchasePlan())){modal.close();render();toast('套餐已开通');}return;}
  if(action==='download'){if(!posterCanvas){toast('海报正在准备，请稍等');return;}try{await downloadCanvas(posterCanvas,`夸一夸-${date(j.createdAt)}.png`);toast('PNG 已生成，请在浏览器下载中查看');}catch(err){toast('保存失败：'+err.message);}return;}
  if(action==='share'){if(!posterCanvas){toast('海报正在准备，请稍等');return;}showModal(`${modalHead('分享这一刻')}<p class="description">先保存海报，再发给你想分享的人。</p><img class="download-preview" src="${posterCanvas.toDataURL('image/png')}" alt="分享海报预览"><button class="primary" data-action="download" data-id="${j.id}">${icon('download')}保存海报图片</button>`);return;}
  if(action==='feedback'){showModal(`${modalHead('这次夸得怎么样？')}<p class="description">你的感受，值得被认真对待。</p><div class="feedback-choices">${['说到心里了','有一点空泛','不符合事实','不喜欢这种语气'].map(t=>`<button data-feedback="${t}">${t}</button>`).join('')}</div>`);return;}
  if(b.dataset.feedback){const saved=attempt(()=>{const key='kua-yikua:feedback:'+store.getState().activeAccount;const items=JSON.parse(localStorage.getItem(key)||'[]');items.push({text:b.dataset.feedback,date:Date.now()});localStorage.setItem(key,JSON.stringify(items));return true;});if(saved){modal.close();toast('感谢你的反馈');}}
});
modal.addEventListener('cancel',cancelLogin);
modal.addEventListener('close',()=>{previewEpoch++;previewPoster=null;});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){cancelLogin();modal.close();}}});
setInterval(refreshJobs,5000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshJobs();});
window.addEventListener('hashchange',()=>{cancelLogin();modal.close();render();app.scrollTo({top:0,behavior:'instant'});window.scrollTo({top:0,behavior:'instant'});});
try{samples=await sampleAssets();render();}catch(e){app.innerHTML=`<div class="page">${nav('暂时无法打开')}<p class="lead">${esc(e.message)}</p><p>暂时无法加载，请稍后刷新重试。</p></div>`;}
