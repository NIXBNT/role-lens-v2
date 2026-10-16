import fs from 'node:fs/promises';
import {build} from 'esbuild';
const frontend=await build({entryPoints:['ui/app.mjs'],bundle:true,write:false,format:'esm',target:'es2022',minify:true});
const seed=JSON.parse(await fs.readFile('seed.json','utf8'));
const assets={
 '/':{type:'text/html; charset=utf-8',body:await fs.readFile('ui/index.html','utf8')},
 '/style.css':{type:'text/css',body:await fs.readFile('ui/style.css','utf8')},
 '/app.js':{type:'text/javascript',body:frontend.outputFiles[0].text},
 '/pdf-worker.mjs':{type:'text/javascript',body:await fs.readFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','utf8')}
};
const source=`import {createBackend} from './src/backend.mjs';\nconst assets=${JSON.stringify(assets)};\nconst api=createBackend(${JSON.stringify(seed)});\nexport default {async fetch(request,env){const url=new URL(request.url);if(url.pathname.startsWith('/api/'))return api(request,env);const a=assets[url.pathname];if(!a)return new Response('Not found',{status:404});if(request.method!=='GET')return new Response('Method not allowed',{status:405});return new Response(a.body,{headers:{'Content-Type':a.type,'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Cache-Control':url.pathname==='/'?'no-store':'public,max-age=300'}});}};`;
const output=await build({stdin:{contents:source,resolveDir:process.cwd(),sourcefile:'worker-source.mjs'},bundle:true,write:false,format:'esm',platform:'browser',target:'es2022',minify:true});await fs.mkdir('worker',{recursive:true});await fs.writeFile('worker/index.js',output.outputFiles[0].text);console.log('Compiled Worker + browser assets:',output.outputFiles[0].contents.length,'bytes');
