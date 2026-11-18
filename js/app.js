const products = [
  {
    id: "honey-oat-latte",
    name: "Honey oat latte",
    category: "coffee",
    description: "Espresso, silky oat milk, and a little wildflower honey.",
    price: 7205,
    image: "assets/images/honey-oat-latte.jpg",
    alt: "Iced latte with creamy milk"
  },
  {
    id: "slow-pour",
    name: "The slow pour",
    category: "coffee",
    description: "A bright, gentle single-origin pour-over, brewed to order.",
    price: 6223,
    image: "assets/images/slow-pour.jpg",
    alt: "Fresh coffee being prepared"
  },
  {
    id: "mellow-cappuccino",
    name: "Mellow cappuccino",
    category: "coffee",
    description: "Our house espresso tucked under a soft cloud of foam.",
    price: 5895,
    image: "assets/images/mellow-cappuccino.jpg",
    alt: "Cappuccino with delicate latte art"
  },
  {
    id: "matcha-cloud",
    name: "Matcha cloud",
    category: "tea",
    description: "Ceremonial matcha whisked slowly with your choice of milk.",
    price: 6878,
    image: "assets/images/matcha-cloud.jpg",
    alt: "A cup of green matcha tea"
  },
  {
    id: "lavender-tea",
    name: "Lavender earl grey",
    category: "tea",
    description: "Bergamot black tea with a calming hint of lavender.",
    price: 5240,
    image: "assets/images/lavender-earl-grey.jpg",
    alt: "Warm tea served in a ceramic cup"
  },
  {
    id: "lemon-loaf",
    name: "Lemon olive loaf",
    category: "dessert",
    description: "A tender, sunny slice finished with a little citrus glaze.",
    price: 5568,
    image: "assets/images/lemon-olive-loaf.jpg",
    alt: "A slice of lemon cake"
  },
  {
    id: "morning-bun",
    name: "Cardamom morning bun",
    category: "dessert",
    description: "Flaky, buttery layers rolled in fragrant cardamom sugar.",
    price: 5895,
    image: "assets/images/cardamom-morning-bun.jpg",
    alt: "Freshly baked golden pastries"
  },
  {
    id: "chocolate-cookie",
    name: "Sea salt cookie",
    category: "dessert",
    description: "Chewy dark chocolate, crisp edges, and flaky sea salt.",
    price: 4585,
    image: "assets/images/sea-salt-cookie.jpg",
    alt: "Fresh chocolate chip cookies"
  }
];

const CART_STORAGE_KEY = "mellow-coffee-cart";
const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#menu-search");
const noResults = document.querySelector("#no-results");
const cartDrawer = document.querySelector("#cart-drawer");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartTotal = document.querySelector("#cart-total");
const cartCount = document.querySelector(".cart-count");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const quantityDialog = document.querySelector("#quantity-dialog");
const quantityForm = document.querySelector("#quantity-form");
const quantityInput = document.querySelector("#quantity-input");
const quantityTotal = document.querySelector("#quantity-total");
let activeCategory = "all";
let cart = loadCart();
let selectedProductId = null;

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((item) =>
      item &&
      products.some((product) => product.id === item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );
  } catch (error) {
    console.error("Could not read the saved shopping bag.", error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Could not save the shopping bag.", error);
  }
}

function renderProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  productGrid.replaceChildren(...visibleProducts.map((product) => {
    const article = document.createElement("article");
    article.className = "product-card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "product-image-wrap";
    const image = document.createElement("img");
    image.className = "product-image";
    image.src = product.image;
    image.alt = product.alt;
    image.loading = "lazy";
    imageWrap.append(image);

    const info = document.createElement("div");
    info.className = "product-info";
    const titleRow = document.createElement("div");
    titleRow.className = "product-title-row";
    const title = document.createElement("h3");
    title.textContent = product.name;
    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);
    titleRow.append(title, price);

    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;
    const addButton = document.createElement("button");
    addButton.className = "add-button";
    addButton.type = "button";
    addButton.dataset.addProduct = product.id;
    addButton.textContent = "Add to bag +";
    info.append(titleRow, description, addButton);
    article.append(imageWrap, info);
    return article;
  }));
  noResults.hidden = visibleProducts.length > 0;
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IQ", {
    style: "currency",
    currency: "IQD",
    maximumFractionDigits: 0
  }).format(amount);
}

function addToCart(productId, quantity) {
  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else if (products.some((product) => product.id === productId)) {
    cart.push({ id: productId, quantity });
  }
  saveCart();
  renderCart();
}

function updateQuantitySummary() {
  const product = products.find((entry) => entry.id === selectedProductId);
  const quantity = quantityInput.valueAsNumber;
  const total = product ? product.price * quantity : NaN;
  const isValid = Number.isSafeInteger(quantity) && quantity > 0 && Number.isSafeInteger(total);

  quantityInput.setCustomValidity(
    quantityInput.value === "" || isValid ? "" : "Enter a whole quantity of 1 or more."
  );
  quantityTotal.textContent = isValid ? formatPrice(total) : "—";
}

function openQuantityDialog(productId) {
  const product = products.find((entry) => entry.id === productId);
  if (!product) return;

  selectedProductId = product.id;
  document.querySelector("#quantity-image").src = product.image;
  document.querySelector("#quantity-image").alt = product.alt;
  document.querySelector("#quantity-product-name").textContent = product.name;
  document.querySelector("#quantity-unit-price").textContent = formatPrice(product.price);
  quantityInput.value = "1";
  updateQuantitySummary();
  quantityDialog.showModal();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
}

function renderCart() {
  cartItems.replaceChildren();
  let total = 0;
  let count = 0;

  cart.forEach((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (!product) return;
    total += product.price * item.quantity;
    count += item.quantity;

    const row = document.createElement("article");
    row.className = "cart-item";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = "";
    const info = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = product.name;
    const detail = document.createElement("p");
    detail.textContent = `${item.quantity} × ${formatPrice(product.price)}`;
    info.append(title, detail);
    const removeButton = document.createElement("button");
    removeButton.className = "remove-item";
    removeButton.type = "button";
    removeButton.dataset.removeProduct = product.id;
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", `Remove ${product.name} from bag`);
    row.append(image, info, removeButton);
    cartItems.append(row);
  });

  cartCount.textContent = String(count);
  cartTotal.textContent = formatPrice(total);
  cartEmpty.hidden = count > 0;
  cartItems.hidden = count === 0;
}

function setDrawerOpen(isOpen) {
  cartDrawer.classList.toggle("open", isOpen);
  cartDrawer.setAttribute("aria-hidden", String(!isOpen));
  drawerBackdrop.hidden = !isOpen;
  document.body.classList.toggle("drawer-open", isOpen);
  if (isOpen) cartDrawer.querySelector(".drawer-close").focus();
}

document.querySelector(".filter-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter-button").forEach((filterButton) => {
    const isActive = filterButton === button;
    filterButton.classList.toggle("active", isActive);
    filterButton.setAttribute("aria-pressed", String(isActive));
  });
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-product]");
  if (button) openQuantityDialog(button.dataset.addProduct);
});

quantityInput.addEventListener("input", updateQuantitySummary);
quantityDialog.addEventListener("click", (event) => {
  const stepButton = event.target.closest("[data-quantity-step]");
  if (!stepButton) return;
  const currentQuantity = quantityInput.valueAsNumber;
  const step = Number(stepButton.dataset.quantityStep);
  quantityInput.value = String(Math.max(1, (Number.isSafeInteger(currentQuantity) ? currentQuantity : 1) + step));
  updateQuantitySummary();
});
quantityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!quantityForm.reportValidity() || !selectedProductId) return;
  addToCart(selectedProductId, quantityInput.valueAsNumber);
  quantityDialog.close();
});
quantityDialog.addEventListener("close", () => {
  selectedProductId = null;
  quantityForm.reset();
  quantityInput.setCustomValidity("");
});
document.querySelector(".quantity-close").addEventListener("click", () => quantityDialog.close());
document.querySelector("#quantity-cancel").addEventListener("click", () => quantityDialog.close());

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-product]");
  if (button) removeFromCart(button.dataset.removeProduct);
});

document.querySelector(".cart-trigger").addEventListener("click", () => setDrawerOpen(true));
document.querySelector(".drawer-close").addEventListener("click", () => setDrawerOpen(false));
document.querySelector(".continue-shopping").addEventListener("click", () => setDrawerOpen(false));
drawerBackdrop.addEventListener("click", () => setDrawerOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) setDrawerOpen(false);
});

const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.querySelector(".primary-nav");
navToggle.addEventListener("click", () => {
  const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isExpanded));
  navToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  primaryNav.classList.toggle("open", !isExpanded);
});
primaryNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    primaryNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  }
});

document.querySelector("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.querySelector("#form-status");
  if (!form.reportValidity()) return;
  status.textContent = "Thanks for your note! This demo validates messages in your browser but doesn't send them.";
  form.reset();
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
renderProducts();
renderCart();
