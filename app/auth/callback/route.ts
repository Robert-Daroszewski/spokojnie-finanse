import {NextResponse} from 'next/server';
import {createClient} from '../../../lib/supabase/server';
export async function GET(request:Request){
 const url=new URL(request.url),code=url.searchParams.get('code');
 if(code){
  const supabase=await createClient();
  const {data,error}=await supabase.auth.exchangeCodeForSession(code);
  if(!error&&data.user?.email?.toLowerCase()===process.env.OWNER_EMAIL?.trim().toLowerCase()){
   const response=NextResponse.redirect(new URL('/account/password',url.origin));
   response.headers.set('Cache-Control','private, no-store');return response;
  }
  if(!error)await supabase.auth.signOut();
 }
 const response=NextResponse.redirect(new URL('/login?error=expired',url.origin));
 response.headers.set('Cache-Control','private, no-store');return response;
}
