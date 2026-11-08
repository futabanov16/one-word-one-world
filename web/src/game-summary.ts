export type RoundRecord = {number:number;words:{id:string;name:string;word:string}[]};
export type GameSummary = {code:string;game:number;history:RoundRecord[];result:string};
export function summaryKey(summary:GameSummary){return `game-summary:${summary.code}:${summary.game}`;}

// A full-game souvenir is available only once the game has ended.
export function completedSummary(room:{code:string;game:number;phase:string;result:string;history:RoundRecord[]}):GameSummary|null {
 if(room.phase !== 'finished' || room.history.length === 0)return null;
 return {code:room.code,game:room.game,result:room.result,history:room.history.map(r=>({...r,words:r.words.map(w=>({...w}))}))};
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
export function drawSummary(ctx:CanvasRenderingContext2D, summary:GameSummary) {
 const width=1080,left=76,right=1004,roundWidth=80;
 const players=Array.from(new Map(summary.history.flatMap(r=>r.words).map(w=>[w.id,{id:w.id,name:w.name}])).values());
 const columnWidth=(right-left-roundWidth)/players.length;
 ctx.font=`22px ${sans}`;
 const names=players.map(p=>wrapText(p.name,columnWidth-24,t=>ctx.measureText(t).width));
 const headerHeight=Math.max(88,36+Math.max(...names.map(n=>n.length))*30);
 ctx.font=`32px ${serif}`;
 const rows=summary.history.map(round=>{
  const cells=players.map(p=>wrapText(round.words.find(w=>w.id===p.id)?.word ?? '—',columnWidth-28,t=>ctx.measureText(t).width));
  return {number:round.number,cells,height:Math.max(96,40+Math.max(...cells.map(c=>c.length))*44)};
 });
 const height=390+headerHeight+rows.reduce((a,r)=>a+r.height,0);
 ctx.canvas.width=width;ctx.canvas.height=height;
 ctx.fillStyle='#f8f6ef';ctx.fillRect(0,0,width,height);
 ctx.fillStyle='#e7e5da';
 for(let y=9;y<height;y+=19)for(let x=11;x<width;x+=23)ctx.fillRect(x+(y%7),y,1,1);
 ctx.strokeStyle='#adb5a2';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(34,36);ctx.lineTo(width-37,32);ctx.lineTo(width-33,height-36);ctx.lineTo(37,height-32);ctx.closePath();ctx.stroke();
 ctx.fillStyle='#69795c';ctx.font=`20px ${sans}`;ctx.fillText('ONE WORD ONE WORLD',left,91);
 ctx.textAlign='right';ctx.fillStyle='#8c9381';ctx.fillText(`${players.length} 人 · ${rows.length} 轮`,right,91);ctx.textAlign='left';
 ctx.fillStyle='#344137';ctx.font=`500 52px ${serif}`;ctx.fillText(`第 ${summary.game} 局 · 一起走过的联想`,left,175);
 ctx.strokeStyle='#d87855';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(left,199);ctx.quadraticCurveTo(345,192,760,197);ctx.stroke();
 ctx.font=`24px ${sans}`;ctx.fillStyle='#77846b';
 const result=summary.result==='match'?'想到同一个词，我们同频了。':summary.result==='consensus'?'大家达成一致，默契也有不同的表达。':'十轮联想，是一段共同的小旅程。';
 ctx.fillText(result,left,246);
 let y=284;
 ctx.fillStyle='#eceddf';ctx.fillRect(left,y,right-left,headerHeight);
 ctx.fillStyle='#8c9381';ctx.font=`20px ${sans}`;ctx.fillText('轮次',left+12,y+39);
 const colors=['#be9a45','#78936a','#c88264','#7c9ca5'];
 names.forEach((lines,i)=>{
  const x=left+roundWidth+columnWidth*i+columnWidth/2;
  ctx.fillStyle=colors[i%colors.length];ctx.beginPath();ctx.arc(x,y+17,4,0,2*Math.PI);ctx.fill();
  ctx.fillStyle='#52684b';ctx.font=`22px ${sans}`;ctx.textAlign='center';
  lines.forEach((line,j)=>ctx.fillText(line,x,y+48+j*30));
 });ctx.textAlign='left';
 y+=headerHeight;
 rows.forEach((r,index)=>{
  if(index%2===0){ctx.fillStyle='#fffef780';ctx.fillRect(left,y,right-left,r.height);}
  ctx.fillStyle='#9aa389';ctx.font=`italic 25px ${serif}`;ctx.fillText(String(r.number).padStart(2,'0'),left+18,y+r.height/2+9);
  ctx.fillStyle='#344137';ctx.font=`32px ${serif}`;ctx.textAlign='center';
  r.cells.forEach((lines,i)=>{
   const x=left+roundWidth+columnWidth*i+columnWidth/2;
   const top=y+(r.height-lines.length*44)/2+32;
   lines.forEach((line,j)=>ctx.fillText(line,x,top+j*44));
  });ctx.textAlign='left';
  y+=r.height;
  ctx.strokeStyle='#c9cebc';ctx.lineWidth=1.5;ctx.setLineDash([5,8]);ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.stroke();ctx.setLineDash([]);
 });
 ctx.fillStyle='#8c9381';ctx.font=`20px ${serif}`;ctx.fillText('每一个词，都是靠近彼此的一小步。',left,height-62);
 ctx.textAlign='right';ctx.font=`18px ${sans}`;ctx.fillText('同频 · 整局纪念卡',right,height-62);ctx.textAlign='left';
 return {width,height};
}
export async function generateSummary(summary:GameSummary):Promise<Blob> {
 // Do not make image saving depend on the external font service being reachable.
 await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,1500))]);
 const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');
 if(!ctx)throw Error('当前浏览器无法生成图片');
 drawSummary(ctx,summary);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('图片生成失败')),'image/png'));
}
