async function loadFilters(){
  const filtersEl = document.getElementById('filters');
  const existingSearch = document.getElementById('search');
  if(!existingSearch){
    filtersEl.innerHTML = `
      <label>Buscar: <input id="q" placeholder="Nombre o descripción"/></label>
      <div style="display:flex;gap:8px;align-items:center;margin-top:6px;">
        <label style="flex:1">Precio mínimo: <input id="price_min" type="number" min="0" step="0.01" placeholder="0.00"/></label>
        <label style="flex:1">Precio máximo: <input id="price_max" type="number" min="0" step="0.01" placeholder="9999.99"/></label>
        <button id="search" class="btn">Buscar</button>
      </div>
    `;
  }
  const btn = document.getElementById('search');
  if(btn){ btn.removeEventListener('click', loadProducts); btn.addEventListener('click', ()=>loadProducts(1)); }
}

async function loadProducts(page=1){
  const q = document.getElementById('q')?.value || '';
  const price_min = document.getElementById('price_min')?.value || '';
  const price_max = document.getElementById('price_max')?.value || '';
  const params = new URLSearchParams({ page, limit: 10 });
  if(q) params.set('q', q);
  if(price_min) params.set('price_min', price_min);
  if(price_max) params.set('price_max', price_max);
  try{
    const res = await apiGet('/products?'+params.toString());
    const products = (res && res.data && res.data.products) ? res.data.products : [];
    const el = document.getElementById('products');
    if(!products.length){
      el.innerHTML = '<div class="card">No hay productos para mostrar.</div>';
    } else {
      el.innerHTML = products.map(p=>{
        const name = p.name || p.title || 'Sin nombre';
        const price = (typeof p.price !== 'undefined') ? parseFloat(p.price).toFixed(2) : '0.00';
        const character = p.character ? `<div class="muted">Personaje: ${p.character}</div>` : '';
          return `
            <div class="product" data-id="${p.id}">
              <div style="height:120px;background:linear-gradient(135deg,#f0f0f0,#ffffff);border-radius:8px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#888">Imagen</div>
              <h3 style="font-size:16px;margin:6px 0;">${name}</h3>
              <div class="price" data-price="${price}" style="font-weight:700;color:var(--accent-2);">$${price}</div>
              ${character}
              <div class="muted">Stock: ${typeof p.stock !== 'undefined' ? p.stock : 'N/A'}</div>
              <div class="actions"><button class="btn primary" data-id="${p.id}">Agregar</button></div>
            </div>`;
      }).join('');
    }
    document.querySelectorAll('#products button').forEach(btn=>btn.addEventListener('click', addToCart));
    updateCartCount();
  }catch(err){
    console.error('Error loading products', err);
    document.getElementById('products').textContent = 'Error cargando productos';
  }
}

function updateCartCount(){
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  document.getElementById('cart-count').textContent = cart.reduce((s,i)=>s+i.qty,0);
}

function addToCart(e){
  const id = parseInt(e.currentTarget.dataset.id,10);
  // find product info from DOM (simple approach)
  const card = e.currentTarget.closest('.product');
  const title = card.querySelector('h3').textContent;
  const priceEl = card.querySelector('.price');
  const price = parseFloat(priceEl ? priceEl.dataset.price : (card.querySelector('div') ? card.querySelector('div').textContent.replace('$','') : 0))||0;
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  const existing = cart.find(c=>c.id===id);
  if(existing) existing.qty += 1; else cart.push({ id, title, price, qty:1 });
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Inicialización
document.addEventListener('DOMContentLoaded', ()=>{
  loadFilters();
  loadProducts();
});
