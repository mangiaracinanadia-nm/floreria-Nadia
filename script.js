/* ================================================
   FLORERÍA AZAHAR — Lógica del carrito
   ================================================ */

const WHATSAPP = '5491100000000'; // <-- TU NÚMERO DE WHATSAPP
let carrito = [];

function filtrar(cat, chip){
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('activo'));
  chip.classList.add('activo');
  document.querySelectorAll('.card[data-cat]').forEach(card => {
    card.classList.toggle('oculto', cat !== 'todos' && card.dataset.cat !== cat);
  });
}

function cambiarQty(btn, delta){
  const span = btn.parentElement.querySelector('.q');
  let q = parseInt(span.textContent) + delta;
  if(q < 1) q = 1;
  span.textContent = q;
}

function agregar(btn, nombre, precio){
  const qty = parseInt(btn.parentElement.querySelector('.q').textContent);
  const existente = carrito.find(i => i.nombre === nombre);
  if(existente){
    existente.qty += qty;
  } else {
    carrito.push({nombre, precio, qty});
  }
  renderCarrito();
  mostrarToast();
}

function cambiarCantidad(nombre, delta){
  const item = carrito.find(i => i.nombre === nombre);
  if(!item) return;
  item.qty += delta;
  if(item.qty < 1){
    carrito = carrito.filter(i => i.nombre !== nombre);
  }
  renderCarrito();
}

function eliminar(nombre){
  carrito = carrito.filter(i => i.nombre !== nombre);
  renderCarrito();
}

function getRecargo(){
  const sel = document.querySelector('input[name="pago"]:checked');
  return sel ? parseFloat(sel.dataset.recargo) : 0;
}

function getTotales(){
  const subtotal = carrito.reduce((s,i) => s + i.precio * i.qty, 0);
  const recargo = Math.round(subtotal * getRecargo() / 100);
  return {subtotal, recargo, total: subtotal + recargo};
}

function fmt(n){ return '$' + n.toLocaleString('es-AR'); }

function renderCarrito(){
  const cont = document.getElementById('cart-items');
  const count = carrito.reduce((s,i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = count;

  if(carrito.length === 0){
    cont.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío. ¡Agregá algunos ramos! 🌷</p>';
    document.getElementById('pago-section').style.display = 'none';
    document.getElementById('ticket').style.display = 'none';
    return;
  }
  document.getElementById('pago-section').style.display = 'block';

  cont.innerHTML = carrito.map(i => `
    <div class="cart-item">
      <div class="cart-item-info">
        <strong>${i.nombre}</strong><br>
        <small>${fmt(i.precio)} c/u</small>
      </div>
      <div class="qty">
        <button onclick="cambiarCantidad('${i.nombre}',-1)">−</button>
        <span>${i.qty}</span>
        <button onclick="cambiarCantidad('${i.nombre}',1)">+</button>
      </div>
      <div class="subtotal-linea">${fmt(i.precio * i.qty)}</div>
      <button class="remove-btn" onclick="eliminar('${i.nombre}')" title="Quitar">🗑️</button>
    </div>
  `).join('');

  const t = getTotales();
  document.getElementById('subtotal').textContent = fmt(t.subtotal);
  document.getElementById('recargo').textContent = fmt(t.recargo);
  document.getElementById('total').textContent = fmt(t.total);

  renderTicket();
}

function renderTicket(){
  const t = getTotales();
  const mostrar = document.getElementById('factura-check').checked && carrito.length > 0;
  const ticket = document.getElementById('ticket');
  ticket.style.display = mostrar ? 'block' : 'none';
  if(!mostrar) return;

  const ahora = new Date();
  document.getElementById('ticket-fecha').textContent =
    ahora.toLocaleDateString('es-AR') + ' ' + ahora.toLocaleTimeString('es-AR');

  document.getElementById('ticket-items').innerHTML = carrito.map(i =>
    `<tr><td>${i.qty} x ${i.nombre}</td><td style="text-align:right">${fmt(i.precio*i.qty)}</td></tr>`
  ).join('');

  document.getElementById('ticket-subtotal').textContent = fmt(t.subtotal);
  document.getElementById('ticket-recargo').textContent = fmt(t.recargo);
  document.getElementById('ticket-total').textContent = fmt(t.total);
  document.getElementById('ticket-iva').textContent = fmt(Math.round(t.total / 1.21));
  document.getElementById('ticket-cae').textContent = String(Math.floor(Math.random()*9e9)+1e9);
}

document.getElementById('pago-options').addEventListener('change', renderCarrito);
document.getElementById('factura-check').addEventListener('change', renderCarrito);

function enviarPedido(){
  if(carrito.length === 0) return;
  const t = getTotales();
  const pago = document.querySelector('input[name="pago"]:checked').value;
  const factura = document.getElementById('factura-check').checked;

  let msg = 'Hola! Quiero hacer este pedido:\n\n';
  carrito.forEach(i => {
    msg += `• ${i.qty} x ${i.nombre} - ${fmt(i.precio*i.qty)}\n`;
  });
  msg += `\nSubtotal: ${fmt(t.subtotal)}`;
  msg += `\nRecargo (${pago}): ${fmt(t.recargo)}`;
  msg += `\nTOTAL: ${fmt(t.total)}`;
  msg += `\nMedio de pago: ${pago}`;
  msg += `\nFactura fiscal: ${factura ? 'SÍ' : 'NO'}`;

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
}

function mostrarToast(){
  const toast = document.getElementById('toast');
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 1800);
}

renderCarrito();
