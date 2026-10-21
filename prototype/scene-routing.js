export const SCENE_LABELS={mama:'孩子成长',work:'工作日常',student:'学习探索',elder:'兴趣生活',daily:'日常美好'};
export const defaultGroupScenes=type=>type==='family'?['mama']:type==='work'?['work']:['daily'];
export const groupScenes=g=>Array.isArray(g.scenes)?g.scenes:defaultGroupScenes(g.type);
export function matchedGroups(draft,groups){return groups.filter(g=>groupScenes(g).includes(draft.category||'mama'));}
