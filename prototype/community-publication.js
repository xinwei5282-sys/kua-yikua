import {matchedGroups} from './scene-routing.js';
export const publishTargets=(draft,groups)=>draft.publishToCommunity===false?[]:matchedGroups(draft,groups).map(g=>g.id);
// Publishing is idempotent across two local stores, including a retry after a failed acknowledgement.
export function publishReadyJobs(store,community){
 let changed=false;
 const actor=store.getState().activeAccount;
 for(const job of store.getAccount().jobs){
  if(!job.autoPublish||job.status!=='done'||job.publication?.state==='complete')continue;
  try{
   const results=community.autoPublish({...job,author:actor});
   store.markPublication(job.id,{state:'complete',results});changed=true;
  }catch(error){
   const message=error.message||'社群暂时无法保存';
   if(job.publication?.message!==message){try{store.markPublication(job.id,{state:'pending',message});changed=true;}catch{/* Keep the unacknowledged job eligible for retry. */}}
  }
 }
 return changed;
}
