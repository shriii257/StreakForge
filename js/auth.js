// ====================================
// AUTHENTICATION LOGIC
// ====================================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Get tab buttons
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    // Get form elements
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    // Switch between login and signup
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    });
    
    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    });
    
    // Handle Login
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        
        // Validate inputs
        if (!email || !password) {
            showError(errorDiv, 'Please fill in all fields');
            return;
        }
        
        // Disable button
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        
        try {
            // Sign in with Firebase
            await auth.signInWithEmailAndPassword(email, password);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('Login error:', error);
            showError(errorDiv, getErrorMessage(error.code));
            
            // Re-enable button
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });
    
    // Handle Signup
    signupBtn.addEventListener('click', async () => {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const errorDiv = document.getElementById('signupError');
        
        // Validate inputs
        if (!name || !email || !password) {
            showError(errorDiv, 'Please fill in all fields');
            return;
        }
        
        if (password.length < 6) {
            showError(errorDiv, 'Password must be at least 6 characters');
            return;
        }
        
        // Disable button
        signupBtn.disabled = true;
        signupBtn.textContent = 'Creating account...';
        
        try {
            // Create user with Firebase
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update profile with name
            await user.updateProfile({
                displayName: name
            });
            
            // Create user document in Firestore
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('Signup error:', error);
            showError(errorDiv, getErrorMessage(error.code));
            
            // Re-enable button
            signupBtn.disabled = false;
            signupBtn.textContent = 'Create Account';
        }
    });
    
    // Handle Enter key press
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginBtn.click();
    });
    
    document.getElementById('signupPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') signupBtn.click();
    });
});

// Helper function to show errors
function showError(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 5000);
}

// Helper function to get user-friendly error messages
function getErrorMessage(errorCode) {
    const errors = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/network-request-failed': 'Network error. Please check your connection',
        'auth/too-many-requests': 'Too many attempts. Please try again later'
    };
    
    return errors[errorCode] || 'An error occurred. Please try again';
}