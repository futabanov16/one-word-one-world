import {test} from 'node:test';
import assert from 'node:assert/strict';
import {completedSummary,summaryKey,wrapText} from '../src/game-summary.ts';
const round=number=>({number,words:[{id:'a',name:'甲',word:'月亮'+number},{id:'b',name:'乙',word:'星星'+number}]});
test('no summary during lobby, writing or ordinary round reveals',()=>{
 for(const phase of ['lobby','writing','reveal']) {
  assert.equal(completedSummary({code:'ABCDEF',game:1,phase,result:'',history:[round(1),round(2)]}),null);
 }
 assert.equal(completedSummary({code:'ABCDEF',game:1,phase:'finished',result:'match',history:[]}),null);
});
test('every ending includes all rounds and every player, in order',()=>{
 for(const [result,count] of [['match',3],['consensus',5],['limit',10]]) {
  const room={code:'ABCDEF',game:2,phase:'finished',result,history:Array.from({length:count},(_,i)=>round(i+1)),players:[{word:'秘密'}]};
  const summary=completedSummary(room);
  assert.equal(summary.history.length,count);assert.deepEqual(summary.history,room.history);assert.equal(summary.result,result);
  assert.ok(!JSON.stringify(summary).includes('秘密'));
  room.history[0].words[0].word='被修改';room.history.length=0;
  assert.equal(summary.history.length,count);assert.equal(summary.history[0].words[0].word,'月亮1');
 }
});
test('popup identity is per game, stable if the final consensus changes',()=>{
 const base={code:'ABCDEF',game:1,result:'limit',history:[round(1)]};
 assert.equal(summaryKey(base),summaryKey({...base,result:'consensus'}));
 assert.notEqual(summaryKey(base),summaryKey({...base,game:2}));
 assert.notEqual(summaryKey(base),summaryKey({...base,code:'ZYXWVU'}));
});
test('narrow cells wrap without dropping long words or emoji',()=>{
 for(const value of ['春夏秋冬日月星辰山川湖海风花雪月天空大地','abcdefghijklmnopqrst','月亮🌙和星星⭐️','<script>alert(1)</script>']){
  const measure=s=>Array.from(s).length*32;
  const lines=wrapText(value,184,measure);
  assert.equal(lines.join(''),value);assert.ok(lines.every(line=>measure(line)<=184));
 }
});
