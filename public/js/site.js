const API_BASE = window.location.port === '3000' ? '/api' : 'http://localhost:3000/api';
const DEFAULT_DEMO_USER_ID = 1;

function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.split('/').pop();
  return page || 'index.html';
}

function getCurrentUserId() {
  return Number(localStorage.getItem('bm_user_id') || DEFAULT_DEMO_USER_ID);
}

async function ensureUserContext() {
  const existing = Number(localStorage.getItem('bm_user_id') || 0);
  if (existing > 0) {
    return existing;
  }

  try {
    const demo = await apiRequest('/auth/demo-user');
    localStorage.setItem('bm_user_id', String(demo.userId));
    return demo.userId;
  } catch (error) {
    localStorage.setItem('bm_user_id', String(DEFAULT_DEMO_USER_ID));
    return DEFAULT_DEMO_USER_ID;
  }
}

function setActiveNav() {
  const page = getCurrentPage();
  document.querySelectorAll('[data-nav]').forEach((item) => {
    if (item.getAttribute('href') === page) {
      item.classList.add('active');
    }
  });
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'API request failed');
  }

  return response.json();
}

async function updateCartCounter() {
  try {
    const cart = await apiRequest(`/cart/${getCurrentUserId()}`);
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = String(cart.totalItems || 0);
    });
  } catch (error) {
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = '0';
    });
  }
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) {
    return;
  }

  if (!products.length) {
    grid.innerHTML = '<article class="card"><div class="card-body"><p class="sub">No products found.</p></div></article>';
    return;
  }

  grid.innerHTML = products
    .map(
      (product) => `
      <article class="card">
        <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80'}" alt="${product.name}">
        <div class="card-body">
          <div class="row"><strong>${product.name}</strong><span class="price">$${Number(product.price).toLocaleString()}</span></div>
          <p class="sub">${product.category || 'Vehicle'} | Stock: ${product.quantityInStock}</p>
          <div class="row">
            <a class="btn" href="product-detail.html">View</a>
            <button class="btn btn-main" data-add-cart-id="${product.id}" type="button">+ Add to cart</button>
          </div>
        </div>
      </article>
      `,
    )
    .join('');

  attachAddToCartHandlers(grid);
}

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) {
    return;
  }

  try {
    const products = await apiRequest('/products');
    renderProducts(products);
  } catch (error) {
    grid.innerHTML = '<article class="card"><div class="card-body"><p class="sub">Failed to load products from API.</p></div></article>';
  }
}

async function loadCartPage() {
  const tableBody = document.getElementById('cart-table-body');
  const totalEl = document.getElementById('cart-grand-total');
  if (!tableBody || !totalEl) {
    return;
  }

  try {
    const cart = await apiRequest(`/cart/${getCurrentUserId()}`);

    if (!cart.items.length) {
      tableBody.innerHTML = '<tr><td colspan="4">No items in cart.</td></tr>';
      totalEl.textContent = 'Grand Total: $0';
      return;
    }

    tableBody.innerHTML = cart.items
      .map(
        (item) => `<tr><td>${item.name}</td><td>$${Number(item.unitPrice).toLocaleString()}</td><td>${item.quantity}</td><td>$${Number(item.subtotal).toLocaleString()}</td></tr>`,
      )
      .join('');

    totalEl.textContent = `Grand Total: $${Number(cart.totalPrice).toLocaleString()}`;
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="4">Failed to load cart.</td></tr>';
  }
}

async function loadCheckoutSummary() {
  const totalEl = document.getElementById('checkout-total');
  if (!totalEl) {
    return;
  }

  try {
    const cart = await apiRequest(`/cart/${getCurrentUserId()}`);
    totalEl.textContent = `Order Total: $${Number(cart.totalPrice).toLocaleString()}`;
  } catch (error) {
    totalEl.textContent = 'Order Total: $0';
  }
}

function attachAuthHandlers() {
  const registerBtn = document.getElementById('register-btn');
  const loginBtn = document.getElementById('login-btn');

  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      const fullName = document.getElementById('register-fullname')?.value || '';
      const [firstName, ...lastParts] = fullName.split(' ');
      const lastName = lastParts.join(' ');

      const payload = {
        email: document.getElementById('register-email')?.value,
        username: document.getElementById('register-username')?.value,
        password: document.getElementById('register-password')?.value,
        phone: document.getElementById('register-phone')?.value,
        firstName,
        lastName,
      };

      try {
        const user = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        localStorage.setItem('bm_user_id', String(user.id));
        alert('Register success');
      } catch (error) {
        alert('Register failed');
      }
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const payload = {
        identifier: document.getElementById('login-identifier')?.value,
        password: document.getElementById('login-password')?.value,
      };

      try {
        const result = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        localStorage.setItem('bm_user_id', String(result.userId));
        alert('Login success');
        window.location.href = 'product.html';
      } catch (error) {
        alert('Login failed');
      }
    });
  }
}

function attachCheckoutHandler() {
  const checkoutBtn = document.getElementById('checkout-btn');
  if (!checkoutBtn) {
    return;
  }

  checkoutBtn.addEventListener('click', async () => {
    const paymentMethod = document.querySelector('input[name="pay"]:checked')?.value || 'credit_card';
    const payload = {
      userId: getCurrentUserId(),
      paymentMethod,
      shippingAddress: document.getElementById('ship-street')?.value || 'N/A',
      shippingCity: document.getElementById('ship-city')?.value || null,
      shippingPostalCode: document.getElementById('ship-zip')?.value || null,
      shippingCountry: document.getElementById('ship-state')?.value || null,
    };

    try {
      const order = await apiRequest('/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await updateCartCounter();
      alert(`Order created: ${order.orderNumber}`);
      window.location.href = 'product.html';
    } catch (error) {
      alert('Checkout failed');
    }
  });
}

function attachAddToCartHandlers(root = document) {
  root.querySelectorAll('[data-add-cart-id]').forEach((button) => {
    if (button.dataset.bound === '1') {
      return;
    }

    button.dataset.bound = '1';
    button.addEventListener('click', async () => {
      const productId = Number(button.getAttribute('data-add-cart-id'));
      if (!productId) {
        alert('Invalid product');
        return;
      }

      try {
        await apiRequest(`/cart/${getCurrentUserId()}/items`, {
          method: 'POST',
          body: JSON.stringify({ productId, quantity: 1 }),
        });
        await updateCartCounter();
        alert('Added to cart');
      } catch (error) {
        alert('Add to cart failed');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await ensureUserContext();
  setActiveNav();
  await updateCartCounter();
  await loadProducts();
  await loadCartPage();
  await loadCheckoutSummary();
  attachAddToCartHandlers(document);
  attachAuthHandlers();
  attachCheckoutHandler();
});
