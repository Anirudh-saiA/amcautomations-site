// Hamburger drawer: open/close, Esc, click-outside, focus return, current-page highlight.
(function(){
  var b=document.body,btn=document.getElementById('menuBtn'),dr=document.getElementById('drawer');
  if(!btn||!dr)return;
  function open(){b.classList.add('menu-open');btn.setAttribute('aria-expanded','true');dr.removeAttribute('inert');dr.querySelector('.drawer-close').focus()}
  function close(){b.classList.remove('menu-open');btn.setAttribute('aria-expanded','false');dr.setAttribute('inert','');btn.focus({preventScroll:true})}
  dr.setAttribute('inert','');
  btn.addEventListener('click',open);
  document.getElementById('scrim').addEventListener('click',close);
  dr.querySelector('.drawer-close').addEventListener('click',close);
  addEventListener('keydown',function(e){if(e.key==='Escape'&&b.classList.contains('menu-open'))close()});
  dr.addEventListener('click',function(e){if(e.target.closest('nav a'))b.classList.remove('menu-open'),btn.setAttribute('aria-expanded','false'),dr.setAttribute('inert','')});
})();
// Home hero already shows the big logo, so hide the small corner logo while it is on screen.
(function(){
  function sync(){var h=document.getElementById('view-home');document.body.classList.toggle('hero-logo',!!(h&&!h.hidden&&scrollY<innerHeight*.5))}
  addEventListener('scroll',sync,{passive:true});addEventListener('hashchange',function(){setTimeout(sync,60)});sync();setTimeout(sync,200);
})();
