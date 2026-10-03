// Al Eutur Perfumes — lógica del sitio.
// Los datos viven en datos/perfumes.js y datos/decants.js: para agregar o
// cambiar un perfume NO hace falta tocar este archivo.
const DATA = window.PERFUMES || [];
const DECANTS = window.DECANTS || [];
const COMBOS = window.COMBOS || [];
const WA = "59891700666";

function esc(t){
  return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ---------- Colección ---------- */
function renderGrid(){
  const g = document.getElementById('grid');
  if(!g) return;
  g.innerHTML = DATA.map(p => `
    <div class="card" data-cat="${esc(p.cat)}" data-name="${esc(p.name.toLowerCase())}" data-brand="${esc(p.brand.toLowerCase())}" onclick="openModal('${esc(p.k)}')">
      <div class="card-img"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">${p.encargue ? '<span class="badge">Por encargue</span>' : ''}</div>
      <div class="card-body">
        <div class="card-brand">${esc(p.brand)}</div>
        <div class="card-name">${esc(p.name)}</div>
        <div class="card-fam">${esc(p.fam)}</div>
      </div>
    </div>`).join('');
}

function openModal(k){
  const p = DATA.find(x=>x.k===k);
  if(!p) return;
  const encargueBadge = p.encargue ? '<div class="modal-encargue">Solo por encargue</div>' : '';
  document.getElementById('modalContent').innerHTML = `
    <div class="mclose" onclick="closeModal()">✕</div>
    <div class="modal-img"><img src="${esc(p.img)}" alt="${esc(p.name)}"></div>
    <div class="modal-body">
      <div class="modal-brand">${esc(p.brand)}</div>
      <div class="modal-name">${esc(p.name)}</div>
      <div class="modal-fam">${esc(p.fam)}</div>
      ${encargueBadge}
      <div class="modal-desc">${esc(p.desc)}</div>
      <div class="notes">
        <div class="note-row"><span class="note-label">Salida</span><span>${esc(p.top)}</span></div>
        <div class="note-row"><span class="note-label">Corazón</span><span>${esc(p.heart)}</span></div>
        <div class="note-row"><span class="note-label">Fondo</span><span>${esc(p.base)}</span></div>
      </div>
      <div class="insp-box">
        <div class="insp-label">${esc(p.il)}</div>
        <div class="insp-value">${esc(p.insp)}</div>
      </div>
      <a class="modal-cta" href="https://wa.me/${WA}?text=${encodeURIComponent('Hola! Me interesa el perfume '+p.name+' de '+p.brand+'. ¿Me pasás info?')}" target="_blank">Consultar por WhatsApp</a>
    </div>`;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow='';
}
function closeModalBg(e){ if(e.target.id==='modalOverlay') closeModal(); }

let currentFilter='all';
function setFilter(cat, el){
  currentFilter = cat;
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  filterCards();
}
function filterCards(){
  const q = document.getElementById('search').value.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll('.card').forEach(card=>{
    const matchCat = currentFilter==='all' || card.dataset.cat===currentFilter;
    const matchQ = !q || card.dataset.name.includes(q) || card.dataset.brand.includes(q);
    const show = matchCat && matchQ;
    card.style.display = show ? '' : 'none';
    if(show) visible++;
  });
  document.getElementById('emptyMsg').style.display = visible===0 ? 'block' : 'none';
}
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

/* ---------- Decants y combos ---------- */
function imgOf(x){
  if(x.img) return x.img;
  const d = DECANTS.find(y=>y.k===x.k);
  if(d && d.img) return d.img;
  const p = DATA.find(y=>y.k===x.k);
  return p ? p.img : '';
}
function infoOf(k){
  const d = DECANTS.find(x=>x.k===k);
  if(d && d.name) return d;
  const p = DATA.find(x=>x.k===k) || {};
  return {name:p.name, brand:p.brand, img:p.img};
}
function waLink(txt){
  return 'https://wa.me/'+WA+'?text='+encodeURIComponent(txt);
}
function renderDecants(){
  const g = document.getElementById('decGrid');
  if(!g) return;
  g.innerHTML = DECANTS.map(x=>{
    const p = infoOf(x.k);
    const nombre = x.name || p.name, marca = x.brand || p.brand;
    return `<div class="dec-card">
      <div class="dec-img"><img src="${esc(imgOf(x))}" alt="${esc(nombre)}" loading="lazy"></div>
      <div class="dec-body">
        <div class="dec-brand">${esc(marca)}</div>
        <div class="dec-name">${esc(nombre)}</div>
        <div class="dec-dupe">${esc(x.dupe)}</div>
        <div class="dec-price">$ ${esc(x.precio)}</div>
        <a class="dec-cta" target="_blank" href="${waLink('Hola! Quiero el decant de 5 ml de '+nombre+' ($ '+x.precio+'). ¿Sigue disponible?')}">Lo quiero</a>
      </div>
    </div>`;
  }).join('');

  const c = document.getElementById('comboGrid');
  c.innerHTML = COMBOS.map(cb=>{
    const imgs = cb.items.length
      ? cb.items.map((k,i)=>`${i?'<span>+</span>':''}<img src="${esc(imgOf({k:k}))}" alt="" loading="lazy">`).join('')
      : DECANTS.slice(0,3).map((x,i)=>`${i?'<span>+</span>':''}<img src="${esc(imgOf(x))}" alt="" loading="lazy">`).join('');
    const lista = cb.labels.length
      ? '<ul>'+cb.labels.map(l=>`<li>${esc(l)}</li>`).join('')+'</ul>'
      : '<ul><li>Cualquiera de los '+DECANTS.length+' decants</li><li>Vos elegís los tres</li></ul>';
    const txt = cb.items.length
      ? 'Hola! Quiero el combo '+cb.nombre+' ($ '+cb.precio+'): '+cb.labels.join(', ')+'.'
      : 'Hola! Quiero armar el combo '+cb.nombre+' ($ '+cb.precio+'). Los tres que quiero son: ';
    return `<div class="combo${cb.destacado?' destacado':''}">
      <h4>${esc(cb.nombre)}</h4>
      <div class="sub">3 decants de 5 ml</div>
      <div class="combo-imgs">${imgs}</div>
      ${lista}
      <div class="precio">$ ${esc(cb.precio)}</div>
      <div class="ahorro">${esc(cb.ahorro)}</div>
      <a class="dec-cta" target="_blank" href="${waLink(txt)}">Pedir combo</a>
    </div>`;
  }).join('');
}

renderGrid();
renderDecants();
