class ConsoleView {
  constructor(element,{onLine=()=>{}}={}){this.element=element;this.onLine=onLine;this.lines=0;this.bytes=0;this.text=[];}
  clear(){this.element.replaceChildren();this.lines=0;this.bytes=0;this.text=[];}
  append({level='log',text='',message,line,source}){
    if(this.lines>=20000||this.bytes>=1024*1024)return;
    text=String(message||text).slice(0,10000);const row=document.createElement('div');row.className='console-entry '+level;
    const prefix=line?`${source||'main.js'}:${line} · `:'';row.textContent=prefix+text;
    if(line){row.tabIndex=0;row.setAttribute('role','button');row.onclick=()=>this.onLine(line);row.onkeydown=e=>{if(e.key==='Enter')row.click();};}
    this.lines++;this.bytes+=text.length;this.text.push(prefix+text);this.element.append(row);if(this.element.childElementCount>2000)this.element.firstChild.remove();this.element.scrollTop=this.element.scrollHeight;
  }
  export(){return this.text.join('\n');}
}
globalThis.ConsoleView=ConsoleView;
