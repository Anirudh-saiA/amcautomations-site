// Output sections: scroll progress for the split-open title, highlighter sweeps and word-by-word reading.
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tracks=[].slice.call(document.querySelectorAll('.o1-track')).map(function(t){return{track:t,stage:t.querySelector('.o1-stage')}});
  var words=[];
  document.querySelectorAll('.rd').forEach(function(el){
    var t=el.textContent.trim().split(/\s+/);el.textContent='';
    var ws=t.map(function(w,i){var s=document.createElement('span');s.className='w';s.textContent=w;el.appendChild(s);if(i<t.length-1)el.appendChild(document.createTextNode(' '));return s});
    words.push({el:el,ws:ws});
  });
  var reel=document.querySelector('.o3-reel'),cards=reel?[].slice.call(reel.querySelectorAll('.rc')):[];
  var cnt=reel&&reel.querySelector('.reel-count b'),bar=reel&&reel.querySelector('.reel-bar i');
  var hls=[].slice.call(document.querySelectorAll('.hl'));
  hls.forEach(function(h,i){h.style.setProperty('--d',(i%4)*0.12+'s')});
  var tick=false;
  function draw(){
    tick=false;
    if(!reduce)tracks.forEach(function(o){
      var r=o.track.getBoundingClientRect(),vh=innerHeight;
      var p=Math.max(0,Math.min(1,(-r.top)/(vh*.85)));
      o.stage.style.setProperty('--p',p.toFixed(4));
    });
    if(reel&&!reduce){
      var rr=reel.getBoundingClientRect(),span=reel.offsetHeight-innerHeight;
      var P=Math.max(0,Math.min(1,(-rr.top)/Math.max(1,span*.92)));
      var n=cards.length,last=0;
      cards.forEach(function(c,i){
        var q=Math.max(0,Math.min(1,(P*n-i*.92)/.9));
        q=1-Math.pow(1-q,3);
        c.style.setProperty('--q',q.toFixed(4));
        if(q>.02)last=i;
        c.classList.toggle('is-new',q>.02&&q<.98);
      });
      if(cnt)cnt.textContent='0'+(last+1);
      if(bar)bar.style.width=(P*100).toFixed(1)+'%';
    }
    hls.forEach(function(h){h.classList.toggle('on',h.getBoundingClientRect().top<innerHeight*.78)});
    words.forEach(function(g){
      var r=g.el.getBoundingClientRect();
      var t=Math.max(0,Math.min(1,(innerHeight*.88-r.top)/(innerHeight*.38)));
      var n=Math.round(t*g.ws.length);
      g.ws.forEach(function(w,i){w.classList.toggle('on',i<n)});
    });
  }
  function req(){if(!tick){tick=true;requestAnimationFrame(draw)}}
  addEventListener('scroll',req,{passive:true});addEventListener('resize',req);addEventListener('hashchange',function(){setTimeout(draw,80)});
  draw();
})();
