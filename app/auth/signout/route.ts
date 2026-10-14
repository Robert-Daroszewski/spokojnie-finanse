import {NextResponse} from 'next/server';
import {createClient} from '../../../lib/supabase/server';
export async function POST(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Niedozwolone żądanie.',{status:403});const supabase=await createClient();await supabase.auth.signOut();return NextResponse.redirect(new URL('/login',request.url),303);}
