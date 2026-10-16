import {ownerClient} from '../../../lib/supabase/server';
import {json,allowedWrite} from '../../../lib/http';
import {searchInstruments,loadInstrument,validateMarketRequest} from '../../../lib/market-data.mjs';
// Route handlers are dynamic by default; only public upstream data is cached.
// Avoid force-dynamic here, which would also disable the upstream fetch cache.
export const maxDuration=60;
export async function GET(request:Request){
 if(!await ownerClient())return json({error:'Zaloguj się.'},401);
 const q=new URL(request.url).searchParams.get('q')||'';
 if(q.trim().length<2||q.length>80)return json({error:'Wpisz od 2 do 80 znaków.'},400);
 try{return json({instruments:await searchInstruments(q)});}catch{return json({error:'Wyszukiwarka instrumentów jest chwilowo niedostępna. Spróbuj ponownie.'},503);}
}
export async function POST(request:Request){
 if(!await ownerClient())return json({error:'Zaloguj się.'},401);
 if(!allowedWrite(request))return json({error:'Niedozwolone żądanie.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Wymagany JSON.'},415);
 let instruments:Array<{symbol:string;from:string}>;
 try{const text=await request.text();if(text.length>4000)throw Error();const body=JSON.parse(text);instruments=body.instruments;if(!Array.isArray(instruments)||!instruments.length||instruments.length>5)throw Error();for(const r of instruments)validateMarketRequest(r.symbol,r.from);}catch{return json({error:'Wybierz od 1 do 5 instrumentów z poprawną datą zakupu.'},400);}
 const items=await Promise.all(instruments.map(async r=>{try{return await loadInstrument(r.symbol,r.from);}catch{return{symbol:r.symbol,error:'Nie udało się pobrać wyceny. Zachowano ostatnią znaną wartość.'};}}));
 return json({items,source:'Yahoo Finance',fxSource:'NBP',fetchedAt:new Date().toISOString()});
}
