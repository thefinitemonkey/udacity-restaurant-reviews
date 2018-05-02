import idb from "idb";

var cacheID = "mws-restaruant-001";

const dbPromise = idb.open("fm-udacity-restaurant", 1, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore("restaurants", {keyPath: "id"});
  }
});

self.addEventListener("install", event => {
  console.log("Initializing sw");
  event.waitUntil(
    caches.open(cacheID).then(cache => {
      console.log("Cache opened");
      return cache
        .addAll([
          "/",
          "/index.html",
          "/restaurant.html",
          "/css/styles.css",
          "/js/dbhelper.js",
          "/js/main.js",
          "/js/restaurant_info.js",
          "/img/na.png",
          "/js/register.js"
        ])
        .catch(error => {
          console.log("Caches open failed: " + error);
        });
    })
  );
});

console.log("Adding fetch listener");
self.addEventListener("fetch", event => {
  console.log("Fetch event: ", event);
  let cacheRequest = event.request;
  let cacheUrlObj = new URL(event.request.url);
  if (event.request.url.indexOf("restaurant.html") > -1) {
    const cacheURL = "restaurant.html";
    cacheRequest = new Request(cacheURL);
  }

  handleNonAJAXEvent(event, cacheRequest);
});

const handleNonAJAXEvent = (event, cacheRequest) => {
  console.log("Handling non-ajax: ", event);
  event.respondWith(
    caches.match(cacheRequest).then(response => {
      return (
        response ||
        fetch(event.request)
          .then(fetchResponse => {
            return caches.open(cacheID).then(cache => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
          .catch(error => {
            if (event.request.url.indexOf(".jpg") > -1) {
              return caches.match("/img/na.png");
            }
            return new Response(
              "Application is not connected to the internet",
              {
                status: 404,
                statusText: "Application is not connected to the internet"
              }
            );
          })
      );
    })
  );
};
