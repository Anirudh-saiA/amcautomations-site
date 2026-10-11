// Light hero parallax on native scroll. No scroll hijacking. Skipped for reduced motion and on phones.
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var ticking=false;
  function draw(){
    ticking=false;
    var y=scrollY;if(y>innerHeight*1.2||innerWidth<=820)return;
    document.querySelectorAll('.hero h1').forEach(function(h){if(h.offsetParent)h.style.transform='translate3d(0,'+(y*0.1)+'px,0)'});
    var side=document.querySelector('#view-home:not([hidden]) .hero .console, .hero .phone');
    if(side)side.style.transform='rotate('+((side.classList.contains('phone')?-4:1.5)+y*0.006)+'deg) translate3d(0,'+(y*-0.08)+'px,0)';
  }
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(draw)}},{passive:true});
})();
