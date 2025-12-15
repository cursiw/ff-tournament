/* script.js - consume backend API: listing, inscription (fetch) and bracket simple */

function $(sel){return document.querySelector(sel)}
function $all(sel){return document.querySelectorAll(sel)}

async function fetchTournaments(){
  try{
    const res = await fetch('/api/tournaments');
    if(!res.ok) throw new Error('API error');
    return await res.json();
  }catch(e){
    console.error(e); return [];
  }
}

async function loadTournaments(){
  const list = $('#tournament-list');
  list.innerHTML='';
  const tournaments = await fetchTournaments();
  tournaments.forEach(t=>{
    const card = document.createElement('div');card.className='card';
    card.innerHTML = `<h4>${t.name}</h4><p>Date: ${t.date} • Places: ${t.slots}</p><p>Prix: ${t.prize}</p><button class="btn" data-id="${t.id}">S'inscrire</button>`;
    list.appendChild(card);
  });
  $all('#tournament-list .btn').forEach(b=>b.addEventListener('click',e=>openModal(e.target.dataset.id)));
}

// modal
function openModal(tid){
  $('#tournamentId').value = tid;
  $('#modal').classList.remove('hidden');
}
function closeModal(){
  $('#reg-form').reset();$('#reg-msg').textContent='';$('#modal').classList.add('hidden');
}

// form submit -> POST to API
$('#reg-form').addEventListener('submit',async function(e){
  e.preventDefault();
  const reg = {
    tournamentId: $('#tournamentId').value,
    teamName: $('#teamName').value.trim(),
    captain: $('#captain').value.trim(),
    players: Number($('#players').value),
    contact: $('#contact').value.trim()
  };
  try{
    const res = await fetch('/api/registrations',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(reg) });
    if(!res.ok){ const j = await res.json().catch(()=>({})); throw new Error(j.error||'Erreur'); }
    const j = await res.json();
    $('#reg-msg').textContent = "Inscription enregistrée ✅";
    setTimeout(()=>{ closeModal(); },800);
  }catch(err){
    $('#reg-msg').textContent = 'Erreur lors de l\'inscription. Vérifie ta connexion.';
  }
});
$('#close-modal').addEventListener('click',closeModal);

// bracket view
async function renderBracket(){
  const box = $('#bracket-view'); box.innerHTML='';
  const tournaments = await fetchTournaments();
  const br = document.createElement('div');br.className='bracket';
  tournaments.forEach(t=>{
    const round = document.createElement('div');round.className='round';
    round.innerHTML = `<strong>${t.name}</strong>`;
    (t.bracket||[]).forEach(m=>{
      const a = document.createElement('div');a.className='team';a.textContent = (m.a||'TBD')+' vs '+(m.b||'TBD');round.appendChild(a);
    });
    br.appendChild(round);
  });
  box.appendChild(br);
}

// init
loadTournaments();renderBracket();

// Expose helpers for admin page if needed
window._ff_client = { fetchTournaments };
