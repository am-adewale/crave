// Main Landing Page JavaScript
class FoodApp {
    constructor() {
        this.foods = [];
        this.filteredFoods = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentPage = 1;
        this.itemsPerPage = APP_CONFIG.itemsPerPage;
        this.isLoading = false;
        this.init();
    }

    async init() {
        await this.loadFoods();
        this.setupEventListeners();
        this.renderCategories();
        this.renderRestaurants();
        this.renderFoods();
        this.setupAnimations();
    }

    async loadFoods() {
        try {
           
            this.foods = SAMPLE_FOODS;
            this.filteredFoods = [...this.foods];
        } catch (error) {
            console.error('Failed to load foods:', error);
            utils.showAlert('Failed to load menu items', 'error');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        const orderNowBtn = document.getElementById('orderNowBtn');
        const exploreBtn = document.getElementById('exploreBtn');
        const getStartedBtn = document.getElementById('getStartedBtn');

        if (orderNowBtn) {
            orderNowBtn.addEventListener('click', () => {
                this.scrollToSection('categories');
            });
        }

        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                this.scrollToSection('featured-restaurants');
            });
        }

        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                this.scrollToSection('categories');
            });
        }

        // Newsletter subscription
        const subscribeBtn = document.getElementById('subscribeBtn');
        const newsletterEmail = document.getElementById('newsletterEmail');

        if (subscribeBtn) {
            subscribeBtn.addEventListener('click', () => {
                this.handleNewsletterSubscription(newsletterEmail?.value);
            });
        }

        if (newsletterEmail) {
            newsletterEmail.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleNewsletterSubscription(e.target.value);
                }
            });
        }
    }

    renderCategories() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (!categoriesGrid) return;

        const categoriesHTML = FOOD_CATEGORIES.map((category, index) => `
            <div class="category-card" data-category="${category.id}" style="animation-delay: ${index * 0.1}s">
                <img src="${category.image}" alt="${category.name}" loading="lazy">
                <div class="category-overlay">
                    <h3 class="category-name">${category.name}</h3>
                </div>
            </div>
        `).join('');

        categoriesGrid.innerHTML = categoriesHTML;

        // Add click event listeners
        categoriesGrid.addEventListener('click', (e) => {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                const categoryId = categoryCard.getAttribute('data-category');
                
                // Find and click the corresponding filter button to maintain consistency
                const targetFilter = document.querySelector(`.filter-btn[data-category="${categoryId}"]`);
                if (targetFilter) {
                    targetFilter.click();
                } else {
                    // Fallback to direct filtering if button not found
                    this.filterByCategory(categoryId);
                }
                
                this.scrollToSection('foods-section');
            }
        });

        // Also populate the category filter buttons in the Delicious Menu section
        this.populateCategoryFilters();
    }

    populateCategoryFilters() {
        const categoryFilters = document.querySelector('.category-filters');
        if (!categoryFilters) return;

        // Add category filter buttons for each category
        const categoryButtonsHTML = FOOD_CATEGORIES.map(cat => `
            <button class="filter-btn" data-category="${cat.id}">${cat.name}</button>
        `).join('');

        // Insert after the "All" button
        const allButton = categoryFilters.querySelector('.filter-btn[data-category="all"]');
        if (allButton) {
            allButton.insertAdjacentHTML('afterend', categoryButtonsHTML);
        }

        // Setup filter event listeners
        this.setupFoodFilters();
    }

    renderRestaurants() {
        const restaurantsGrid = document.getElementById('restaurantsGrid');
        if (!restaurantsGrid) return;

        const restaurantsHTML = SAMPLE_RESTAURANTS.map((restaurant, index) => {
            const restaurantFoods = SAMPLE_FOODS
                .filter(food => food.restaurant === restaurant.name)
                .slice(0, 4);

            const previewHTML = restaurantFoods.length ? `
                <div class="restaurant-menu-preview">
                    ${restaurantFoods.map(food => `
                        <div class="preview-item" data-food-id="${food.id}">
                            <div class="preview-image">
                                <img src="${food.image}" alt="${food.name}" loading="lazy">
                            </div>
                            <div class="preview-info">
                                <div class="preview-name">${food.name}</div>
                                <div class="preview-price">${utils.formatCurrency(food.price)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '';

            return `
            <div class="restaurant-card" data-restaurant-id="${restaurant.id}" style="animation-delay: ${index * 0.1}s">
                <div class="restaurant-image">
                    <img src="${restaurant.image}" alt="${restaurant.name}" loading="lazy">
                    ${restaurant.badge ? `<div class="restaurant-badge">${restaurant.badge}</div>` : ''}
                </div>
                <div class="restaurant-info">
                    <div class="restaurant-header">
                        <div>
                            <h3 class="restaurant-name">${restaurant.name}</h3>
                            <div class="restaurant-rating">
                                <div class="stars">
                                    ${this.generateStars(restaurant.rating)}
                                </div>
                                <span>${restaurant.rating} (${restaurant.reviews})</span>
                            </div>
                        </div>
                    </div>
                    <div class="restaurant-meta">
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${restaurant.deliveryTime}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-truck"></i>
                            <span>${restaurant.deliveryFee}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-utensils"></i>
                            <span>${restaurant.cuisine}</span>
                        </div>
                    </div>
                    <p class="restaurant-description">Discover amazing ${restaurant.cuisine} cuisine with fresh ingredients and authentic flavors.</p>

                    ${previewHTML}

                    <div class="restaurant-actions">
                        <button class="btn-secondary btn-sm view-restaurant-menu" data-restaurant-id="${restaurant.id}">
                            <i class="fas fa-book-open"></i>
                            View Menu
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        restaurantsGrid.innerHTML = restaurantsHTML;

        // click event listeners
        restaurantsGrid.addEventListener('click', (e) => {
            const previewItem = e.target.closest('.preview-item');
            if (previewItem) {
                const foodId = previewItem.getAttribute('data-food-id');
                if (foodId) {
                    this.viewFoodDetails(foodId);
                    e.stopPropagation();
                    return;
                }
            }

            const viewMenuBtn = e.target.closest('.view-restaurant-menu');
            if (viewMenuBtn) {
                const restaurantId = viewMenuBtn.getAttribute('data-restaurant-id');
                if (restaurantId) {
                    this.filterByRestaurant(restaurantId);
                    this.scrollToSection('foods-section');
                    e.stopPropagation();
                    return;
                }
            }

            const restaurantCard = e.target.closest('.restaurant-card');
            if (restaurantCard) {
                const restaurantId = restaurantCard.getAttribute('data-restaurant-id');
                this.filterByRestaurant(restaurantId);
                this.scrollToSection('foods-section');
            }
        });
    }

    renderFoods() {
        // Use existing foods section
        const foodsSection = document.getElementById('foods-section');
        if (!foodsSection) return;

        const foodsGrid = document.getElementById('foodsGrid');
        if (!foodsGrid) return;

        if (this.filteredFoods.length === 0) {
            foodsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No items found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                    <button class="btn-primary" onclick="foodApp.clearFilters()">Clear Filters</button>
                </div>
            `;
            return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const foodsToShow = this.filteredFoods.slice(startIndex, endIndex);

        const foodsHTML = foodsToShow.map((food, index) => `
            <div class="food-card category-${food.category}" data-food-id="${food.id}" data-category="${food.category}" style="animation-delay: ${index * 0.1}s">
                <div class="food-card-image">
                    <img src="${food.image}" alt="${food.name}" loading="lazy">
                    <div class="food-card-badges">
                        ${food.dietLabel ? `<span class="badge diet-badge">${food.dietLabel}</span>` : ''}
                        ${food.originalPrice > food.price ? `<span class="badge discount-badge">${Math.round((1 - food.price / food.originalPrice) * 100)}% OFF</span>` : ''}
                    </div>
                    <div class="food-card-actions">
                        <button class="btn-secondary view-details-btn" data-food-id="${food.id}">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                        <button class="btn-primary add-to-cart-btn" data-food-id="${food.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="food-card-info">
                    <h3 class="food-card-title">${food.name}</h3>
                    <div class="food-card-rating">
                        <div class="stars">
                            ${this.generateStars(food.rating)}
                        </div>
                        <span>${food.rating} (${food.reviews})</span>
                    </div>
                    <div class="food-card-meta">
                        <div class="meta-item">
                            <i class="fas fa-fire"></i>
                            <span>${food.calories} cal</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span>15-25 min</span>
                        </div>
                    </div>
                    <p class="food-card-description">${food.description.substring(0, 100)}...</p>
                    <div class="food-card-footer">
                        <div class="food-card-price">
                            <span class="current-price">${utils.formatCurrency(food.price)}</span>
                            ${food.originalPrice > food.price ? `<span class="original-price">${utils.formatCurrency(food.originalPrice)}</span>` : ''}
                        </div>
                        <div class="food-card-restaurant">${food.restaurant}</div>
                    </div>
                </div>
            </div>
        `).join('');

        foodsGrid.innerHTML = foodsHTML;

        // Add event listeners
        this.attachFoodCardEvents();

        // Update pagination
        this.updatePagination();
    }

    createFoodsSection() {
        return document.getElementById('foods-section');
    }

    setupFoodFilters() {
        const categoryFilters = document.querySelectorAll('.filter-btn');
        const sortSelect = document.getElementById('sortSelect');

        categoryFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                categoryFilters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter foods
                const category = btn.getAttribute('data-category');
                this.filterByCategory(category);
            });
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortFoods(e.target.value);
            });
        }

      
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (categoriesGrid) {
            categoriesGrid.addEventListener('click', (e) => {
                const categoryCard = e.target.closest('.category-card');
                if (categoryCard) {
                    const categoryId = categoryCard.getAttribute('data-category');
                    const targetFilter = document.querySelector(`.filter-btn[data-category="${categoryId}"]`);
                    if (targetFilter) {
                        categoryFilters.forEach(b => b.classList.remove('active'));
                        targetFilter.classList.add('active');
                    }
                }
            });
        }
    }

    attachFoodCardEvents() {
        const foodsGrid = document.getElementById('foodsGrid');
        if (!foodsGrid) return;

        foodsGrid.addEventListener('click', (e) => {
            const foodId = e.target.getAttribute('data-food-id') || 
                          e.target.closest('[data-food-id]')?.getAttribute('data-food-id');
            
            if (!foodId) return;

            if (e.target.classList.contains('view-details-btn') || 
                e.target.closest('.view-details-btn')) {
                this.viewFoodDetails(foodId);
            } else if (e.target.classList.contains('add-to-cart-btn') || 
                      e.target.closest('.add-to-cart-btn')) {
                this.addToCart(foodId);
            } else if (e.target.closest('.food-card')) {
                this.viewFoodDetails(foodId);
            }
        });
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.currentPage = 1;
        this.applyFilters();
        
        // Debug logging
        console.log(`Filtering by category: ${categoryId}`);
        console.log(`Filtered foods count: ${this.filteredFoods.length}`);
        
        if (this.filteredFoods.length > 0) {
            this.renderFoods();
        } else {
            
            this.renderFoods();
        }
    }

    filterByRestaurant(restaurantId) {
        const restaurant = SAMPLE_RESTAURANTS.find(r => r.id == restaurantId);
        if (restaurant) {
            this.filteredFoods = this.foods.filter(food => 
                food.restaurant === restaurant.name
            );
            this.currentPage = 1;
            this.renderFoods();
        }
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.currentPage = 1;
        this.applyFilters();
        
        // Ensure we're showing the first page of results
        if (this.filteredFoods.length > 0) {
            this.renderFoods();
        }
    }

    applyFilters() {
        let filtered = [...this.foods];

        // Category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(food => food.category === this.currentCategory);
        }

        // Search filter
        if (this.searchQuery) {
            filtered = filtered.filter(food => 
                food.name.toLowerCase().includes(this.searchQuery) ||
                food.description.toLowerCase().includes(this.searchQuery) ||
                food.restaurant.toLowerCase().includes(this.searchQuery) ||
                food.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }

        this.filteredFoods = filtered;
        
        // Debug logging
        console.log(`applyFilters: category=${this.currentCategory}, search="${this.searchQuery}", filtered count=${filtered.length}`);
        
      
    }

    sortFoods(sortBy) {
        switch (sortBy) {
            case 'price-low':
                this.filteredFoods.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredFoods.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                this.filteredFoods.sort((a, b) => b.rating - a.rating);
                break;
            case 'popular':
            default:
                this.filteredFoods.sort((a, b) => b.reviews - a.reviews);
                break;
        }
        this.renderFoods();
    }

    clearFilters() {
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentPage = 1;
        
        // Reset UI
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        
        const activeFilter = document.querySelector('.filter-btn.active');
        const allFilter = document.querySelector('.filter-btn[data-category="all"]');
        if (activeFilter) activeFilter.classList.remove('active');
        if (allFilter) allFilter.classList.add('active');
        
        this.applyFilters();
        
      
        if (this.filteredFoods.length > 0) {
            this.renderFoods();
        }
    }

    viewFoodDetails(foodId) {
        window.location.href = `food-details.html?id=${foodId}`;
    }

    addToCart(foodId) {
        const food = this.foods.find(f => f.id == foodId);
        if (food && window.cartManager) {
            window.cartManager.addItem(food, 1);
        }
    }

    updatePagination() {
        const paginationContainer = document.getElementById('foodsPagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(this.filteredFoods.length / this.itemsPerPage);
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            data-page="${i}">${i}</button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Next button
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;

        // Add event listeners
        paginationContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('pagination-btn') && !e.target.disabled) {
                const page = parseInt(e.target.getAttribute('data-page'));
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.renderFoods();
                    this.scrollToSection('foods-section');
                }
            }
        });
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt star"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star star"></i>';
        }
        
        return starsHTML;
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId) || 
                       document.querySelector(`.${sectionId}`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    handleNewsletterSubscription(email) {
        if (!email || !utils.validateEmail(email)) {
            utils.showAlert('Please enter a valid email address', 'error');
            return;
        }

        // Simulate newsletter subscription
        utils.showAlert('Thank you for subscribing to our newsletter!', 'success');
        
        const newsletterEmail = document.getElementById('newsletterEmail');
        if (newsletterEmail) {
            newsletterEmail.value = '';
        }
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);

        // Observe animated elements
        const animatedElements = document.querySelectorAll('.step, .category-card, .restaurant-card, .food-card');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.foodApp = new FoodApp();
});

