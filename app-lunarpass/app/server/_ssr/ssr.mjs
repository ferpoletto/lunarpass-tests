var e;function t(t){e={error:t,at:Date.now()}}typeof globalThis.addEventListener==`function`&&(globalThis.addEventListener(`error`,e=>t(e.error??e)),globalThis.addEventListener(`unhandledrejection`,e=>t(e.reason)));function n(){if(!e)return;if(Date.now()-e.at>5e3){e=void 0;return}let{error:t}=e;return e=void 0,t}function r(){return`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`}var i;async function a(){return i||=import(`./server-CX0PtBVe.mjs`).then(e=>e.s).then(e=>e.t).then(e=>e.default??e),i}async function o(e){if(e.status<500||!(e.headers.get(`content-type`)??``).includes(`application/json`))return e;let t=await e.clone().text();return s(t)?(console.error(n()??Error(`h3 swallowed SSR error: ${t}`)),new Response(r(),{status:500,headers:{"content-type":`text/html; charset=utf-8`}})):e}function s(e){try{let t=JSON.parse(e);return t.unhandled===!0&&t.message===`HTTPError`}catch{return!1}}var c={async fetch(e,t,n){try{return await o(await(await a()).fetch(e,t,n))}catch(e){return console.error(e),new Response(r(),{status:500,headers:{"content-type":`text/html; charset=utf-8`}})}}};export{c as default,r as t};