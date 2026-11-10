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
    <span className="entry-header-note"><span/> Finanse po Twojemu</span>
    <AppearanceControls/>
   </header>

   <div className="entry-body">
    <section className="entry-story" aria-labelledby="entry-title">
     <span className="entry-eyebrow">Małe kroki. Dobre decyzje.</span>
     <h1 id="entry-title">Twoje finanse.<br/><em>Na spokojnie.</em></h1>
     <p className="entry-intro">Codzienne wydatki i większe plany.<br/>Wreszcie w jednym, spokojnym miejscu.</p>

     <div className="entry-art" data-glass="sculpture" aria-hidden="true"><div className="entry-art-halo"/><img className="entry-sculpture" src="/glass-sculpture.svg" width="420" height="320" alt="" draggable="false"/><span className="art-coordinate">S / 01</span></div>
     <div className="entry-capabilities"><span>Codzienne wydatki</span><span>Plany i cele</span><span>Portfel inwestycji</span></div>
    </section>

    <section data-glass="access" className="entry-access" aria-labelledby="entry-access-title">
     <div className="entry-access-heading"><span className="entry-section-number">TWOJA PRZESTRZEŃ</span><svg className="entry-lock" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></svg></div>
     <h2 id="entry-access-title">{recovery?'Ustaw swoje hasło.':'Witaj u siebie.'}</h2>
     <p className="entry-access-intro">{recovery?'Jednorazowy link pozwoli Ci ustawić pierwsze hasło albo odzyskać dostęp do konta.':'Wróć do swoich wydatków, planów i oszczędności.'}</p>
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

   <footer className="entry-footer"><span>Mniej chaosu. Więcej spokoju.</span><span className="entry-phone-note"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17h2"/></svg>Przy Tobie. Także na telefonie.</span><span className="entry-footer-mark" aria-hidden="true">S / F</span></footer>
  </div>
 </main>;
}
