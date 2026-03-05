const products = [
  { id: 1, name: 'Wireless Earbuds', category: 'Electronics', price: 49, tags: ['audio', 'bluetooth'] },
  { id: 2, name: 'Smart Watch', category: 'Electronics', price: 79, tags: ['fitness', 'wearable'] },
  { id: 3, name: 'Coffee Maker', category: 'Home', price: 59, tags: ['kitchen', 'morning'] },
  { id: 4, name: 'Ergonomic Chair', category: 'Furniture', price: 129, tags: ['office', 'comfort'] },
  { id: 5, name: 'Gaming Mouse', category: 'Electronics', price: 39, tags: ['gaming', 'pc'] },
  { id: 6, name: 'Air Fryer', category: 'Home', price: 89, tags: ['kitchen', 'healthy'] },
];

const state = {
  query: '',
  category: 'all',
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]'),
};

const productsEl = document.getElementById('products');
const recommendationsEl = document.getElementById('recommendations');
const categoryFilter = document.getElementById('categoryFilter');

function initCategories() {
  [...new Set(products.map((p) => p.category))].forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

function scoreProduct(product) {
  const likedIds = new Set([...state.cart, ...state.wishlist]);
  const likedProducts = products.filter((p) => likedIds.has(p.id));
  const likedTags = likedProducts.flatMap((p) => p.tags);
  return product.tags.reduce((acc, tag) => acc + (likedTags.includes(tag) ? 2 : 0), 0);
}

function getFilteredProducts() {
  return products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(state.query.toLowerCase());
    const matchesCategory = state.category === 'all' || p.category === state.category;
    return matchesQuery && matchesCategory;
  });
}

function renderCard(product) {
  const item = document.createElement('article');
  item.className = 'card';
  item.innerHTML = `
    <h4>${product.name}</h4>
    <div class="price">$${product.price}</div>
    <div class="tags">${product.category} • ${product.tags.join(' • ')}</div>
    <div class="card-actions">
      <button class="add">Add to Cart</button>
      <button class="like">♡ Save</button>
    </div>
  `;

  item.querySelector('.add').onclick = () => {
    state.cart.push(product.id);
    persist();
    renderAll();
  };
  item.querySelector('.like').onclick = () => {
    if (!state.wishlist.includes(product.id)) state.wishlist.push(product.id);
    persist();
    renderAll();
  };

  return item;
}

function renderAll() {
  productsEl.innerHTML = '';
  getFilteredProducts().forEach((p) => productsEl.appendChild(renderCard(p)));

  const recs = products
    .filter((p) => !state.cart.includes(p.id) && !state.wishlist.includes(p.id))
    .map((p) => ({ ...p, score: scoreProduct(p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  recommendationsEl.innerHTML = '';
  recs.forEach((p) => recommendationsEl.appendChild(renderCard(p)));

  document.getElementById('cartCount').textContent = state.cart.length;
  document.getElementById('wishlistCount').textContent = state.wishlist.length;

  const cartProducts = state.cart.map((id) => products.find((p) => p.id === id));
  document.getElementById('cartItems').innerHTML = cartProducts.map((p) => `<li>${p.name} - $${p.price}</li>`).join('');
  const total = cartProducts.reduce((sum, p) => sum + p.price, 0);
  document.getElementById('cartTotal').textContent = `Total: $${total}`;

  const wishProducts = state.wishlist.map((id) => products.find((p) => p.id === id));
  document.getElementById('wishlistItems').innerHTML = wishProducts.map((p) => `<li>${p.name}</li>`).join('');
}

function persist() {
  localStorage.setItem('cart', JSON.stringify(state.cart));
  localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  state.query = e.target.value;
  renderAll();
});

categoryFilter.addEventListener('change', (e) => {
  state.category = e.target.value;
  renderAll();
});

document.getElementById('cartBtn').onclick = () => document.getElementById('cartDialog').showModal();
document.getElementById('wishlistBtn').onclick = () => document.getElementById('wishlistDialog').showModal();

document.getElementById('themeToggle').onclick = () => {
  document.body.classList.toggle('dark');
};

initCategories();
renderAll();
