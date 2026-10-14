import {configured} from '../../lib/supabase/server';
import Login from './sign-in';
export const dynamic='force-dynamic';
export default function Page(){return <Login configured={configured()}/>;}
