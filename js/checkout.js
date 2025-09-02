// Checkout Page JavaScript
class CheckoutPage {
    constructor() {
        this.cartData = null;
        this.orderData = {
            deliveryInfo: {},
            deliveryTime: 'asap',
            paymentMethod: 'card',
            promoCode: null,
            discount: 0
        };
        this.isProcessing = false;
        this.init();
    }

    async init() {
		// Check if user is authenticated (avoid race with auth manager)
		try {
			const { data: { user }, error } = await supabase.auth.getUser();
			if (error || !user) {
				window.location.href = 'auth.html';
				return;
			}
		} catch (err) {
			window.location.href = 'auth.html';
			return;
		}

        // Get cart data
        this.loadCartData();
        
        if (!this.cartData || this.cartData.items.length === 0) {
            utils.showAlert('Your cart is empty', 'warning');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        this.renderOrderSummary();
        this.setupEventListeners();
        this.prefillUserData();
        this.updateTotals();
    }

    loadCartData() {
        if (window.cartManager) {
            this.cartData = window.cartManager.getCheckoutData();
        } else {
            // Fallback: load from localStorage
            try {
                const savedCart = localStorage.getItem('crave_cart');
                if (savedCart) {
                    const cart = JSON.parse(savedCart);
                    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                    this.cartData = {
                        items: cart,
                        subtotal,
                        deliveryFee: APP_CONFIG.defaultDeliveryFee,
                        serviceFee: APP_CONFIG.defaultServiceFee,
                        total: subtotal + APP_CONFIG.defaultDeliveryFee + APP_CONFIG.defaultServiceFee,
                        itemCount: cart.reduce((total, item) => total + item.quantity, 0)
                    };
                }
            } catch (error) {
                console.error('Failed to load cart data:', error);
            }
        }
    }

    renderOrderSummary() {
        const orderItemsContainer = document.getElementById('orderItems');
        if (!orderItemsContainer || !this.cartData) return;

        const itemsHTML = this.cartData.items.map(item => `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="order-item-info">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-details">
                        ${item.size ? `Size: ${item.size} • ` : ''}Qty: ${item.quantity}
                        ${item.restaurant ? ` • ${item.restaurant}` : ''}
                    </div>
                    <div class="order-item-price">${utils.formatCurrency(item.price * item.quantity)}</div>
                </div>
            </div>
        `).join('');

        orderItemsContainer.innerHTML = itemsHTML;
    }

    setupEventListeners() {
        // Delivery time options
        const deliveryTimeRadios = document.querySelectorAll('input[name="deliveryTime"]');
        const scheduledTimeContainer = document.getElementById('scheduledTime');

        deliveryTimeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.orderData.deliveryTime = e.target.value;
                if (scheduledTimeContainer) {
                    scheduledTimeContainer.style.display = 
                        e.target.value === 'scheduled' ? 'block' : 'none';
                }
            });
        });

        // Payment method options
        const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
        paymentMethodRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.orderData.paymentMethod = e.target.value;
            });
        });

        // Promo code
        const applyPromoBtn = document.getElementById('applyPromo');
        const promoCodeInput = document.getElementById('promoCode');

        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => {
                this.applyPromoCode(promoCodeInput?.value);
            });
        }

        if (promoCodeInput) {
            promoCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyPromoCode(e.target.value);
                }
            });
        }

        // Place order button
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => {
                this.placeOrder();
            });
        }

        // Form validation
        this.setupFormValidation();

        // Success modal
        this.setupSuccessModal();

        // Set minimum date for delivery
        const deliveryDateInput = document.getElementById('deliveryDate');
        if (deliveryDateInput) {
            const today = new Date().toISOString().split('T')[0];
            deliveryDateInput.min = today;
            deliveryDateInput.value = today;
        }
    }

    setupFormValidation() {
        const form = document.getElementById('deliveryForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error state
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Validate based on field type
        switch (field.type) {
            case 'email':
                if (!utils.validateEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'tel':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
            default:
                if (field.hasAttribute('required') && !value) {
                    isValid = false;
                    errorMessage = 'This field is required';
                }
                break;
        }

        // Show error if invalid
        if (!isValid) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = errorMessage;
            field.parentNode.appendChild(errorDiv);
        }

        return isValid;
    }

    prefillUserData() {
        if (!window.authManager) return;

        const user = window.authManager.getCurrentUser();
        if (!user || !user.profile) return;

        // Prefill user information
        const emailField = document.getElementById('email');
        if (emailField && user.email) {
            emailField.value = user.email;
        }

        // Split name if available
        if (user.profile.name) {
            const nameParts = user.profile.name.split(' ');
            const firstNameField = document.getElementById('firstName');
            const lastNameField = document.getElementById('lastName');

            if (firstNameField && nameParts.length > 0) {
                firstNameField.value = nameParts[0];
            }

            if (lastNameField && nameParts.length > 1) {
                lastNameField.value = nameParts.slice(1).join(' ');
            }
        }
    }

    applyPromoCode(code) {
        if (!code || code.trim() === '') {
            utils.showAlert('Please enter a promo code', 'error');
            return;
        }

        const trimmedCode = code.trim().toUpperCase();

        
        const promoCodes = {
            'WELCOME10': { discount: 0.1, type: 'percentage', description: '10% off your order' },
            'SAVE500': { discount: 500, type: 'fixed', description: '₦500 off your order' },
            'NEWUSER': { discount: 0.15, type: 'percentage', description: '15% off for new users' }
        };

        const promo = promoCodes[trimmedCode];
        if (!promo) {
            utils.showAlert('Invalid promo code', 'error');
            return;
        }

        // Calculate discount
        let discountAmount = 0;
        if (promo.type === 'percentage') {
            discountAmount = this.cartData.subtotal * promo.discount;
        } else {
            discountAmount = Math.min(promo.discount, this.cartData.subtotal);
        }

        this.orderData.promoCode = trimmedCode;
        this.orderData.discount = discountAmount;

        this.updateTotals();
        utils.showAlert(`Promo code applied: ${promo.description}`, 'success');

        // Disable promo input
        const promoInput = document.getElementById('promoCode');
        const applyBtn = document.getElementById('applyPromo');
        if (promoInput) promoInput.disabled = true;
        if (applyBtn) {
            applyBtn.textContent = 'Applied';
            applyBtn.disabled = true;
        }
    }

    updateTotals() {
        if (!this.cartData) return;

        const subtotalElement = document.getElementById('subtotal');
        const deliveryFeeElement = document.getElementById('deliveryFee');
        const serviceFeeElement = document.getElementById('serviceFee');
        const discountElement = document.getElementById('discount');
        const discountRow = document.getElementById('discountRow');
        const finalTotalElement = document.getElementById('finalTotal');
        const orderTotalElement = document.getElementById('orderTotal');

        const subtotal = this.cartData.subtotal;
        const deliveryFee = this.cartData.deliveryFee;
        const serviceFee = this.cartData.serviceFee;
        const discount = this.orderData.discount || 0;
        const finalTotal = subtotal + deliveryFee + serviceFee - discount;

        if (subtotalElement) subtotalElement.textContent = utils.formatCurrency(subtotal);
        if (deliveryFeeElement) deliveryFeeElement.textContent = utils.formatCurrency(deliveryFee);
        if (serviceFeeElement) serviceFeeElement.textContent = utils.formatCurrency(serviceFee);
        
        if (discount > 0) {
            if (discountElement) discountElement.textContent = `-${utils.formatCurrency(discount)}`;
            if (discountRow) discountRow.style.display = 'flex';
        } else {
            if (discountRow) discountRow.style.display = 'none';
        }

        if (finalTotalElement) finalTotalElement.textContent = utils.formatCurrency(finalTotal);
        if (orderTotalElement) orderTotalElement.textContent = finalTotal.toLocaleString();

        // Update cart data
        this.cartData.discount = discount;
        this.cartData.finalTotal = finalTotal;
    }

    validateForm() {
        const form = document.getElementById('deliveryForm');
        if (!form) return false;

        let isValid = true;
        const requiredFields = form.querySelectorAll('input[required], textarea[required]');

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate scheduled delivery if selected
        if (this.orderData.deliveryTime === 'scheduled') {
            const dateField = document.getElementById('deliveryDate');
            const timeField = document.getElementById('deliveryTimeSlot');

            if (!dateField?.value || !timeField?.value) {
                utils.showAlert('Please select delivery date and time', 'error');
                isValid = false;
            }
        }

        return isValid;
    }

    collectFormData() {
        const form = document.getElementById('deliveryForm');
        if (!form) return null;

        const formData = new FormData(form);
        const deliveryInfo = {};

        for (let [key, value] of formData.entries()) {
            deliveryInfo[key] = value;
        }

        // Add scheduled delivery info if applicable
        if (this.orderData.deliveryTime === 'scheduled') {
            deliveryInfo.scheduledDate = document.getElementById('deliveryDate')?.value;
            deliveryInfo.scheduledTime = document.getElementById('deliveryTimeSlot')?.value;
        }

        // Add order notes
        deliveryInfo.orderNotes = document.getElementById('orderNotes')?.value || '';

        return deliveryInfo;
    }

    async placeOrder() {
        if (this.isProcessing) return;

        // Validate form
        if (!this.validateForm()) {
            utils.showAlert('Please fill in all required fields', 'error');
            return;
        }

        // Collect form data
        const deliveryInfo = this.collectFormData();
        if (!deliveryInfo) {
            utils.showAlert('Failed to collect form data', 'error');
            return;
        }

        this.orderData.deliveryInfo = deliveryInfo;
        this.isProcessing = true;
        
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
            placeOrderBtn.innerHTML = `
                <div class="btn-loader"></div>
                Processing...
            `;
        }

        try {
            // Process payment based on selected method
            switch (this.orderData.paymentMethod) {
                case 'card':
                    await this.processCardPayment();
                    break;
                case 'bank':
                    await this.processBankTransfer();
                    break;
                case 'ussd':
                    await this.processUSSDPayment();
                    break;
                default:
                    throw new Error('Invalid payment method');
            }
        } catch (error) {
            console.error('Payment processing failed:', error);
            utils.showAlert(error.message || 'Payment failed. Please try again.', 'error');
        } finally {
            this.isProcessing = false;
            if (placeOrderBtn) {
                placeOrderBtn.disabled = false;
                placeOrderBtn.innerHTML = `
                    <i class="fas fa-lock"></i>
                    Place Order - ${utils.formatCurrency(this.cartData.finalTotal)}
                `;
            }
        }
    }

    async processCardPayment() {
        return new Promise((resolve, reject) => {
            const handler = PaystackPop.setup({
                key: PAYSTACK_PUBLIC_KEY,
                email: this.orderData.deliveryInfo.email,
                amount: this.cartData.finalTotal * 100, // Paystack expects amount in kobo
                currency: 'NGN',
                ref: this.generateOrderReference(),
                metadata: {
                    custom_fields: [
                        {
                            display_name: "Customer Name",
                            variable_name: "customer_name",
                            value: `${this.orderData.deliveryInfo.firstName} ${this.orderData.deliveryInfo.lastName}`
                        },
                        {
                            display_name: "Phone Number",
                            variable_name: "phone_number",
                            value: this.orderData.deliveryInfo.phone
                        },
                        {
                            display_name: "Order Items",
                            variable_name: "order_items",
                            value: this.cartData.items.length
                        }
                    ]
                },
                callback: (response) => {
                    this.handlePaymentSuccess(response);
                    resolve(response);
                },
                onClose: () => {
                    reject(new Error('Payment was cancelled'));
                }
            });

            handler.openIframe();
        });
    }

    async processBankTransfer() {
        // For demo purposes, simulate bank transfer
        utils.showAlert('Bank transfer option would be implemented here', 'info');
        
        // In production, this would:
        // 1. Generate bank transfer details
        // 2. Show payment instructions
        // 3. Handle payment verification
        
        setTimeout(() => {
            const mockResponse = {
                reference: this.generateOrderReference(),
                status: 'success',
                trans: utils.generateId()
            };
            this.handlePaymentSuccess(mockResponse);
        }, 2000);
    }

    async processUSSDPayment() {
        // For demo purposes, simulate USSD payment
        utils.showAlert('USSD payment option would be implemented here', 'info');
        
        // In production, this would:
        // 1. Generate USSD code
        // 2. Show payment instructions
        // 3. Handle payment verification
        
        setTimeout(() => {
            const mockResponse = {
                reference: this.generateOrderReference(),
                status: 'success',
                trans: utils.generateId()
            };
            this.handlePaymentSuccess(mockResponse);
        }, 2000);
    }

    generateOrderReference() {
        return `CRAVE_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    async handlePaymentSuccess(paymentResponse) {
        try {
            // Create order record
            const order = await this.createOrder(paymentResponse);
            
            // Clear cart
            if (window.cartManager) {
                window.cartManager.clearCart();
            } else {
                localStorage.removeItem('crave_cart');
            }

            // Show success modal
            this.showSuccessModal(order);

        } catch (error) {
            console.error('Failed to create order:', error);
            utils.showAlert('Payment successful but failed to create order record', 'warning');
        }
    }

    async createOrder(paymentResponse) {
        const user = window.authManager.getCurrentUser();
        
        const order = {
            id: utils.generateId(),
            user_id: user.id,
            order_reference: paymentResponse.reference,
            payment_reference: paymentResponse.trans || paymentResponse.reference,
            items: this.cartData.items,
            subtotal: this.cartData.subtotal,
            delivery_fee: this.cartData.deliveryFee,
            service_fee: this.cartData.serviceFee,
            discount: this.orderData.discount || 0,
            total_amount: this.cartData.finalTotal,
            payment_method: this.orderData.paymentMethod,
            payment_status: 'paid',
            order_status: 'confirmed',
            delivery_info: this.orderData.deliveryInfo,
            delivery_time: this.orderData.deliveryTime,
            promo_code: this.orderData.promoCode,
            created_at: new Date().toISOString()
        };

        // In production, this would save to Supabase
        // const { data, error } = await supabase
        //     .from('orders')
        //     .insert(order)
        //     .select()
        //     .single();

        // For now, save to localStorage for demo
        const existingOrders = JSON.parse(localStorage.getItem('crave_orders') || '[]');
        existingOrders.push(order);
        localStorage.setItem('crave_orders', JSON.stringify(existingOrders));

        return order;
    }

    showSuccessModal(order) {
        const modal = document.getElementById('successModal');
        const orderIdDisplay = document.getElementById('orderIdDisplay');
        const estimatedDelivery = document.getElementById('estimatedDelivery');

        if (orderIdDisplay) {
            orderIdDisplay.textContent = order.order_reference;
        }

        if (estimatedDelivery) {
            if (this.orderData.deliveryTime === 'scheduled') {
                const date = new Date(this.orderData.deliveryInfo.scheduledDate);
                const time = this.orderData.deliveryInfo.scheduledTime;
                estimatedDelivery.textContent = `${date.toLocaleDateString()} at ${time}`;
            } else {
                estimatedDelivery.textContent = '30-45 minutes';
            }
        }

        if (modal) {
            modal.classList.add('show');
        }
    }

    setupSuccessModal() {
        const continueShopping = document.getElementById('continueShopping');
        const trackOrder = document.getElementById('trackOrder');

        if (continueShopping) {
            continueShopping.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        if (trackOrder) {
            trackOrder.addEventListener('click', () => {
                // In production, this would navigate to order tracking page
                utils.showAlert('Order tracking feature would be implemented here', 'info');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            });
        }
    }
}

// Add field error styles
const fieldErrorStyles = `
<style>
.field-error {
    color: var(--error-color);
    font-size: var(--font-size-xs);
    margin-top: var(--spacing-xs);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.field-error::before {
    content: '⚠';
    font-size: var(--font-size-sm);
}

input.error,
textarea.error,
select.error {
    border-color: var(--error-color) !important;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
}

.btn-loader {
    width: 20px;
    height: 20px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', fieldErrorStyles);

// Initialize the checkout page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.checkoutPage = new CheckoutPage();
});
