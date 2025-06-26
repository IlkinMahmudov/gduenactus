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

    container.innerHTML = '';
    categories.forEach(cat => {
      const a = document.createElement("a");
      
      a.textContent = cat.label;
      a.href = `card.html?category=${cat.name}&name=${cat.name}`;
      container.appendChild(a);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
   
    setupCatalogMenu();

    const filterButtons = document.querySelectorAll('.filter-button');
    const cards = document.querySelectorAll('.card');


    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const category = button.getAttribute('data-category');

        cards.forEach(card => {
          card.classList.toggle('show', category === 'all' || card.getAttribute('data-category') === category);
        });
      });
    });

    cards.forEach(card => {
      card.addEventListener("click", () => {
        const category = card.getAttribute("data-category");
        const name = card.getAttribute("data-name");
        window.location.href = `card.html?category=${category}&name=${name}`;
      });
    });


    const searchInput = document.getElementById('searchInput');
    const clearSearchIcon = document.getElementById('clearSearch');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', () => {
      if (searchInput.value.length > 0) {
        clearSearchIcon.classList.remove('hidden');
      } else {
        clearSearchIcon.classList.add('hidden');
        searchResults.style.display = 'none'; 
      }
    });

 
    clearSearchIcon.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchIcon.classList.add('hidden');
      searchResults.style.display = 'none';
      searchInput.focus();
      
      const allButton = document.querySelector('.filter-button[data-category="all"]');
      if (allButton) {
        allButton.click(); 
      }
    });

    
    const performSearch = () => {
      const searchTerm = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = ''; 

      if (!searchTerm) {
        searchResults.style.display = 'none';
        
        const allButton = document.querySelector('.filter-button[data-category="all"]');
        if (allButton) {
          allButton.click();
        }
        return;
      }

      let foundItems = [];

      cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category').toLowerCase();
        const cardName = card.getAttribute('data-name').toLowerCase();
        const cardText = card.querySelector('p').textContent.toLowerCase();

        if (cardText.includes(searchTerm) || cardName.includes(searchTerm) || cardCategory.includes(searchTerm)) {
          foundItems.push(card);
        }
      });

      if (foundItems.length > 0) {
      
        searchResults.style.display = 'block';
        foundItems.slice(0, 5).forEach((item, idx) => {
          const resultItem = document.createElement('div');
          resultItem.className = 'search-result-item';
          resultItem.textContent = item.querySelector('p').textContent;
          resultItem.addEventListener('click', () => {
     
            const itemCategory = item.getAttribute('data-category');
            const itemName = item.getAttribute('data-name');
            window.location.href = `card.html?category=${itemCategory}&name=${itemName}`;
          });
          searchResults.appendChild(resultItem);
        });

       
        cards.forEach(card => card.classList.remove('show')); 
        foundItems.forEach(card => card.classList.add('show')); 
    
        filterButtons.forEach(btn => btn.classList.remove('active'));

      } else {
        searchResults.style.display = 'block';
        searchResults.innerHTML = "<div style='padding:10px;'>Heç nə tapılmadı</div>";
        cards.forEach(card => card.classList.remove('show')); 
      }
    };

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      } else if (e.key === 'Escape') {
        searchInput.value = '';
        clearSearchIcon.classList.add('hidden');
        searchResults.style.display = 'none';
        
        const allButton = document.querySelector('.filter-button[data-category="all"]');
        if (allButton) {
          allButton.click();
        }
      }
    });


    document.addEventListener('click', (e) => {
      if (!searchResults.contains(e.target) && e.target !== searchInput && e.target !== searchButton) {
        searchResults.style.display = 'none';
      }
    });

    if (searchInput.value.length > 0) {
      clearSearchIcon.classList.remove('hidden');
    }
  });