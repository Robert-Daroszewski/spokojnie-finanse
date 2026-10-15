'use client';
import {useState} from 'react';
import {createClient} from '../../../lib/supabase/browser';
export default function PasswordForm(){
 const[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function save(e:React.FormEvent){
  e.preventDefault();setMessage('');
  if(password.length<12){setMessage('Użyj przynajmniej 12 znaków.');return;}
  if(password!==confirm){setMessage('Hasła muszą być takie same.');return;}
  setBusy(true);
  try{
   const {error}=await createClient().auth.updateUser({password});
   if(error){setMessage('Nie udało się ustawić hasła. Użyj innego hasła lub otwórz świeży link do odzyskania dostępu.');setBusy(false);return;}
   setPassword('');setConfirm('');window.location.replace('/');
  }catch{setMessage('Nie udało się połączyć. Spróbuj ponownie.');setBusy(false);}
 }
 return <main className="app-login password-page"><div className="entry-shell">
  <header className="entry-header"><a className="entry-brand" href="/">spokojnie<span>.</span></a><span className="entry-header-note">Twoja prywatna przestrzeń</span></header>
  <section className="entry-access password-access" aria-labelledby="password-title">
   <span className="entry-section-number">DOSTĘP DO KONTA</span><h1 id="password-title">Ustaw swoje hasło.</h1>
   <p className="entry-access-intro">Przy kolejnym logowaniu wystarczy e-mail i hasło.<br/>Bez potwierdzania każdego wejścia w poczcie.</p>
   <form className="entry-form" onSubmit={save} aria-busy={busy}>
    <label htmlFor="new-password">Nowe hasło</label><div className="entry-input-wrap password-input"><input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)} disabled={busy} aria-describedby="password-help"/></div>
    <p id="password-help" className="entry-access-intro password-help">Minimum 12 znaków. Możesz użyć długiej frazy lub menedżera haseł.</p>
    <label htmlFor="confirm-password">Powtórz hasło</label><div className="entry-input-wrap password-input"><input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirm} onChange={e=>setConfirm(e.target.value)} disabled={busy}/></div>
    <button className="entry-submit" type="submit" disabled={busy}>{busy?'Zapisywanie…':'Zapisz hasło i przejdź do aplikacji'}</button>
   </form><p className={`entry-message${message?' is-visible':''}`} role="status" aria-live="polite">{message}</p><a className="entry-recovery" href="/">Wróć do aplikacji</a>
  </section>
 </div></main>;
}
