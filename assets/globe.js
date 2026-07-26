(() => {
  const canvases = document.querySelectorAll("[data-route-globe]");
  const data = window.MTC_ROUTE_DATA;
  if (!canvases.length || !data) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toRad = Math.PI / 180;
  const duration = 5200;
  const continents = [
    [[-168,68],[-140,70],[-125,55],[-124,38],[-112,25],[-97,18],[-83,9],[-79,25],[-67,45],[-52,48],[-60,60],[-86,72],[-120,73]],
    [[-81,12],[-70,5],[-64,-10],[-54,-22],[-55,-39],[-69,-55],[-76,-36],[-80,-10]],
    [[-10,36],[0,44],[20,55],[45,60],[70,55],[100,70],[140,58],[165,48],[145,35],[120,22],[105,5],[80,8],[60,24],[42,30],[32,40],[18,35],[5,37]],
    [[-18,34],[5,37],[27,31],[42,12],[50,-10],[34,-34],[18,-35],[3,-25],[-9,5]],
    [[112,-11],[132,-12],[153,-27],[145,-40],[119,-35]], [[-52,60],[-28,72],[-42,82],[-62,80]],
    [[48,-13],[51,-26],[45,-25]], [[130,31],[142,45],[145,36]], [[-8,50],[2,58],[-4,59]]
  ];
  const featured = data.routes.filter((route) => route.length > 2 || route[0] === "JFK" || route[0] === "EWR");
  const vector = ([lat,lon]) => { const p=lat*toRad,l=lon*toRad; return [Math.cos(p)*Math.cos(l),Math.cos(p)*Math.sin(l),Math.sin(p)]; };
  const slerp = (a,b,t) => {
    const va=vector(a),vb=vector(b),dot=Math.max(-1,Math.min(1,va[0]*vb[0]+va[1]*vb[1]+va[2]*vb[2])),angle=Math.acos(dot);
    if(angle<.0001)return a; const s=Math.sin(angle),x=Math.sin((1-t)*angle)/s,y=Math.sin(t*angle)/s,v=[va[0]*x+vb[0]*y,va[1]*x+vb[1]*y,va[2]*x+vb[2]*y];
    return [Math.asin(v[2])/toRad,Math.atan2(v[1],v[0])/toRad];
  };
  const sampledRoutes = new Map(data.routes.map((route) => {
    const points=[]; for(let i=0;i<route.length-1;i++)for(let n=0;n<=35;n++)points.push(slerp(data.airports[route[i]],data.airports[route[i+1]],n/35));
    return [route.join("-"),points];
  }));
  const palette = () => document.documentElement.dataset.theme === "light" ? {
    sphere:"#e5edf8",edge:"rgba(48,87,142,.28)",land:"rgba(60,103,163,.13)",grid:"rgba(48,87,142,.12)",route:"#386bb7",glow:"rgba(56,107,183,.3)"
  } : {sphere:"#09111f",edge:"rgba(131,174,246,.28)",land:"rgba(131,174,246,.10)",grid:"rgba(131,174,246,.10)",route:"#83aef6",glow:"rgba(131,174,246,.35)"};

  canvases.forEach((canvas) => {
    const ambient = canvas.dataset.routeGlobe === "ambient";
    const ctx = canvas.getContext("2d");
    const label = document.getElementById(ambient ? "heroGlobeRouteLabel" : "globeRouteLabel");
    let width=0,height=0,dpr=1,radius=0,rotationOffset=0,tilt=12*toRad,dragging=false,lastX=0,lastY=0,visible=true;
    const resize = () => { const rect=canvas.getBoundingClientRect(); dpr=Math.min(devicePixelRatio||1,ambient?1.35:2); width=rect.width;height=rect.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);radius=Math.min(width*(ambient ? .47 : .42),height*(ambient ? .47 : .45)); };
    const observer = new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; },{rootMargin:"180px"});
    observer.observe(canvas); new ResizeObserver(resize).observe(canvas); resize();

    const project = ([lat,lon],rotation) => { const p=lat*toRad,dl=lon*toRad-rotation,front=Math.sin(p)*Math.sin(tilt)+Math.cos(p)*Math.cos(tilt)*Math.cos(dl); return {x:width/2+radius*Math.cos(p)*Math.sin(dl),y:height/2-radius*(Math.sin(p)*Math.cos(tilt)-Math.cos(p)*Math.cos(dl)*Math.sin(tilt)),visible:front}; };
    const pathPoints = (points,rotation,close=false) => { ctx.beginPath();let pen=false;points.forEach(point=>{const p=project(point,rotation);if(p.visible>0){pen?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);pen=true;}else pen=false;});if(close&&pen)ctx.closePath(); };
    const drawSphere = (c,rotation) => {
      ctx.save();ctx.beginPath();ctx.arc(width/2,height/2,radius,0,Math.PI*2);ctx.fillStyle=c.sphere;ctx.shadowColor=c.glow;ctx.shadowBlur=ambient?28:45;ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=c.edge;ctx.stroke();ctx.clip();ctx.strokeStyle=c.grid;ctx.lineWidth=1;
      for(let lat=-60;lat<=60;lat+=30){const pts=[];for(let lon=-180;lon<=180;lon+=4)pts.push([lat,lon]);pathPoints(pts,rotation);ctx.stroke();}
      for(let lon=-180;lon<180;lon+=30){const pts=[];for(let lat=-90;lat<=90;lat+=3)pts.push([lat,lon]);pathPoints(pts,rotation);ctx.stroke();}
      continents.forEach(poly=>{pathPoints(poly.map(([lon,lat])=>[lat,lon]),rotation,true);ctx.fillStyle=c.land;ctx.fill();ctx.strokeStyle=c.edge;ctx.stroke();});ctx.restore();
    };
    const drawRoute = (route,c,rotation,alpha=.25,progress=1,plane=false) => {
      const pts=sampledRoutes.get(route.join("-")),limit=Math.max(2,Math.floor(pts.length*progress));ctx.save();ctx.strokeStyle=c.route;ctx.globalAlpha=alpha;ctx.lineWidth=ambient?1:1.15;ctx.shadowColor=c.route;ctx.shadowBlur=plane?8:0;pathPoints(pts.slice(0,limit),rotation);ctx.stroke();ctx.restore();
      if(plane&&limit>2){const p=project(pts[limit-1],rotation),prev=project(pts[limit-2],rotation);if(p.visible>0){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(p.y-prev.y,p.x-prev.x));ctx.globalAlpha=ambient ? .72 : 1;ctx.fillStyle=c.route;ctx.shadowColor=c.route;ctx.shadowBlur=10;ctx.font=`${ambient?13:15}px system-ui`;ctx.fillText("✈",-7,5);ctx.restore();}}
    };
    const drawAirports = (c,rotation) => {ctx.fillStyle=c.route;new Set(data.routes.flat()).forEach(code=>{const p=project(data.airports[code],rotation);if(p.visible>0){ctx.globalAlpha=ambient ? .38 : .65;ctx.beginPath();ctx.arc(p.x,p.y,ambient?1.4:1.8,0,Math.PI*2);ctx.fill();}});ctx.globalAlpha=1;};
    const render = (now=0) => {
      if(visible&&!document.hidden){const c=palette(),cycle=reducedMotion?0:Math.floor(now/duration),progress=reducedMotion?1:(now%duration)/duration,active=featured[cycle%featured.length]||data.routes[0],rotation=-72*toRad+rotationOffset+(reducedMotion?0:now*.000012);ctx.clearRect(0,0,width,height);drawSphere(c,rotation);data.routes.forEach(route=>drawRoute(route,c,rotation,ambient ? .075 : .11));drawRoute(active,c,rotation,ambient ? .62 : .95,Math.min(1,progress*1.28),!reducedMotion);drawAirports(c,rotation);if(label)label.textContent=active.join(" → ");}
      requestAnimationFrame(render);
    };
    if(!ambient){const start=e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.classList.add("dragging");canvas.setPointerCapture?.(e.pointerId);};const move=e=>{if(!dragging)return;rotationOffset-=(e.clientX-lastX)*.006;tilt=Math.max(-1.15,Math.min(1.15,tilt+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY;};const end=()=>{dragging=false;canvas.classList.remove("dragging");};canvas.addEventListener("pointerdown",start);canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerup",end);canvas.addEventListener("pointercancel",end);}
    requestAnimationFrame(render);
  });
})();
