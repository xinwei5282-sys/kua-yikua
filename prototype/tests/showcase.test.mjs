import test from 'node:test';
import assert from 'node:assert/strict';
import {showcaseMarkup,showcaseDocument} from '../community-showcase.js';
const item={groupId:'g',postId:'p',group:'家',author:'小叶',title:'好时光',caption:'<script>bad</script>',likes:['小光'],comments:[{author:'小光',body:'用心生活'}],image:'data:image/jpeg;base64,AA'};
test('showcase snapshot escapes content and embeds portable images with corresponding reactions',()=>{const html=showcaseDocument([item],'家庭');assert.ok(html.includes('data:image/jpeg;base64,AA'));assert.ok(html.includes('&lt;script&gt;bad&lt;/script&gt;'));assert.ok(html.includes('小光 觉得很赞'));assert.ok(html.includes('用心生活'));assert.ok(html.includes('requestFullscreen'));assert.ok(!html.includes('localStorage'));assert.ok(!html.includes('http://127.0.0.1'));});
test('banner has one visible slide, controls and an empty state',()=>{assert.ok(showcaseMarkup([]).includes('发布第一张海报'));const html=showcaseMarkup([item,item],{compact:true});assert.equal((html.match(/class="showcase-slide" hidden/g)||[]).length,1);assert.ok(html.includes('data-slide="pause"'));assert.ok(html.includes('1 / 2'));});
