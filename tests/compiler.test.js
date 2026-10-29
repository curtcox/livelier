const {test}=require('node:test'),assert=require('node:assert/strict');
const K=require('./kernel-helper.cjs');
test('instrument every loop, function, label and expression arrow',async()=>{
 for(const source of ['let i=0;while(i<2)i++;i','let i=0;do i++;while(i<2);i','let i=0;for(;i<2;)i++;i','let n=0;for(const x of [1,2])n+=x;n','let n=0;for(const x in {a:1})n++;n','outer:for(let x=0;x<2;x++){continue outer;} 3','function* g(){yield 3} g().next().value','const f=x=>x+1; f(2)','async function f(){await 0;return 3} await f()'])assert.equal(typeof await K.compile(source)(),'number');
 assert.equal(await K.compile('await Promise.resolve(42)')(),42);
});
test('loop guard trips and cannot be swallowed',async()=>{let clock=0,clear;const guard=K.createGuard({clock:()=>clock++,budget:5,queue:fn=>clear=fn});await assert.rejects(K.compile('while(true){try{}catch(e){}}',{guard})(),K.LoopGuardError);assert.throws(()=>guard(),K.LoopGuardError);clear();guard();});
test('guard time resets at the microtask boundary',async()=>{let now=0;const guard=K.createGuard({clock:()=>now});guard();await Promise.resolve();now=10000;guard();for(let n=0;n<2000;n++)guard();});
test('line map corrects inserted columns and syntax location',async()=>{const unit=K.instrument('for(;;) break;\nmissing()');assert.deepEqual(unit.map(2,1),{line:2,column:1});assert.throws(()=>K.compile('const = ;'),e=>e.loc.line===1);try{await K.compile('const ok=1;\nmissing();',{name:'main.js'})();assert.fail();}catch(e){assert.equal(K.errorLocation(e).line,2);}});
