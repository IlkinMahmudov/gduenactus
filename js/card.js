let originalData = [];

function renderProducts(products) {
  const list = document.getElementById('product-list');
  list.innerHTML = '';

  if (products.length === 0) {
    list.innerHTML = '<p>Heç bir məhsul tapılmadı.</p>';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  console.log("📦 Cari category:", category);

  toggleBrandFilters(category);

  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';

    const discountTag = p.discount > 0 ? `<div class="discount-tag">-${p.discount}%</div>` : '';
    const oldPrice = p.discount > 0 && p.old_price !== null ? `<span class="old-price">${p.old_price} ₼</span>` : ''; // old_price null ola bilər

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
  const minInput = document.getElementById("minPrice");
  const maxInput = document.getElementById("maxPrice");
  const rangeMin = document.getElementById("priceRangeMin");
  const rangeMax = document.getElementById("priceRangeMax");

  // Number input ilə slider sinxron
  minInput.addEventListener("input", () => {
    rangeMin.value = minInput.value;
    applyFilters();
  });

  maxInput.addEventListener("input", () => {
    rangeMax.value = maxInput.value;
    applyFilters();
  });

  // Slider input ilə number input sinxron
  rangeMin.addEventListener("input", () => {
    minInput.value = rangeMin.value;
    applyFilters();
  });

  rangeMax.addEventListener("input", () => {
    maxInput.value = rangeMax.value;
    applyFilters();
  });

  document.getElementById('priceFilterBtn').addEventListener('click', applyFilters);
  document.getElementById('discountOnly').addEventListener('change', applyFilters);
  document.getElementById('sortBy').addEventListener('change', applyFilters);

  document.querySelectorAll('input[name="brand"]').forEach(cb => {
    cb.addEventListener('change', applyFilters);
  });
}

// Əlavə olunmuş sinxron funksiya (təhlükəsiz saxlanıb)
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
  const laptopFilter = document.getElementById('laptop-brand-filter');
  const powertoolsFilter = document.getElementById('powertools-brand-filter');
  const wardrobesFilter = document.getElementById('wardrobes-brand-filter');

  document.querySelectorAll('.brand-checkboxes').forEach(el => el.classList.add('hidden'));

  if (category === 'beds' || category === 'sofas') { // "furniture" əvəzinə "sofas" daxil etdim, çünki əvvəlki JSON-da "sofas" var idi. Əgər furniture olacaqsa əlavə edə bilərik.
    bedFilter.classList.remove('hidden');
  }
  else if(category === 'electronics' || category === 'blenders' || category === 'washing-machines' || category === 'microwaves' || category === 'refrigerators' || category === 'cameras' || category === 'drones'){
    laptopFilter.classList.remove('hidden'); // Elektronika kateqoriyaları üçün bir filter
  }
  else if(category === 'powertools'){
    powertoolsFilter.classList.remove('hidden');
  }
  else if(category === 'wardrobes'){
    wardrobesFilter.classList.remove('hidden');
  }
  else {
    techFilter.classList.remove('hidden'); // Ümumi texnologiya filtrləri (əgər hələ də istifadə olunursa)
  }
}


function setupSearch(category) {
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");
  const searchButton = document.getElementById('searchButton'); // Axtar düyməsini də götürək

  fetch(`data/${category}.json`)
    .then(res => res.json())
    .then(data => {
      // originalData'nı burada doldurmaq daha yaxşıdır, əgər bu funksiya init zamanı çağırılırsa
      // originalData = data; // Bu sətri INIT hissəsindən kopyaladım, iki dəfə çağırılmasının qarşısını almaq üçün

      // SİLİNDİ: inputa mətn yazdıqca axtarış funksiyasını işə salan hissə
      /*
      input.addEventListener("input", () => {
        const val = input.value.trim().toLowerCase();
        if (!val) {
          results.style.display = "none";
          results.innerHTML = "";
          renderProducts(originalData);
          return;
        }

        const filtered = data.filter(p => p.name.toLowerCase().includes(val));
        results.innerHTML = filtered.length > 0 ?
          filtered.slice(0, 5).map((p, idx) => `
            <div class="search-result-item" data-index="${idx}">${p.name} - ${p.price} ₼</div>
          `).join("") :
          "<div style='padding:10px;'>Heç nə tapılmadı</div>";

        results.style.display = "block";
        renderProducts(filtered);
      });
      */

      // YENİ: Axtar düyməsi klikləndikdə axtarışı et
      searchButton.addEventListener('click', () => {
        const val = input.value.trim().toLowerCase();
        if (!val) {
          results.style.display = "none";
          results.innerHTML = "";
          renderProducts(originalData); // Boş olarsa, bütün məhsulları göstər
          return;
        }

        const filtered = data.filter(p => p.name.toLowerCase().includes(val));
        results.innerHTML = filtered.length > 0 ?
          filtered.slice(0, 5).map((p, idx) => `
            <div class="search-result-item" data-index="${idx}">${p.name} - ${p.price} ₼</div>
          `).join("") :
          "<div style='padding:10px;'>Heç nə tapılmadı</div>";

        results.style.display = "block";
        renderProducts(filtered); // Filtrlənmiş məhsulları göstər
      });


      // Axtarış nəticəsinə klik edəndə yalnız o məhsulu göstər
      results.addEventListener("click", e => {
        if (e.target && e.target.classList.contains("search-result-item")) {
          const nameClicked = e.target.textContent.split(' - ')[0].trim().toLowerCase();
          const selected = data.find(p => p.name.toLowerCase() === nameClicked);
          if (selected) renderProducts([selected]);
          results.style.display = "none";
        }
      });

      // çöldə klik olarsa, nəticələri bağla
      document.addEventListener("click", e => {
        if (!results.contains(e.target) && e.target !== input && e.target !== searchButton) { // Düyməni də əlavə etdik
          results.style.display = "none";
        }
      });

      // ESC ilə axtarışı təmizlə və nəticələri bağla
      input.addEventListener("keydown", e => {
        if (e.key === "Escape") {
          results.style.display = "none";
          input.value = "";
          renderProducts(originalData);
        } else if (e.key === "Enter") { // Enter basıldıqda da axtarışı işə salmaq üçün
          searchButton.click(); // Axtar düyməsinin klik hadisəsini tətiklə
        }
      });
    });
}

function setupCatalogMenu() {
  const categories = [
    { name: "blenders", label: "Blenderlər", icon: "fa-solid fa-blender" },
    { name: "washing-machines", label: "Paltaryuyanlar", icon: "fa-solid fa-soap" },
    { name: "microwaves", label: "Mikrodalğalı sobalar", icon: "fa-solid fa-fire-burner" },
    { name: "refrigerators", label: "Soyuducular", icon: "fa-solid fa-snowflake" },
    { name: "laptops", label: "Noutbuklar", icon: "fa-solid fa-laptop" },
    { name: "cameras", label: "Kameralar", icon: "fa-solid fa-camera" },
    { name: "sofas", label: "Divanlar", icon: "fa-solid fa-couch" },
    { name: "chairs", label: "Oturacaqlar", icon: "fa-solid fa-chair" },
    { name: "beds", label: "Çarpayılar", icon: "fa-solid fa-bed" },
    { name: "wardrobes", label: "Dolablar", icon: "fa-solid fa-warehouse" },
    { name: "powertools", label: "Elektrik alətləri", icon: "fa-solid fa-screwdriver-wrench" },
    { name: "electronics", label: "Elektronika", icon: "fa-solid fa-plug" },
    { name: "drones", label: "Dronlar", icon: "fa-solid fa-helicopter" }
  ];

  const container = document.querySelector(".catalog-menu");
  categories.forEach(cat => {
    const a = document.createElement("a");
    a.href = `card.html?category=${cat.name}&name=${cat.name}`;
    a.textContent = cat.label;
    container.appendChild(a);
  });
}

// INIT (Səhifə yüklənəndə ilkin işə salma)
const params = new URLSearchParams(window.location.search);
const category = params.get("category");
const name = params.get("name") || category;

if (category && name) {
  document.addEventListener("DOMContentLoaded", () => {
    toggleBrandFilters(category);
    setupFilters();
    setupSearch(name); // setupSearch-i çağırırıq
    setupCatalogMenu();

    fetch(`data/${name}.json`)
      .then(res => {
        if (!res.ok) throw new Error("404");
        return res.json();
      })
      .then(data => {
        originalData = data; // Original məlumatları burada saxlayırıq
        renderProducts(data); // Bütün məhsulları ilk olaraq render edirik
      })
      .catch(err => {
        console.error("Fayl tapılmadı:", err);
        document.getElementById("product-list").innerHTML = "<p style='padding:20px;'>Məhsul məlumatı tapılmadı.</p>";
      });
  });
}

// Təmizləmə (X işarəsi) funksionallığı artıq yuxarıdakı `setupSearch` içində olmalıdı,
// ancaq DOMContentLoaded-in içinə də əlavə edildiyini nəzərə alaraq onu da buraya da daxil etdim.
// Lakin ən optimalı, bu event listenerlərin yalnız bir yerdə olmasıdır, tercihen setupSearch içində.
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const clearSearchIcon = document.getElementById('clearSearch');
  const searchButton = document.getElementById('searchButton');

  // Inputa mətn daxil edildikdə "X" işarəsini göstər
  // Bu hissə hələ də hər inputda işləyəcək, lakin axtarış nəticələrini render etməyəcək.
  searchInput.addEventListener('input', () => {
    if (searchInput.value.length > 0) {
      clearSearchIcon.classList.remove('hidden');
    } else {
      clearSearchIcon.classList.add('hidden');
    }
  });

  // "X" işarəsi klikləndikdə inputu təmizlə və "X"-i gizlə
  clearSearchIcon.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchIcon.classList.add('hidden');
    searchInput.focus();
    renderProducts(originalData); // Təmizləyəndə bütün məhsulları geri gətir
    document.getElementById('searchResults').style.display = "none"; // Axtarış nəticələrini gizlət
  });

  // Axtar düyməsi klikləndikdə nəticələr üçün əlavə funksionallıq
  // Qeyd: Bu event listener əgər setupSearch içində də varsa, iki dəfə işləyə bilər.
  // setupSearch içindəki əsas olaraq qəbul edilməlidir.
  searchButton.addEventListener('click', () => {
    // setupSearch içindəki axtarış məntiqi işləyəcək
    console.log("Axtar düyməsinə basıldı.");
  });
});