import test from 'node:test';
import assert from 'node:assert/strict';
import {trendBuckets} from '../dashboard.js';
test('daily zero values remain zero and fixed periods include empty days',()=>{const bars=trendBuckets({'2026-10-20':2},'2026-10-18','2026-10-20');assert.deepEqual(bars.map(x=>x.value),[0,0,2]);assert.equal(bars.length,3);});
test('long ranges aggregate without losing events or inventing activity',()=>{const bars=trendBuckets({'2026-01-01':2,'2026-06-01':4,'2026-12-31':3},'2026-01-01','2026-12-31');assert.ok(bars.length<=14);assert.equal(bars.reduce((n,b)=>n+b.value,0),9);assert.equal(bars.at(-1).to,'2026-12-31');assert.deepEqual(trendBuckets({}),[]);});
