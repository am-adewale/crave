// Shopping Cart System
class CartManager {
    constructor() {
        this.cart = [];
        this.isOpen = false;
        this.init();
    }

    init() {
        this.loadCart();
        this.setupCartEvents();
        this.updateCartDisplay();
    }

    loadCart() {
        try {
            const savedCart = localStorage.getItem('crave_cart');
            if (savedCart) {
                this.cart = JSON.parse(savedCart);
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
            this.cart = [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('crave_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Failed to save cart:', error);
        }
    }

    setupCartEvents() {
        // Cart toggle
        const cartContainer = document.getElementById('cartContainer');
        const cartSidebar = document.getElementById('cartSidebar');
        const closeCart = document.getElementById('closeCart');
        const overlay = document.getElementById('overlay');

        if (cartContainer) {
            cartContainer.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCart();
            });
        }

        if (closeCart) {
            closeCart.addEventListener('click', () => {
                this.closeCart();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeCart();
            });
        }

        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.proceedToCheckout();
            });
        }
    }

    addItem(food, quantity = 1, size = null) {
        if (!food || quantity <= 0) return false;

        const itemId = this.generateItemId(food.id, size);
        const existingItemIndex = this.cart.findIndex(item => item.id === itemId);

        const price = size ? 
            food.sizes?.find(s => s.name === size)?.price || food.price : 
            food.price;

        if (existingItemIndex !== -1) {
            // Update existing item
            this.cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            const cartItem = {
                id: itemId,
                foodId: food.id,
                name: food.name,
                price: price,
                originalPrice: food.originalPrice,
                image: food.image,
                quantity: quantity,
                size: size,
                restaurant: food.restaurant,
                maxQuantity: 10 // Set a reasonable limit
            };
            this.cart.push(cartItem);
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showAddToCartAnimation();
        
        utils.showAlert(`${food.name} added to cart!`, 'success', 3000);
        return true;
    }

    removeItem(itemId) {
        const itemIndex = this.cart.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            const item = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartDisplay();
            
            utils.showAlert(`${item.name} removed from cart`, 'success', 3000);
            return true;
        }
        return false;
    }

    updateQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            return this.removeItem(itemId);
        }

        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            item.quantity = Math.min(newQuantity, item.maxQuantity);
            this.saveCart();
            this.updateCartDisplay();
            return true;
        }
        return false;
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
        utils.showAlert('Cart cleared', 'success', 3000);
    }

    getCart() {
        return [...this.cart];
    }

    getItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotal() {
        const subtotal = this.getSubtotal();
        const deliveryFee = subtotal > 0 ? APP_CONFIG.defaultDeliveryFee : 0;
        const serviceFee = subtotal > 0 ? APP_CONFIG.defaultServiceFee : 0;
        return subtotal + deliveryFee + serviceFee;
    }

    generateItemId(foodId, size = null) {
        return size ? `${foodId}_${size}` : `${foodId}`;
    }

    toggleCart() {
        if (this.isOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    openCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('overlay');

        if (cartSidebar && overlay) {
            cartSidebar.classList.add('open');
            overlay.classList.add('show');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('overlay');

        if (cartSidebar && overlay) {
            cartSidebar.classList.remove('open');
            overlay.classList.remove('show');
            this.isOpen = false;
            document.body.style.overflow = '';
        }
    }

    updateCartDisplay() {
        this.updateCartBadge();
        this.updateCartItems();
        this.updateCartTotal();
    }

    updateCartBadge() {
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) {
            const count = this.getItemCount();
            cartBadge.textContent = count;
            cartBadge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    updateCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some delicious items to get started!</p>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    ${item.size ? `<div class="cart-item-size">Size: ${item.size}</div>` : ''}
                    <div class="cart-item-restaurant">${item.restaurant}</div>
                    <div class="cart-item-price">${utils.formatCurrency(item.price)}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease-btn" data-item-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase-btn" data-item-id="${item.id}">+</button>
                        <button class="remove-item" data-item-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Attach event listeners
        this.attachCartItemEvents();
    }

    attachCartItemEvents() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;

        // Quantity controls
        cartItemsContainer.addEventListener('click', (e) => {
            const itemId = e.target.getAttribute('data-item-id');
            if (!itemId) return;

            if (e.target.classList.contains('increase-btn')) {
                const item = this.cart.find(item => item.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity + 1);
                }
            } else if (e.target.classList.contains('decrease-btn')) {
                const item = this.cart.find(item => item.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity - 1);
                }
            } else if (e.target.classList.contains('remove-item') || e.target.parentElement.classList.contains('remove-item')) {
                this.removeItem(itemId);
            }
        });
    }

    updateCartTotal() {
        const cartTotalElement = document.getElementById('cartTotal');
        if (cartTotalElement) {
            const subtotal = this.getSubtotal();
            cartTotalElement.textContent = subtotal.toLocaleString();
        }

        // Update checkout button state
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.cart.length === 0;
            if (this.cart.length === 0) {
                checkoutBtn.textContent = 'Cart is Empty';
            } else {
                checkoutBtn.innerHTML = `
                    <i class="fas fa-credit-card"></i>
                    Checkout - ${utils.formatCurrency(this.getSubtotal())}
                `;
            }
        }
    }

    showAddToCartAnimation() {
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.style.animation = 'none';
            cartIcon.offsetHeight; // Trigger reflow
            cartIcon.style.animation = 'pulse 0.6s ease-out';
        }
    }

    proceedToCheckout() {
        if (this.cart.length === 0) {
            utils.showAlert('Your cart is empty', 'warning');
            return;
        }

        // Close cart
        this.closeCart();
        
        // Navigate to checkout
        window.location.href = 'checkout.html';
    }

    // Method to get cart data for checkout
    getCheckoutData() {
        const subtotal = this.getSubtotal();
        const deliveryFee = APP_CONFIG.defaultDeliveryFee;
        const serviceFee = APP_CONFIG.defaultServiceFee;
        const total = subtotal + deliveryFee + serviceFee;

        return {
            items: this.getCart(),
            subtotal,
            deliveryFee,
            serviceFee,
            total,
            itemCount: this.getItemCount()
        };
    }

    // Method to validate cart before checkout
    validateCart() {
        if (this.cart.length === 0) {
            return { valid: false, message: 'Cart is empty' };
        }

        // Check for any invalid items
        const invalidItems = this.cart.filter(item => 
            !item.foodId || 
            !item.name || 
            !item.price || 
            item.quantity <= 0
        );

        if (invalidItems.length > 0) {
            return { valid: false, message: 'Some items in your cart are invalid' };
        }

        return { valid: true };
    }

    // Method to restore cart from checkout data (if user goes back)
    restoreCart(cartData) {
        if (cartData && cartData.items) {
            this.cart = cartData.items;
            this.saveCart();
            this.updateCartDisplay();
        }
    }
}

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}
