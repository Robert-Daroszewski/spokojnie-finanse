export const MAX_RECEIPT_SIZE=3_000_000;
export const receiptKey=(userId,id)=>`receipts/${encodeURIComponent(userId)}/${id}`;
export const validReceiptId=id=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);
export async function inspectReceipt(file){
 if(!file||typeof file.arrayBuffer!=='function'||file.size<1||file.size>MAX_RECEIPT_SIZE)throw Error('Wybierz PDF, JSON albo zdjęcie JPEG/PNG/WebP do 3 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer()),head=new TextDecoder().decode(bytes.slice(0,12));let type;
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)type='image/jpeg';
 else if(bytes.length>=8&&bytes.slice(0,8).every((v,i)=>v===[137,80,78,71,13,10,26,10][i]))type='image/png';
 else if(head.startsWith('RIFF')&&head.slice(8,12)==='WEBP')type='image/webp';
 else if(head.startsWith('%PDF-'))type='application/pdf';
 else{try{const value=JSON.parse(new TextDecoder().decode(bytes));if(!value||typeof value!=='object')throw Error();type='application/json';}catch{throw Error('Nieobsługiwany plik. Użyj PDF, JSON albo zdjęcia JPEG/PNG/WebP.');}}
 const sha256=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
 return {bytes,type,sha256,fileName:String(file.name||'paragon').replace(/[\r\n\x00]/g,'').slice(0,160),size:bytes.length};
}
