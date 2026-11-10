'use client';
import {useState} from 'react';
import {createClient} from '../../lib/supabase/browser';
import AppearanceControls from '../appearance-controls';
export default function Login({configured}:{configured:boolean}){
 const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[recovery,setRecovery]=useState(false);
 async function signIn(e:React.FormEvent){
  e.preventDefault();setBusy(true);setMessage('');
  try{
   const supabase=createClient();
   if(recovery){
    const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:false,emailRedirectTo:window.location.origin+'/auth/callback'}});
    setMessage(error?'Nie udało się wysłać linku. Spróbuj ponownie za chwilę.':'Jeśli konto istnieje, wysłaliśmy link do ustawienia hasła. Otwórz go w tej samej przeglądarce na tym urządzeniu.');
   }else{
    const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
    if(error)setMessage('Nie udało się zalogować. Sprawdź e-mail i hasło.');
    else{setPassword('');window.location.replace('/');}
   }
  }catch{setMessage('Logowanie jest chwilowo niedostępne. Spróbuj ponownie.');}finally{setBusy(false);}
 }
 return <main className="app-login">
  <div className="entry-shell">
   <header className="entry-header">
    <span className="entry-brand"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M4 21c8 0 4-13 12-13s4 13 12 13" strokeLinecap="round"/></svg>spokojnie<span>.</span></span>
    <AppearanceControls/>
   </header>

   <div className="entry-body">
    <section className="entry-story" aria-labelledby="entry-title">
     <h1 id="entry-title">Twoje finanse.<br/><em>Na spokojnie.</em></h1>
     <p className="entry-intro">Wydatki, budżet i inwestycje w jednym miejscu.</p>
    </section>

    <section data-lens="access" data-glass="access" className="entry-access" aria-labelledby="entry-access-title">
     <h2 id="entry-access-title">{recovery?'Ustaw swoje hasło.':'Zaloguj się'}</h2>
     <p className="entry-access-intro">{recovery?'Jednorazowy link pozwoli Ci ustawić pierwsze hasło albo odzyskać dostęp do konta.':'Użyj adresu e-mail i hasła do swojego konta.'}</p>
     {configured?<form className="entry-form" onSubmit={signIn} aria-busy={busy}>
      <label htmlFor="entry-email">Twój adres e-mail</label>
      <div className="entry-input-wrap"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg><input id="entry-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" inputMode="email" spellCheck={false} placeholder="twoj@email.pl" required disabled={busy}/></div>
      {!recovery&&<><label className="password-label" htmlFor="entry-password">Hasło</label><div className="entry-input-wrap password-input"><input id="entry-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required disabled={busy}/></div></>}
      <button className="entry-submit" disabled={busy} type="submit"><span>{busy?(recovery?'Wysyłanie…':'Logowanie…'):(recovery?'Wyślij link do ustawienia hasła':'Zaloguj się')}</span>{busy?<span className="entry-spinner" aria-hidden="true"/>:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>}</button>
      <button type="button" className="entry-recovery" disabled={busy} onClick={()=>{setRecovery(!recovery);setPassword('');setMessage('');}}>{recovery?'Wróć do logowania hasłem':'Ustaw lub odzyskaj hasło'}</button>
     </form>:<div className="entry-config-note">Aplikacja czeka na konfigurację Supabase. Instrukcja wdrożenia znajduje się w repozytorium.</div>}
     <p className={`entry-message${message?' is-visible':''}`} role="status" aria-live="polite">{message}</p>
     <div className="entry-private-note"><span className="entry-private-dot"/><p>Prywatne, tak jak Twoje finanse.<br/><span>Dostęp ma tylko właściciel konta.</span></p></div>
    </section>
   </div>

  </div>
 </main>;
}
