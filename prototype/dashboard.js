import {dayOf} from './community-model.js';
export function trendBuckets(trend,from,to,maxBars=14){
 const values=Object.keys(trend).sort();if(!from)from=values[0];if(!to)to=values.at(-1);if(!from||!to)return [];
 const start=Date.parse(from+'T00:00:00+08:00'),end=Date.parse(to+'T00:00:00+08:00');if(!Number.isFinite(start)||!Number.isFinite(end)||end<start)return [];
 const days=Math.round((end-start)/86400000)+1,step=Math.max(1,Math.ceil(days/maxBars)),out=[];
 for(let offset=0;offset<days;offset+=step){const first=dayOf(start+offset*86400000),last=dayOf(start+Math.min(days-1,offset+step-1)*86400000);let total=0;for(const [date,value] of Object.entries(trend))if(date>=first&&date<=last)total+=value;out.push({from:first,to:last,value:total});}return out;
}
