import {ownerClient} from '../../../lib/supabase/server';
import {json,allowedWrite} from '../../../lib/http';
import {validateState} from '../../../public/core.mjs';
export const dynamic='force-dynamic';
export async function GET(){const owner=await ownerClient();if(!owner)return json({error:'Zaloguj się.'},401);const {data,error}=await owner.supabase.from('finance_snapshots').select('state_json,revision,updated_at').eq('user_id',owner.user.id).maybeSingle();if(error)return json({error:'Baza jest chwilowo niedostępna. Lokalne zapisy są zachowane.'},503);return json(data?{state:data.state_json,revision:data.revision,updatedAt:data.updated_at}:{state:null,revision:0,updatedAt:null});}
export async function PUT(request:Request){
 const owner=await ownerClient();if(!owner)return json({error:'Zaloguj się.'},401);if(!allowedWrite(request))return json({error:'Niedozwolone żądanie.'},403);if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Wymagany JSON.'},415);
 if(Number(request.headers.get('content-length')||0)>4_001_000)return json({error:'Maksymalny rozmiar stanu to 4 MB.'},413);
 let payload;try{const text=await request.text();if(new TextEncoder().encode(text).length>4_000_000)return json({error:'Maksymalny rozmiar stanu to 4 MB.'},413);payload=JSON.parse(text);if(!Number.isSafeInteger(payload.revision)||payload.revision<0)throw Error();validateState(payload.state);}catch{return json({error:'Nieprawidłowe dane finansowe.'},400);}
 const {data,error}=await owner.supabase.rpc('save_finance_snapshot',{expected_revision:payload.revision,new_state:payload.state});
 if(error)return error.code==='40001'?json({error:'Dane zmieniły się na innym urządzeniu.'},409):json({error:'Nie udało się zapisać w chmurze. Lokalna kopia jest zachowana.'},503);
 if(!data?.length)return json({error:'Dane zmieniły się na innym urządzeniu.'},409);return json({revision:Number(data[0].revision),updatedAt:data[0].updated_at});
}
