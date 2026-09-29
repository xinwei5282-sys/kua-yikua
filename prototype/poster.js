import {preparePhoto,fitPhoto} from './photo-processing.js';

/**
 * Poster export helpers for 夸一夸.
 *
 * This module intentionally only consumes already-resolved image URLs. It does
 * not fetch application data or make network requests on its own.
 */

const WIDTH = 1500;
const HEIGHT = 1000;
const COLORS = {
  paper: '#fffdf6',
  ink: '#263b31',
  muted: '#687069',
  gold: '#f7b83b',
  line: '#e9e4d8',
};
const SERIF = '"Songti SC", "STSong", "Noto Serif CJK SC", serif';
const SANS = '"PingFang SC", "Helvetica Neue", Arial, sans-serif';

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapText(ctx, value, maxWidth) {
  const text = String(value ?? '');
  const lines = [];
  for (const paragraph of text.split(/\n/)) {
    if (!paragraph) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const char of Array.from(paragraph)) {
      const next = line + char;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = char;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines.length ? lines : [''];
}

function drawCover(ctx, image, x, y, width, height, radius = 18) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  ctx.save();
  roundRect(ctx, x, y, width, height, radius);
  ctx.clip();
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function loadImage(source, index) {
  return new Promise((resolve, reject) => {
    if (typeof source !== 'string' || !source.trim()) {
      reject(new Error(`第 ${index + 1} 张图片地址无效`));
      return;
    }
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight) {
        reject(new Error(`第 ${index + 1} 张图片无法读取尺寸`));
      } else resolve(image);
    };
    image.onerror = () => reject(new Error(`第 ${index + 1} 张图片加载失败`));
    image.src = source;
  });
}

function drawSun(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.strokeStyle = COLORS.gold;
  ctx.fillStyle = COLORS.gold;
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.arc(x, y, 9 * scale, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 8; i += 1) {
    const angle = i * Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * 15 * scale, y + Math.sin(angle) * 15 * scale);
    ctx.lineTo(x + Math.cos(angle) * 23 * scale, y + Math.sin(angle) * 23 * scale);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPrepared(ctx, photo, box) {
  const fitted=fitPhoto(photo,box);
  drawCover(ctx,photo.image,fitted.x,fitted.y,fitted.w,fitted.h,2);
  return fitted;
}

function textBlock(ctx, text, x, y, width, height, font=32, color=COLORS.ink, weight=500) {
  let lines;
  do {
    ctx.font=`${weight} ${font}px ${SERIF}`;
    lines=wrapText(ctx,text,width);
    if(lines.length*font*1.55<=height)break;
    font*=.94;
  }while(font>8);
  ctx.fillStyle=color;ctx.textBaseline='top';
  lines.forEach((line,i)=>ctx.fillText(line,x,y+i*font*1.55));
  ctx.textBaseline='alphabetic';
}

function drawPraisedPhotos(ctx, photos, praises, title) {
  // Main photograph + differently scaled supporting moments, never equal cards.
  const layouts={
    2:[[56,315,840,465],[990,172,448,478]],
    3:[[56,315,826,465],[976,88,462,268],[976,555,462,268]],
    4:[[56,310,750,480],[906,92,532,256],[874,504,280,280],[1178,563,260,244]],
    5:[[56,310,650,480],[824,92,272,272],[1130,147,308,250],[796,557,310,250],[1150,605,288,230]],
    6:[[56,308,584,486],[728,84,316,245],[1110,132,328,245],[728,475,710,150],[728,737,316,125],[1110,737,328,125]]
  };
  const titleWidth=photos.length<=3?800:photos.length===4?750:630;
  ctx.fillStyle='#829077';ctx.font=`22px ${SANS}`;
  ctx.fillText('夸一夸 · 值得记住的日常',56,65);
  ctx.fillStyle=COLORS.ink;ctx.fillRect(56,84,62,2);
  textBlock(ctx,title||'每个瞬间，\n都值得被看见。',56,112,titleWidth,182,66,COLORS.ink,600);
  photos.forEach((photo,i)=>{
    const [x,y,w,h]=layouts[photos.length][i];
    const fitted=drawPrepared(ctx,photo,{x,y,w,h});
    const captionY=fitted.y+fitted.h+18;
    const maxH=Math.min(i===0?116:photos.length===6&&i>=4?54:108,928-captionY);
    const captionFont=i===0?36:photos.length>=5?25:29;
    const captionX=i===0?x+4:fitted.x;
    const captionW=i===0?w-8:fitted.w;
    textBlock(ctx,praises[i],captionX,captionY,captionW,maxH,captionFont);
    ctx.fillStyle='#c7b799';ctx.fillRect(captionX,captionY+maxH+3,24,1);
  });
}

/** Render the default 3:2 landscape poster; preview and PNG share this canvas. */
export async function renderPoster({ photos = [], title = '', body = '', date = '', praises = [] } = {}) {
  if (!Array.isArray(photos) || photos.length < 1 || photos.length > 6) throw new Error('海报需要 1 至 6 张图片');
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') throw new Error('当前环境不支持 Canvas 海报导出');
  const images = await Promise.all(photos.map((source, index) => loadImage(source, index)));
  const processed = images.map(preparePhoto);
  await document.fonts?.ready;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH; canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = COLORS.paper; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  if(images.length>1){
    const captions=images.map((_,i)=>String(praises[i]||'这一刻，值得被好好记住。'));
    drawPraisedPhotos(ctx,processed,captions,title);
  }else{
  drawPrepared(ctx,processed[0],{x:48,y:72,w:750,h:800});
  const textX = 858, textWidth = WIDTH - textX - 54, availableHeight = 716;
  let titleFont = 54, bodyFont = 32, titleLines, bodyLines, textHeight;
  do {
    ctx.font = `600 ${titleFont}px ${SERIF}`;
    titleLines = wrapText(ctx, title, textWidth);
    ctx.font = `${bodyFont}px ${SANS}`;
    bodyLines = wrapText(ctx, body, textWidth);
    textHeight = titleLines.length * titleFont * 1.5 + 36 + bodyLines.length * bodyFont * 1.75;
    if (textHeight <= availableHeight) break;
    titleFont *= .94; bodyFont *= .94;
  } while (bodyFont > 8);
  let y = 70 + (availableHeight - textHeight) / 2;
  ctx.textBaseline = 'top'; ctx.fillStyle = COLORS.ink;
  ctx.font = `600 ${titleFont}px ${SERIF}`;
  for (const line of titleLines) { ctx.fillText(line, textX, y); y += titleFont * 1.5; }
  y += 36;
  ctx.fillStyle = COLORS.muted; ctx.font = `${bodyFont}px ${SANS}`;
  for (const line of bodyLines) { ctx.fillText(line, textX, y); y += bodyFont * 1.75; }
  }
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLORS.muted; ctx.font = `24px ${SANS}`;
  ctx.fillText(String(date || ''), 48, HEIGHT - 48);
  ctx.fillStyle = COLORS.ink; ctx.font = `600 30px ${SANS}`; ctx.textAlign = 'right';
  ctx.fillText('夸一夸', WIDTH - 100, HEIGHT - 48);
  drawSun(ctx, WIDTH - 68, HEIGHT - 59, .72);
  ctx.textAlign = 'left';
  return canvas;
}

/** Convert a rendered canvas to a PNG Blob. */
export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (!canvas || typeof canvas.toBlob !== 'function') {
      reject(new Error('无效的 Canvas，无法导出 PNG'));
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG 导出失败'));
    }, 'image/png');
  });
}

/** Download the canvas as a real PNG and release the temporary object URL. */
export async function downloadCanvas(canvas, filename = '夸一夸.png') {
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.toLowerCase().endsWith('.png') ? filename : `${filename}.png`;
    link.click();
  } finally {
    // Give the browser time to start the download before releasing the URL.
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
}
