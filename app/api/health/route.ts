import {ownerClient} from '../../../lib/supabase/server';
import {json} from '../../../lib/http';
export const dynamic='force-dynamic';
export async function GET(){const owner=await ownerClient();if(!owner)return json({error:'Zaloguj się.'},401);const {error}=await owner.supabase.from('finance_snapshots').select('revision').limit(1);return error?json({status:'unavailable'},503):json({status:'ok',version:3});}
