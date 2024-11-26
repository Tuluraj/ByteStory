// Constants
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGHsqpnrxQQCSG6RVFfu4ma89BctNGaJzCoPF8mzNxDaxm9lkeRs3XuysmlJ9wtF4G/exec';
const FORM_NAME = 'submit-to-google-sheet';
const MESSAGE_DURATION = 4500; // 4.5 seconds

// Elements
const form = document.forms[FORM_NAME];
const msg = document.getElementById('msg');
const submitButton = form.querySelector('button[type="submit"]');
const emailInput = form.querySelector('input[type="email"]');

// Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// UI Updates
function updateUI(isLoading, message = '', isError = false) {
    // Update button state
    submitButton.disabled = isLoading;
    submitButton.innerHTML = isLoading ? 'Subscribing...' : 'Subscribe';
    
    // Update message
    if (message) {
        msg.innerHTML = message;
        msg.style.color = isError ? '#dc3545' : '#28a745';
        
        // Clear message after duration
        if (!isError) {
            setTimeout(() => {
                msg.innerHTML = '';
                msg.style.color = '';
            }, MESSAGE_DURATION);
        }
    }
}

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    // Validate email
    if (!isValidEmail(email)) {
        updateUI(false, 'Please enter a valid email address', true);
        return;
    }
    
    // Start loading state
    updateUI(true);
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: new FormData(form),
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Success
        updateUI(false, 'Thanks for Subscribing!');
        form.reset();
        
    } catch (error) {
        console.error('Subscription error:', error);
        updateUI(false, 'Subscription failed. Please try again later.', true);
    }
});

// Reset error message when user starts typing
emailInput.addEventListener('input', () => {
    if (msg.style.color === 'rgb(220, 53, 69)') { // #dc3545 in rgb
        msg.innerHTML = '';
        msg.style.color = '';
    }
});