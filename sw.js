const CACHE = "kakei-fixed-v1";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE).then(function(cache){ return cache.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event){
  if(event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then(function(response){
      var copy = response.clone();
      caches.open(CACHE).then(function(cache){ cache.put(event.request, copy); });
      return response;
    }).catch(function(){
      return caches.match(event.request).then(function(hit){
        return hit || caches.match("./index.html");
      });
    })
  );
});
