/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "62fb041fe633c0f8c9e123b2c9eeecb5"
  }, {
    "url": "pwa-512x512.png",
    "revision": "ea1547bcc67bcff3dc0b9bc983409775"
  }, {
    "url": "pwa-192x192.png",
    "revision": "4f0268b03a62cb885e82ee411d8b46c2"
  }, {
    "url": "manifest.webmanifest",
    "revision": "25d1b3c79f1c30dbe4741e870ce90b56"
  }, {
    "url": "index.html",
    "revision": "9f990842756f17c2252d7b840548131e"
  }, {
    "url": "icon.svg",
    "revision": "d2d70c66496c13a38c8a4c384a81edea"
  }, {
    "url": "icon-maskable.svg",
    "revision": "6914ef03c8486c2670f6b1e4db27da27"
  }, {
    "url": "favicon.ico",
    "revision": "891b288a69126a5621cb5624b1570042"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "cc3b68dd4ddd08cb3d0c3b8ac82a93b8"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/web-BNKcRD9Q.js",
    "revision": null
  }, {
    "url": "assets/index-cksFChpL.js",
    "revision": null
  }, {
    "url": "assets/index-Cxem28Yi.css",
    "revision": null
  }, {
    "url": ".nojekyll",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "cc3b68dd4ddd08cb3d0c3b8ac82a93b8"
  }, {
    "url": "favicon.ico",
    "revision": "891b288a69126a5621cb5624b1570042"
  }, {
    "url": "icon-maskable.svg",
    "revision": "6914ef03c8486c2670f6b1e4db27da27"
  }, {
    "url": "icon.svg",
    "revision": "d2d70c66496c13a38c8a4c384a81edea"
  }, {
    "url": "pwa-192x192.png",
    "revision": "4f0268b03a62cb885e82ee411d8b46c2"
  }, {
    "url": "pwa-512x512.png",
    "revision": "ea1547bcc67bcff3dc0b9bc983409775"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "62fb041fe633c0f8c9e123b2c9eeecb5"
  }, {
    "url": ".well-known/assetlinks.json",
    "revision": "7534f9222bbdd8780bcdee3ea50a0205"
  }, {
    "url": "manifest.webmanifest",
    "revision": "25d1b3c79f1c30dbe4741e870ce90b56"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/\/\.well-known\//, /\/downloads\/.*\.apk$/]
  }));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
