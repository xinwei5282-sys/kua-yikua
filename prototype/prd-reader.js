import {marked} from './vendor/marked/marked.esm.js';

const source='/docs/产品方案-v1.0.md';
const toggle=document.querySelector('#prd-toggle');
const panel=document.querySelector('#prd-panel');
const content=document.querySelector('#prd-content');
const chapters=document.querySelector('#prd-chapters');
let pending=false;

function safeMarkup(markdown){
  const template=document.createElement('template');
  template.innerHTML=marked.parse(markdown);
  const allowed=new Set('H1 H2 H3 H4 H5 H6 P STRONG EM DEL CODE PRE UL OL LI TABLE THEAD TBODY TR TH TD BLOCKQUOTE HR BR A IMG'.split(' '));
  for(const node of template.content.querySelectorAll('*')){
    if(!allowed.has(node.tagName)){node.replaceWith(document.createTextNode(node.textContent));continue;}
    const href=node.getAttribute('href'),src=node.getAttribute('src'),alt=node.getAttribute('alt');
    for(const attribute of [...node.attributes])node.removeAttribute(attribute.name);
    if(node.tagName==='A'&&href){
      const url=new URL(href,new URL(source,location.origin));
      if(['https:','http:'].includes(url.protocol)){node.href=url.href;node.target='_blank';node.rel='noopener noreferrer';}
    }
    if(node.tagName==='IMG'&&src){
      const url=new URL(src,new URL(source,location.origin));
      if(['https:','http:'].includes(url.protocol)){node.src=url.href;node.alt=alt||'';node.loading='lazy';}
    }
  }
  return template.content;
}

async function load(){
  if(pending)return;
  pending=true;content.setAttribute('aria-busy','true');
  document.querySelector('#prd-refresh').disabled=true;
  chapters.disabled=true;
  content.textContent='正在加载产品需求文档…';
  try{
    const response=await fetch(source,{cache:'no-store'});
    if(!response.ok)throw Error('加载失败');
    content.replaceChildren(safeMarkup(await response.text()));
    chapters.replaceChildren(new Option('跳转到章节',''));
    content.querySelectorAll('h2,h3').forEach((heading,i)=>{
      heading.id=`prd-section-${i}`;
      chapters.add(new Option(`${heading.tagName==='H3'?'　':''}${heading.textContent}`,heading.id));
    });
    content.querySelectorAll('table').forEach(table=>{
      const wrapper=document.createElement('div');wrapper.className='prd-table';
      table.replaceWith(wrapper);wrapper.append(table);
    });
    chapters.disabled=false;content.scrollTop=0;
  }catch{
    content.textContent='暂时无法读取 PRD，请点击“刷新”重试。';
  }finally{
    pending=false;content.setAttribute('aria-busy','false');
    document.querySelector('#prd-refresh').disabled=false;
  }
}

function setOpen(open,focus=false){
  panel.hidden=!open;document.body.classList.toggle('prd-open',open);
  toggle.setAttribute('aria-expanded',String(open));
  toggle.textContent=open?'收起 PRD':'查看 PRD';
  const url=new URL(location.href);if(open)url.searchParams.set('prd','1');else url.searchParams.delete('prd');
  history.replaceState(null,'',url);
  if(open){load();if(focus)document.querySelector('#prd-heading').focus({preventScroll:true});}
  else if(focus)toggle.focus({preventScroll:true});
}
toggle.addEventListener('click',()=>setOpen(panel.hidden,true));
document.querySelector('#prd-close').addEventListener('click',()=>setOpen(false,true));
document.querySelector('#prd-refresh').addEventListener('click',load);
chapters.addEventListener('change',()=>{
  const heading=document.getElementById(chapters.value);
  if(heading)content.scrollTop+=heading.getBoundingClientRect().top-content.getBoundingClientRect().top-18;
});
setOpen(new URL(location.href).searchParams.get('prd')==='1');
