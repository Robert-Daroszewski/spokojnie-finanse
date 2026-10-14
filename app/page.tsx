import {redirect} from 'next/navigation';
import {ownerClient,configured} from '../lib/supabase/server';
import Organizer from './organizer';
export const dynamic='force-dynamic';
export default async function Home(){if(!configured())redirect('/login');if(!await ownerClient())redirect('/login');return <Organizer/>;}
