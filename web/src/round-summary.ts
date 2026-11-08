export type RoundRecord = {number:number;words:{id:string;name:string;word:string}[]};
export type RoundSummary = {code:string;game:number;round:RoundRecord};
export function summaryKey(summary:RoundSummary){return `round-summary:${summary.code}:${summary.game}:${summary.round.number}`;}

// Use only revealed history, never the players' in-progress submissions.
export function latestSummary(room:{code:string;game:number;history:RoundRecord[]}):RoundSummary|null {
 const round=room.history.at(-1);
 return round ? {code:room.code,game:room.game,round} : null;
}
export function wrapText(text:string, maxWidth:number, measure:(text:string)=>number):string[] {
 const lines:string[]=[];let line='';
 for(const char of Array.from(text)) {
  if(line && measure(line+char)>maxWidth){lines.push(line);line=char;}
  else line+=char;
 }
 if(line)lines.push(line);
 return lines;
}
const serif='"Noto Serif SC", "Songti SC", "SimSun", serif';
const sans='"Noto Sans CJK SC", "Songti SC", "SimSun", serif';
export function drawSummary(ctx:CanvasRenderingContext2D, summary:RoundSummary) {
 const width=1080;
 ctx.font=`500 46px ${serif}`;
 const rows=summary.round.words.map(w=>({...w,lines:wrapText(w.word,758,t=>ctx.measureText(t).width)}));
 const heights=rows.map(w=>Math.max(164,102+w.lines.length*62));
 const height=420+heights.reduce((a,b)=>a+b,0);
 ctx.canvas.width=width;ctx.canvas.height=height;
 ctx.fillStyle='#f8f6ef';ctx.fillRect(0,0,width,height);
 // Quiet paper grain and slightly uneven pencil rules; no external image assets.
 ctx.fillStyle='#e7e5da';
 for(let y=9;y<height;y+=19)for(let x=11;x<width;x+=23)ctx.fillRect(x+(y%7),y,1,1);
 ctx.strokeStyle='#adb5a2';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(34,36);ctx.lineTo(width-37,32);ctx.lineTo(width-33,height-36);ctx.lineTo(37,height-32);ctx.closePath();ctx.stroke();
 ctx.fillStyle='#69795c';ctx.font=`20px ${sans}`;ctx.fillText('ONE WORD ONE WORLD',76,91);
 ctx.textAlign='right';ctx.fillStyle='#8c9381';ctx.font=`20px ${sans}`;ctx.fillText(`第 ${summary.game} 局 · ${summary.round.words.length} 人`,1004,91);ctx.textAlign='left';
 ctx.fillStyle='#344137';ctx.font=`500 56px ${serif}`;ctx.fillText(`第 ${summary.round.number} 轮 · 我们想到的词`,76,179);
 ctx.strokeStyle='#d87855';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(77,204);ctx.quadraticCurveTo(345,194,624,201);ctx.stroke();
 ctx.font=`24px ${sans}`;ctx.fillStyle='#858d79';ctx.fillText('把这一刻的联想，留在一张小纸上。',76,252);
 let y=292;
 const colors=['#ead59f','#c6d3ba','#e6b49f','#c6d8dd'];
 rows.forEach((w,i)=>{
  ctx.fillStyle=colors[i%colors.length];ctx.strokeStyle='#69755e';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(112,y+52,34,32,i%2?.08:-.08,0,2*Math.PI);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(101,y+44);ctx.lineTo(101,y+50);ctx.moveTo(123,y+44);ctx.lineTo(123,y+50);ctx.moveTo(103,y+62);ctx.quadraticCurveTo(112,y+70,122,y+61);ctx.stroke();
  ctx.fillStyle='#77846b';ctx.font=`24px ${sans}`;ctx.fillText(w.name,174,y+31);
  ctx.fillStyle='#344137';ctx.font=`500 46px ${serif}`;
  w.lines.forEach((line,j)=>ctx.fillText(line,174,y+96+j*62));
  y+=heights[i];
  ctx.strokeStyle='#c9cebc';ctx.lineWidth=1.5;ctx.setLineDash([6,9]);ctx.beginPath();ctx.moveTo(76,y-16);ctx.lineTo(1004,y-18);ctx.stroke();ctx.setLineDash([]);
 });
 ctx.fillStyle='#8c9381';ctx.font=`22px ${serif}`;ctx.fillText('一点联想，一点默契。',76,height-75);
 ctx.textAlign='right';ctx.font=`18px ${sans}`;ctx.fillText('同频 · 联想纪念卡',1004,height-75);ctx.textAlign='left';
 return {width,height};
}
export async function generateSummary(summary:RoundSummary):Promise<Blob> {
 // Do not make image saving depend on the external font service being reachable.
 await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,1500))]);
 const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');
 if(!ctx)throw Error('当前浏览器无法生成图片');
 drawSummary(ctx,summary);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('图片生成失败')),'image/png'));
}
