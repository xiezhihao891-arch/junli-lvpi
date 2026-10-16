/* 军理绿皮 · 刷题 */
(function(){
'use strict';
var D=window.QUIZ; if(!D){document.getElementById('view').innerHTML='<p class="empty">题库未加载</p>';return;}
var KEY='junli_lvpi_quiz_v2';
var TYPE={S:'单选',M:'多选',T:'判断',F:'填空'};
var CH={};(D.chs||[]).forEach(function(c){CH[c.id]=c.title;});
var QBY={};D.questions.forEach(function(q){QBY[q.id]=q;});
var view=document.getElementById('view');
var QZ=null;

function load(){var d;try{d=JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){d={};}return{q:d.q||{},wrong:d.wrong||{},star:d.star||{}};}
var S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove('show');},1800);}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>1;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function pct(a,b){return b?Math.round(a*100/b):0;}
function topbar(title,opts){opts=opts||{};return '<div class="top">'+(opts.back?'<a class="iconbtn" href="#" id="back" aria-label="返回"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></a>':'')+'<h1>'+title+(opts.sub?' <span class="sub">'+opts.sub+'</span>':'')+'</h1>'+(opts.right||'')+'</div>';}
function h(html){view.innerHTML=html;var b=document.getElementById('back');if(b)b.onclick=function(e){e.preventDefault();if(QZ){QZ=null;home();}else location.href='index.html';};}
function record(q,ok){var r=S.q[q.id]||{c:0,w:0};if(ok)r.c++;else{r.w++;S.wrong[q.id]=Date.now();}r.l=ok?1:0;S.q[q.id]=r;if(ok)delete S.wrong[q.id];save();}
function fmtAnswer(q){
  if(q.t==='S'||q.t==='M')return q.a.map(function(i){return 'ABCDE'[i]+'. '+q.o[i];}).join('；');
  if(q.t==='T')return q.a?'正确':'错误';
  return q.a.map(function(alts){return alts[0];}).join(' / ');
}
function norm(s){return String(s||'').replace(/\s+/g,'').replace(/[，,。.、；;：:]/g,'').toLowerCase();}
function checkFill(q,ans){return q.a.map(function(alts,i){var v=norm(ans[i]);return alts.some(function(a){return norm(a)===v||(v&&norm(a).indexOf(v)>=0)||(v&&v.indexOf(norm(a))>=0);});});}
function qtext(q){return esc(q.q).replace(/____/g,'<span class="blank">____</span>');}

function stats(filter){
  var tot=0,done=0,c=0,w=0;
  D.questions.forEach(function(q){if(filter&&!filter(q))return;tot++;var r=S.q[q.id];if(r&&(r.c||r.w)){done++;c+=r.c;w+=r.w;}});
  return{tot:tot,done:done,c:c,w:w,acc:pct(c,c+w)};
}

function home(){
  var all=stats();
  var byT={};['S','M','T','F'].forEach(function(t){byT[t]=stats(function(q){return q.t===t;});});
  var wrongN=Object.keys(S.wrong).length;
  h(topbar('刷题',{sub:D.questions.length+' 题'})+
    '<div class="hero"><div class="lbl">绿皮题库 · 本地进度</div><div class="big">'+all.acc+'<small>%</small></div><div class="meta">已做 '+all.done+' / '+all.tot+' · 对 '+all.c+' 错 '+all.w+'</div>'+
    '<div class="fmt"><span>单选 '+byT.S.tot+'</span><span>多选 '+byT.M.tot+'</span><span>判断 '+byT.T.tot+'</span><span>填空 '+byT.F.tot+'</span></div></div>'+
    '<div class="tiles">'+
    '<button class="tile" data-mode="mix"><div class="ico">🎲</div><b>随机练习</b><span>20 题混合</span></button>'+
    '<button class="tile" data-mode="exam"><div class="ico">⏱</div><b>模拟一套</b><span>单20+多10 估分</span></button>'+
    '<button class="tile" data-mode="wrong"><div class="ico">📕</div><b>错题本</b><span>'+(wrongN||'暂无')+' 题</span></button>'+
    '<button class="tile" data-mode="chapters"><div class="ico">📂</div><b>按章节</b><span>专题一至五</span></button>'+
    '</div>'+
    '<div class="label">按题型</div><div class="chips">'+['S','M','T','F'].map(function(t){return '<button class="chip" data-ty="'+t+'">'+TYPE[t]+'（'+byT[t].tot+'）</button>';}).join('')+'</div>'+
    '<p class="disclaimer" style="margin-top:18px">题库对齐徐亮《普通高校军事课教程》考点；与旧笔记冲突处以教材为准，详见「新旧差异」。</p>');
  Array.prototype.forEach.call(document.querySelectorAll('[data-mode]'),function(b){b.onclick=function(){
    var m=b.getAttribute('data-mode');
    if(m==='mix')start(shuffle(D.questions).slice(0,20),{title:'随机练习'});
    else if(m==='exam'){
      var Sqs=shuffle(D.questions.filter(function(q){return q.t==='S';})).slice(0,20);
      var Mqs=shuffle(D.questions.filter(function(q){return q.t==='M';})).slice(0,10);
      start(Sqs.concat(Mqs),{title:'模拟考（估分）',exam:true});
    }
    else if(m==='wrong'){var ids=Object.keys(S.wrong);if(!ids.length){toast('错题本是空的');return;}start(shuffle(ids.map(function(id){return QBY[id];}).filter(Boolean)),{title:'错题重练',wrongMode:true});}
    else if(m==='chapters')chapterPick();
  };});
  Array.prototype.forEach.call(document.querySelectorAll('[data-ty]'),function(b){b.onclick=function(){
    var t=b.getAttribute('data-ty');
    start(shuffle(D.questions.filter(function(q){return q.t===t;})).slice(0,30),{title:TYPE[t]+'练习'});
  };});
}

function chapterPick(){
  h(topbar('按章节',{back:true})+
    '<div class="list">'+(D.chs||[]).map(function(c){
      var n=D.questions.filter(function(q){return q.c===c.id;}).length;
      return '<button class="li" data-c="'+c.id+'"><span class="num">'+(c.id.replace('ch',''))+'</span><div class="main"><b>'+esc(c.title)+'</b><span>'+n+' 题</span></div><span class="arr">›</span></button>';
    }).join('')+'</div>');
  document.getElementById('back').onclick=function(e){e.preventDefault();home();};
  Array.prototype.forEach.call(document.querySelectorAll('[data-c]'),function(b){b.onclick=function(){
    var id=b.getAttribute('data-c');
    var qs=D.questions.filter(function(q){return q.c===id;});
    start(shuffle(qs),{title:CH[id]||id});
  };});
}

function start(qs,opt){
  if(!qs||!qs.length){toast('没有题目');return;}
  QZ={items:qs.map(function(q){return{q:q,ans:null,ok:null,order:q.o?shuffle(q.o.map(function(_,i){return i;})):null};}),i:0,title:opt.title||'练习',wrongMode:!!opt.wrongMode,exam:!!opt.exam};
  render();
}

function renderBody(it,done){
  var q=it.q,html='';
  if(q.t==='S'||q.t==='M'){
    html+='<div class="opts'+(done?' done':'')+'">'+it.order.map(function(oi,k){
      var cls='',sel=it.ans&&it.ans.indexOf(oi)>=0;
      if(done){var right=q.a.indexOf(oi)>=0;if(right&&sel)cls='ok';else if(sel)cls='bad';else if(right)cls=q.t==='M'?'ok miss':'ok';}
      else if(sel)cls='sel';
      return '<button class="opt '+cls+'" data-oi="'+oi+'"><span class="k">'+'ABCDE'[k]+'</span><span>'+esc(q.o[oi])+'</span></button>';
    }).join('')+'</div>';
  }else if(q.t==='T'){
    html+='<div class="tf opts'+(done?' done':'')+'">'+[true,false].map(function(v){
      var cls='',sel=it.ans===v;
      if(done){if(v===q.a)cls='ok';else if(sel)cls='bad';}else if(sel)cls='sel';
      return '<button class="opt '+cls+'" data-tf="'+(v?1:0)+'">'+(v?'✓ 正确':'✗ 错误')+'</button>';
    }).join('')+'</div>';
  }else{
    var res=done?checkFill(q,it.ans||[]):null;
    html+='<div class="fill">'+q.a.map(function(_,i){
      return '<input data-fi="'+i+'" placeholder="第 '+(i+1)+' 空" autocomplete="off" value="'+esc((it.ans||[])[i]||'')+'" '+(done?'readonly class="'+(res[i]?'ok':'bad')+'"':'')+'>';
    }).join('')+'</div>';
  }
  if(done){
    html+='<div class="fb '+(it.ok?'ok':'bad')+'"><div class="h">'+(it.ok?'✓ 正确':'✗ 错误')+'</div>'+
      '<div>正确答案：<b>'+esc(fmtAnswer(q))+'</b></div>'+
      '<div style="margin-top:6px">'+esc(q.e||'')+'</div><div class="src">'+esc(q.s||'')+'</div></div>';
  }
  return html;
}

function judge(it){
  var q=it.q;
  if(q.t==='S'||q.t==='M'){var a=(it.ans||[]).slice().sort(function(x,y){return x-y;});var b=q.a.slice().sort(function(x,y){return x-y;});return a.length===b.length&&a.every(function(v,i){return v===b[i];});}
  if(q.t==='T')return it.ans===q.a;
  return checkFill(q,it.ans||[]).every(Boolean);
}

function render(){
  if(!QZ){home();return;}
  if(QZ.i>=QZ.items.length){summary();return;}
  var it=QZ.items[QZ.i],q=it.q,done=it.ok!==null;
  var tc={S:'',M:'m',T:'t',F:'f'}[q.t];
  h(topbar(esc(QZ.title),{back:true,right:'<button class="star'+(S.star[q.id]?' on':'')+'" id="star">★</button>'})+
    '<div class="qhead"><div class="prog"><div class="bar"><i style="width:'+pct(QZ.i+(done?1:0),QZ.items.length)+'%"></i></div></div><div class="cnt">'+(QZ.i+1)+' / '+QZ.items.length+'</div></div>'+
    '<div class="qcard"><span class="qtype '+tc+'">'+TYPE[q.t]+'题</span><span class="qsec">'+esc(q.s||'')+'</span>'+
    '<div class="qtext">'+qtext(q)+'</div><div id="qb">'+renderBody(it,done)+'</div></div>'+
    '<div class="qfoot">'+(QZ.i>0?'<button class="btn ghost" id="prev" style="flex:0 0 90px">‹</button>':'')+
    (done?'<button class="btn" id="next">'+(QZ.i===QZ.items.length-1?'查看结果':'下一题 ›')+'</button>':(q.t==='M'||q.t==='F')?'<button class="btn" id="submit">提交</button>':'<button class="btn ghost" id="skip">跳过</button>')+
    '</div>');
  document.getElementById('back').onclick=function(e){e.preventDefault();if(confirm('结束本轮练习？')){QZ=null;home();}};
  document.getElementById('star').onclick=function(){if(S.star[q.id])delete S.star[q.id];else S.star[q.id]=1;save();this.classList.toggle('on');};
  var pv=document.getElementById('prev');if(pv)pv.onclick=function(){QZ.i--;render();};
  var nx=document.getElementById('next');if(nx)nx.onclick=function(){QZ.i++;render();};
  var sk=document.getElementById('skip');if(sk)sk.onclick=function(){QZ.i++;render();};
  var sb=document.getElementById('submit');if(sb)sb.onclick=function(){
    if(q.t==='M'&&(!it.ans||!it.ans.length)){toast('请至少选一项');return;}
    if(q.t==='F'){it.ans=Array.prototype.map.call(document.querySelectorAll('[data-fi]'),function(x){return x.value;});if(!it.ans.some(function(x){return x.trim();})){toast('请填写');return;}}
    finish(it);
  };
  if(!done){
    Array.prototype.forEach.call(document.querySelectorAll('[data-oi]'),function(b){b.onclick=function(){
      var oi=+b.getAttribute('data-oi');
      if(q.t==='S'){it.ans=[oi];finish(it);}
      else{it.ans=it.ans||[];var k=it.ans.indexOf(oi);if(k>=0)it.ans.splice(k,1);else it.ans.push(oi);render();}
    };});
    Array.prototype.forEach.call(document.querySelectorAll('[data-tf]'),function(b){b.onclick=function(){it.ans=b.getAttribute('data-tf')==='1';finish(it);};});
  }
}

function finish(it){it.ok=judge(it);record(it.q,it.ok);if(navigator.vibrate&&!it.ok)try{navigator.vibrate(30);}catch(e){}render();}

function summary(){
  var ans=QZ.items.filter(function(x){return x.ok!==null;});
  var ok=ans.filter(function(x){return x.ok;}).length;
  var wrong=QZ.items.filter(function(x){return x.ok===false;});
  h(topbar('本轮结果',{back:true})+
    '<div class="card summary"><div class="score">'+ok+'<small> / '+ans.length+'</small></div><p class="small">正确率 '+pct(ok,ans.length)+'%'+(QZ.exam?' · 模拟估分仅供参考':'')+'</p>'+
    '<div class="row mt">'+(wrong.length?'<button class="btn red" id="rw">重做错题（'+wrong.length+'）</button>':'')+
    '<button class="btn" id="home">返回</button></div></div>'+
    (wrong.length?'<div class="label">错题</div><div class="list">'+wrong.map(function(x){return '<div class="res"><div class="where">'+TYPE[x.q.t]+' · '+esc(x.q.s)+'</div><div class="txt">'+esc(x.q.q)+'<br><span class="small">答案：'+esc(fmtAnswer(x.q))+'</span></div></div>';}).join('')+'</div>':''));
  document.getElementById('back').onclick=document.getElementById('home').onclick=function(e){e&&e.preventDefault();QZ=null;home();};
  var rw=document.getElementById('rw');if(rw)rw.onclick=function(){start(shuffle(wrong.map(function(x){return x.q;})),{title:'重做错题',wrongMode:true});};
}

home();
})();
