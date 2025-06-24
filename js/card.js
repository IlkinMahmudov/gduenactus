// card.js
let originalData = [];

function renderProducts(products) {
  const list = document.getElementById('product-list');
  list.innerHTML = '';

  if (products.length === 0) {
    list.innerHTML = '<p>Heç bir məhsul tapılmadı.</p>';
    return;
  }

  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';

    const discountTag = p.discount > 0 ? `<div class="discount-tag">-${p.discount}%</div>` : '';
    const oldPrice = p.discount > 0 ? `<span class="old-price">${p.old_price} ₼</span>` : '';

    div.innerHTML = `
      ${discountTag}
      <img src="${p.image}" alt="${p.name}">
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-price">${p.price} ₼ ${oldPrice}</div>
        <div class="product-bottom">
          <span class="rating">⭐ ${p.rating} (${p.review_count})</span>
          <span>${p.location}</span>
        </div>
      </div>
    `;

    list.appendChild(div);
  });
}

function applyFilters() {
  const discountOnly = document.getElementById('discountOnly').checked;
  const min = parseFloat(document.getElementById('minPrice').value) || 0;
  const max = parseFloat(document.getElementById('maxPrice').value) || Infinity;
  const sortBy = document.getElementById('sortBy').value;

  const selectedBrands = Array.from(document.querySelectorAll('.brand-checkboxes input:checked')).map(cb => cb.value);

  let filtered = originalData.filter(p => {
    const inRange = p.price >= min && p.price <= max;
    const matchDiscount = !discountOnly || p.discount > 0;
    const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
    return inRange && matchDiscount && matchBrand;
  });

  switch (sortBy) {
    case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
    case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
  }

  renderProducts(filtered);
}

function setupFilters() {
  document.getElementById('priceFilterBtn').addEventListener('click', applyFilters);
  document.getElementById('discountOnly').addEventListener('change', applyFilters);
  document.getElementById('sortBy').addEventListener('change', applyFilters);

  document.querySelectorAll('input[name="brand"]').forEach(cb => {
    cb.addEventListener('change', applyFilters);
  });

  ['minPrice', 'maxPrice', 'priceRangeMin', 'priceRangeMax'].forEach(id => {
    document.getElementById(id).addEventListener('input', syncPriceInputs);
  });
}

function syncPriceInputs() {
  const minInput = document.getElementById("minPrice");
  const maxInput = document.getElementById("maxPrice");
  const rangeMin = document.getElementById("priceRangeMin");
  const rangeMax = document.getElementById("priceRangeMax");

  rangeMin.value = minInput.value;
  rangeMax.value = maxInput.value;
}

function toggleBrandFilters(category) {
  const techFilter = document.getElementById('brand-filter');
  const bedFilter = document.getElementById('bed-brand-filter');

  document.querySelectorAll('.brand-checkboxes').forEach(el => el.classList.add('hidden'));

  if (category === 'beds' || category === 'furniture') {
    bedFilter.classList.remove('hidden');
  } else {
    techFilter.classList.remove('hidden');
  }
}

function setupSearch(category) {
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");

  fetch(`data/${category}.json`).then(res => res.json()).then(data => {
    input.addEventListener("input", () => {
      const val = input.value.trim().toLowerCase();
      if (!val) {
        results.style.display = "none";
        results.innerHTML = "";
        return;
      }

      const filtered = data.filter(p => p.name.toLowerCase().includes(val));
      results.innerHTML = filtered.length > 0 ?
        filtered.slice(0, 5).map(p => `
          <div onclick="window.location.href='card.html?category=${category}&name=${category}'">
            ${p.name} - ${p.price} ₼
          </div>
        `).join("") :
        "<div style='padding:10px;'>Heç nə tapılmadı</div>";

      results.style.display = "block";
    });

    document.addEventListener("click", e => {
      if (!results.contains(e.target) && e.target !== input) {
        results.style.display = "none";
      }
    });
  });
}

function setupCatalogMenu() {
  const categories = [
    { name: "blenders", label: "🥤 Blenderlər" },
    { name: "washing-machines", label: "🔀 Paltaryuyanlar" },
    { name: "microwaves", label: "🍲 Mikrodalğalı sobalar" },
    { name: "refrigerators", label: "🧊 Soyuducular" },
    { name: "laptops", label: "💻 Noutbuklar" },
    { name: "cameras", label: "📸 Kameralar" },
    { name: "sofas", label: "🛎️ Divanlar" },
    { name: "chairs", label: "🪑 Oturacaqlar" },
    { name: "beds", label: "🛏️ Çarpayılar" },
    { name: "wardrobes", label: "🛋 Dolablar" },
    { name: "powertools", label: "🔧 Elektrik alətləri" },
    { name: "electronics", label: "📱 Elektronika" },
    { name: "drones", label: "🚁 Dronlar" }
  ];

  const container = document.querySelector(".catalog-menu");
  categories.forEach(cat => {
    const a = document.createElement("a");
    a.href = `card.html?category=appliances&name=${cat.name}`;
    a.textContent = cat.label;
    container.appendChild(a);
  });
}

// INIT
const params = new URLSearchParams(window.location.search);
const category = params.get("category");
const name = params.get("name") || category;

if (category && name) {
  document.addEventListener("DOMContentLoaded", () => {
    toggleBrandFilters(category);
    setupFilters();
    setupSearch(name);
    setupCatalogMenu();

    fetch(`data/${name}.json`)
      .then(res => {
        if (!res.ok) throw new Error("404");
        return res.json();
      })
      .then(data => {
        originalData = data;
        renderProducts(data);
      })
      .catch(err => {
        console.error("Fayl tapılmadı:", err);
        document.getElementById("product-list").innerHTML = "<p style='padding:20px;'>Məhsul məlumatı tapılmadı.</p>";
      });
  });
}