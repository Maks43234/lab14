let globalStoreProducts = [];

const localProducts = [
    {
        id: 1,
        title: "Смартфон Samsung Galaxy",
        price: 599.99,
        image: "https://placehold.co/300x200?text=Samsung"
    },
    {
        id: 2,
        title: "Ноутбук Lenovo",
        price: 899.99,
        image: "https://placehold.co/300x200?text=Lenovo"
    },
    {
        id: 3,
        title: "Навушники Sony",
        price: 149.99,
        image: "https://placehold.co/300x200?text=Sony"
    },
    {
        id: 4,
        title: "Мишка Logitech",
        price: 49.99,
        image: "https://placehold.co/300x200?text=Logitech"
    },
    {
        id: 5,
        title: "Клавіатура HyperX",
        price: 89.99,
        image: "https://placehold.co/300x200?text=HyperX"
    },
    {
        id: 6,
        title: "Монітор LG",
        price: 299.99,
        image: "https://placehold.co/300x200?text=LG"
    },
    {
        id: 7,
        title: "Планшет Apple iPad",
        price: 699.99,
        image: "https://placehold.co/300x200?text=iPad"
    },
    {
        id: 8,
        title: "Вебкамера Logitech",
        price: 79.99,
        image: "https://placehold.co/300x200?text=Webcam"
    }
];

async function fetchProducts() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
        const response = await fetch(
            "https://fakestoreapi.com/products?limit=8",
            {
                signal: controller.signal
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP помилка: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        return localProducts;
    } finally {
        clearTimeout(timeout);
    }
}

let cart = [];

const productsGrid = document.querySelector(".products-grid");
const cartButton = document.querySelector(".btn-cart");
const cartOverlay = document.getElementById("cartOverlay");
const closeBtn = document.getElementById("closeCartBtn");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartTotalSum = document.getElementById("cartTotalSum");
const favoritesZone = document.getElementById("favoritesZone");

async function initShop() {
    const loader = document.getElementById("loader");

    loader.classList.remove("hidden");
    productsGrid.innerHTML = "";

    try {
        const data = await fetchProducts();

        globalStoreProducts = data;

        productsGrid.innerHTML = data.map((product) => `
            <div
                class="product-card"
                draggable="true"
                data-id="${product.id}"
            >
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p class="product-price">$${Number(product.price).toFixed(2)}</p>
                <button
                    class="btn btn-buy"
                    data-id="${product.id}"
                    type="button"
                >
                    Купити
                </button>
            </div>
        `).join("");
    } catch (error) {
        productsGrid.innerHTML = `
            <p class="error">
                Не вдалося завантажити товари.
            </p>
        `;
    } finally {
        loader.classList.add("hidden");
    }
}

productsGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".btn-buy");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.id);

    const product = globalStoreProducts.find(
        (item) => item.id === productId
    );

    if (product) {
        addToCart(product);
    }
});

productsGrid.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".product-card");

    if (!card) {
        return;
    }

    event.dataTransfer.setData(
        "text/plain",
        card.dataset.id
    );

    event.dataTransfer.effectAllowed = "move";
    card.classList.add("dragging");
});

productsGrid.addEventListener("dragend", (event) => {
    const card = event.target.closest(".product-card");

    if (!card) {
        return;
    }

    card.classList.remove("dragging");
});

favoritesZone.addEventListener("dragover", (event) => {
    event.preventDefault();

    favoritesZone.classList.add("drag-over");
    event.dataTransfer.dropEffect = "move";
});

favoritesZone.addEventListener("dragleave", () => {
    favoritesZone.classList.remove("drag-over");
});

favoritesZone.addEventListener("drop", (event) => {
    event.preventDefault();

    favoritesZone.classList.remove("drag-over");

    const productId = Number(
        event.dataTransfer.getData("text/plain")
    );

    const product = globalStoreProducts.find(
        (item) => item.id === productId
    );

    if (!product) {
        return;
    }

    const favoriteItem = document.createElement("div");

    favoriteItem.classList.add("fav-item");

    favoriteItem.textContent =
        `${product.title} (ID: ${product.id})`;

    favoritesZone.appendChild(favoriteItem);
});

function addToCart(product) {
    const existingItem = cart.find(
        (item) => item.id === product.id
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            name: product.title,
            quantity: 1
        });
    }

    updateUI();
}

function increaseQuantity(productId) {
    const item = cart.find(
        (item) => item.id === productId
    );

    if (item) {
        item.quantity += 1;
    }

    updateUI();
}

function decreaseQuantity(productId) {
    const item = cart.find(
        (item) => item.id === productId
    );

    if (!item) {
        return;
    }

    item.quantity -= 1;

    if (item.quantity <= 0) {
        cart = cart.filter(
            (cartItem) => cartItem.id !== productId
        );
    }

    updateUI();
}

function calculateTotal() {
    return cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Кошик порожній.</p>";
        cartTotalSum.textContent = "0";
        return;
    }

    cartItemsContainer.innerHTML = cart.map((item) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">

            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">
                    $${Number(item.price).toFixed(2)}
                </div>
            </div>

            <div class="cart-item-controls">
                <button
                    class="quantity-btn"
                    data-action="decrease"
                    data-id="${item.id}"
                    type="button"
                >
                    −
                </button>

                <span class="quantity">${item.quantity}</span>

                <button
                    class="quantity-btn"
                    data-action="increase"
                    data-id="${item.id}"
                    type="button"
                >
                    +
                </button>
            </div>
        </div>
    `).join("");

    cartTotalSum.textContent =
        calculateTotal().toFixed(2);
}

cartItemsContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".quantity-btn");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.id);

    if (button.dataset.action === "increase") {
        increaseQuantity(productId);
    }

    if (button.dataset.action === "decrease") {
        decreaseQuantity(productId);
    }
});

function updateUI() {
    const cartCounter =
        document.querySelector(".cart-counter");

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    cartCounter.textContent = totalItems;

    renderCartItems();
}

function openCartModal() {
    renderCartItems();
    cartOverlay.classList.remove("hidden");
}

function closeCartModal() {
    cartOverlay.classList.
    add("hidden");
}

cartButton.addEventListener("click", openCartModal);

closeBtn.addEventListener("click", closeCartModal);

cartOverlay.addEventListener("click", (event) => {
    if (event.target === cartOverlay) {
        closeCartModal();
    }
});

initShop();
updateUI();