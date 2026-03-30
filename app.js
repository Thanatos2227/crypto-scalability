class App {
    constructor() {
        this.elements = {};
        this.currentView = 'login';
        this.unsubscribeAuth = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.initialize();
    }

    initializeElements() {
        this.elements.loadingScreen = document.getElementById('loading-screen');
        this.elements.loginContainer = document.getElementById('login-container');
        this.elements.dashboardContainer = document.getElementById('dashboard-container');
        
        this.elements.loginForm = document.getElementById('login-form');
        this.elements.registerForm = document.getElementById('register-form');
        this.elements.loginEmail = document.getElementById('login-email');
        this.elements.loginPassword = document.getElementById('login-password');
        this.elements.loginError = document.getElementById('login-error');
        this.elements.registerName = document.getElementById('register-name');
        this.elements.registerEmail = document.getElementById('register-email');
        this.elements.registerPassword = document.getElementById('register-password');
        this.elements.registerConfirm = document.getElementById('register-confirm');
        this.elements.registerError = document.getElementById('register-error');
        this.elements.registerSuccess = document.getElementById('register-success');
        
        this.elements.demoToggleBtn = document.getElementById('demo-toggle-btn');
        
        this.elements.userBadge = document.getElementById('user-badge');
        this.elements.welcomeText = document.getElementById('welcome-text');
        this.elements.userMenuBtn = document.getElementById('user-menu-btn');
        this.elements.userDropdownMenu = document.getElementById('user-dropdown-menu');
        this.elements.userInitials = document.getElementById('user-initials');
        this.elements.userName = document.getElementById('user-name');
        this.elements.dropdownName = document.getElementById('dropdown-name');
        this.elements.dropdownEmail = document.getElementById('dropdown-email');
        this.elements.adminItem = document.getElementById('admin-item');
        this.elements.logoutBtn = document.getElementById('logout-btn');
        
        this.elements.profileModal = document.getElementById('profile-modal');
        this.elements.profileBtn = document.getElementById('profile-btn');
        this.elements.profileClose = document.getElementById('profile-close');
        this.elements.profileLogout = document.getElementById('profile-logout');
        this.elements.profileInitials = document.getElementById('profile-initials');
        this.elements.profileName = document.getElementById('profile-name');
        this.elements.profileEmail = document.getElementById('profile-email');
        this.elements.profileRoleBadge = document.getElementById('profile-role-badge');
        this.elements.profileEmailDetail = document.getElementById('profile-email-detail');
        this.elements.profileDate = document.getElementById('profile-date');
        this.elements.profileRole = document.getElementById('profile-role');
        this.elements.adminPrivileges = document.getElementById('admin-privileges');
    }

    setupEventListeners() {

        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        

        if (this.elements.registerForm) {
            this.elements.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectRole(e.target.dataset.role));
        });
        
        document.querySelectorAll('.demo-fill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.fillDemoCredentials(e.target.dataset.role));
        });
        
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => this.togglePassword(e));
        });
        
        if (this.elements.demoToggleBtn) {
            this.elements.demoToggleBtn.addEventListener('click', () => this.toggleDemoMode());
        }
        
        if (this.elements.userMenuBtn) {
            this.elements.userMenuBtn.addEventListener('click', () => this.toggleUserMenu());
        }
        
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => this.logout());
        }
        if (this.elements.profileLogout) {
            this.elements.profileLogout.addEventListener('click', () => this.logout());
        }
        
        if (this.elements.profileBtn) {
            this.elements.profileBtn.addEventListener('click', () => this.showProfile());
        }
        if (this.elements.profileClose) {
            this.elements.profileClose.addEventListener('click', () => this.hideProfile());
        }
        if (this.elements.profileModal) {
            this.elements.profileModal.addEventListener('click', (e) => {
                if (e.target === this.elements.profileModal) {
                    this.hideProfile();
                }
            });
        }
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                this.hideUserMenu();
            }
        });
    }

    async initialize() {
        this.showLoading();
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.unsubscribeAuth = window.authManager.subscribe((authState) => {
            this.handleAuthChange(authState);
        });
        
        this.handleAuthChange({
            user: window.authManager.getCurrentUser(),
            isAuthenticated: window.authManager.isAuthenticated(),
            isAdmin: window.authManager.isAdmin(),
            demoMode: window.authManager.demoMode
        });
        
        this.hideLoading();
    }

    showLoading() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.display = 'none';
        }
    }

    handleAuthChange(authState) {
        if (authState.isAuthenticated) {
            this.showDashboard(authState);
        } else {
            this.showLogin();
        }
        
        this.updateDemoToggle(authState.demoMode);
    }

    showLogin() {
        if (this.currentView === 'login') return;
        
        this.currentView = 'login';
        
        if (this.elements.loginContainer) {
            this.elements.loginContainer.style.display = 'flex';
        }
        if (this.elements.dashboardContainer) {
            this.elements.dashboardContainer.style.display = 'none';
        }

        window.dashboardManager.stop();
    }

    showDashboard(authState) {
        if (this.currentView === 'dashboard') return;
        
        this.currentView = 'dashboard';
        
        if (this.elements.loginContainer) {
            this.elements.loginContainer.style.display = 'none';
        }
        if (this.elements.dashboardContainer) {
            this.elements.dashboardContainer.style.display = 'flex';
        }
        

        this.updateUserInterface(authState);
        
        window.dashboardManager.start();
    }

    updateUserInterface(authState) {
        const user = authState.user;
        const isAdmin = authState.isAdmin;
        
        if (!user && !authState.demoMode) return;
        
        const displayName = user ? user.name : 'Demo User';
        const displayEmail = user ? user.email : 'demo@blockchain.com';
        const displayRole = isAdmin ? 'admin' : 'user';
        const initials = window.authManager.getUserInitials(displayName);
        
        if (this.elements.userBadge) {
            this.elements.userBadge.textContent = isAdmin ? 'Admin Panel' : 'User Dashboard';
            this.elements.userBadge.className = `user-badge ${isAdmin ? 'admin' : ''}`;
        }
        
        if (this.elements.welcomeText) {
            this.elements.welcomeText.textContent = `Welcome back, ${displayName.split(' ')[0]}`;
        }
        
        if (this.elements.userInitials) {
            this.elements.userInitials.textContent = initials;
        }
        
        if (this.elements.userName) {
            this.elements.userName.textContent = displayName;
        }
        
        if (this.elements.dropdownName) {
            this.elements.dropdownName.textContent = displayName;
        }
        
        if (this.elements.dropdownEmail) {
            this.elements.dropdownEmail.textContent = displayEmail;
        }
        
        if (this.elements.adminItem) {
            this.elements.adminItem.style.display = isAdmin ? 'flex' : 'none';
        }
        
        this.updateProfileModal(user, isAdmin);
    }

    updateProfileModal(user, isAdmin) {
        if (!user) return;
        
        const initials = window.authManager.getUserInitials(user.name);
        
        if (this.elements.profileInitials) {
            this.elements.profileInitials.textContent = initials;
        }
        
        if (this.elements.profileName) {
            this.elements.profileName.textContent = user.name;
        }
        
        if (this.elements.profileEmail) {
            this.elements.profileEmail.textContent = user.email;
        }
        
        if (this.elements.profileRoleBadge) {
            this.elements.profileRoleBadge.textContent = isAdmin ? 'Administrator' : 'User';
            this.elements.profileRoleBadge.className = `role-badge ${isAdmin ? 'admin' : ''}`;
        }
        
        if (this.elements.profileEmailDetail) {
            this.elements.profileEmailDetail.textContent = user.email;
        }
        
        if (this.elements.profileDate) {
            this.elements.profileDate.textContent = user.createdAt.toLocaleDateString();
        }
        
        if (this.elements.profileRole) {
            this.elements.profileRole.textContent = user.role;
        }
        
        if (this.elements.adminPrivileges) {
            this.elements.adminPrivileges.style.display = isAdmin ? 'block' : 'none';
        }
    }

    updateDemoToggle(demoMode) {
        if (!this.elements.demoToggleBtn) return;
        
        const icon = this.elements.demoToggleBtn.querySelector('i');
        const text = this.elements.demoToggleBtn.childNodes[2];
        
        if (demoMode) {
            this.elements.demoToggleBtn.classList.add('active');
            icon.className = 'fas fa-eye';
            text.textContent = ' Dashboard';
        } else {
            this.elements.demoToggleBtn.classList.remove('active');
            icon.className = 'fas fa-eye-slash';
            text.textContent = ' Login';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = this.elements.loginEmail.value.trim();
        const password = this.elements.loginPassword.value;
        const role = document.querySelector('.role-btn.active')?.dataset.role;
        
        if (!email || !password) {
            this.showError('login', 'Please fill in all fields');
            return;
        }
        
        this.setLoading('login', true);
        this.hideError('login');
        
        const success = await window.authManager.login(email, password, role);
        
        this.setLoading('login', false);
        
        if (!success) {
            this.showError('login', 'Invalid credentials. Please check your email and password.');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = this.elements.registerName.value.trim();
        const email = this.elements.registerEmail.value.trim();
        const password = this.elements.registerPassword.value;
        const confirmPassword = this.elements.registerConfirm.value;
        
        if (!name || !email || !password) {
            this.showError('register', 'Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showError('register', 'Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            this.showError('register', 'Password must be at least 6 characters long');
            return;
        }
        
        this.setLoading('register', true);
        this.hideError('register');
        this.hideSuccess('register');
        
        const success = await window.authManager.register(email, password, name);
        
        this.setLoading('register', false);
        
        if (success) {
            this.showSuccess('register', 'Account created successfully! You are now logged in.');
        } else {
            this.showError('register', 'Email already exists. Please use a different email.');
        }
    }

    switchTab(tabName) {

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        
        this.hideError('login');
        this.hideError('register');
        this.hideSuccess('register');
    }

    selectRole(role) {
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.role === role);
        });
    }

    fillDemoCredentials(role) {
        if (role === 'admin') {
            this.elements.loginEmail.value = 'admin@blockchain.com';
            this.elements.loginPassword.value = 'admin123';
            this.selectRole('admin');
        } else {
            this.elements.loginEmail.value = 'user@blockchain.com';
            this.elements.loginPassword.value = 'user123';
            this.selectRole('user');
        }
    }

    togglePassword(e) {
        const button = e.target.closest('.toggle-password');
        const input = button.parentElement.querySelector('input');
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    toggleDemoMode() {
        const currentMode = window.authManager.demoMode;
        window.authManager.setDemoMode(!currentMode);
    }

    toggleUserMenu() {
        if (this.elements.userDropdownMenu) {
            this.elements.userDropdownMenu.classList.toggle('show');
        }
    }


    hideUserMenu() {
        if (this.elements.userDropdownMenu) {
            this.elements.userDropdownMenu.classList.remove('show');
        }
    }

    showProfile() {
        if (this.elements.profileModal) {
            this.elements.profileModal.style.display = 'flex';
        }
        this.hideUserMenu();
    }

    hideProfile() {
        if (this.elements.profileModal) {
            this.elements.profileModal.style.display = 'none';
        }
    }

    logout() {
        window.authManager.logout();
        this.hideUserMenu();
        this.hideProfile();
        
        if (this.elements.loginForm) {
            this.elements.loginForm.reset();
        }
        if (this.elements.registerForm) {
            this.elements.registerForm.reset();
        }
        
        this.selectRole('user');
    }

    showError(form, message) {
        const errorElement = this.elements[`${form}Error`];
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    hideError(form) {
        const errorElement = this.elements[`${form}Error`];
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    showSuccess(form, message) {
        const successElement = this.elements[`${form}Success`];
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        }
    }

    hideSuccess(form) {
        const successElement = this.elements[`${form}Success`];
        if (successElement) {
            successElement.style.display = 'none';
        }
    }

    setLoading(form, loading) {
        const formElement = this.elements[`${form}Form`];
        const submitBtn = formElement?.querySelector('.submit-btn');
        
        if (!submitBtn) return;
        
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');
        
        if (loading) {
            submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnSpinner) btnSpinner.style.display = 'flex';
        } else {
            submitBtn.disabled = false;
            if (btnText) btnText.style.display = 'block';
            if (btnSpinner) btnSpinner.style.display = 'none';
        }
    }

    destroy() {
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
        }
        
        window.dashboardManager.stop();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.destroy();
    }
});