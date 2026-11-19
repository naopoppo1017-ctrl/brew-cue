const CACHE='brew-cue-ui-2026-11-19-v12-edge34';
const FONTS='cue-fonts-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&(k.startsWith('brew-cue')||k.startsWith('brewcue'))).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const host=new URL(event.request.url).hostname;
  if(host==='fonts.googleapis.com'||host==='fonts.gstatic.com'){
    event.respondWith(caches.open(FONTS).then(cache=>cache.match(event.request).then(hit=>{const net=fetch(event.request).then(r=>{if(r.ok)cache.put(event.request,r.clone());return r;}).catch(()=>hit);return hit||net;})));
    return;
  }
  if(new URL(event.request.url).origin!==self.location.origin)return;
  const url=new URL(event.request.url);
  if(event.request.mode==='navigate'||url.pathname.endsWith('/index.html')){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request).then(x=>x||caches.match('./index.html'))));
  }else{
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;})));
  }
});
