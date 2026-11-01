// Al Eutur Perfumes — lógica del sitio.
// Los datos viven en datos/perfumes.js y datos/decants.js: para agregar o
// cambiar un perfume NO hace falta tocar este archivo.
const DATA = window.PERFUMES || [];
const DECANTS = window.DECANTS || [];
const COMBOS = window.COMBOS || [];
const WA = "59891700666";

// Precio para mostrar: "$ 2.390", "Consultar precio" o "No disponible por ahora".
function precioTxt(p){
  if(p.disponible === false) return 'No disponible por ahora';
  if(!p.precio) return 'Consultar precio';
  return '$ ' + Number(p.precio).toLocaleString('es-UY');
}
function precioClase(p){
  return p.disponible === false ? 'agotado' : (p.precio ? '' : 'consultar');
}
function esc(t){
  return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ---------- Tienda: pestañas Hombre / Mujer / Decants ---------- */
let TAB = 'hombre', SUB = 'todos';
function cardHTML(p){
  const puede = p.disponible !== false;
  return `
    <div class="card" onclick="openModal('${esc(p.k)}')">
      <div class="card-img"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">
        ${puede ? `<button class="add" aria-label="Agregar al carrito" onclick="event.stopPropagation();addPerfume('${esc(p.k)}', this)">+</button>` : ''}
      </div>
      <div class="card-body">
        <div class="card-brand">${esc(p.brand)}</div>
        <div class="card-name">${esc(p.name)}</div>
        <div class="card-price ${precioClase(p)}">${precioTxt(p)}</div>
      </div>
    </div>`;
}
function delTab(){ return DATA.filter(p => (p.genero === 'mujer') === (TAB === 'mujer')); }
function renderGrid(){
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === TAB));
  const esDec = TAB === 'decants';
  document.getElementById('subtabs').hidden = esDec;
  document.getElementById('grid').hidden = esDec;
  document.getElementById('decantsBox').hidden = !esDec;
  if(esDec) return;
  const lista = delTab();
  const cuenta = {todos: lista.length, disenador: lista.filter(p => p.seccion === 'disenador').length};
  cuenta.arabe = cuenta.todos - cuenta.disenador;
  document.querySelectorAll('.sub').forEach(b => {
    b.classList.toggle('on', b.dataset.sub === SUB);
    b.innerHTML = b.textContent.replace(/\d+$/, '').trim() + ` <small>${cuenta[b.dataset.sub]}</small>`;
  });
  const orden = p => p.seccion === 'disenador' ? 0 : 1;
  const ver = lista.filter(p => SUB === 'todos' || p.seccion === SUB)
    .sort((a, b) => orden(a) - orden(b) || (a.disponible === false) - (b.disponible === false));
  document.getElementById('grid').innerHTML = ver.map(cardHTML).join('');
}
function setTab(t){ TAB = t; SUB = 'todos'; renderGrid(); history.replaceState(null, '', '#' + t); }
function setSub(s){ SUB = s; renderGrid(); }
function irA(t){ setTab(t); document.getElementById('tienda').scrollIntoView({behavior:'smooth'}); event && event.preventDefault(); }

function openModal(k){
  const p = DATA.find(x=>x.k===k);
  if(!p) return;
  document.getElementById('modalContent').innerHTML = `
    <div class="mclose" onclick="closeModal()">✕</div>
    <div class="modal-img"><img src="${esc(p.img)}" alt="${esc(p.name)}"></div>
    <div class="modal-body">
      <div class="modal-brand">${esc(p.brand)}</div>
      <div class="modal-name">${esc(p.name)}</div>
      <div class="modal-fam">${esc(p.fam)}</div>
      <div class="modal-price ${precioClase(p)}">${precioTxt(p)}</div>
      <div class="modal-desc">${esc(p.desc)}</div>
      <div class="notes">
        <div class="note-row"><span class="note-label">Salida</span><span>${esc(p.top)}</span></div>
        <div class="note-row"><span class="note-label">Corazón</span><span>${esc(p.heart)}</span></div>
        <div class="note-row"><span class="note-label">Fondo</span><span>${esc(p.base)}</span></div>
      </div>
      ${p.il === 'Inspirado en' ? `<div class="insp">Inspirado en <b>${esc(p.insp)}</b></div>` : ''}
      <div class="modal-actions">
        ${p.disponible === false ? '' : `<button class="modal-cta" onclick="addPerfume('${esc(p.k)}', this)">Agregar al carrito</button>`}
        <a class="modal-ghost" href="https://wa.me/${WA}?text=${encodeURIComponent('Hola! Me interesa el perfume '+p.name+' de '+p.brand+'. ¿Me pasás info?')}" target="_blank">Consultar por WhatsApp</a>
      </div>
    </div>`;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow='';
}
function closeModalBg(e){ if(e.target.id==='modalOverlay') closeModal(); }
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
    return `<div class="card" onclick="addDecant('${esc(x.k)}', this.querySelector('.add'))">
      <div class="card-img"><img src="${esc(imgOf(x))}" alt="${esc(nombre)}" loading="lazy">
        <button class="add" aria-label="Agregar al carrito" onclick="event.stopPropagation();addDecant('${esc(x.k)}', this)">+</button></div>
      <div class="card-body">
        <div class="card-brand">${esc(marca)}</div>
        <div class="card-name">${esc(nombre)}</div>
        <div class="card-sub">${esc(x.dupe)}</div>
        <div class="card-price">$ ${esc(x.precio)}</div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('comboGrid').innerHTML = COMBOS.map((cb, i)=>{
    const det = cb.labels.length ? cb.labels.join(' · ') : 'Elegí los 3 que quieras';
    return `<div class="combo">
      <div class="combo-txt"><h4>${esc(cb.nombre)}</h4><p>${esc(det)}</p></div>
      <div class="combo-precio"><b>$ ${esc(cb.precio)}</b><span>${esc(cb.ahorro)}</span></div>
      <button class="btn-linea" onclick="addCombo(${i}, this)">Agregar</button>
    </div>`;
  }).join('');
}

/* ---------- Vitrina animada del inicio ---------- */
// Claves de los perfumes que pasan por la fila del inicio (en este orden).
const CARRUSEL = ['sauvage_edp','yara','khamrah','very_good_girl','eros_flame','clubdenuit','libre_edp',
  'lemale_elixir','maleka','adg_profondo_edp','baroque','la_bomba','invictus_victory_elixir','khamrah_waha',
  'scandal_parfum','mega','val_donna_extradose','iconic','paradigme','yaraelixir','bad_boy'];
function renderVitrina(){
  const v = document.getElementById('vitrina');
  if(!v) return;
  const items = CARRUSEL.map(k => DATA.find(p => p.k === k)).filter(Boolean);
  const html = items.map(p => `<div class="vitrina-item" onclick="openModal('${esc(p.k)}')" title="${esc(p.name)}">
      <img src="${esc(p.img)}" alt="${esc(p.name)}"></div>`).join('');
  v.innerHTML = html + html.replace(/alt="/g, 'aria-hidden="true" alt="');   // duplicado para que el giro no tenga cortes
}


/* ---------- Carrito ---------- */
// Cada ítem: {id, tipo, nombre, detalle, precio (número o null), cant}
let CART = [];
try { CART = JSON.parse(localStorage.getItem('aleutur_carrito') || '[]') || []; } catch(e) { CART = []; }
function guardarCarrito(){ try { localStorage.setItem('aleutur_carrito', JSON.stringify(CART)); } catch(e) {} }
const $ = n => '$ ' + Number(n).toLocaleString('es-UY');

function addItem(item, btn){
  const ya = CART.find(x => x.id === item.id);
  if(ya) ya.cant++; else CART.push(Object.assign({cant:1}, item));
  guardarCarrito(); renderCart();
  const fab = document.getElementById('cartFab');
  fab.classList.remove('pop'); void fab.offsetWidth; fab.classList.add('pop');
  if(btn){ const t = btn.textContent; btn.textContent = btn.classList.contains('add') ? '✓' : '✓ Agregado'; btn.classList.add('ok');
    setTimeout(()=>{ btn.textContent = t; btn.classList.remove('ok'); }, 1300); }
}
function addPerfume(k, btn){
  const p = DATA.find(x => x.k === k); if(!p) return;
  addItem({id:'p:'+k, tipo:'Perfume', nombre:p.name, detalle:p.brand, precio:p.precio || null}, btn);
}
function addDecant(k, btn){
  const x = DECANTS.find(d => d.k === k); if(!x) return;
  const info = infoOf(k);
  addItem({id:'d:'+k, tipo:'Decant 5 ml', nombre:x.name || info.name, detalle:x.brand || info.brand, precio:Number(x.precio) || null}, btn);
}
function addCombo(i, btn){
  const cb = COMBOS[i]; if(!cb) return;
  const det = cb.labels.length ? cb.labels.join(', ') : 'Elijo los 3 decants por WhatsApp';
  addItem({id:'c:'+cb.nombre, tipo:'Combo decants', nombre:cb.nombre, detalle:det, precio:Number(cb.precio) || null}, btn);
}
function cambiarCant(id, d){
  const it = CART.find(x => x.id === id); if(!it) return;
  it.cant += d; if(it.cant <= 0) CART = CART.filter(x => x.id !== id);
  guardarCarrito(); renderCart();
}
function vaciarCarrito(){ CART = []; guardarCarrito(); renderCart(); }
function totalCarrito(){ return CART.reduce((s,x) => s + (x.precio ? x.precio * x.cant : 0), 0); }

function renderCart(){
  const n = CART.reduce((s,x) => s + x.cant, 0);
  const fab = document.getElementById('cartFab');
  fab.classList.toggle('lleno', n > 0);
  document.getElementById('cartCount').textContent = n;
  const list = document.getElementById('cartItems');
  if(!CART.length){
    list.innerHTML = '<p class="cart-empty">Tu carrito está vacío.<br>Agregá perfumes o decants para armar tu pedido.</p>';
  } else {
    list.innerHTML = CART.map(x => `<div class="cart-item">
      <div class="ci-info">
        <div class="ci-tipo">${esc(x.tipo)}</div>
        <div class="ci-nombre">${esc(x.nombre)}</div>
        <div class="ci-det">${esc(x.detalle)}</div>
      </div>
      <div class="ci-der">
        <div class="ci-precio">${x.precio ? $(x.precio * x.cant) : 'A consultar'}</div>
        <div class="ci-cant">
          <button onclick="cambiarCant('${esc(x.id)}',-1)" aria-label="Quitar uno">−</button>
          <span>${x.cant}</span>
          <button onclick="cambiarCant('${esc(x.id)}',1)" aria-label="Agregar uno">+</button>
        </div>
      </div>
    </div>`).join('');
  }
  const consultar = CART.some(x => !x.precio);
  document.getElementById('cartTotal').textContent = $(totalCarrito());
  document.getElementById('cartNota').textContent = consultar ? 'Algunos productos tienen precio a confirmar.' : '';
  document.getElementById('cartFoot').style.display = CART.length ? '' : 'none';
}
function abrirCarrito(){ document.getElementById('cartPanel').classList.add('open'); document.body.style.overflow = 'hidden'; }
function cerrarCarrito(){ document.getElementById('cartPanel').classList.remove('open'); document.body.style.overflow = ''; }

function finalizarPedido(){
  if(!CART.length) return;
  const lineas = CART.map(x => `• ${x.cant} x ${x.tipo === 'Perfume' ? '' : x.tipo + ' · '}${x.nombre} (${x.detalle})` +
    (x.precio ? ` — ${$(x.precio * x.cant)}` : ' — precio a consultar'));
  let msg = 'Hola Al Eutur! 🖤 Quiero hacer este pedido:\n\n' + lineas.join('\n') + '\n\n*Total: ' + $(totalCarrito()) + '*';
  if(CART.some(x => !x.precio)) msg += '\n(sin incluir los productos con precio a consultar)';
  msg += '\n\n¿Me confirman stock y forma de entrega?';
  window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank');
}
document.addEventListener('keydown', e => { if(e.key === 'Escape') cerrarCarrito(); });


/* ---------- Buscador general ---------- */
// Busca en nombre, marca, familia, notas e "inspirado en" (por ej. "aventus" encuentra el Club de Nuit).
const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function buscar(q){
  const box = document.getElementById('busRes');
  const palabras = norm(q).split(/\s+/).filter(Boolean);
  if(!palabras.length){
    box.innerHTML = '<p class="bus-ayuda">Escribí el nombre del perfume, la marca o el perfume en el que se inspira.</p>';
    return;
  }
  const puntaje = p => {
    const nombre = norm(p.name + ' ' + p.brand), resto = norm([p.fam, p.insp, p.top, p.heart, p.base].join(' '));
    let s = 0;
    for(const w of palabras){
      if(nombre.includes(w)) s += nombre.startsWith(w) ? 3 : 2;
      else if(resto.includes(w)) s += 1;
      else return 0;
    }
    return s;
  };
  const res = DATA.map(p => [puntaje(p), p]).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, 40).map(x => x[1]);
  if(!res.length){
    box.innerHTML = `<p class="bus-ayuda">No encontramos "${esc(q)}". <a target="_blank" href="${waLink('Hola! Están trayendo el perfume ' + q + '?')}">Preguntanos por WhatsApp</a> y te lo conseguimos.</p>`;
    return;
  }
  box.innerHTML = res.map(p => `<div class="bus-item" onclick="cerrarBuscador();openModal('${esc(p.k)}')">
      <img src="${esc(p.img)}" alt="" loading="lazy">
      <div class="bus-txt">
        <div class="bus-marca">${esc(p.brand)}</div>
        <div class="bus-nombre">${esc(p.name)}</div>
        <div class="bus-fam">${esc(p.fam)}${p.il === 'Inspirado en' ? ' · ' + esc(p.insp) : ''}</div>
      </div>
      <div class="bus-precio ${precioClase(p)}">${precioTxt(p)}</div>
    </div>`).join('');
}
function abrirBuscador(){
  document.getElementById('buscador').classList.add('open');
  document.body.style.overflow = 'hidden';
  const i = document.getElementById('busInput'); buscar(i.value); setTimeout(() => i.focus(), 50);
}
function cerrarBuscador(){ document.getElementById('buscador').classList.remove('open'); document.body.style.overflow = ''; }
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') cerrarBuscador();
  if(e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)){ e.preventDefault(); abrirBuscador(); }
});

const inicial = location.hash.slice(1);
if(['hombre','mujer','decants'].includes(inicial)) TAB = inicial;
renderGrid();
renderDecants();
renderCart();
renderVitrina();
