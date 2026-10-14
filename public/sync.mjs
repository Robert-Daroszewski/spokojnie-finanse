import { validateState } from './core.mjs';
export class CloudSync {
 constructor({key,storage=localStorage,fetcher=(...args)=>globalThis.fetch(...args),onStatus,onRemote}) {
  this.key=key+':cloud';this.storage=storage;this.fetcher=fetcher;this.onStatus=onStatus;this.onRemote=onRemote;
  try{this.meta=JSON.parse(storage.getItem(this.key)||'{}');}catch{this.meta={};}
  this.revision=this.meta.revision||0;this.enabled=false;this.phase='loading';this.busy=false;this.desired=null;
 }
 status(phase,message=''){this.phase=phase;this.message=message;this.onStatus?.(phase,message);}
 persist(pending){this.meta={revision:this.revision,enabled:this.enabled,pending};this.storage.setItem(this.key,JSON.stringify(this.meta));}
 async getRemote(){const res=await this.fetcher('/api/state',{cache:'no-store'});if(!res.ok)throw Error(res.status===401?'Sesja wygasła. Odśwież stronę i zaloguj się.':'Chmura jest chwilowo niedostępna. Twoje lokalne dane są zachowane.');const remote=await res.json();if(remote.state)validateState(remote.state);if(!Number.isSafeInteger(remote.revision)||remote.revision<0)throw Error('Nieprawidłowa odpowiedź serwera.');return remote;}
 async bootstrap(local){
  this.status('loading');
  try{
   const remote=await this.getRemote();
   if(remote.state){
    if((this.meta.pending&&this.revision!==remote.revision)||(!this.meta.enabled&&local.updatedAt&&JSON.stringify(local)!==JSON.stringify(remote.state))){this.remote=remote;this.status('conflict');return;}
    this.enabled=true;
    if(this.meta.pending){this.revision=remote.revision;this.status('ready');this.save(local);}
    else{this.revision=remote.revision;this.onRemote(remote.state);this.persist(false);this.status('ready');}
   }else if(local.updatedAt){this.revision=0;this.status('migration');}
   else{this.enabled=true;this.revision=0;this.status('ready');this.save(local);}
  }catch(error){this.enabled=Boolean(this.meta.enabled);this.status('offline',error.message);}
 }
 save(state){
  if(!this.enabled||['conflict','migration'].includes(this.phase))return;
  this.desired=JSON.stringify(state);this.persist(true);this.pump();
 }
 async pump(){
  if(this.busy||!this.desired||!this.enabled)return;
  this.busy=true;this.status('saving');
  try{
   while(this.desired){
    const sent=this.desired;
    const res=await this.fetcher('/api/state',{method:'PUT',headers:{'Content-Type':'application/json','X-Spokojnie-Client':'1'},body:JSON.stringify({revision:this.revision,state:JSON.parse(sent)})});
    if(res.status===409){this.enabled=false;this.status('conflict');return;}
    if(!res.ok){const data=await res.json().catch(()=>({}));throw Error(data.error||'Nie udało się zapisać w chmurze.');}
    const data=await res.json();if(data.revision!==this.revision+1)throw Error('Nieprawidłowe potwierdzenie zapisu.');
    this.revision=data.revision;
    if(this.desired===sent)this.desired=null;
    this.persist(Boolean(this.desired));
   }
   this.status('ready');
  }catch(error){this.status('offline',error.message);}finally{this.busy=false;}
 }
 async migrate(local){this.enabled=true;this.revision=0;this.status('ready');this.save(local);}
 async retry(local){if(this.busy)return;await this.bootstrap(local);}
 async useCloud(){
  if(this.busy)throw Error('Poczekaj na zakończenie zapisu.');
  const remote=await this.getRemote();if(!remote.state)throw Error('W chmurze nie ma jeszcze zapisanych danych.');
  this.onRemote(remote.state);this.desired=null;this.revision=remote.revision;this.enabled=true;this.persist(false);this.status('ready');
 }
 async keepLocal(local){
  if(this.busy)throw Error('Poczekaj na zakończenie zapisu.');
  const remote=await this.getRemote();this.revision=remote.revision;this.enabled=true;this.status('ready');this.save(local);
 }
}
