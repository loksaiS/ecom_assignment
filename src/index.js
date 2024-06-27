document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  var productDetail = {}

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });

  const shopNowBtn = document.getElementById("shopNowBtn");
  if (shopNowBtn) {
    shopNowBtn.addEventListener("click", () => {
      window.location.href = "../pages/lists.html";
    });
  }

  const productSearch = document.getElementById("productSearch");

  productSearch?.addEventListener("input", function () {
    const searchValue = productSearch.value.trim().toLowerCase();

    const filteredProducts = allProducts.filter((product) => {
      return product.title.toLowerCase().includes(searchValue);
    });

    productsContainer.innerHTML = "";
    populateFilteredProducts(filteredProducts);
  });

  const productsContainer = document.querySelector(".products-container");
  let allProducts = [];
  let loadedProductsCount = 0;
  let totalProductsCount = 0;

  const loadingOverlay = document.querySelector(".loading-overlay");

  loadingOverlay.style.display = "block";

  fetch("https://fakestoreapi.com/products")
    .then((response) => response.json())
    .then((products) => {
      loadingOverlay.style.display = "none";
      allProducts = products;
      totalProductsCount = allProducts.length;

      populateProducts(loadedProductsCount, 10);
      loadedProductsCount += 10;

      updateTotalProductCount();

    })
    .catch((error) => {
      console.error("Error fetching products:", error);
      loadingOverlay.style.display = "none";
    });

  fetch("https://fakestoreapi.com/products/categories")
    .then((response) => response.json())
    .then((categories) => {
      allCategories = categories;

      populateCategories(categories);
    })
    .catch((error) => console.error("Error fetching categories:", error));

  function populateCategories(categories) {
    const filtersContainer = document.querySelector(".filterCat");
    const categoriesList = document.createElement("div");
    categoriesList.className = "categories-list";

    categories.forEach((category) => {
      const categoryContainer = document.createElement("div");
      categoryContainer.className = "category-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `category-${category}`;
      checkbox.value = category;
      checkbox.addEventListener("change", updateProducts);

      const label = document.createElement("label");
      label.textContent = category;
      label.setAttribute("for", `category-${category}`);

      categoryContainer.appendChild(checkbox);
      categoryContainer.appendChild(label);
      categoriesList.appendChild(categoryContainer);
    });

    filtersContainer.appendChild(categoriesList);
  }


  function populateProducts(startIndex, count) {
    const endIndex = startIndex + count;
    const productsToDisplay = allProducts.slice(startIndex, endIndex);

    productsToDisplay.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.className = "productList";

      productElement.innerHTML = `
                  <img src="${product.image}" alt="${product.title}">
                  <div>
                    <h3>${product.title}</h3>
                    <p>$${product.price}</p>
                  </div
              `;

      productsContainer.appendChild(productElement);
    });
    updateTotalProductCount();
    checkLoadMoreButton();
  }


  function updateProducts() {
    loadingOverlay.style.display = "block";
    const checkedCategories = Array.from(
      document.querySelectorAll(".category-item input:checked")
    ).map((checkbox) => checkbox.value);

    setTimeout(() => {
      if (checkedCategories.length === 0) {
        productsContainer.innerHTML = "";
        populateProducts(0, loadedProductsCount);
      } else {
        const filteredProducts = allProducts.filter((product) => {
          return checkedCategories.includes(product.category);
        });

        productsContainer.innerHTML = "";
        populateFilteredProducts(filteredProducts);
      }
      loadingOverlay.style.display = "none";
    }, 500);
  }

  function resetPriceRangeFilter() {
    minPriceSlider.value = 0;
    maxPriceSlider.value = 1000;
    minPriceValue.textContent = "0";
    maxPriceValue.textContent = "1000";
    filterProductsByPrice(0, 1000);
  }

  const minPriceSlider = document.getElementById("minPrice");
  const maxPriceSlider = document.getElementById("maxPrice");
  const minPriceValue = document.getElementById("minPriceValue");
  const maxPriceValue = document.getElementById("maxPriceValue");

  resetPriceRangeFilter();

  minPriceSlider.addEventListener("input", updatePrices);
  maxPriceSlider.addEventListener("input", updatePrices);

  function updatePrices() {
    const minValue = parseInt(minPriceSlider.value);
    const maxValue = parseInt(maxPriceSlider.value);

    if (minValue > maxValue - 50) {
      if (event.target.id === "minPrice") {
        minPriceSlider.value = maxValue - 50;
      } else {
        maxPriceSlider.value = minValue + 50;
      }
    }

    minPriceValue.textContent = minPriceSlider.value;
    maxPriceValue.textContent = maxPriceSlider.value;

    filterProductsByPrice(minPriceSlider.value, maxPriceSlider.value);
  }

  function filterProductsByPrice(minPrice, maxPrice) {
    loadingOverlay.style.display = "block";

    setTimeout(() => {
      const filteredProducts = allProducts.filter((product) => {
        return product.price >= minPrice && product.price <= maxPrice;
      });

      productsContainer.innerHTML = "";
      populateFilteredProducts(filteredProducts);

      loadingOverlay.style.display = "none";
    }, 500);
  }

  function populateFilteredProducts(filteredProducts) {
    productsContainer.innerHTML = "";

    filteredProducts.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.className = "productList";

      productElement.innerHTML = `
                  <img src="${product.image}" alt="${product.title}">
                  <div>
                    <h3>${product.title}</h3>
                    <p>$${product.price}</p>
                  </div>
              `;
      productsContainer.appendChild(productElement);
    });

    updateTotalProductCount();

    checkLoadMoreButton();
  }


  function checkLoadMoreButton() {
    if (loadedProductsCount >= totalProductsCount) {
      const loadMoreBtn = document.querySelector(".load-more button");
      console.log(loadMoreBtn, "working");
      if (loadMoreBtn) {
        loadMoreBtn.style.display = "none";
      }
    }
  }

  function updateTotalProductCount() {
    const totalProductCountElement =
      document.getElementById("totalProductCount");
    if (totalProductCountElement) {
      const renderedProductsCount =
        productsContainer.querySelectorAll(".productList").length;
      totalProductCountElement.textContent = `${renderedProductsCount} Results`;
    }
  }

  const loadMoreBtn = document.querySelector(".load-more button");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      loadingOverlay.style.display = "block";
      const remainingProducts = totalProductsCount - loadedProductsCount;
      const nextBatch = remainingProducts >= 10 ? 10 : remainingProducts;
      checkLoadMoreButton();

      setTimeout(() => {
        populateProducts(loadedProductsCount, nextBatch);
        loadedProductsCount += nextBatch;


        checkLoadMoreButton();
        loadingOverlay.style.display = "none";
      }, 500);
    });
  }

  const sortDropdown = document.querySelector(".sortOptions select");
  if (sortDropdown) {
    sortDropdown.addEventListener("change", function () {
      const sortBy = this.value;
      sortProducts(sortBy);
    });
  }
  function sortProducts(sortBy) {
    if (sortBy === "Price -- Low to High") {
      allProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price -- High to Low") {
      allProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Ratings") {
      allProducts.sort((a, b) => b.rating.rate - a.rating.rate);
    }
    productsContainer.innerHTML = "";
    populateProducts(0, loadedProductsCount);
  }

});
