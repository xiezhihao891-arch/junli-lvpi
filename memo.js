/* 军理绿皮 · 背诵 */
(function(){
'use strict';
var D=window.MEMO; if(!D){document.getElementById('view').innerHTML='<p class="empty">背诵数据未加载</p>';return;}
var KEY='junli_lvpi_memo_v2';
var view=document.getElementById('view');
var mode='home', idx=0, list=[], flipped=false, reveal={};

function load(){var d;try{d=JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){d={};}return{known:d.known||{},theme:d.theme||'auto'};}
var S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove('show');},1600);}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function topbar(title,opts){opts=opts||{};return '<div class="top">'+(opts.back?'<a class="iconbtn" href="#" id="back"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></a>':'')+'<h1>'+title+(opts.sub?' <span class="sub">'+opts.sub+'</span>':'')+'</h1></div>';}
function h(html){view.innerHTML=html;var b=document.getElementById('back');if(b)b.onclick=function(e){e.preventDefault();home();};}

function home(){
  mode='home';
  var kn=Object.keys(S.known).length;
  h(topbar('背诵',{sub:(D.cards||[]).length+' 卡'})+
    '<div class="hero"><div class="lbl">绿皮背诵 · 考前默写</div><div class="big">'+(D.cards||[]).length+'<small> 卡</small></div><div class="meta">挖空 '+(D.clozes||[]).length+' · 时间轴 '+(D.timeline||[]).length+' 组 · 已掌握 '+kn+'</div>'+
    '<div class="fmt"><span>闪卡</span><span>挖空</span><span>时间轴</span></div></div>'+
    '<div class="tiles">'+
    '<button class="tile" data-m="cards"><div class="ico">🃏</div><b>闪卡背诵</b><span>正反翻面 · 掌握标记</span></button>'+
    '<button class="tile" data-m="cloze"><div class="ico">✏️</div><b>挖空默写</b><span>关键列表填空</span></button>'+
    '<button class="tile" data-m="tl"><div class="ico">📅</div><b>时间轴</b><span>点开看日期</span></button>'+
    '<button class="tile" data-m="must"><div class="ico">⭐</div><b>考前必背</b><span>易错+军种日等</span></button>'+
    '</div>'+
    '<p class="disclaimer">卡片提炼自绿皮教材考点；与詹哲轩笔记冲突见「新旧差异」。</p>');
  Array.prototype.forEach.call(document.querySelectorAll('[data-m]'),function(b){b.onclick=function(){
    var m=b.getAttribute('data-m');
    if(m==='cards')startCards(D.cards);
    else if(m==='cloze')startCloze();
    else if(m==='tl')showTimeline();
    else if(m==='must')startCards((D.cards||[]).filter(function(c){return /^mc\d/.test(c.id);}).concat((D.cards||[]).slice(0,20)));
  };});
}

function startCards(cards){
  list=shuffle(cards||[]);idx=0;flipped=false;mode='cards';
  if(!list.length){toast('无卡片');return;}
  renderCard();
}
function renderCard(){
  var c=list[idx]; if(!c){home();return;}
  var known=!!S.known[c.id];
  h(topbar('闪卡',{back:true,sub:(idx+1)+'/'+list.length})+
    '<div class="fc-meta"><span>'+esc(c.c||'')+'</span><span class="fc-state '+(known?'k':'u')+'">'+(known?'已掌握':'待巩固')+'</span></div>'+
    '<div class="fc-wrap"><div class="fc'+(flipped?' flip':'')+'" id="fc">'+
    '<div class="face front"><div class="tag">正面 · 点击翻转</div><div class="q">'+esc(c.f)+'</div><div class="hint">轻触查看答案</div></div>'+
    '<div class="face back"><div class="tag">背面</div><div class="a">'+esc(c.b)+'</div><div class="hint">再点可翻回</div></div>'+
    '</div></div>'+
    '<div class="fc-btns"><button class="btn ghost" id="unk">还不会</button><button class="btn" id="kn">掌握了</button></div>'+
    '<div class="row mt"><button class="btn soft block" id="nextc">下一张 ›</button></div>');
  document.getElementById('back').onclick=function(e){e.preventDefault();home();};
  document.getElementById('fc').onclick=function(){flipped=!flipped;renderCard();};
  document.getElementById('unk').onclick=function(){delete S.known[c.id];save();toast('继续加油');nextCard();};
  document.getElementById('kn').onclick=function(){S.known[c.id]=1;save();toast('已标记掌握');nextCard();};
  document.getElementById('nextc').onclick=nextCard;
}
function nextCard(){idx++;flipped=false;if(idx>=list.length){toast('本组完成');home();}else renderCard();}

function startCloze(){
  list=shuffle(D.clozes||[]);idx=0;reveal={};mode='cloze';
  if(!list.length){toast('无挖空');return;}
  renderCloze();
}
function renderCloze(){
  var z=list[idx]; if(!z){home();return;}
  var shown=!!reveal[idx];
  var html=esc(z.p).replace(/【(\d+)】/g,function(_,n){
    var i=+n-1;
    if(shown) return '<b class="kb">'+esc((z.a||[])[i]||'')+'</b>';
    return '<span class="blank">（'+(i+1)+'）</span>';
  });
  h(topbar('挖空',{back:true,sub:(idx+1)+'/'+list.length})+
    '<div class="qcard"><div class="qtext" style="font-size:18px;font-weight:600">'+html+'</div>'+
    (shown?'<div class="fb ok"><div class="h">完整句</div><div>'+esc(z.full||'')+'</div></div>':'')+
    '</div>'+
    '<div class="qfoot"><button class="btn ghost" id="rev">'+(shown?'隐藏':'显示答案')+'</button>'+
    '<button class="btn" id="nx">下一题 ›</button></div>');
  document.getElementById('back').onclick=function(e){e.preventDefault();home();};
  document.getElementById('rev').onclick=function(){reveal[idx]=!reveal[idx];renderCloze();};
  document.getElementById('nx').onclick=function(){idx++;reveal={};if(idx>=list.length){toast('挖空完成');home();}else renderCloze();};
}

function showTimeline(){
  var hide=true;
  function draw(){
    var tl=(D.timeline||[]).map(function(g){
      return '<div class="tl-g">'+esc(g.g)+'</div>'+(g.items||[]).map(function(it){
        return '<div class="tl-i"><div class="d">'+esc(it[0])+'</div><div class="e">'+esc(it[1])+'</div></div>';
      }).join('');
    }).join('');
    h(topbar('时间轴',{back:true})+
      '<div class="row"><button class="btn soft" id="tog">'+(hide?'显示日期':'遮挡日期')+'</button></div>'+
      '<div class="tl'+(hide?' hide':'')+'">'+tl+'</div>'+
      '<p class="note"><b>提示：</b>总体国家安全观日期见差异页；点条目可临时显示。</p>');
    document.getElementById('back').onclick=function(e){e.preventDefault();home();};
    document.getElementById('tog').onclick=function(){hide=!hide;draw();};
    Array.prototype.forEach.call(document.querySelectorAll('.tl-i'),function(el){el.onclick=function(){el.classList.toggle('show');};});
  }
  draw();
}

home();
})();
