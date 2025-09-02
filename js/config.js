// Supabase Configuration
const SUPABASE_URL = 'https://mmjpqfmtmvlkvwoovliw.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tanBxZm10bXZsa3Z3b292bGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDkxMzQsImV4cCI6MjA3MDE4NTEzNH0.IlmzD8h8z8vI48kfNEKKaeNfwIUBkwbPq_SInog2WM8'; // Replace with your Supabase anon key

// Paystack Configuration
const PAYSTACK_PUBLIC_KEY = 'MY_PAYSTACK_PUBLIC_KEY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// App Configuration
const APP_CONFIG = {
    name: 'Crave',
    version: '1.0.0',
    currency: '₦',
    defaultDeliveryFee: 500,
    defaultServiceFee: 100,
    maxImageSize: 5 * 1024 * 1024, // 5MB
    supportedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    itemsPerPage: 12,
    reviewsPerPage: 10,
};

// API Endpoints
const API_ENDPOINTS = {
    foods: '/foods',
    reviews: '/reviews',
    orders: '/orders',
    users: '/users',
};

// Storage Buckets
const STORAGE_BUCKETS = {
    profiles: 'profiles', // Make sure this matches your Supabase bucket name exactly
    foods: 'foods',
};


const ALTERNATIVE_BUCKET_NAMES = [
    'profiles',
    'profile-images',
    'user-profiles',
    'avatars',
    'images'
];

// Default images
const DEFAULT_IMAGES = {
    profile: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEN0Q5RDEiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjA3NjEgMTAgMjQgMTEuOTIzOSAyNCAxNEMyNCAxNi4wNzYxIDIyLjA3NjEgMTggMjAgMThDMTcuOTIzOSAxOCAxNiAxNi4wNzYxIDE2IDE0QzE2IDExLjkyMzkgMTcuOTIzOSAxMCAyMCAxMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI4IDMwQzI4IDI2LjY4NjMgMjQuNDE4MyAyNCAyMCAyNEMxNS41ODE3IDI0IDEyIDI2LjY4NjMgMTIgMzBIMjhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=',
    food: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
};

// Food categories with images
const FOOD_CATEGORIES = [
    {
        id: 'pizza',
        name: 'Pizza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'burger',
        name: 'Burgers',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'pasta',
        name: 'Pasta',
        image: 'images/4.jpg'
    },
    {
        id: 'salad',
        name: 'Salads',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'dessert',
        name: 'Desserts',
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 'drinks',
        name: 'Drinks',
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    }
];

// Sample restaurant data
const SAMPLE_RESTAURANTS = [
    {
        id: 1,
        name: "Mama's Kitchen",
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        rating: 4.8,
        reviews: 156,
        deliveryTime: '25-35 min',
        deliveryFee: 'Free',
        cuisine: 'Nigerian',
        badge: 'Popular'
    },
    {
        id: 2,
        name: "Pizza Palace",
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        rating: 4.6,
        reviews: 89,
        deliveryTime: '30-40 min',
        deliveryFee: '₦200',
        cuisine: 'Italian',
        badge: 'New'
    },
    {
        id: 3,
        name: "Burger Junction",
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        rating: 4.7,
        reviews: 234,
        deliveryTime: '20-30 min',
        deliveryFee: 'Free',
        cuisine: 'American',
        badge: 'Fast'
    }
];

// Sample food data
const SAMPLE_FOODS = [
    {
        id: 1,
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza with fresh tomatoes, mozzarella cheese, and basil leaves on a crispy thin crust.',
        price: 3500,
        originalPrice: 4000,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'pizza',
        calories: 285,
        dietLabel: 'Vegetarian',
        healthLabels: ['Gluten-Free Available'],
        rating: 4.8,
        reviews: 156,
        restaurant: "Mama's Kitchen",
        tags: ['Italian', 'Cheese', 'Tomato', 'Basil'],
        sizes: [
            { name: 'Small', price: 3500 },
            { name: 'Medium', price: 4500 },
            { name: 'Large', price: 5500 }
        ]
    },
    {
        id: 2,
        name: 'Classic Cheeseburger',
        description: 'Juicy beef patty with melted cheese, lettuce, tomato, onions, and our special sauce on a sesame bun.',
        price: 2800,
        originalPrice: 3200,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'burger',
        calories: 540,
        dietLabel: 'Non-Vegetarian',
        healthLabels: ['High Protein'],
        rating: 4.6,
        reviews: 89,
        restaurant: 'Burger Junction',
        tags: ['Beef', 'Cheese', 'American', 'Classic'],
        sizes: [
            { name: 'Regular', price: 2800 },
            { name: 'Large', price: 3500 }
        ]
    },
    {
        id: 3,
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan cheese, croutons, and creamy Caesar dressing.',
        price: 2200,
        originalPrice: 2500,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'salad',
        calories: 180,
        dietLabel: 'Vegetarian',
        healthLabels: ['Low Calorie', 'Fresh'],
        rating: 4.4,
        reviews: 67,
        restaurant: "Mama's Kitchen",
        tags: ['Healthy', 'Fresh', 'Lettuce', 'Cheese'],
        sizes: [
            { name: 'Regular', price: 2200 },
            { name: 'Large', price: 2800 }
        ]
    },
    {
        id: 4,
        name: 'Chocolate Brownie',
        description: 'Rich and fudgy chocolate brownie served warm with vanilla ice cream.',
        price: 1800,
        originalPrice: 2000,
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'dessert',
        calories: 320,
        dietLabel: 'Vegetarian',
        healthLabels: ['Sweet'],
        rating: 4.9,
        reviews: 124,
        restaurant: 'Pizza Palace',
        tags: ['Chocolate', 'Sweet', 'Dessert', 'Ice Cream'],
        sizes: [
            { name: 'Single', price: 1800 },
            { name: 'Double', price: 3200 }
        ]
    },
    {
        id: 5,
        name: 'Pepperoni Pizza',
        description: 'Classic pizza topped with spicy pepperoni, mozzarella cheese, and tomato sauce.',
        price: 4200,
        originalPrice: 4800,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'pizza',
        calories: 320,
        dietLabel: 'Non-Vegetarian',
        healthLabels: ['High Protein'],
        rating: 4.7,
        reviews: 203,
        restaurant: 'Pizza Palace',
        tags: ['Pepperoni', 'Spicy', 'Italian', 'Cheese'],
        sizes: [
            { name: 'Small', price: 4200 },
            { name: 'Medium', price: 5200 },
            { name: 'Large', price: 6200 }
        ]
    },
    {
        id: 6,
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice packed with vitamin C and natural sweetness.',
        price: 800,
        originalPrice: 1000,
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'drinks',
        calories: 110,
        dietLabel: 'Vegan',
        healthLabels: ['Vitamin C', 'Natural', 'Fresh'],
        rating: 4.3,
        reviews: 45,
        restaurant: "Mama's Kitchen",
        tags: ['Orange', 'Fresh', 'Healthy', 'Natural'],
        sizes: [
            { name: 'Small', price: 800 },
            { name: 'Large', price: 1200 }
        ]
    },
    {
        id: 7,
        name: 'BBQ Chicken Pizza',
        description: 'Delicious pizza with grilled chicken, red onions, and tangy BBQ sauce.',
        price: 4500,
        originalPrice: 5000,
        image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'pizza',
        calories: 380,
        dietLabel: 'Non-Vegetarian',
        healthLabels: ['High Protein'],
        rating: 4.5,
        reviews: 98,
        restaurant: 'Pizza Palace',
        tags: ['Chicken', 'BBQ', 'American', 'Spicy'],
        sizes: [
            { name: 'Medium', price: 4500 },
            { name: 'Large', price: 5500 }
        ]
    },
    {
        id: 8,
        name: 'Veggie Burger',
        description: 'Plant-based burger with fresh vegetables, avocado, and special sauce.',
        price: 2500,
        originalPrice: 2800,
        image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1520072959219-c595dc870360?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'burger',
        calories: 320,
        dietLabel: 'Vegan',
        healthLabels: ['Plant-Based', 'Healthy'],
        rating: 4.3,
        reviews: 76,
        restaurant: 'Burger Junction',
        tags: ['Vegetarian', 'Healthy', 'Plant-Based', 'Fresh'],
        sizes: [
            { name: 'Regular', price: 2500 },
            { name: 'Large', price: 3200 }
        ]
    },
    {
        id: 9,
        name: 'Greek Salad',
        description: 'Fresh mixed greens with feta cheese, olives, tomatoes, and Greek dressing.',
        price: 2400,
        originalPrice: 2700,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'salad',
        calories: 220,
        dietLabel: 'Vegetarian',
        healthLabels: ['Mediterranean', 'Fresh'],
        rating: 4.6,
        reviews: 89,
        restaurant: "Mama's Kitchen",
        tags: ['Greek', 'Fresh', 'Feta', 'Olives'],
        sizes: [
            { name: 'Regular', price: 2400 },
            { name: 'Large', price: 3000 }
        ]
    },
    {
        id: 10,
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-flavored mascarpone cream and ladyfingers.',
        price: 2200,
        originalPrice: 2500,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'dessert',
        calories: 280,
        dietLabel: 'Vegetarian',
        healthLabels: ['Italian', 'Coffee'],
        rating: 4.8,
        reviews: 156,
        restaurant: 'Pizza Palace',
        tags: ['Italian', 'Coffee', 'Cream', 'Ladyfingers'],
        sizes: [
            { name: 'Single', price: 2200 },
            { name: 'Double', price: 3800 }
        ]
    },
    {
        id: 11,
        name: 'Iced Coffee',
        description: 'Smooth cold brew coffee served over ice with a hint of vanilla.',
        price: 1200,
        originalPrice: 1400,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        images: [
            'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: 'drinks',
        calories: 85,
        dietLabel: 'Vegan',
        healthLabels: ['Caffeine', 'Cold'],
        rating: 4.4,
        reviews: 67,
        restaurant: 'Burger Junction',
        tags: ['Coffee', 'Cold', 'Vanilla', 'Smooth'],
        sizes: [
            { name: 'Regular', price: 1200 },
            { name: 'Large', price: 1600 }
        ]
    },
    {
        id: 12,
        name: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta with eggs, cheese, pancetta, and black pepper.',
        price: 3200,
        originalPrice: 3600,
        image: 'images/4.jpg',
        images: [
            'images/4.jpg'
        ],
        category: 'pasta',
        calories: 420,
        dietLabel: 'Non-Vegetarian',
        healthLabels: ['Italian', 'Creamy'],
        rating: 4.7,
        reviews: 134,
        restaurant: 'Pizza Palace',
        tags: ['Italian', 'Pasta', 'Eggs', 'Cheese'],
        sizes: [
            { name: 'Regular', price: 3200 },
            { name: 'Large', price: 4200 }
        ]
    }
];

// Utility functions
const utils = {
    formatCurrency: (amount) => {
        return `${APP_CONFIG.currency}${amount.toLocaleString()}`;
    },
    
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    formatTime: (date) => {
        return new Date(date).toLocaleTimeString('en-NG', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    validateImageFile: (file) => {
        if (!file) return { valid: false, error: 'No file selected' };
        
        if (!APP_CONFIG.supportedImageTypes.includes(file.type)) {
            return { valid: false, error: 'Unsupported file type' };
        }
        
        if (file.size > APP_CONFIG.maxImageSize) {
            return { valid: false, error: 'File size too large' };
        }
        
        return { valid: true };
    },
    
    showLoading: () => {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.add('show');
        }
    },
    
    hideLoading: () => {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.remove('show');
        }
    },
    
    showAlert: (message, type = 'success', duration = 5000) => {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="alert-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        alertContainer.appendChild(alert);
        
        // Auto remove
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, duration);
        
        // Close button
        alert.querySelector('.alert-close').addEventListener('click', () => {
            alert.remove();
        });
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        PAYSTACK_PUBLIC_KEY,
        APP_CONFIG,
        API_ENDPOINTS,
        STORAGE_BUCKETS,
        DEFAULT_IMAGES,
        FOOD_CATEGORIES,
        SAMPLE_RESTAURANTS,
        SAMPLE_FOODS,
        utils
    };
}
