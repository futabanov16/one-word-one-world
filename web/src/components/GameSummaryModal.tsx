import {useEffect,useRef,useState} from 'react';
import {Download, X, RotateCcw} from 'lucide-react';
import {generateSummary, type GameSummary} from '../game-summary';
export default function GameSummaryModal({summary,onClose}:{summary:GameSummary;onClose:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);
 const [url,setUrl]=useState(''),[error,setError]=useState(''),[attempt,setAttempt]=useState(0),[downloaded,setDownloaded]=useState(false);
 useEffect(()=>{
  const el=dialog.current;const previous=document.activeElement as HTMLElement|null;
  el?.showModal();
  return()=>{el?.close();previous?.focus();};
 },[]);
 useEffect(()=>{
  let active=true;let objectUrl='';setUrl('');setError('');setDownloaded(false);
  generateSummary(summary).then(blob=>{
   if(!active)return;objectUrl=URL.createObjectURL(blob);setUrl(objectUrl);
  }).catch(()=>{if(active)setError('图片暂时没生成好，再试一次吧。');});
  return()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};
 },[summary,attempt]);
 const filename=`one-word-one-world-${summary.code}-第${summary.game}局-完整总结.png`;
 return <dialog ref={dialog} className="summary-dialog" aria-labelledby="summary-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
  <button className="close" aria-label="关闭整局纪念卡" onClick={onClose} autoFocus><X size={20}/></button>
  <p className="eyebrow">留住这一局的全部默契</p>
  <h2 id="summary-title">第 {summary.game} 局的完整联想纪念卡</h2>
  <p className="summary-caption">从第一轮到最后一轮，每个人的词都在这里。</p>
  <div className="summary-preview" aria-busy={!url&&!error}>
   {url?<img src={url} alt={`第${summary.game}局完整总结。${summary.history.map(r=>`第${r.number}轮：${r.words.map(w=>`${w.name}：${w.word}`).join('；')}`).join('。')}`} />:error?<div className="summary-placeholder" role="alert"><p>{error}</p><button className="outline" onClick={()=>setAttempt(x=>x+1)}><RotateCcw size={16}/>重新生成</button></div>:<p className="summary-placeholder" role="status">正在把大家的词写到小纸上…</p>}
  </div>
  <div className="summary-buttons">
   {url?<a className="primary" href={url} download={filename} onClick={()=>setDownloaded(true)}><Download size={17}/>保存图片</a>:<button className="primary" disabled><Download size={17}/>保存图片</button>}
   <button className="outline" onClick={onClose}>关闭总结</button>
  </div>
  <p className="summary-tip" role="status">{downloaded?'已发起下载；手机也可以长按图片保存。':'想留作纪念就保存，不保存也没关系。手机支持长按图片保存。'}</p>
 </dialog>;
}
