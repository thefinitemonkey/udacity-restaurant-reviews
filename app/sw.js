import idb from "idb";

var cacheID = "mws-restaruant-001";

const dbPromise = idb.open("fm-udacity-restaurant", 2, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore("restaurants", {keyPath: "id"});
    case 1:
      upgradeDB.createObjectStore("reviews", {keyPath: "id"})
  }
});

self.addEventListener("install", event => {
  event.waitUntil(caches.open(cacheID).then(cache => {
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
  }));
});

self.addEventListener("fetch", event => {
  let cacheRequest = event.request;
  let cacheUrlObj = new URL(event.request.url);
  if (event.request.url.indexOf("restaurant.html") > -1) {
    const cacheURL = "restaurant.html";
    cacheRequest = new Request(cacheURL);
  }

  // Requests going to the API get handled separately from those going to other
  // destinations
  const checkURL = new URL(event.request.url);
  if (checkURL.port === "1337") {
    const parts = checkURL
      .pathname
      .split("/");
    const id = parts[parts.length - 1] === "restaurants"
      ? "-1"
      : parts[parts.length - 1];
    handleAJAXEvent(event, id);
  } else {
    handleNonAJAXEvent(event, cacheRequest);
  }
});

const handleAJAXEvent = (event, id) => {
  // Check the IndexedDB to see if the JSON for the API has already been stored
  // there. If so, return that. If not, request it from the API, store it, and
  // then return it back.
  event.respondWith(dbPromise.then(db => {
    return db
      .transaction("restaurants")
      .objectStore("restaurants")
      .get(id);
  }).then(data => {
    return ((data && data.data) || fetch(event.request).then(fetchResponse => fetchResponse.json()).then(json => {
      return dbPromise.then(db => {
        const tx = db.transaction("restaurants", "readwrite");
        tx
          .objectStore("restaurants")
          .put({id: id, data: json});
        return json;
      });
    }));
  }).then(finalResponse => {
    return new Response(JSON.stringify(finalResponse));
  }).catch(error => {
    return new Response("Error fetching data", {status: 500});
  }));
};

const handleNonAJAXEvent = (event, cacheRequest) => {
  // Check if the HTML request has previously been cached. If so, return the
  // response from the cache. If not, fetch the request, cache it, and then return
  // it.
  event.respondWith(caches.match(cacheRequest).then(response => {
    return (response || fetch(event.request).then(fetchResponse => {
      return caches
        .open(cacheID)
        .then(cache => {
          if (fetchResponse.url.indexOf("browser-sync") === -1) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
    }).catch(error => {
      if (event.request.url.indexOf(".jpg") > -1) {
        return caches.match("/img/na.png");
      }
      return new Response("Application is not connected to the internet", {
        status: 404,
        statusText: "Application is not connected to the internet"
      });
    }));
  }));
};
