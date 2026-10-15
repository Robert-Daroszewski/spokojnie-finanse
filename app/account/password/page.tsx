import {redirect} from 'next/navigation';
import {ownerClient} from '../../../lib/supabase/server';
import PasswordForm from './password-form';
export const dynamic='force-dynamic';
export default async function PasswordPage(){
 if(!await ownerClient())redirect('/login');
 return <PasswordForm/>;
}
