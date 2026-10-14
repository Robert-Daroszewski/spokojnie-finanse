import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export function configured(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY&&process.env.OWNER_EMAIL);}
export async function createClient(){
 if(!configured())throw Error('Najpierw skonfiguruj Supabase i właściciela aplikacji.');
 const cookieStore=await cookies();
 return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll(){return cookieStore.getAll();},setAll(items){try{items.forEach(({name,value,options})=>cookieStore.set(name,value,options));}catch{/* Read-only server components use the proxy to refresh cookies. */}}}});
}
export async function ownerClient(){
 if(!configured())return null;const supabase=await createClient(),{data:{user},error}=await supabase.auth.getUser();
 if(error||!user||user.email?.toLowerCase()!==process.env.OWNER_EMAIL!.trim().toLowerCase())return null;
 return {supabase,user};
}
