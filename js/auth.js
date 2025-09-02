// Authentication System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthPage = window.location.pathname.includes('auth.html');
        this.init();
    }

    async init() {
        // Check if user is already logged in
        await this.checkAuthState();
        
        if (this.isAuthPage) {
            this.initAuthPage();
        } else {
            this.initProtectedPage();
        }
    }

    async checkAuthState() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                console.error('Auth check error:', error);
                localStorage.setItem('is_authenticated', 'false');
                return;
            }

            if (user) {
                this.currentUser = user;
                await this.loadUserProfile();
                localStorage.setItem('is_authenticated', 'true');
                
                // If on auth page and logged in, redirect to home
                if (this.isAuthPage) {
                    window.location.href = 'index.html';
                    return;
                }
                
                this.updateNavigation();
            } else {
                // If not on auth page and not logged in, redirect to auth
                localStorage.setItem('is_authenticated', 'false');
                if (!this.isAuthPage) {
                    window.location.href = 'auth.html';
                    return;
                }
            }
        } catch (error) {
            console.error('Auth state check failed:', error);
            localStorage.setItem('is_authenticated', 'false');
            if (!this.isAuthPage) {
                window.location.href = 'auth.html';
            }
        }
    }

    async loadUserProfile() {
        if (!this.currentUser) return;

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error && error.code !== 'PGRST116') { // Not found error
                console.error('Profile load error:', error);
                return;
            }

            if (data) {
                this.currentUser.profile = data;
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
    }

    initAuthPage() {
        this.setupAuthForms();
        this.setupFormSwitching();
        this.setupPasswordToggle();
        this.setupFileUpload();
    }

    initProtectedPage() {
        if (!this.currentUser) {
            window.location.href = 'auth.html';
            return;
        }
        
        this.updateNavigation();
        this.setupLogout();
        this.ensureDropdownAvailable();
    }

    setupAuthForms() {
        const signinForm = document.getElementById('signinForm');
        const signupForm = document.getElementById('signupForm');

        if (signinForm) {
            signinForm.addEventListener('submit', (e) => this.handleSignIn(e));
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignUp(e));
        }

        // Google sign in
        const googleBtn = document.getElementById('googleSignin');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }
    }

    setupFormSwitching() {
        const switchLink = document.getElementById('switchLink');
        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');
        const switchText = document.getElementById('switchText');
        const signinForm = document.getElementById('signinForm');
        const signupForm = document.getElementById('signupForm');

        if (switchLink) {
            switchLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                const isSignUp = signupForm && !signupForm.classList.contains('hidden');
                
                if (isSignUp) {
                    // Switch to sign in
                    signupForm.classList.add('hidden');
                    signinForm.classList.remove('hidden');
                    authTitle.textContent = 'Welcome Back';
                    authSubtitle.textContent = 'Sign in to continue your food journey';
                    switchText.innerHTML = 'Don\'t have an account? <a href="#" id="switchLink">Sign up</a>';
                } else {
                    // Switch to sign up
                    signinForm.classList.add('hidden');
                    signupForm.classList.remove('hidden');
                    authTitle.textContent = 'Create Account';
                    authSubtitle.textContent = 'Join us and discover amazing food';
                    switchText.innerHTML = 'Already have an account? <a href="#" id="switchLink">Sign in</a>';
                }
                
                // Re-attach event listener
                document.getElementById('switchLink').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.setupFormSwitching();
                });
            });
        }
    }

    setupPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const input = document.getElementById(targetId);
                const icon = button.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    setupFileUpload() {
        const fileInput = document.getElementById('profileImage');
        const preview = document.getElementById('imagePreview');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const validation = utils.validateImageFile(file);
                if (!validation.valid) {
                    utils.showAlert(validation.error, 'error');
                    fileInput.value = '';
                    return;
                }

                // Show preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            });
        }
    }

    async handleSignIn(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.signinEmail.value;
        const password = form.signinPassword.value;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (!utils.validateEmail(email)) {
            utils.showAlert('Please enter a valid email address', 'error');
            return;
        }

        this.setButtonLoading(submitBtn, true);
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            utils.showAlert('Welcome back!', 'success');
            localStorage.setItem('is_authenticated', 'true');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            console.error('Sign in error:', error);
            utils.showAlert(error.message || 'Failed to sign in', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleSignUp(e) {
        e.preventDefault();
        
        const form = e.target;
        const name = form.signupName.value.trim();
        const email = form.signupEmail.value.trim();
        const password = form.signupPassword.value;
        const confirmPassword = form.confirmPassword.value;
        const profileImage = form.profileImage.files[0];
        const agreeTerms = form.agreeTerms.checked;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Validation
        if (!name) {
            utils.showAlert('Please enter your full name', 'error');
            return;
        }
        
        if (!utils.validateEmail(email)) {
            utils.showAlert('Please enter a valid email address', 'error');
            return;
        }
        
        if (password.length < 6) {
            utils.showAlert('Password must be at least 6 characters long', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            utils.showAlert('Passwords do not match', 'error');
            return;
        }
        
        if (!agreeTerms) {
            utils.showAlert('Please agree to the terms and conditions', 'error');
            return;
        }

        this.setButtonLoading(submitBtn, true);
        
        try {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (authError) {
                throw authError;
            }

            let profileImageUrl = DEFAULT_IMAGES.profile;

            // Upload profile image if provided
            if (profileImage) {
                try {
                    const fileName = `${authData.user.id}-${Date.now()}.${profileImage.name.split('.').pop()}`;
                    
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from(STORAGE_BUCKETS.profiles)
                        .upload(fileName, profileImage);

                    if (uploadError) {
                        console.error('Image upload error:', uploadError);
                    } else {
                        const { data: urlData } = supabase.storage
                            .from(STORAGE_BUCKETS.profiles)
                            .getPublicUrl(fileName);
                        
                        profileImageUrl = urlData.publicUrl;
                    }
                } catch (uploadError) {
                    console.error('Image upload failed:', uploadError);
                }
            }

            // Create user profile
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    name: name,
                    email: email,
                    profile_image: profileImageUrl
                });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Continue anyway, profile can be created later
            }

            utils.showAlert('Account created successfully! Please check your email for verification.', 'success');
            localStorage.setItem('is_authenticated', 'true');
            
            // Switch to sign in form
            setTimeout(() => {
                document.getElementById('switchLink').click();
            }, 2000);

        } catch (error) {
            console.error('Sign up error:', error);
            utils.showAlert(error.message || 'Failed to create account', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleGoogleSignIn() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/index.html`
                }
            });

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Google sign in error:', error);
            utils.showAlert('Failed to sign in with Google', 'error');
        }
    }

    updateNavigation() {
        const profileImg = document.getElementById('profileImg');
        
        if (profileImg && this.currentUser) {
            const imageUrl = this.currentUser.profile?.profile_image || DEFAULT_IMAGES.profile;
            profileImg.src = imageUrl;
            profileImg.alt = this.currentUser.profile?.name || 'Profile';
            
            // Setup dropdown
            const profileContainer = profileImg.parentElement;
            const dropdown = document.getElementById('dropdownMenu');
            
            if (profileContainer && dropdown) {
                this.bindDropdown(profileContainer, dropdown);
            }
        }
    }

    bindDropdown(profileContainer, dropdown) {
        if (profileContainer.dataset.dropdownBound === 'true') return;
        profileContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
        profileContainer.dataset.dropdownBound = 'true';
    }

    ensureDropdownAvailable() {
        const profileImg = document.getElementById('profileImg');
        const dropdown = document.getElementById('dropdownMenu');
        const profileContainer = profileImg?.parentElement;
        if (profileImg && !profileImg.getAttribute('src')) {
            profileImg.src = DEFAULT_IMAGES.profile;
        }
        if (profileContainer && dropdown) {
            this.bindDropdown(profileContainer, dropdown);
        }
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleLogout();
            });
        }
    }

    async handleLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                throw error;
            }
            
            // Clear any local storage
            localStorage.clear();
            localStorage.setItem('is_authenticated', 'false');
            
            utils.showAlert('Logged out successfully', 'success');
            
            // Redirect to auth page
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 1000);
            
        } catch (error) {
            console.error('Logout error:', error);
            utils.showAlert('Failed to logout', 'error');
        }
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        window.location.href = 'auth.html';
    } else if (event === 'SIGNED_IN' && session) {
        if (window.location.pathname.includes('auth.html')) {
            window.location.href = 'index.html';
        }
    }
});
