(() => {
const K=globalThis.Livelier;
const parser=typeof module!=='undefined'?require('../vendor/acorn.js'):globalThis.acorn;
class LoopGuardError extends Error { constructor() { super('This code ran for 2 seconds without pausing, so Livelier stopped it.'); this.name='LoopGuardError'; } }
function createGuard({clock=()=>performance.now(),queue=queueMicrotask,budget=2000}={}) {
  let started=null,count=0,tripped=false;
  const guard=()=>{ if(tripped)throw new LoopGuardError(); if(started===null){started=clock();queue(()=>{started=null;count=0;tripped=false;});} if((++count&1023)===0&&clock()-started>budget){tripped=true;throw new LoopGuardError();} };
  guard.check=()=>{if(tripped)throw new LoopGuardError();}; return guard;
}
function instrument(source,{lastExpression=false,resumeAwait=false}={}) {
  const ast=parser.parse(source,{ecmaVersion:'latest',sourceType:'script',allowAwaitOutsideFunction:true,allowReturnOutsideFunction:true,locations:true});
  const edits=[];
  const insert=(pos,text)=>edits.push({pos,text,order:edits.length});
  const bodyGuard=body=>{if(body.type==='BlockStatement'){let pos=body.start+1;for(const s of body.body){if(s.directive)pos=s.end;else break;}insert(pos,'__lg();');}else{insert(body.start,'{__lg();');insert(body.end,'}');}};
  const visit=node=>{
    if(!node||typeof node.type!=='string')return;
    if(['WhileStatement','DoWhileStatement','ForStatement','ForInStatement','ForOfStatement'].includes(node.type))bodyGuard(node.body);
    if(['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression'].includes(node.type)) {
      if(node.body.type==='BlockStatement')bodyGuard(node.body);else{insert(node.body.start,'(__lg(),');insert(node.body.end,')');}
    }
    if(resumeAwait&&node.type==='AwaitExpression'){insert(node.start,'__resume(');insert(node.end,')');}
    if(node.type==='CatchClause')insert(node.body.start+1,'__lg.check();');
    for(const [key,value]of Object.entries(node)){if(['loc','start','end'].includes(key))continue;if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);}
  };
  visit(ast);
  const last=ast.body.at(-1);
  if(lastExpression&&last?.type==='ExpressionStatement'){insert(last.expression.start,'return (');insert(last.expression.end,')');}
  edits.sort((a,b)=>a.pos-b.pos||a.order-b.order);
  let code='',offset=0;const segments=[];
  for(const edit of edits){code+=source.slice(offset,edit.pos);segments.push({generated:code.length,original:edit.pos,length:edit.text.length});code+=edit.text;offset=edit.pos;}
  code+=source.slice(offset);
  return {code,source,segments, map(line,column){const lines=code.split('\n');let p=lines.slice(0,Math.max(0,line-1)).reduce((n,s)=>n+s.length+1,0)+Math.max(0,column-1);let removed=0;for(const s of segments){if(p<s.generated)break;if(p<s.generated+s.length){p=s.generated;break;}removed+=s.length;}const original=Math.max(0,p-removed),before=source.slice(0,original).split('\n');return {line:before.length,column:before.at(-1).length+1};}};
}
const units=new Map();
const safeName=name=>String(name||'workspace.js').replace(/[^a-zA-Z0-9_./-]/g,'_');
function compile(source,{scope={},name='workspace.js',lastExpression=true,resumeAwait=false,guard=K.guard||(K.guard=createGuard())}={}) {
  name=safeName(name); const unit=instrument(source,{lastExpression,resumeAwait});units.set(name,unit);
  // Only this frame-side compiler and the trusted frame bootstrap evaluate strings.
  const fn=new Function('__lg',...Object.keys(scope),`return (async function(){${unit.code}\n}).call(this);\n//# sourceURL=${name}`);
  return function(){try{return fn.call(this,guard,...Object.values(scope)).catch(error=>{annotate(error,name);throw error;});}catch(error){annotate(error,name);throw error;}};
}
function compileFunction(source,{scope={},name='script.js',guard=K.guard||(K.guard=createGuard())}={}) {
  name=safeName(name); const unit=instrument('('+source+')');units.set(name,unit);
  const fn=new Function('__lg',...Object.keys(scope),`return ${unit.code};\n//# sourceURL=${name}`)(guard,...Object.values(scope));
  const wrapped=function(...args){try{const result=fn.apply(this,args);if(result&&typeof result.catch==='function')return result.catch(error=>{annotate(error,name);throw error;});return result;}catch(error){annotate(error,name);throw error;}};Object.defineProperty(wrapped,'name',{value:fn.name});return wrapped;
}
function annotate(error,name){if(error&&typeof error==='object'&&!error.livelierLocation)error.livelierLocation=errorLocation(error,name);}
function errorLocation(error,nameHint) {
  if(error.livelierLocation)return error.livelierLocation;
  if(error.loc)return {line:error.loc.line,column:error.loc.column+1,source:'main.js'};
  for(const [name,unit]of [...units].reverse()) {
    const match=String(error.stack).match(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+':(\\d+):(\\d+)'));
    if(match)return {source:name,...unit.map(Math.max(1,Number(match[1])-2),Number(match[2]))};
  }
  if(nameHint&&units.has(nameHint)&&Number.isFinite(error.line))return {source:nameHint,...units.get(nameHint).map(Math.max(1,error.line-2),error.column||1)};
  return {};
}
Object.assign(K,{LoopGuardError,createGuard,instrument,compile,compileFunction,errorLocation});
if(typeof module!=='undefined')module.exports=K;
})();
