export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export function allowedWrite(r:Request){return r.headers.get('x-spokojnie-client')==='1'&&r.headers.get('sec-fetch-site')!=='cross-site'&&(!r.headers.get('origin')||r.headers.get('origin')===new URL(r.url).origin);}
