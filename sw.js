const C='hisab-tasdeek-v12';
const CORE=['./','index.html','manifest.json','xlsx.full.min.js'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(async c=>{
    for(const u of CORE){
      try{
        const request=new Request(u,{cache:'reload'});
        const response=await fetch(request);
        if(response.ok)await c.put(u,response);
      }catch(e){}
    }
  }));
});
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(x=>x!==C).map(x=>caches.delete(x)));
  await self.clients.claim();
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  await Promise.all(windows.map(client=>client.navigate(client.url).catch(()=>{})));
})()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(resp=>{
      const cp=resp.clone();caches.open(C).then(c=>c.put('./',cp)).catch(()=>{});return resp;
    }).catch(()=>caches.match('./').then(r=>r||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    const cp=resp.clone();caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{});return resp;
  })));
});
