class AuthManager {
    constructor() {
        this.users = [
            {
                id: '1',
                email: 'admin@blockchain.com',
                password: 'admin123',
                name: 'Admin User',
                role: 'admin',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
                createdAt: new Date('2024-01-01')
            },
            {
                id: '2',
                email: 'user@blockchain.com',
                password: 'user123',
                name: 'Demo User',
                role: 'user',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
                createdAt: new Date('2024-01-15')
            }
        ];
        
        this.currentUser = null;
        this.demoMode = false;
        this.callbacks = [];
        
        this.loadSession();
    }

    loadSession() {
        try {
            const savedUser = localStorage.getItem('blockchain_user');
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                this.currentUser = {
                    ...userData,
                    createdAt: new Date(userData.createdAt)
                };
            }
        } catch (error) {
            localStorage.removeItem('blockchain_user');
        }
    }

    saveSession() {
        if (this.currentUser) {
            localStorage.setItem('blockchain_user', JSON.stringify(this.currentUser));
        }
    }

    async login(email, password, role) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.users.find(u => 
                    u.email === email && 
                    u.password === password &&
                    (!role || u.role === role)
                );
                
                if (user) {
                    this.currentUser = {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        avatar: user.avatar,
                        createdAt: user.createdAt
                    };
                    
                    this.saveSession();
                    this.notifyCallbacks();
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 1000);
        });
    }

    async register(email, password, name) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const existingUser = this.users.find(u => u.email === email);
                if (existingUser) {
                    resolve(false);
                    return;
                }
                
                const newUser = {
                    id: Date.now().toString(),
                    email,
                    password,
                    name,
                    role: 'user',
                    createdAt: new Date()
                };
                
                this.users.push(newUser);
                
                this.currentUser = {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                    createdAt: newUser.createdAt
                };
                
                this.saveSession();
                this.notifyCallbacks();
                resolve(true);
            }, 1000);
        });
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('blockchain_user');
        this.notifyCallbacks();
    }

    setDemoMode(enabled) {
        this.demoMode = enabled;
        this.notifyCallbacks();
    }

    isAuthenticated() {
        return !!this.currentUser || this.demoMode;
    }

    isAdmin() {
        return this.currentUser?.role === 'admin';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserInitials(name) {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    subscribe(callback) {
        this.callbacks.push(callback);
        return () => {
            this.callbacks = this.callbacks.filter(cb => cb !== callback);
        };
    }

    notifyCallbacks() {
        this.callbacks.forEach(callback => callback({
            user: this.currentUser,
            isAuthenticated: this.isAuthenticated(),
            isAdmin: this.isAdmin(),
            demoMode: this.demoMode
        }));
    }
}

window.authManager = new AuthManager();