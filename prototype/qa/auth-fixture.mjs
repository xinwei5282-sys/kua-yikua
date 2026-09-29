import {createStore} from '../model.js';
// Existing business-flow tests start with authenticated local review accounts.
// The unauthenticated journey is separately covered by wechat-login.mjs.
export async function authenticatedFixture(page){
 await demoDraftFixture(page);
 await page.addInitScript(()=>{
  if(!localStorage.getItem('kua-yikua:login:v1'))
   localStorage.setItem('kua-yikua:login:v1',JSON.stringify({a:true,b:true}));
 });
}

// Historical flow tests intentionally use a sample; production starts empty.
export async function demoDraftFixture(page){
 const db=new Map(),storage={getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,v)};
 const store=createStore(storage);store.setDraft({category:'daily',text:'第一次做面包，样子一般，但全家都说很好吃。',photos:['sample:4']});
 await page.addInitScript(raw=>{if(!localStorage.getItem('kua-yikua:model:v1'))localStorage.setItem('kua-yikua:model:v1',raw);},db.get('kua-yikua:model:v1'));
}
