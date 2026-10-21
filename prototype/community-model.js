import {defaultGroupScenes,groupScenes,SCENE_LABELS} from './scene-routing.js';
const KEY='kua-yikua:communities:v1';
const copy=x=>JSON.parse(JSON.stringify(x));
const fail=m=>{throw Error(m);};
const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const text=(s,max)=>String(s??'').trim().slice(0,max);
export const dayOf=t=>new Date(t+8*3600000).toISOString().slice(0,10);
export function createCommunityStore(storage,actor,now=()=>Date.now()){
 let state;try{state=JSON.parse(storage.getItem(KEY)||'null')||{version:1,groups:[]};if(state.version!==1||!Array.isArray(state.groups))fail('社群数据格式无效');}catch(e){fail('无法读取社群：'+e.message);}
 const group=(s,id)=>s.groups.find(g=>g.id===id&&!g.closed)||fail('群组不存在或已解散');
 const role=(g,id=actor())=>g.members.find(m=>m.id===id)?.role;
 const member=g=>role(g)||fail('请先申请加入群组');
 const manage=g=>['owner','admin'].includes(member(g))||fail('仅创建者和管理员可操作');
 const change=fn=>{const next=copy(state),result=fn(next);try{storage.setItem(KEY,JSON.stringify(next));}catch{fail('保存失败，请释放浏览器空间后重试');}state=next;return copy(result??true);};
 const post=(g,id)=>g.posts.find(p=>p.id===id&&!p.removed)||fail('动态已撤回');
 const validateInfo=input=>{const name=text(input.name,30),description=text(input.description,150),type=input.type;if(!name)fail('请填写群名称');if(!['family','work','other'].includes(type))fail('请选择群类型');const scenes=input.scenes??defaultGroupScenes(type);if(!Array.isArray(scenes)||scenes.some(x=>!Object.hasOwn(SCENE_LABELS,x)))fail('请选择有效的关联场景');return {name,description,type,scenes:[...new Set(scenes)],cover:['sun','leaf','home','coffee'].includes(input.cover)?input.cover:'sun'};};
 const removePosts=(g,author)=>g.posts.filter(p=>p.author===author).forEach(p=>{p.removed=true;});
 const stats=(g,target,from,to)=>{
  const inRange=t=>dayOf(t)>=from&&dayOf(t)<=to;
  const all=g.posts.filter(p=>!p.removed),posts=all.filter(p=>(!target||p.author===target)&&inRange(p.createdAt));
  const received=all.filter(p=>!target||p.author===target);
  const likes=received.flatMap(p=>p.likes).filter(x=>inRange(x.at));
  const comments=received.flatMap(p=>p.comments.filter(c=>!c.removed)).filter(c=>inRange(c.at));
  const dates=[...new Set(posts.map(p=>dayOf(p.createdAt)))];
  const members=[...new Set(posts.map(p=>p.author))];
  const likesTrend={},commentsTrend={};for(const event of likes){const d=dayOf(event.at);likesTrend[d]=(likesTrend[d]||0)+1;}for(const event of comments){const d=dayOf(event.at);commentsTrend[d]=(commentsTrend[d]||0)+1;}
  const participatingMembers=members.filter(id=>g.members.some(m=>m.id===id)).length;
  const trend={};for(const p of posts){const d=dayOf(p.createdAt);trend[d]=(trend[d]||0)+1;}
  return {members:g.members.length,authors:members.length,posts:posts.length,days:dates.length,likes:likes.length,comments:comments.length,participatingMembers,likesTrend,commentsTrend,lastPublished:all.filter(p=>!target||p.author===target).reduce((n,p)=>Math.max(n,p.createdAt),0),trend};
 };
 return {
  list:()=>copy(state.groups.filter(g=>!g.closed&&role(g)).map(g=>({id:g.id,name:g.name,type:g.type,description:g.description,cover:g.cover,scenes:groupScenes(g),role:role(g),members:g.members.length,posts:g.posts.filter(p=>!p.removed).length,pending:['owner','admin'].includes(role(g))?g.requests.filter(r=>r.status==='pending').length:0}))),
  get:id=>{const g=group(state,id);member(g);const x=copy(g);if(!['owner','admin'].includes(role(g)))x.requests=[];x.posts=x.posts.filter(p=>!p.removed);return x;},
  role:id=>role(group(state,id)),
  create:input=>change(s=>{const g={...validateInfo(input),id:uid(),owner:actor(),createdAt:now(),invite:uid(),members:[{id:actor(),role:'owner',joinedAt:now()}],requests:[],posts:[],closed:false};s.groups.push(g);return g.id;}),
  edit:(id,input)=>change(s=>{const g=group(s,id);manage(g);Object.assign(g,validateInfo(input));}),
  invitation:token=>{const g=state.groups.find(g=>!g.closed&&g.invite===token)||fail('邀请已失效');const request=g.requests.find(r=>r.user===actor());return copy({id:g.id,name:g.name,type:g.type,cover:g.cover,description:g.description,members:g.members.length,joined:!!role(g),status:request?.status||'none'});},
  invite:id=>{const g=group(state,id);manage(g);return g.invite;},
  apply:(token,message)=>change(s=>{const g=s.groups.find(g=>!g.closed&&g.invite===token)||fail('邀请已失效');if(role(g))fail('你已在群组中');if(g.requests.some(r=>r.user===actor()&&r.status==='pending'))fail('申请正在审核中');g.requests=g.requests.filter(r=>r.user!==actor());g.requests.push({user:actor(),message:text(message,100),at:now(),status:'pending'});}),
  review:(id,user,accept)=>change(s=>{const g=group(s,id);manage(g);const r=g.requests.find(r=>r.user===user&&r.status==='pending')||fail('申请已处理');r.status=accept?'approved':'rejected';r.reviewedBy=actor();r.reviewedAt=now();if(accept&&!role(g,user))g.members.push({id:user,role:'member',joinedAt:now()});}),
  setAdmin:(id,user,admin)=>change(s=>{const g=group(s,id);manage(g);const m=g.members.find(m=>m.id===user)||fail('成员不存在');if(m.role==='owner')fail('不能变更创建者身份');m.role=admin?'admin':'member';}),
  remove:(id,user)=>change(s=>{const g=group(s,id);manage(g);if(user===g.owner)fail('不能移除创建者');if(!role(g,user))fail('成员不存在');g.members=g.members.filter(m=>m.id!==user);}),
  transfer:(id,user)=>change(s=>{const g=group(s,id);if(g.owner!==actor())fail('只有创建者可转让群组');if(user===actor()||!role(g,user))fail('请选择其他群成员');g.members.find(m=>m.id===g.owner).role='admin';g.members.find(m=>m.id===user).role='owner';g.owner=user;}),
  leave:(id,withdraw)=>change(s=>{const g=group(s,id);member(g);if(g.owner===actor())fail('创建者需先转让或解散群组');if(withdraw)removePosts(g,actor());g.members=g.members.filter(m=>m.id!==actor());}),
  dissolve:id=>change(s=>{const g=group(s,id);if(g.owner!==actor())fail('只有创建者可解散群组');g.closed=true;}),
  share:(ids,job,caption='')=>change(s=>{if(!ids.length)fail('请选择群组');if(job?.status!=='done')fail('请选择已完成的海报');if(job.author!==actor())fail('只能分享自己的海报');let count=0;for(const id of new Set(ids)){const g=group(s,id);member(g);if(g.posts.some(p=>!p.removed&&p.author===actor()&&p.jobId===job.id))continue;g.posts.push({id:uid(),jobId:job.id,author:actor(),createdAt:now(),caption:text(caption,300),snapshot:{title:job.title||job.text,body:job.body||'',photos:copy(job.photos),praises:copy(job.praises||[]),orientation:job.orientation||'landscape',date:job.createdAt},likes:[],comments:[],removed:false});count++;}if(!count)fail('已分享到所选群组，无需重复分享');return count;}),
  autoPublish:job=>change(s=>{
   if(job?.status!=='done'||job.author!==actor()||!job.autoPublish||!Array.isArray(job.publishTargets))fail('自动发布任务无效');
   return [...new Set(job.publishTargets)].map(id=>{
    const g=s.groups.find(g=>g.id===id&&!g.closed);
    if(!g||!role(g)||!groupScenes(g).includes(job.category||'mama'))return {groupId:id,status:'skipped'};
    if(g.posts.some(p=>p.author===actor()&&p.jobId===job.id))return {groupId:id,status:'already'};
    g.posts.push({id:uid(),jobId:job.id,author:actor(),createdAt:now(),caption:text(job.text,300),snapshot:{title:job.title||job.text,body:job.body||'',photos:copy(job.photos),praises:copy(job.praises||[]),orientation:job.orientation||'landscape',date:job.createdAt},likes:[],comments:[],removed:false});
    return {groupId:id,status:'published'};
   });
  }),
  like:(id,pid)=>change(s=>{const g=group(s,id);member(g);const p=post(g,pid),i=p.likes.findIndex(l=>l.user===actor());if(i>=0)p.likes.splice(i,1);else p.likes.push({user:actor(),at:now()});}),
  comment:(id,pid,content,replyTo=null)=>change(s=>{const g=group(s,id);member(g);const p=post(g,pid),body=text(content,300);if(!body)fail('请填写评论');const reply=replyTo?p.comments.find(x=>x.id===replyTo&&!x.removed)||fail('这条评论已删除，请重新选择回复对象'):null;p.comments.push({id:uid(),user:actor(),body,at:now(),replyTo:reply?.id||null,replyUser:reply?.user||null,removed:false});}),
  deleteComment:(id,pid,cid)=>change(s=>{const g=group(s,id);member(g);const c=post(g,pid).comments.find(c=>c.id===cid&&!c.removed)||fail('评论已删除');if(c.user!==actor())manage(g);c.removed=true;}),
  withdraw:(id,pid)=>change(s=>{const g=group(s,id);member(g);const p=post(g,pid);if(p.author!==actor())manage(g);p.removed=true;}),
  withdrawJob:jobId=>change(s=>{for(const g of s.groups)for(const p of g.posts)if(p.author===actor()&&p.jobId===jobId)p.removed=true;}),
  sharedJob:jobId=>state.groups.some(g=>!g.closed&&g.posts.some(p=>!p.removed&&p.author===actor()&&p.jobId===jobId)),
  statistics:(id,{target=null,from='0000-01-01',to='9999-12-31'}={})=>{const g=group(state,id);member(g);if(!target||target!==actor())manage(g);if(from>to)fail('开始日期不能晚于结束日期');if(target&&!g.members.some(m=>m.id===target)&&!g.posts.some(p=>p.author===target))fail('成员不存在');return copy(stats(g,target,from,to));},
  seedDemo:()=>change(s=>{if(s.groups.some(g=>g.demo))fail('体验社群已存在');const t=now();for(const [name,type,cover,owner] of [['云朵一家','family','sun','a'],['向光工作室','work','leaf','b']]){const g={id:uid(),name,type,cover,owner,description:type==='family'?'把相伴的日常，留成一家人的美好。':'认真生活，也为彼此的每一步喝彩。',createdAt:t-7*86400000,invite:uid(),closed:false,demo:true,members:[{id:'a',role:owner==='a'?'owner':'member',joinedAt:t-7*86400000},{id:'b',role:owner==='b'?'owner':'member',joinedAt:t-7*86400000},{id:'demo-grandma',role:'admin',joinedAt:t-6*86400000}],requests:[],posts:[]};for(let i=0;i<3;i++)g.posts.push({id:uid(),jobId:'demo-'+i,author:i===1?'b':'a',createdAt:t-i*86400000,caption:['小小的勇敢，也值得大大的掌声。','今天的用心，被大家看见了。','平凡的一天，也有温柔的光。'][i],snapshot:{title:['每一步成长，都闪闪发光。','认真生活的你，值得被夸夸。','把喜欢的日常，好好收藏。'][i],body:'每个小小瞬间，都值得被看见。',photos:['sample:'+i],praises:[],orientation:'portrait',date:t-i*86400000},likes:i===0?[{user:'b',at:t}]:[],comments:i===0?[{id:uid(),user:'b',body:'一起收藏这份美好！',at:t,removed:false}]:[],removed:false});s.groups.push(g);}})
 };
}
