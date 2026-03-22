const API_BASE = window.location.port === '3000' ? '/api' : 'http://localhost:3000/api';
const DEFAULT_DEMO_USER_ID = 1;

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function successMessage(text = 'Success') {
  alert(text);
}

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
            <a class="btn" href="product-detail.html?id=${product.id}">View</a>
            <button class="btn btn-main" data-add-cart-id="${product.id}" type="button">+ Add to cart</button>
          </div>
        </div>
      </article>
      `,
    )
    .join('');

  attachAddToCartHandlers(grid);
}

function renderHomeProducts(products) {
  const grid = document.getElementById('home-product-grid');
  if (!grid) {
    return;
  }

  const topProducts = products.slice(0, 6);
  if (!topProducts.length) {
    grid.innerHTML = '<article class="card"><div class="card-body"><p class="sub">No products found.</p></div></article>';
    return;
  }

  grid.innerHTML = topProducts
    .map(
      (product) => `
      <article class="card">
        <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80'}" alt="${escapeHtml(product.name)}">
        <div class="card-body">
          <div class="row"><strong>${escapeHtml(product.name)}</strong><span class="price">$${Number(product.price).toLocaleString()}</span></div>
          <p class="sub">${escapeHtml(product.category || 'Vehicle')} | Stock: ${Number(product.quantityInStock || 0)}</p>
          <div class="row">
            <a class="btn" href="product-detail.html?id=${product.id}">View</a>
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
    renderHomeProducts(products);
  } catch (error) {
    grid.innerHTML = '<article class="card"><div class="card-body"><p class="sub">Failed to load products from API.</p></div></article>';
  }
}

function renderStars(score) {
  const safe = Math.max(0, Math.min(5, Math.round(Number(score) || 0)));
  return '★'.repeat(safe) + '☆'.repeat(5 - safe);
}

async function loadProductDetailPage() {
  const nameEl = document.getElementById('detail-name');
  if (!nameEl) {
    return;
  }

  const productId = Number(getQueryParam('id') || 0);
  if (!productId) {
    nameEl.textContent = 'Product not found';
    return;
  }

  try {
    const product = await apiRequest(`/products/${productId}`);
    const reviews = await apiRequest(`/products/${productId}/reviews`);

    document.getElementById('detail-image').src = product.imageUrl || 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80';
    document.getElementById('detail-name').textContent = product.name;
    document.getElementById('detail-description').textContent = product.description || 'No description';
    document.getElementById('detail-price').textContent = `$${Number(product.price).toLocaleString()}`;
    document.getElementById('detail-stars').textContent = renderStars(product.rating);
    document.getElementById('detail-review-meta').textContent = `${Number(product.rating || 0).toFixed(1)} / 5 from ${Number(product.reviewCount || 0)} reviews`;
    document.getElementById('detail-category').textContent = product.category || '-';
    document.getElementById('detail-sku').textContent = product.sku || '-';
    document.getElementById('detail-stock').textContent = String(product.quantityInStock ?? '-');
    document.getElementById('detail-status').textContent = Number(product.quantityInStock || 0) > 0 ? 'Available' : 'Out of stock';

    const addBtn = document.getElementById('detail-add-cart');
    addBtn.setAttribute('data-add-cart-id', String(product.id));

    const reviewBox = document.getElementById('detail-reviews');
    if (!reviews.length) {
      reviewBox.innerHTML = '<p class="sub">No reviews yet.</p>';
    } else {
      reviewBox.innerHTML = reviews
        .slice(0, 5)
        .map((r) => `<p class="sub">${escapeHtml(r.username)} (${renderStars(r.rating)}): ${escapeHtml(r.comment)}</p>`)
        .join('');
    }

    const writeLink = document.getElementById('write-review-link');
    writeLink.href = `review.html?productId=${product.id}`;

    attachAddToCartHandlers(document);
  } catch (error) {
    nameEl.textContent = 'Failed to load product detail';
  }
}

function buildStarPicker(selected) {
  const picker = document.getElementById('star-picker');
  if (!picker) {
    return;
  }

  const current = Number(selected || 5);
  picker.innerHTML = '';
  for (let i = 1; i <= 5; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `star-btn ${i <= current ? 'active' : ''}`;
    btn.textContent = '★';
    btn.setAttribute('data-value', String(i));
    picker.appendChild(btn);
  }
}

async function loadReviewPage() {
  const select = document.getElementById('review-product');
  const submitBtn = document.getElementById('submit-review-btn');
  if (!select || !submitBtn) {
    return;
  }

  const products = await apiRequest('/products');
  select.innerHTML = products
    .map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`)
    .join('');

  const fromQuery = Number(getQueryParam('productId') || 0);
  if (fromQuery) {
    select.value = String(fromQuery);
  }

  let pickedRating = 5;
  buildStarPicker(pickedRating);

  const picker = document.getElementById('star-picker');
  picker.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }
    const value = Number(target.getAttribute('data-value') || 5);
    pickedRating = value;
    buildStarPicker(pickedRating);
  });

  submitBtn.addEventListener('click', async () => {
    const productId = Number(select.value);
    const comment = document.getElementById('review-comment')?.value?.trim() || '';

    if (!productId || !comment) {
      alert('กรุณาเลือกสินค้าและกรอกข้อความรีวิว');
      return;
    }

    try {
      await apiRequest(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          userId: getCurrentUserId(),
          rating: pickedRating,
          comment,
        }),
      });
      successMessage('Review submitted successfully');
      document.getElementById('review-comment').value = '';
    } catch (error) {
      alert('Submit review failed');
    }
  });
}

async function loadReviewsFeedPage() {
  const box = document.getElementById('reviews-feed');
  if (!box) {
    return;
  }

  try {
    const rows = await apiRequest('/reviews');
    if (!rows.length) {
      box.innerHTML = '<article class="card"><div class="card-body"><p class="sub">No feedback yet.</p></div></article>';
      return;
    }

    box.innerHTML = rows
      .map(
        (item) => `
        <article class="card">
          <div class="card-body">
            <div class="row">
              <strong>${escapeHtml(item.productName)}</strong>
              <span class="rating">${renderStars(item.rating)}</span>
            </div>
            <p class="sub" style="margin:8px 0;">by ${escapeHtml(item.username)}</p>
            <p>${escapeHtml(item.comment)}</p>
          </div>
        </article>
      `,
      )
      .join('');
  } catch (error) {
    box.innerHTML = '<article class="card"><div class="card-body"><p class="sub">Failed to load feedback.</p></div></article>';
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
        successMessage('Add to cart success');
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
  await loadProductDetailPage();
  await loadReviewPage();
  await loadReviewsFeedPage();
  await loadCartPage();
  await loadCheckoutSummary();
  attachAddToCartHandlers(document);
  attachAuthHandlers();
  attachCheckoutHandler();
});
