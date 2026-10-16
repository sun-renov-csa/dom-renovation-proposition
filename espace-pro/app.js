(()=>{
"use strict";
const KEY="domrenovation_espacepro_demo_v1";
const today=()=>new Date().toISOString().slice(0,10);
const euro=n=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(Number(n)||0);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];
const seed=()=>({
 requests:[
  {id:101,nom:"Contact démo A",telephone:"",ville:"Orléans",prestation:"Plâtrerie et enduits",date:today(),statut:"Nouveau",details:"Demande fictive : travaux de plâtrerie."},
  {id:102,nom:"Contact démo B",telephone:"",ville:"Saran",prestation:"Cloisons et placo",date:today(),statut:"En cours",details:"Demande fictive : pose de cloisons."},
  {id:103,nom:"Contact démo C",telephone:"",ville:"Ingré",prestation:"Finitions et rénovation",date:today(),statut:"Traité",details:"Demande fictive : reprise des finitions."},
  {id:104,nom:"Contact démo D",telephone:"",ville:"Orléans",prestation:"Plafonds et doublages",date:today(),statut:"Nouveau",details:"Demande fictive : aménagement de plafond."}
 ],
 clients:[
  {id:201,nom:"Client exemple A",telephone:"",ville:"Orléans",projet:"Plâtrerie et enduits"},
  {id:202,nom:"Client exemple B",telephone:"",ville:"Saran",projet:"Cloisons et placo"},
  {id:203,nom:"Client exemple C",telephone:"",ville:"Ingré",projet:"Finitions et rénovation"}
 ],
 quotes:[{id:301,ref:"DEMO-001",nom:"Client exemple A",prestation:"Plâtrerie et enduits",description:"Prestation illustrative, sans valeur contractuelle",quantite:1,prix:480,taux:0,date:today()}]
});
let data;
try{const from=JSON.parse(localStorage.getItem(KEY));data=from&&Array.isArray(from.requests)&&Array.isArray(from.clients)&&Array.isArray(from.quotes)?from:seed()}catch{data=seed()}
let currentPage="accueil";
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{notice("Stockage local indisponible. Les modifications peuvent être perdues.")}};
const datefmt=d=>{try{return new Date(d+"T12:00:00").toLocaleDateString("fr-FR")}catch{return d}};
let toastTimer;
function notice(message){const t=$("#toast");t.textContent=message;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),3500)}
const id=()=>Date.now()+Math.floor(Math.random()*300);
const statusClass=s=>s==="Traité"?"Traité":s==="En cours"?"En-cours":"Nouveau";
const statusChip=s=>'<span class="status '+statusClass(s)+'">'+esc(s)+'</span>';
function navigate(page){
 if(!$("#page-"+page))return;
 currentPage=page;
 $$(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page));
 $$("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
 $("#crumbCurrent").textContent=({"accueil":"Vue d'ensemble","demandes":"Demandes de devis","clients":"Clients et contacts","devis":"Mes devis","prestations":"Prestations","parametres":"Paramètres"})[page];
 $("#sidebar").classList.remove("open");$("#overlay").classList.remove("show");
 window.scrollTo({top:0,behavior:"smooth"});render();
}
function render(){
 $("#statRequests").textContent=data.requests.length;
 $("#statPending").textContent=data.requests.filter(x=>x.statut==="Nouveau").length;
 $("#statQuotes").textContent=data.quotes.length;
 $("#statValue").textContent=euro(data.quotes.reduce((n,q)=>n+q.prix*q.quantite*(1+q.taux/100),0));
 $("#sidebarRequests").textContent=data.requests.filter(x=>x.statut==="Nouveau").length;
 const recent=data.requests.slice(-4).reverse();
 $("#recentRequests").innerHTML=recent.length?recent.map(x=>'<div class="request-mini"><div class="initial">'+esc(x.nom.slice(0,2).toUpperCase())+'</div><div class="name"><strong>'+esc(x.nom)+'</strong><small>'+esc(x.prestation)+' · '+esc(x.ville||"Commune à préciser")+'</small></div>'+statusChip(x.statut)+'</div>').join(""):'<div class="empty">Aucune demande pour le moment.</div>';
 const rq=$("#requestSearch").value.trim().toLocaleLowerCase("fr"), rf=$("#requestFilter").value;
 const filtered=data.requests.filter(x=>[x.nom,x.ville,x.prestation].join(" ").toLocaleLowerCase("fr").includes(rq)&&(rf==="tous"||x.statut===rf)).sort((a,b)=>b.id-a.id);
 $("#requestRows").innerHTML=filtered.length?filtered.map(x=>'<tr><td><strong>'+esc(x.nom)+'</strong><small class="subtle">'+esc(x.ville||"—")+'</small></td><td>'+esc(x.prestation)+'</td><td>'+datefmt(x.date)+'</td><td><select aria-label="Statut de '+esc(x.nom)+'" data-status="'+x.id+'"><option '+(x.statut==="Nouveau"?"selected":"")+'>Nouveau</option><option '+(x.statut==="En cours"?"selected":"")+'>En cours</option><option '+(x.statut==="Traité"?"selected":"")+'>Traité</option></select></td><td><button class="rowbtn" data-edit-request="'+x.id+'">Modifier</button><button class="rowbtn" data-request-quote="'+x.id+'">Devis</button><button class="rowbtn red" data-delete-request="'+x.id+'">Retirer</button></td></tr>').join(""):'<tr><td colspan="5"><div class="empty">Aucune demande pour ce filtre.</div></td></tr>';
 const cq=$("#clientSearch").value.trim().toLocaleLowerCase("fr");
 const clients=data.clients.filter(x=>[x.nom,x.ville,x.projet,x.telephone].join(" ").toLocaleLowerCase("fr").includes(cq));
 $("#clientRows").innerHTML=clients.length?clients.map(x=>'<tr><td><strong>'+esc(x.nom)+'</strong></td><td>'+esc(x.ville||"—")+'</td><td>'+esc(x.telephone||"Non renseigné")+'</td><td>'+esc(x.projet||"—")+'</td><td><button class="rowbtn" data-edit-client="'+x.id+'">Modifier</button><button class="rowbtn" data-client-quote="'+x.id+'">Devis</button><button class="rowbtn red" data-delete-client="'+x.id+'">Retirer</button></td></tr>').join(""):'<tr><td colspan="5"><div class="empty">Aucun contact trouvé.</div></td></tr>';
 $("#quoteRows").innerHTML=data.quotes.length?data.quotes.slice().reverse().map(x=>'<tr><td><strong>'+esc(x.ref)+'</strong><small class="subtle">'+datefmt(x.date)+'</small></td><td>'+esc(x.nom)+'</td><td>'+esc(x.prestation)+'</td><td><strong>'+euro(x.prix*x.quantite*(1+x.taux/100))+'</strong></td><td><button class="rowbtn" data-view-quote="'+x.id+'">Voir / imprimer</button><button class="rowbtn red" data-delete-quote="'+x.id+'">Retirer</button></td></tr>').join(""):'<tr><td colspan="5"><div class="empty">Aucun devis de démonstration.</div></td></tr>';
}
const fields=["Plâtrerie et enduits","Cloisons et placo","Plafonds et doublages","Finitions et rénovation","Autre"];
const options=(list,selected)=>list.map(v=>'<option value="'+esc(v)+'" '+(v===selected?"selected":"")+'>'+esc(v)+'</option>').join("");
function modal(title,body,subtitle="DÉMONSTRATION"){
 $("#modalTitle").textContent=title;$("#modalEyebrow").textContent=subtitle;
 $("#modalBody").innerHTML=body;$("#modalBackdrop").hidden=false;
 document.body.style.overflow="hidden";
 $("#modalBody input,#modalBody select,#modalBody button")?.focus?.();
}
function closeModal(){$("#modalBackdrop").hidden=true;document.body.style.overflow=""}
function requestForm(entry){
 const edit=!!entry,x=entry||{nom:"",telephone:"",ville:"",prestation:fields[0],statut:"Nouveau",details:""};
 modal(edit?"Modifier la demande":"Nouvelle demande",
 '<form id="requestForm" class="form-grid"><label class="field">Nom du contact<input name="nom" required maxlength="100" value="'+esc(x.nom)+'" placeholder="Nom ou entreprise"></label><label class="field">Téléphone (facultatif)<input name="telephone" type="tel" maxlength="35" value="'+esc(x.telephone)+'" placeholder="Numéro de contact"></label><label class="field">Commune<input name="ville" maxlength="80" value="'+esc(x.ville)+'" placeholder="Orléans…"></label><label class="field">Prestation<select name="prestation">'+options(fields,x.prestation)+'</select></label><label class="field">Statut<select name="statut">'+options(["Nouveau","En cours","Traité"],x.statut)+'</select></label><label class="field full">Description du besoin<textarea name="details" maxlength="1000" placeholder="Exemple de projet à chiffrer">'+esc(x.details)+'</textarea></label><div class="field full notice">Les informations saisies restent dans ce navigateur, sans stockage serveur.</div><div class="modal-actions field full"><button type="button" class="secondary" id="cancelModal">Annuler</button><button type="submit" class="primary">Enregistrer la demande</button></div></form>');
 $("#cancelModal").onclick=closeModal;
 $("#requestForm").onsubmit=e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.currentTarget));values.nom=values.nom.trim();if(!values.nom)return;const obj={...values,id:edit?x.id:id(),date:edit?x.date:today()};if(edit){data.requests=data.requests.map(a=>a.id===x.id?obj:a)}else{data.requests.push(obj)}save();closeModal();render();notice(edit?"Demande mise à jour dans la démo.":"Demande ajoutée dans la démo.")};
}
function clientForm(entry){
 const edit=!!entry,x=entry||{nom:"",telephone:"",ville:"",projet:fields[0]};
 modal(edit?"Modifier le contact":"Nouveau contact",
 '<form id="clientForm" class="form-grid"><label class="field">Nom / entreprise<input name="nom" required maxlength="100" value="'+esc(x.nom)+'" placeholder="Nom du contact"></label><label class="field">Téléphone<input name="telephone" type="tel" maxlength="35" value="'+esc(x.telephone)+'"></label><label class="field">Commune<input name="ville" maxlength="80" value="'+esc(x.ville)+'"></label><label class="field">Prestation envisagée<select name="projet">'+options(fields,x.projet)+'</select></label><div class="modal-actions field full"><button type="button" class="secondary" id="cancelModal">Annuler</button><button type="submit" class="primary">Enregistrer le contact</button></div></form>');
 $("#cancelModal").onclick=closeModal;
 $("#clientForm").onsubmit=e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.currentTarget));values.nom=values.nom.trim();if(!values.nom)return;const obj={...values,id:edit?x.id:id()};if(edit){data.clients=data.clients.map(a=>a.id===x.id?obj:a)}else{data.clients.push(obj)}save();closeModal();render();notice(edit?"Contact modifié dans la démo.":"Contact créé dans la démo.")};
}
function quoteForm(prefill={}){
 const x={nom:prefill.nom||"",prestation:prefill.prestation||fields[0]};
 modal("Préparer un devis","<form id='quoteForm' class='form-grid'>"
 +'<label class="field">Client<input name="nom" required maxlength="100" value="'+esc(x.nom)+'" placeholder="Nom du client"></label>'
 +'<label class="field">Prestation<select name="prestation">'+options(fields,x.prestation)+'</select></label>'
 +'<label class="field full">Description de la prestation<textarea name="description" required maxlength="1000" placeholder="Détail du chantier"></textarea></label>'
 +'<label class="field">Quantité<input name="quantite" type="number" min="1" max="10000" value="1" step="1" required></label>'
 +'<label class="field">Prix unitaire indicatif (€)<input name="prix" type="number" min="0" max="1000000" step="0.01" value="250" required></label>'
 +'<label class="field">Taux de taxe simulé<select name="taux"><option value="0">0 %</option><option value="5.5">5,5 %</option><option value="10">10 %</option><option value="20">20 %</option></select></label>'
 +'<div class="field"><span>Aperçu du total</span><strong id="liveQuoteTotal" style="font-size:22px">'+euro(250)+'</strong></div>'
 +'<div class="field full notice">Simulation non contractuelle. Un vrai devis doit respecter les obligations légales et les règles fiscales applicables.</div>'
 +'<div class="modal-actions field full"><button type="button" class="secondary" id="cancelModal">Annuler</button><button type="submit" class="primary">Enregistrer le devis démo</button></div></form>');
 $("#cancelModal").onclick=closeModal;
 const form=$("#quoteForm");
 const recalc=()=>{let d=new FormData(form);$("#liveQuoteTotal").textContent=euro(Number(d.get("quantite"))*Number(d.get("prix"))*(1+Number(d.get("taux"))/100))};
 form.oninput=recalc;form.onchange=recalc;
 form.onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(form));const q={...f,id:id(),date:today(),ref:"DEMO-"+String(data.quotes.length+1).padStart(3,"0"),quantite:Number(f.quantite),prix:Number(f.prix),taux:Number(f.taux)};if(!q.nom.trim()||!Number.isFinite(q.prix)||q.prix<0||q.quantite<1)return notice("Vérifiez le nom, la quantité et le prix.");data.quotes.push(q);save();closeModal();navigate("devis");notice("Devis ajouté à la démonstration.")};
}
function quotePreview(q){
 const subtotal=q.quantite*q.prix,tax=subtotal*q.taux/100,total=subtotal+tax;
 modal("Aperçu du devis "+q.ref,
 '<div class="quote-preview" id="quotePrintArea"><div style="display:flex;justify-content:space-between;gap:20px;align-items:start"><div><h3 style="font-size:22px">BATI<span style="color:#ec7628">PLUS</span>41</h3><small>DÉMONSTRATION — NON OFFICIELLE</small></div><div style="text-align:right"><strong>'+esc(q.ref)+'</strong><br><small>'+datefmt(q.date)+'</small></div></div><hr style="border:0;border-top:1px solid #e8edef;margin:24px 0"><div><small>DESTINATAIRE (EXEMPLE)</small><h3>'+esc(q.nom)+'</h3></div><p><strong>Prestation :</strong> '+esc(q.prestation)+'</p><p>'+esc(q.description)+'</p><table style="min-width:0;width:100%;margin:20px 0"><thead><tr><th>Désignation</th><th>Qté</th><th>Unitaire</th><th>Montant</th></tr></thead><tbody><tr><td>'+esc(q.prestation)+'</td><td>'+q.quantite+'</td><td>'+euro(q.prix)+'</td><td>'+euro(subtotal)+'</td></tr></tbody></table><p style="text-align:right">Base : '+euro(subtotal)+'<br>Taxe simulée ('+q.taux+' %) : '+euro(tax)+'</p><div class="quote-total">Total indicatif : '+euro(total)+'</div><p class="notice">Document de démonstration sans valeur commerciale ou légale. Non destiné à être émis tel quel. Conditions, coordonnées légales, TVA et mentions à compléter et vérifier.</p></div><div class="modal-actions"><button class="secondary" id="cancelModal">Fermer</button><button class="primary" id="printQuoteButton">Imprimer / PDF →</button></div>',
 "APERÇU DU DOCUMENT");
 $("#cancelModal").onclick=closeModal;$("#printQuoteButton").onclick=()=>window.print();
}
function confirmDelete(kind,itemId){
 const names={request:"demande",client:"contact",quote:"devis"},sets={request:"requests",client:"clients",quote:"quotes"};
 if(!window.confirm("Retirer ce "+names[kind]+" de la démonstration ?"))return;
 data[sets[kind]]=data[sets[kind]].filter(x=>x.id!==itemId);save();render();notice("Élément retiré de la démonstration.");
}
function reset(){
 if(!confirm("Réinitialiser les exemples et supprimer les modifications de ce navigateur ?"))return;
 data=seed();save();closeModal();navigate("accueil");notice("Données fictives réinitialisées.");
}
document.addEventListener("click",e=>{
 const t=e.target.closest("button,a");if(!t)return;
 if(t.dataset.page){e.preventDefault();navigate(t.dataset.page);return}
 if(t.dataset.action==="new-request"){requestForm();return}
 if(t.dataset.action==="new-client"){clientForm();return}
 if(t.dataset.action==="new-quote"){quoteForm();return}
 if(t.dataset.quoteService){quoteForm({prestation:t.dataset.quoteService});return}
 if(t.dataset.editRequest){requestForm(data.requests.find(x=>x.id===Number(t.dataset.editRequest)));return}
 if(t.dataset.editClient){clientForm(data.clients.find(x=>x.id===Number(t.dataset.editClient)));return}
 if(t.dataset.requestQuote){const x=data.requests.find(x=>x.id===Number(t.dataset.requestQuote));quoteForm({nom:x.nom,prestation:x.prestation});return}
 if(t.dataset.clientQuote){const x=data.clients.find(x=>x.id===Number(t.dataset.clientQuote));quoteForm({nom:x.nom,prestation:x.projet});return}
 if(t.dataset.viewQuote){quotePreview(data.quotes.find(x=>x.id===Number(t.dataset.viewQuote)));return}
 if(t.dataset.deleteRequest){confirmDelete("request",Number(t.dataset.deleteRequest));return}
 if(t.dataset.deleteClient){confirmDelete("client",Number(t.dataset.deleteClient));return}
 if(t.dataset.deleteQuote){confirmDelete("quote",Number(t.dataset.deleteQuote));return}
});
document.addEventListener("change",e=>{if(e.target.dataset.status){const x=data.requests.find(r=>r.id===Number(e.target.dataset.status));if(x){x.statut=e.target.value;save();render();notice("Statut mis à jour.")}}});
$("#requestSearch").oninput=render;$("#requestFilter").onchange=render;$("#clientSearch").oninput=render;
$("#mobileMenu").onclick=()=>{$("#sidebar").classList.toggle("open");$("#overlay").classList.toggle("show")};
$("#overlay").onclick=()=>{$("#sidebar").classList.remove("open");$("#overlay").classList.remove("show")};
$("#modalClose").onclick=closeModal;
$("#modalBackdrop").addEventListener("click",e=>{if(e.target===$("#modalBackdrop"))closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
$("#resetData").onclick=reset;$("#resetLink").onclick=reset;
$("#exportData").onclick=()=>{const blob=new Blob([JSON.stringify({...data,note:"Données de démonstration locales, ne contenant aucune donnée serveur"},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="domrenovation-demo-donnees.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);notice("Export local préparé.")};
save();render();
})();