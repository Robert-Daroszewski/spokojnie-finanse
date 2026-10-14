'use client';
import { useEffect } from 'react';
export default function Organizer() {
  useEffect(() => {
    if (document.querySelector('script[data-spokojnie]')) return;
    const script = document.createElement('script');
    script.type = 'module'; script.src = '/app.mjs'; script.dataset.spokojnie = 'true';
    script.onerror = () => { const node = document.getElementById('app'); if (node) node.textContent = 'Nie udało się załadować aplikacji. Odśwież stronę.'; };
    document.body.appendChild(script);
  }, []);
  return <><div id="app"><div className="boot-screen"><span className="boot-brand">spokojnie.</span><span>Przygotowujemy Twoją przestrzeń.</span></div></div><div id="toast" role="status" aria-live="polite" /><dialog id="modal" aria-labelledby="modal-title" /><input id="restore-file" type="file" accept=".json,application/json" hidden /></>;
}
