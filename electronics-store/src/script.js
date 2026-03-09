// This script now supports two pages: index.html (product listing) and cart.html (cart + checkout).
// Cart is persisted in localStorage under key "neon_cart".

const STORAGE_KEY = 'neon_cart';

// Frissített products: adjunk hozzá color opcionális listát
const products = [
  {
    id:1,
    title:'Wireless Headphones',
    price:19999,
    img:'https://via.placeholder.com/800x500?text=Headphones',
    desc:'Kényelmes, zajszűrős fejhallgató 20 órás üzemidővel.',
    specs:['Bluetooth 5.2','ANC','20h battery'],
    colors:[
      {name:'Black',hex:'#0b0f17'},
      {name:'White',hex:'#f4f6f8'},
      {name:'Neon Blue',hex:'#00e5ff'}
    ]
  },
  {
    id:2,
    title:'Smartwatch Pro',
    price:34999,
    img:'https://via.placeholder.com/800x500?text=Smartwatch',
    desc:'Pulzusmérés, GPS, 7 napos üzemidő, vízálló.',
    specs:['GPS','Heart-rate','5ATM'],
    colors:[{name:'Black',hex:'#111827'},{name:'Gray',hex:'#9aa6b2'}]
  },
  {
    id:3,
    title:'Bluetooth Speaker',
    price:14999,
    img:'https://via.placeholder.com/800x500?text=Speaker',
    desc:'Erős basszus, hordozható kialakítás és 12 órás lejátszás.',
    specs:['12h play','IPX5','Party mode'],
    colors:[{name:'Black',hex:'#0b1320'},{name:'Coral',hex:'#ff7a6b'}]
  },
  {
    id:4,
    title:'Gaming Mouse',
    price:8999,
    img:'https://via.placeholder.com/800x500?text=Gaming+Mouse',
    desc:'Programozható gombok és pontos szenzor 16000 DPI-ig.',
    specs:['16000 DPI','RGB','6 buttons'],
    colors:[{name:'Black',hex:'#0f1724'},{name:'White',hex:'#ffffff'}]
  }
];

const formatCurrency = (v) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ft';

let cart = {};

// persistence
function saveCart(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
function loadCart(){ try{ cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }catch(e){ cart = {}; } }

// utility to compute total items
function cartItemCount(){ return Object.values(cart).reduce((s,i)=>s+i.qty,0); }

document.addEventListener('DOMContentLoaded', ()=>{
  loadCart();

  // elements (may be missing on one of the pages)
  const productList = document.getElementById('product-list');
  const cartCountEl = document.getElementById('cart-count');
  const cartTotalEl = document.getElementById('cart-total');
  const cartListEl = document.getElementById('cart-list');
  const pageCheckoutBtn = document.getElementById('page-checkout-button');
  const pageClearBtn = document.getElementById('page-clear-cart');

  // payment modal and fields (present on cart.html when used)
  const paymentModal = document.getElementById('payment-modal');
  const closeModal = document.getElementById('close-modal');
  const paymentForm = document.getElementById('payment-form');
  const paymentStatus = document.getElementById('payment-status');
  const gotoCheckout = document.getElementById('goto-checkout');
  const cancelPayment = document.getElementById('cancel-payment');
  const cardInput = document.getElementById('card');
  const expInput = document.getElementById('exp');
  const cvcInput = document.getElementById('cvc');

  // --- Drawer elemek és funkciók ---
  const openCartBtn = document.getElementById('open-cart-drawer');
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const drawerItems = document.getElementById('drawer-items');
  const drawerTotal = document.getElementById('drawer-total');
  const drawerClose = document.getElementById('close-cart-drawer');
  const drawerCheckout = document.getElementById('drawer-checkout');
  const drawerClear = document.getElementById('drawer-clear');

  // Ha a felhasználó a "Kosár" gombra kattint a headerben,
  // dobja át a cart.html-re (mint a korábbi fizetés-gomb)
  if(openCartBtn){
    openCartBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      window.location.href = 'cart.html';
    });
  }

  // eltávolítjuk a drawer és a cart-oldali "Fizetés" gombot (ha van)
  if(drawerCheckout) drawerCheckout.remove();
  if(pageCheckoutBtn) pageCheckoutBtn?.remove();

  // drawer funkciók továbbra is megmaradnak (ha mégis szükséges)
  function renderDrawer(){
    if(!drawerItems) return;
    drawerItems.innerHTML = '';
    const items = Object.values(cart);
    if(items.length === 0){
      drawerItems.innerHTML = '<div style="color:var(--muted);padding:12px">A kosár üres.</div>';
      if(drawerTotal) drawerTotal.textContent = '0 Ft';
      return;
    }
    let total = 0;
    items.forEach(it=>{
      total += it.qty * it.price;
      const el = document.createElement('div');
      el.className = 'drawer-item';
      el.innerHTML = `
        <img src="${it.img}" alt="${it.title}">
        <div class="meta">
          <div class="title">${it.title}</div>
          <div class="price">${formatCurrency(it.price)}</div>
          <div style="color:var(--muted);font-size:.85rem">${it.qty}×</div>
        </div>
        <div class="controls">
          <button class="btn" data-id="${it.id}" data-action="dec">−</button>
          <button class="btn" data-id="${it.id}" data-action="inc">+</button>
        </div>
      `;
      drawerItems.appendChild(el);
    });
    if(drawerTotal) drawerTotal.textContent = formatCurrency(total);
  }

  // open / close drawer
  function openDrawer(){
    if(!drawer || !overlay) return;
    drawer.classList.add('open');
    overlay.classList.remove('hidden');
    drawer.setAttribute('aria-hidden','false');
    overlay.setAttribute('aria-hidden','false');
    renderDrawer();
  }
  function closeDrawer(){
    if(!drawer || !overlay) return;
    drawer.classList.remove('open');
    overlay.classList.add('hidden');
    drawer.setAttribute('aria-hidden','true');
    overlay.setAttribute('aria-hidden','true');
  }

  // render product list on index page
  function renderProducts(){
    if(!productList) return;
    productList.innerHTML = '';
    products.forEach(p=>{
      const card = document.createElement('article');
      card.className = 'product-card';
      card.dataset.id = p.id; // fontos: kattintható kártya
      card.innerHTML = `
        <div class="product-media"><img src="${p.img}" alt="${p.title}"></div>
        <div class="product-body">
          <h3 class="product-title">${p.title}</h3>
          <p class="product-desc">${p.desc}</p>
          <div class="product-meta">
            <div class="price">${formatCurrency(p.price)}</div>
            <div class="specs">${p.specs.join(' • ')}</div>
          </div>
          <div class="controls">
            <input class="qty" type="number" min="1" value="1" data-id="${p.id}">
            <button class="btn primary add-to-cart" data-id="${p.id}">Kosárba</button>
          </div>
        </div>
      `;
      productList.appendChild(card);
    });
  }

  // megnyitja a részletes modal-t a kiválasztott termékről
  function openProductModal(id){
    const p = products.find(x=>x.id===id);
    if(!p) return;
    const modal = document.getElementById('product-modal');
    if(!modal) return;
    document.getElementById('modal-img').src = p.img;
    document.getElementById('modal-img').alt = p.title;
    document.getElementById('modal-title').textContent = p.title;
    document.getElementById('modal-price').textContent = formatCurrency(p.price);
    document.getElementById('modal-desc').textContent = p.desc;
    document.getElementById('modal-specs').textContent = p.specs.join(' • ');
    document.getElementById('modal-qty').value = 1;

    // swatches
    const swatches = document.getElementById('color-swatches');
    swatches.innerHTML = '';
    (p.colors || []).forEach((c, idx)=>{
      const s = document.createElement('button');
      s.className = 'swatch';
      s.style.background = c.hex;
      s.title = c.name;
      s.dataset.colorName = c.name;
      if(idx === 0) s.classList.add('selected');
      s.addEventListener('click', ()=>{
        swatches.querySelectorAll('.swatch').forEach(x=>x.classList.remove('selected'));
        s.classList.add('selected');
      });
      swatches.appendChild(s);
    });

    // store current product id on modal action buttons
    document.getElementById('modal-add').dataset.id = p.id;
    document.getElementById('modal-buy').dataset.id = p.id;

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
  }

  // close product modal
  function closeProductModal(){
    const modal = document.getElementById('product-modal');
    if(!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
  }

  // kattintás a termékkártyán: ha nem a Kosár gomb vagy qty volt, nyisson modal-t
  if(productList){
    productList.addEventListener('click', (e)=>{
      // ha add-to-cart gomb, hagyjuk az add-to-cart logikát
      if(e.target.closest('.add-to-cart')) return;
      if(e.target.closest('.qty')) return;
      const card = e.target.closest('.product-card');
      if(!card) return;
      const id = Number(card.dataset.id);
      openProductModal(id);
    });
  }

  // modal gombok
  const closeProductBtn = document.getElementById('close-product-modal');
  if(closeProductBtn) closeProductBtn.addEventListener('click', closeProductModal);
  const modalAddBtn = document.getElementById('modal-add');
  const modalBuyBtn = document.getElementById('modal-buy');
  if(modalAddBtn){
    modalAddBtn.addEventListener('click', (e)=>{
      const id = Number(e.target.dataset.id);
      const qty = Math.max(1, Number(document.getElementById('modal-qty').value||1));
      const sw = document.querySelector('#color-swatches .swatch.selected');
      const colorName = sw ? sw.dataset.colorName : null;
      const p = products.find(x=>x.id===id);
      if(!p) return;
      const key = id + (colorName ? '::' + colorName : '');
      if(cart[key]) cart[key].qty += qty;
      else cart[key] = {...p, qty, color: colorName, id: key};
      saveCart();
      updateCartUI();
      // rövid visszajelzés
      e.target.textContent = 'Hozzáadva';
      setTimeout(()=> e.target.textContent = 'Kosárba', 900);
      closeProductModal();
    });
  }
  if(modalBuyBtn){
    modalBuyBtn.addEventListener('click', (e)=>{
      // hozzáad és átirányít a kosár oldalra
      const id = Number(e.target.dataset.id);
      const qty = Math.max(1, Number(document.getElementById('modal-qty').value||1));
      const sw = document.querySelector('#color-swatches .swatch.selected');
      const colorName = sw ? sw.dataset.colorName : null;
      const p = products.find(x=>x.id===id);
      if(!p) return;
      const key = id + (colorName ? '::' + colorName : '');
      if(cart[key]) cart[key].qty += qty;
      else cart[key] = {...p, qty, color: colorName, id: key};
      saveCart();
      updateCartUI();
      window.location.href = 'cart.html';
    });
  }

  // close modal on overlay click or Escape
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeProductModal(); });

  // render cart UI (header count + cart page list if exists)
  function updateCartUI(){
    const entries = Object.values(cart);
    if(cartCountEl) cartCountEl.textContent = cartItemCount();
    if(cartListEl){
      cartListEl.innerHTML = '';
      if(entries.length===0){
        cartListEl.innerHTML = '<div style="color:var(--muted)">A kosár üres.</div>';
        if(cartTotalEl) cartTotalEl.textContent = '0 Ft';
        return;
      }
      let total = 0;
      entries.forEach(item=>{
        total += item.qty * item.price;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <div class="product-media"><img src="${item.img}" alt="${item.title}"></div>
          <div class="product-body">
            <h3 class="product-title">${item.title}</h3>
            <div class="product-desc">${item.desc}</div>
            <div class="product-meta" style="margin-top:8px">
              <div style="font-weight:700">${formatCurrency(item.price)}</div>
              <div style="color:var(--muted)">${item.specs?.join ? item.specs.join(' • ') : ''}</div>
            </div>
            <div class="controls" style="margin-top:10px">
              <button class="btn" data-id="${item.id}" data-action="dec">−</button>
              <div style="min-width:40px;text-align:center">${item.qty}</div>
              <button class="btn" data-id="${item.id}" data-action="inc">+</button>
              <button class="btn" data-id="${item.id}" data-action="remove" title="Eltávolít">Töröl</button>
            </div>
          </div>
        `;
        cartListEl.appendChild(card);
      });
      if(cartTotalEl) cartTotalEl.textContent = formatCurrency(total);
    } else {
      // if no cartListEl but cartTotalEl exists (e.g. small sidebar), update total
      if(cartTotalEl){
        const total = Object.values(cart).reduce((s,i)=>s+i.qty*i.price,0);
        cartTotalEl.textContent = formatCurrency(total);
      }
    }
  }

  // add to cart from product list
  if(productList){
    productList.addEventListener('click', (e)=>{
      if(e.target.matches('.add-to-cart')){
        const id = Number(e.target.dataset.id);
        const qtyInput = document.querySelector(`.qty[data-id="${id}"]`);
        const qty = Math.max(1, Number(qtyInput.value||1));
        const p = products.find(x=>x.id===id);
        if(!p) return;
        if(cart[id]) cart[id].qty += qty;
        else cart[id] = {...p, qty};
        saveCart();
        updateCartUI();
      }
    });
  }

  // cart page controls (inc/dec/remove)
  if(cartListEl){
    cartListEl.addEventListener('click', (e)=>{
      const btn = e.target.closest('button');
      if(!btn) return;
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if(action === 'inc') {
        cart[id].qty++;
      } else if(action === 'dec') {
        cart[id].qty--;
        if(cart[id].qty <= 0) delete cart[id];
      } else if(action === 'remove') {
        delete cart[id];
      }
      saveCart();
      updateCartUI();
    });
  }

  // clear cart button on cart page
  if(pageClearBtn){
    pageClearBtn.addEventListener('click', ()=>{
      if(!confirm('Tényleg üríti a kosarat?')) return;
      cart = {};
      saveCart();
      updateCartUI();
    });
  }

  // open payment modal (page checkout or header link triggers navigation to cart page)
  function openPayment(){
    if(Object.keys(cart).length === 0){
      alert('A kosár üres.');
      return;
    }
    if(!paymentModal) {
      // if modal not present (index page), navigate to cart page
      window.location.href = 'cart.html';
      return;
    }
    paymentModal.classList.remove('hidden');
    paymentModal.setAttribute('aria-hidden','false');
    if(paymentStatus) paymentStatus.textContent = '';
  }

  if(pageCheckoutBtn) pageCheckoutBtn.addEventListener('click', openPayment);
  if(gotoCheckout) gotoCheckout.addEventListener('click', (e)=>{ e.preventDefault(); openPayment(); });

  if(closeModal) closeModal.addEventListener('click', closePayment);
  if(cancelPayment) cancelPayment.addEventListener('click', closePayment);

  function closePayment(){
    if(!paymentModal) return;
    paymentModal.classList.add('hidden');
    paymentModal.setAttribute('aria-hidden','true');
    if(paymentForm) paymentForm.reset();
  }

  // card input helpers and validation (only if fields exist on page)
  if(cardInput){
    cardInput.addEventListener('input', (e) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    });
  }
  if(expInput){
    expInput.addEventListener('input', (e) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length <= 2) e.target.value = digits;
      else e.target.value = digits.slice(0,2) + '/' + digits.slice(2);
    });
  }
  if(cvcInput){
    cvcInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    });
  }

  // mentés rendelésként (localStorage)
  function saveOrderRecord(order){
    try{
      const list = JSON.parse(localStorage.getItem('neon_orders')||'[]');
      list.push(order);
      localStorage.setItem('neon_orders', JSON.stringify(list));
    }catch(e){
      console.error('Order save error', e);
    }
  }

  // egyszerű PDF számla generálás jsPDF-vel, visszaad egy dataURI-t és letöltést indít
  function createInvoicePdf(order){
    if(!window.jspdf || !window.jspdf.jsPDF){
      console.warn('jsPDF hiányzik, nem lehet PDF-et készíteni.');
      return null;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 40;
    doc.setFontSize(18);
    doc.text('Neon Electronics - Számla', 40, y); y += 30;
    doc.setFontSize(10);
    doc.text(`Rendelés azonosító: ${order.id}`, 40, y); y += 14;
    doc.text(`Dátum: ${new Date(order.date).toLocaleString()}`, 40, y); y += 16;
    doc.text(`Név: ${order.name}`, 40, y);
    doc.text(`E-mail: ${order.email}`, 320, y); y += 20;

    doc.setFontSize(11);
    doc.text('Termékek:', 40, y); y += 14;

    order.items.forEach((it, idx) => {
      const line = `${idx+1}. ${it.title} - ${it.qty} × ${formatCurrency(it.price)} = ${formatCurrency(it.qty * it.price)}`;
      doc.text(line, 48, y); y += 14;
      if (y > 740) { doc.addPage(); y = 40; }
    });

    y += 8;
    doc.setFontSize(12);
    doc.text(`Összesen: ${formatCurrency(order.total)}`, 40, y);

    const filename = `${order.id}.pdf`;
    // letöltés
    try { doc.save(filename); } catch(e){ console.warn('PDF save failed', e); }

    // visszatérő data URI (base64) mentéshez
    try {
      const dataUri = doc.output('datauristring');
      return dataUri;
    } catch (e) {
      console.warn('PDF output datauri failed', e);
      return null;
    }
  }

  if(paymentForm){
    paymentForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const cardDigits = (cardInput.value || '').replace(/\D/g, '');
      const expDigits = (expInput.value || '').replace(/\D/g, '');
      const cvcDigits = (cvcInput.value || '').replace(/\D/g, '');

      if (cardDigits.length !== 16) {
        paymentStatus.textContent = 'A kártyaszámnak pontosan 16 számjegyből kell állnia.';
        return;
      }
      if (expDigits.length !== 4) {
        paymentStatus.textContent = 'A lejárati dátumnak 4 számjegynek kell lennie (MMYY).';
        return;
      }
      const month = parseInt(expDigits.slice(0,2), 10);
      const yearTwo = parseInt(expDigits.slice(2,4), 10);
      if (!(month >= 1 && month <= 12)) {
        paymentStatus.textContent = 'A hónynak 01 és 12 közé kell esnie.';
        return;
      }
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const fullYear = 2000 + yearTwo;
      if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
        paymentStatus.textContent = 'A kártya lejárt.';
        return;
      }
      if (cvcDigits.length !== 3) {
        paymentStatus.textContent = 'A CVC pontosan 3 számjegyű kell legyen.';
        return;
      }

      paymentStatus.textContent = 'Feldolgozás...';

      // szimulált fizetés és számla készítés
      setTimeout(()=>{
        // készíts mentésre szánt rendelés-objektumot a jelenlegi kosár elemeiből
        const orderItems = Object.values(cart);
        const total = orderItems.reduce((s,i)=>s + (i.qty * i.price), 0);
        const order = {
          id: 'ORD' + Date.now(),
          date: new Date().toISOString(),
          name: (paymentForm.name && paymentForm.name.value) || '',
          email: (paymentForm.email && paymentForm.email.value) || '',
          items: orderItems,
          total
        };

        // készíts PDF-et és mentsd el az order-re a base64 dataURI-t (ha sikerül)
        const pdfDataUri = createInvoicePdf(order);
        if(pdfDataUri) order.pdf = pdfDataUri;

        // mentsd el a rendelést (localStorage)
        saveOrderRecord(order);

        paymentStatus.textContent = 'Sikeres fizetés! Számla készült és letöltődött.';
        // ürítsd a kosarat és frissíts UI-t
        cart = {};
        saveCart();
        updateCartUI();

        setTimeout(()=>{
          closePayment();
        }, 1400);
      }, 1200);
    });
  }

  // initial render
  renderProducts();
  updateCartUI();
});