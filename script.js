const DEFAULT_DATA = {
  users: [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', phone: '123-456-7890', address: '123 Fashion Ave, NY' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', phone: '987-654-3210', address: '456 Vintage St, CA' }
  ],
  products: [
    { id: 1, userId: 1, name: 'Vintage Leather Jacket', description: 'Authentic 90s leather jacket in mint condition.', price: 120.00, category: 'Clothing', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', status: 'available', date: new Date().toISOString() },
    { id: 2, userId: 2, name: 'Antique Oak Table', description: 'Solid oak coffee table perfect for modern homes.', price: 85.50, category: 'Furniture', image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', status: 'available', date: new Date().toISOString() },
    { id: 3, userId: 1, name: 'Sony DSLR Camera', description: 'Minimal usage, comes with two lenses and a bag.', price: 450.00, category: 'Electronics', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', status: 'available', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 4, userId: 2, name: 'Classic Gold Watch', description: 'Timeless piece, freshly serviced.', price: 210.00, category: 'Accessories', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', status: 'available', date: new Date(Date.now() - 172800000).toISOString() }
  ],
  cart: [
    { id: 1, productId: 2, quantity: 1 } // Alice's cart
  ]
};

// Initialize DB Simulation
function initDB() {
  if (!localStorage.getItem('revogue_db')) {
    localStorage.setItem('revogue_db', JSON.stringify(DEFAULT_DATA));
  }
}
initDB();

let currentUser = null; // Simulate logged-in user

function initAuth() {
  const stored = localStorage.getItem('revogue_currentUser');
  if (stored) {
    currentUser = parseInt(stored);
  } else {
    currentUser = null;
  }
}
initAuth(); // Initialize auth state

function getDB() {
  return JSON.parse(localStorage.getItem('revogue_db'));
}

function saveDB(data) {
  localStorage.setItem('revogue_db', JSON.stringify(data));
  updateCartCount();
}

function getSellerName(userId) {
  const db = getDB();
  const user = db.users.find(u => u.id === parseInt(userId));
  return user ? user.name : 'Unknown';
}

// -----------------------------------------------------
// GET & RENDER PRODUCTS
// -----------------------------------------------------
function renderProducts(isLatestOnly = false, sortBy = 'date') {
  const container = document.getElementById('latest-products') || document.getElementById('all-products');
  if (!container) return;

  const db = getDB();
  // Filter available products
  let productsToRender = db.products.filter(p => p.status === 'available');

  // Sorting
  if (sortBy === 'price-asc') {
    productsToRender.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    productsToRender.sort((a, b) => b.price - a.price);
  } else {
    // Default: Date Descending (Newest first)
    productsToRender.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Limit for home page
  if (isLatestOnly) {
    productsToRender = productsToRender.slice(0, 3);
  }

  container.innerHTML = '';

  if (productsToRender.length === 0) {
    container.innerHTML = '<p>No products available currently.</p>';
    return;
  }

  productsToRender.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}" class="product-img">
      <div class="product-info">
        <span class="product-category">${prod.category}</span>
        <h3 class="product-name">${prod.name}</h3>
        <p class="product-seller">Sold by: ${getSellerName(prod.userId)}</p>
        <div class="product-footer">
          <span class="product-price">$${prod.price.toFixed(2)}</span>
          <button class="btn btn-primary" onclick="addToCart(${prod.id})">Add to Cart</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// -----------------------------------------------------
// INSERT PRODUCT (Simulated POST)
// -----------------------------------------------------
function handleAddProduct(event) {
  event.preventDefault();
  const db = getDB();

  const name = document.getElementById('prodName').value;
  const desc = document.getElementById('prodDesc').value;
  const price = parseFloat(document.getElementById('prodPrice').value);
  const cat = document.getElementById('prodCat').value;
  const imgInput = document.getElementById('prodImg').value; // Using unspash dummy if empty

  const newId = (db.products.length > 0) ? Math.max(...db.products.map(p => p.id)) + 1 : 1;

  const newProduct = {
    id: newId,
    userId: currentUser,
    name: name,
    description: desc,
    price: price,
    category: cat,
    image: imgInput || 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    status: 'available',
    date: new Date().toISOString()
  };

  db.products.push(newProduct);
  saveDB(db);

  alert('Product added successfully!');
  document.getElementById('add-product-form').reset();

  if (document.getElementById('all-products')) {
    renderProducts(false, document.getElementById('sortProducts') ? document.getElementById('sortProducts').value : 'date');
  } else {
    // Redirect to the products list page
    window.location.href = 'buy.html';
  }
}

// -----------------------------------------------------
// CART OPERATIONS
// -----------------------------------------------------
function updateCartCount() {
  const db = getDB();
  const countEl = document.getElementById('nav-cart-count');
  if (countEl) {
    const totalItems = db.cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = totalItems;
  }
}

function addToCart(productId) {
  const db = getDB();
  const existing = db.cart.find(c => c.productId === productId);
  if (existing) {
    existing.quantity += 1; // Update
  } else {
    // Insert
    db.cart.push({ id: Date.now(), productId: productId, quantity: 1 });
  }
  saveDB(db);
  alert('Item added to cart!');
}

function updateCartQuantity(cartId, newQuantity) {
  const db = getDB();
  const item = db.cart.find(c => c.id === cartId);
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    item.quantity = newQuantity;
    saveDB(db);
    renderCart();
  }
}

function removeFromCart(cartId) {
  const db = getDB();
  db.cart = db.cart.filter(c => c.id !== cartId); // Delete
  saveDB(db);
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items-body');
  if (!container) return;

  const db = getDB();
  container.innerHTML = '';
  let total = 0;

  if (db.cart.length === 0) {
    container.innerHTML = '<tr><td colspan="4" style="text-align:center;">Your cart is empty.</td></tr>';
    document.getElementById('cart-total').textContent = '$0.00';
    return;
  }

  db.cart.forEach(cartItem => {
    const product = db.products.find(p => p.id === cartItem.productId);
    if (!product) return;

    const subtotal = product.price * cartItem.quantity;
    total += subtotal;

    const tr = document.createElement('tr');
    tr.className = 'cart-item-row';
    tr.innerHTML = `
      <td data-label="Product">
        <div class="cart-product-info">
          <img src="${product.image}" class="cart-img" alt="${product.name}">
          <div>
            <div style="font-weight: 600; color: var(--primary);">${product.name}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Seller: ${getSellerName(product.userId)}</div>
          </div>
        </div>
      </td>
      <td data-label="Price">$${product.price.toFixed(2)}</td>
      <td data-label="Quantity">
        <input type="number" class="qty-input" value="${cartItem.quantity}" min="1" onchange="updateCartQuantity(${cartItem.id}, this.value)">
      </td>
      <td data-label="Total">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>$${subtotal.toFixed(2)}</strong>
          <button class="btn btn-danger" style="padding: 0.3rem 0.8rem;" onclick="removeFromCart(${cartItem.id})">Remove</button>
        </div>
      </td>
    `;
    container.appendChild(tr);
  });

  document.getElementById('cart-total').textContent = '$' + total.toFixed(2);
}

// -----------------------------------------------------
// PROFILE & USER OPERATIONS
// -----------------------------------------------------
function renderProfile() {
  const profNameEl = document.getElementById('prof-name');
  if (!profNameEl) return;

  const authSec = document.getElementById('auth-section');
  const profSec = document.getElementById('profile-section');

  if (currentUser === null) {
    if (authSec) authSec.style.display = 'block';
    if (profSec) profSec.style.display = 'none';
    return;
  } else {
    if (authSec) authSec.style.display = 'none';
    if (profSec) profSec.style.display = 'block';
  }

  const db = getDB();
  const user = db.users.find(u => u.id === currentUser);
  if (!user) return;

  document.getElementById('prof-name').textContent = user.name;
  document.getElementById('prof-email').textContent = user.email;
  document.getElementById('prof-phone').textContent = user.phone;
  document.getElementById('prof-address').textContent = user.address;

  // Render My Listed Products
  const myListings = document.getElementById('my-listings');
  const userProducts = db.products.filter(p => p.userId === currentUser);

  if (userProducts.length === 0) {
    myListings.innerHTML = '<p>You have not listed any products yet.</p>';
  } else {
    myListings.innerHTML = '';
    userProducts.forEach(prod => {
      myListings.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 1rem; border-bottom: 1px solid var(--border);">
          <div>
            <strong style="color:var(--primary); font-size:1.1rem;">${prod.name}</strong>
            <p style="color:var(--text-muted); font-size:0.9rem;">Status: <span style="color:${prod.status === 'available' ? 'var(--success)' : 'var(--text-muted)'}">${prod.status}</span></p>
          </div>
          <div style="font-weight:bold; color:var(--primary);">$${prod.price.toFixed(2)}</div>
        </div>
      `;
    });
  }
}

// -----------------------------------------------------
// AUTHENTICATION LOGIC
// -----------------------------------------------------
function switchAuthTab(tab) {
  document.getElementById('tab-login').classList.remove('active');
  document.getElementById('tab-register').classList.remove('active');

  if (tab === 'login') {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
  } else {
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const db = getDB();
  const user = db.users.find(u => u.email === email);
  if (user) {
    currentUser = user.id;
    localStorage.setItem('revogue_currentUser', currentUser);
    renderProfile();
    if (typeof updateInitials === 'function') updateInitials();
  } else {
    alert('User not found. Try alice@example.com or register a new account.');
  }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;

  const db = getDB();
  if (db.users.find(u => u.email === email)) {
    alert('Email already registered.');
    return;
  }

  const newId = (db.users.length > 0) ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newUser = { id: newId, name, email, phone: 'Not Provided', address: 'Not Provided' };
  db.users.push(newUser);
  saveDB(db);

  currentUser = newId;
  localStorage.setItem('revogue_currentUser', currentUser);
  renderProfile();
  if (typeof updateInitials === 'function') updateInitials();
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('revogue_currentUser');
  renderProfile();
}

// Global Init Calls
updateCartCount();
