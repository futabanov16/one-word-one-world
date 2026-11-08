import {test} from 'node:test';
import assert from 'node:assert/strict';
import {latestSummary,summaryKey,wrapText} from '../src/round-summary.ts';
test('only revealed history becomes a summary, never private submissions',()=>{
 const room={code:'ABCDEF',game:1,history:[],players:[{name:'甲',word:'秘密'}]};
 assert.equal(latestSummary(room),null);
 room.history.push({number:1,words:[{id:'a',name:'甲',word:'月亮'},{id:'b',name:'乙',word:'星星'}]});
 const summary=latestSummary(room);assert.equal(summary.round.words.length,2);assert.ok(!JSON.stringify(summary).includes('秘密'));
 room.history.push({number:2,words:[{id:'a',name:'甲',word:'夜空'},{id:'b',name:'乙',word:'夜空'}]});
 assert.equal(latestSummary(room).round.number,2);assert.equal(summary.round.number,1);
});
test('popup identity distinguishes rooms, replayed games, and rounds',()=>{
 const base={code:'ABCDEF',game:1,round:{number:1,words:[]}};
 const keys=[base,{...base,game:2},{...base,code:'ZYXWVU'},{...base,round:{number:2,words:[]}}].map(summaryKey);
 assert.equal(new Set(keys).size,4);
});
test('long words wrap without dropping characters or splitting emoji surrogates',()=>{
 for(const value of ['春夏秋冬日月星辰山川湖海风花雪月天空大地','abcdefghijklmnopqrst','月亮🌙和星星⭐️','<script>alert(1)</script>']){
  const measure=s=>Array.from(s).length*46;
  const lines=wrapText(value,758,measure);
  assert.equal(lines.join(''),value);assert.ok(lines.every(line=>measure(line)<=758));
 }
});
