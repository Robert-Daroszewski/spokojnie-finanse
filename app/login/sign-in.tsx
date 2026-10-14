'use client';
import {useState} from 'react';
import {createClient} from '../../lib/supabase/browser';
export default function Login({configured}:{configured:boolean}){
 const[email,setEmail]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function signIn(e:React.FormEvent){e.preventDefault();setBusy(true);try{const {error}=await createClient().auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:false,emailRedirectTo:window.location.origin+'/auth/callback'}});setMessage(error?'Nie udało się wysłać linku. Sprawdź adres i aktywację konta właściciela.':'Sprawdź swoją pocztę. Otwórz link w tej samej przeglądarce na tym urządzeniu.');}catch{setMessage('Logowanie jest chwilowo niedostępne. Spróbuj ponownie.');}finally{setBusy(false);}}
 return <main className="app-login">
  <div className="entry-shell">
   <header className="entry-header">
    <span className="entry-brand"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M4 21c8 0 4-13 12-13s4 13 12 13" strokeLinecap="round"/></svg>spokojnie<span>.</span></span>
    <span className="entry-header-note"><span/> Finanse po Twojemu</span>
   </header>

   <div className="entry-body">
    <section className="entry-story" aria-labelledby="entry-title">
     <span className="entry-eyebrow">Małe kroki. Dobre decyzje.</span>
     <h1 id="entry-title">Twoje pieniądze.<br/><em>Twoje tempo.</em></h1>
     <p className="entry-intro">Codzienne wydatki i większe plany.<br/>Wreszcie w jednym, spokojnym miejscu.</p>

     <div className="entry-art" aria-hidden="true">
      <svg className="entry-landscape" viewBox="0 0 580 236" fill="none">
       <defs><clipPath id="entry-landscape-clip"><path d="M0 0h580v236H0z"/></clipPath></defs>
       <g clipPath="url(#entry-landscape-clip)">
        <path className="entry-art-rule" d="M0 205.5h580"/>
        <path className="entry-art-contour contour-one" d="M60 205a178 178 0 0 1 356 0"/>
        <path className="entry-art-contour contour-two" d="M86 205a152 152 0 0 1 304 0"/>
        <path className="entry-art-contour contour-three" d="M112 205a126 126 0 0 1 252 0"/>
        <path className="entry-art-contour contour-four" d="M138 205a100 100 0 0 1 200 0"/>
        <path className="entry-art-contour contour-five" d="M164 205a74 74 0 0 1 148 0"/>
        <path className="entry-art-core" d="M190 205a48 48 0 0 1 96 0z"/>
        <path className="entry-art-vertical" d="M238 18v213"/>
        <path className="entry-art-horizon" d="M24 181h430M24 193h430M24 217h430"/>
        <path className="entry-art-ray" d="m238 205 130-130"/>
        <circle className="entry-art-orbit" cx="368" cy="75" r="7"/>
        <circle className="entry-art-satellite" cx="471" cy="130" r="27"/>
        <path className="entry-art-satellite-mark" d="M471 119v22m-11-11h22"/>
        <path className="entry-art-caption-rule" d="M447 181h53"/>
       </g>
      </svg>
      <div className="entry-art-caption"><span>Równowaga, na co dzień.</span><span className="entry-art-coordinate">SP / 01</span></div>
     </div>
    </section>

    <section className="entry-access" aria-labelledby="entry-access-title">
     <div className="entry-access-heading"><span className="entry-section-number">01 / TWOJA PRZESTRZEŃ</span><svg className="entry-lock" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></svg></div>
     <h2 id="entry-access-title">Witaj u siebie.</h2>
     <p className="entry-access-intro">Jeden link z poczty i jesteś na miejscu.<br/>Bez zapamiętywania kolejnego hasła.</p>
     {configured?<form className="entry-form" onSubmit={signIn} aria-busy={busy}>
      <label htmlFor="entry-email">Twój adres e-mail</label>
      <div className="entry-input-wrap"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg><input id="entry-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" inputMode="email" spellCheck={false} placeholder="twoj@email.pl" required disabled={busy}/></div>
      <button className="entry-submit" disabled={busy} type="submit"><span>{busy?'Wysyłanie…':'Wyślij link do logowania'}</span>{busy?<span className="entry-spinner" aria-hidden="true"/>:<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>}</button>
     </form>:<div className="entry-config-note">Aplikacja czeka na konfigurację Supabase. Instrukcja wdrożenia znajduje się w repozytorium.</div>}
     <p className={`entry-message${message?' is-visible':''}`} role="status" aria-live="polite">{message}</p>
     <div className="entry-private-note"><span className="entry-private-dot"/><p>Prywatne, tak jak Twoje finanse.<br/><span>Dostęp ma tylko właściciel konta.</span></p></div>
    </section>
   </div>

   <footer className="entry-footer"><span>Mniej chaosu. Więcej spokoju.</span><span className="entry-phone-note"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17h2"/></svg>Przy Tobie. Także na telefonie.</span><span className="entry-footer-mark" aria-hidden="true">S / F</span></footer>
  </div>
 </main>;
}
