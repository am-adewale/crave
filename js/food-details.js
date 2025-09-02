// Food Details Page JavaScript
class FoodDetailsPage {
    constructor() {
        this.food = null;
        this.currentImageIndex = 0;
        this.selectedSize = null;
        this.quantity = 1;
        this.reviews = [];
        this.userRating = 0;
        this.init();
    }

    async init() {
        const foodId = this.getFoodIdFromUrl();
        if (!foodId) {
            this.redirectToHome();
            return;
        }

        await this.loadFood(foodId);
        if (!this.food) {
            this.redirectToHome();
            return;
        }

        this.renderFoodDetails();
        this.setupEventListeners();
        this.loadReviews();
        this.loadRelatedFoods();
    }

    getFoodIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadFood(foodId) {
        try {
            // For now, use sample data. In production, this would fetch from Supabase
            this.food = SAMPLE_FOODS.find(food => food.id == foodId);
            if (this.food && this.food.sizes && this.food.sizes.length > 0) {
                this.selectedSize = this.food.sizes[0].name;
            }
        } catch (error) {
            console.error('Failed to load food details:', error);
            utils.showAlert('Failed to load food details', 'error');
        }
    }

    renderFoodDetails() {
        if (!this.food) return;

        // Update page title
        document.title = `${this.food.name} - Crave`;

        // Update breadcrumb
        this.updateBreadcrumb();

        // Update main image
        this.updateMainImage();

        // Update thumbnail images
        this.updateThumbnailImages();

        // Update food info
        this.updateFoodInfo();

        // Update size options
        this.updateSizeOptions();

        // Update related tags
        this.updateTags();
    }

    updateBreadcrumb() {
        const categoryBreadcrumb = document.getElementById('categoryBreadcrumb');
        const foodBreadcrumb = document.getElementById('foodBreadcrumb');

        if (categoryBreadcrumb) {
            const category = FOOD_CATEGORIES.find(cat => cat.id === this.food.category);
            categoryBreadcrumb.textContent = category ? category.name : 'Food';
        }

        if (foodBreadcrumb) {
            foodBreadcrumb.textContent = this.food.name;
        }
    }

    updateMainImage() {
        const mainImage = document.getElementById('mainFoodImage');
        const dietBadge = document.getElementById('dietBadge');
        const healthBadge = document.getElementById('healthBadge');

        if (mainImage) {
            const currentImage = this.food.images ? 
                this.food.images[this.currentImageIndex] : 
                this.food.image;
            mainImage.src = currentImage;
            mainImage.alt = this.food.name;
        }

        if (dietBadge) {
            dietBadge.textContent = this.food.dietLabel || '';
            dietBadge.style.display = this.food.dietLabel ? 'inline-block' : 'none';
        }

        if (healthBadge && this.food.healthLabels && this.food.healthLabels.length > 0) {
            healthBadge.textContent = this.food.healthLabels[0];
            healthBadge.style.display = 'inline-block';
        } else if (healthBadge) {
            healthBadge.style.display = 'none';
        }
    }

    updateThumbnailImages() {
        const thumbnailContainer = document.getElementById('thumbnailImages');
        if (!thumbnailContainer || !this.food.images || this.food.images.length <= 1) {
            if (thumbnailContainer) thumbnailContainer.style.display = 'none';
            return;
        }

        const thumbnailsHTML = this.food.images.map((image, index) => `
            <div class="thumbnail ${index === this.currentImageIndex ? 'active' : ''}" 
                 data-index="${index}">
                <img src="${image}" alt="${this.food.name}" loading="lazy">
            </div>
        `).join('');

        thumbnailContainer.innerHTML = thumbnailsHTML;
        thumbnailContainer.style.display = 'grid';

        // Add click event listeners
        thumbnailContainer.addEventListener('click', (e) => {
            const thumbnail = e.target.closest('.thumbnail');
            if (thumbnail) {
                const index = parseInt(thumbnail.getAttribute('data-index'));
                this.changeImage(index);
            }
        });
    }

    changeImage(index) {
        if (index >= 0 && index < (this.food.images?.length || 1)) {
            this.currentImageIndex = index;
            this.updateMainImage();
            
            // Update thumbnail active state
            const thumbnails = document.querySelectorAll('.thumbnail');
            thumbnails.forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
        }
    }

    updateFoodInfo() {
        // Basic info
        const elements = {
            foodTitle: this.food.name,
            foodCalories: `${this.food.calories} cal`,
            foodDescription: this.food.description,
            foodPrice: utils.formatCurrency(this.getCurrentPrice()),
            originalPrice: this.food.originalPrice > this.getCurrentPrice() ? 
                utils.formatCurrency(this.food.originalPrice) : '',
            totalPrice: utils.formatCurrency(this.getCurrentPrice() * this.quantity)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                if (id === 'originalPrice') {
                    element.style.display = value ? 'inline' : 'none';
                }
            }
        });

        // Discount calculation
        const discountElement = document.getElementById('discount');
        if (discountElement) {
            if (this.food.originalPrice > this.getCurrentPrice()) {
                const discount = Math.round((1 - this.getCurrentPrice() / this.food.originalPrice) * 100);
                discountElement.textContent = `${discount}% off`;
                discountElement.style.display = 'inline';
            } else {
                discountElement.style.display = 'none';
            }
        }

        // Rating
        this.updateRatingDisplay();
    }

    updateRatingDisplay() {
        const ratingContainer = document.getElementById('foodRating');
        const ratingCount = document.getElementById('ratingCount');

        if (ratingContainer) {
            ratingContainer.innerHTML = this.generateStars(this.food.rating);
        }

        if (ratingCount) {
            ratingCount.textContent = `(${this.food.reviews} reviews)`;
        }
    }

    updateSizeOptions() {
        const sizeOptionsContainer = document.getElementById('sizeOptions');
        if (!sizeOptionsContainer) return;

        if (!this.food.sizes || this.food.sizes.length <= 1) {
            sizeOptionsContainer.style.display = 'none';
            return;
        }

        const sizeButtonsContainer = sizeOptionsContainer.querySelector('.size-buttons');
        if (sizeButtonsContainer) {
            const sizesHTML = this.food.sizes.map(size => `
                <button class="size-btn ${size.name === this.selectedSize ? 'active' : ''}" 
                        data-size="${size.name}" data-price="${size.price}">
                    ${size.name} - ${utils.formatCurrency(size.price)}
                </button>
            `).join('');

            sizeButtonsContainer.innerHTML = sizesHTML;
            sizeOptionsContainer.style.display = 'block';

            // Add event listeners
            sizeButtonsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('size-btn')) {
                    this.selectSize(e.target.getAttribute('data-size'));
                }
            });
        }
    }

    selectSize(sizeName) {
        this.selectedSize = sizeName;
        
        // Update active state
        const sizeButtons = document.querySelectorAll('.size-btn');
        sizeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-size') === sizeName);
        });

        // Update price display
        this.updatePriceDisplay();
    }

    updatePriceDisplay() {
        const currentPrice = this.getCurrentPrice();
        const foodPriceElement = document.getElementById('foodPrice');
        const totalPriceElement = document.getElementById('totalPrice');

        if (foodPriceElement) {
            foodPriceElement.textContent = utils.formatCurrency(currentPrice);
        }

        if (totalPriceElement) {
            totalPriceElement.textContent = (currentPrice * this.quantity).toLocaleString();
        }
    }

    getCurrentPrice() {
        if (this.selectedSize && this.food.sizes) {
            const size = this.food.sizes.find(s => s.name === this.selectedSize);
            return size ? size.price : this.food.price;
        }
        return this.food.price;
    }

    updateTags() {
        const tagsContainer = document.getElementById('foodTags');
        if (!tagsContainer || !this.food.tags) return;

        const tagsHTML = this.food.tags.map(tag => `
            <span class="tag">${tag}</span>
        `).join('');

        tagsContainer.innerHTML = tagsHTML;
    }

    setupEventListeners() {
        // Quantity controls
        const decreaseBtn = document.getElementById('decreaseQty');
        const increaseBtn = document.getElementById('increaseQty');
        const quantityDisplay = document.getElementById('quantity');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                if (this.quantity > 1) {
                    this.quantity--;
                    this.updateQuantityDisplay();
                }
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                if (this.quantity < 10) {
                    this.quantity++;
                    this.updateQuantityDisplay();
                }
            });
        }

        // Add to cart button
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                this.addToCart();
            });
        }

        // Favorite button
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => {
                this.toggleFavorite();
            });
        }

        // Review form
        this.setupReviewForm();

        // Success modal
        this.setupSuccessModal();
    }

    updateQuantityDisplay() {
        const quantityDisplay = document.getElementById('quantity');
        const totalPriceElement = document.getElementById('totalPrice');

        if (quantityDisplay) {
            quantityDisplay.textContent = this.quantity;
        }

        if (totalPriceElement) {
            const total = this.getCurrentPrice() * this.quantity;
            totalPriceElement.textContent = total.toLocaleString();
        }
    }

    addToCart() {
        if (!window.cartManager) {
            utils.showAlert('Cart system not available', 'error');
            return;
        }

        const success = window.cartManager.addItem(this.food, this.quantity, this.selectedSize);
        if (success) {
            this.showSuccessModal();
        }
    }

    toggleFavorite() {
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active');
            const isActive = favoriteBtn.classList.contains('active');
            
            utils.showAlert(
                isActive ? 'Added to favorites' : 'Removed from favorites', 
                'success', 
                2000
            );
        }
    }

    setupReviewForm() {
        const starRating = document.getElementById('starRating');
        const reviewForm = document.getElementById('reviewForm');

        // Star rating interaction
        if (starRating) {
            const stars = starRating.querySelectorAll('i');
            
            stars.forEach((star, index) => {
                star.addEventListener('mouseenter', () => {
                    this.highlightStars(index + 1);
                });

                star.addEventListener('click', () => {
                    this.userRating = index + 1;
                    this.setStarRating(this.userRating);
                });
            });

            starRating.addEventListener('mouseleave', () => {
                this.setStarRating(this.userRating);
            });
        }

        // Review form submission
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReview();
            });
        }
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('#starRating i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
    }

    setStarRating(rating) {
        this.highlightStars(rating);
    }

    async submitReview() {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            utils.showAlert('Please sign in to leave a review', 'warning');
            return;
        }

        if (this.userRating === 0) {
            utils.showAlert('Please select a rating', 'error');
            return;
        }

        const comment = document.getElementById('reviewComment').value.trim();
        if (!comment) {
            utils.showAlert('Please write a review comment', 'error');
            return;
        }

        try {
            const user = window.authManager.getCurrentUser();
            const review = {
                id: utils.generateId(),
                food_id: this.food.id,
                user_id: user.id,
                user_name: user.profile?.name || 'Anonymous',
                user_avatar: user.profile?.profile_image || DEFAULT_IMAGES.profile,
                rating: this.userRating,
                comment: comment,
                created_at: new Date().toISOString()
            };

            // In production, this would save to Supabase
            this.reviews.unshift(review);
            this.renderReviews();

            // Reset form
            document.getElementById('reviewComment').value = '';
            this.userRating = 0;
            this.setStarRating(0);

            utils.showAlert('Review submitted successfully!', 'success');

        } catch (error) {
            console.error('Failed to submit review:', error);
            utils.showAlert('Failed to submit review', 'error');
        }
    }

    async loadReviews() {
        try {
            // For now, generate some sample reviews
            this.reviews = this.generateSampleReviews();
            this.renderReviews();
            this.updateReviewStats();
        } catch (error) {
            console.error('Failed to load reviews:', error);
        }
    }

    generateSampleReviews() {
        const sampleReviews = [
            {
                id: '1',
                user_name: 'John Doe',
                user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                rating: 5,
                comment: 'Absolutely delicious! The flavors were incredible and the portion size was perfect.',
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                user_name: 'Sarah Johnson',
                user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                rating: 4,
                comment: 'Great taste and quality. Delivery was quick too. Will order again!',
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '3',
                user_name: 'Mike Wilson',
                user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                rating: 5,
                comment: 'Best food I\'ve had in a while. Highly recommend this place!',
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        return sampleReviews;
    }

    renderReviews() {
        const reviewsList = document.getElementById('reviewsList');
        if (!reviewsList) return;

        if (this.reviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="no-reviews">
                    <i class="fas fa-star"></i>
                    <h3>No reviews yet</h3>
                    <p>Be the first to review this food item!</p>
                </div>
            `;
            return;
        }

        const reviewsHTML = this.reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <img src="${review.user_avatar}" alt="${review.user_name}" class="reviewer-avatar">
                        <div class="reviewer-details">
                            <h4>${review.user_name}</h4>
                            <div class="review-rating">
                                ${this.generateStars(review.rating)}
                            </div>
                            <div class="review-date">${utils.formatDate(review.created_at)}</div>
                        </div>
                    </div>
                </div>
                <p class="review-comment">${review.comment}</p>
            </div>
        `).join('');

        reviewsList.innerHTML = reviewsHTML;
    }

    updateReviewStats() {
        const averageRating = this.reviews.length > 0 ? 
            this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length : 0;

        const averageRatingElement = document.getElementById('averageRating');
        const averageStarsElement = document.getElementById('averageStars');
        const totalReviewsElement = document.getElementById('totalReviews');

        if (averageRatingElement) {
            averageRatingElement.textContent = averageRating.toFixed(1);
        }

        if (averageStarsElement) {
            averageStarsElement.innerHTML = this.generateStars(averageRating);
        }

        if (totalReviewsElement) {
            totalReviewsElement.textContent = `${this.reviews.length} review${this.reviews.length !== 1 ? 's' : ''}`;
        }
    }

    async loadRelatedFoods() {
        try {
            const relatedFoods = SAMPLE_FOODS
                .filter(food => 
                    food.id !== this.food.id && 
                    (food.category === this.food.category || food.restaurant === this.food.restaurant)
                )
                .slice(0, 4);

            this.renderRelatedFoods(relatedFoods);
        } catch (error) {
            console.error('Failed to load related foods:', error);
        }
    }

    renderRelatedFoods(relatedFoods) {
        const relatedFoodsGrid = document.getElementById('relatedFoodsGrid');
        if (!relatedFoodsGrid) return;

        if (relatedFoods.length === 0) {
            document.querySelector('.related-foods').style.display = 'none';
            return;
        }

        const relatedHTML = relatedFoods.map(food => `
            <div class="food-card" data-food-id="${food.id}">
                <div class="food-card-image">
                    <img src="${food.image}" alt="${food.name}" loading="lazy">
                </div>
                <div class="food-card-info">
                    <h3 class="food-card-title">${food.name}</h3>
                    <div class="food-card-price">${utils.formatCurrency(food.price)}</div>
                    <div class="food-card-meta">
                        <div class="meta-item">
                            <div class="stars">
                                ${this.generateStars(food.rating)}
                            </div>
                            <span>${food.rating}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-fire"></i>
                            <span>${food.calories} cal</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        relatedFoodsGrid.innerHTML = relatedHTML;

        // Add click event listeners
        relatedFoodsGrid.addEventListener('click', (e) => {
            const foodCard = e.target.closest('.food-card');
            if (foodCard) {
                const foodId = foodCard.getAttribute('data-food-id');
                window.location.href = `food-details.html?id=${foodId}`;
            }
        });
    }

    setupSuccessModal() {
        const closeSuccessModal = document.getElementById('closeSuccessModal');
        const continueShopping = document.getElementById('continueShopping');
        const viewCart = document.getElementById('viewCart');

        if (closeSuccessModal) {
            closeSuccessModal.addEventListener('click', () => {
                this.hideSuccessModal();
            });
        }

        if (continueShopping) {
            continueShopping.addEventListener('click', () => {
                this.hideSuccessModal();
            });
        }

        if (viewCart) {
            viewCart.addEventListener('click', () => {
                this.hideSuccessModal();
                if (window.cartManager) {
                    window.cartManager.openCart();
                }
            });
        }
    }

    showSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    hideSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';
        
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star star"></i>';
        }
        
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt star"></i>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star star"></i>';
        }
        
        return starsHTML;
    }

    redirectToHome() {
        utils.showAlert('Food item not found', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Initialize the food details page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.foodDetailsPage = new FoodDetailsPage();
});
