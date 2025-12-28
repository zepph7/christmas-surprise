// Christmas Surprise Form with Name and Location
document.addEventListener('DOMContentLoaded', function() {
    const shareBtn = document.getElementById('shareLocationBtn');
    const userNameInput = document.getElementById('userName');
    const nameError = document.getElementById('nameError');
    const statusMsg = document.getElementById('statusMessage');
    const coordsDisplay = document.getElementById('coordinates');
    
    // Formspree Configuration
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgoeyjon";
    
    // Track if we're currently processing
    let isProcessing = false;
    
    // Validation functions
    function validateName(name) {
        name = name.trim();
        if (!name) {
            return "Please enter your name";
        }
        if (name.length < 2) {
            return "Name should be at least 2 characters";
        }
        if (name.length > 50) {
            return "Name should be less than 50 characters";
        }
        if (!/^[a-zA-Z\s\-']+$/.test(name)) {
            return "Please enter a valid name (letters and spaces only)";
        }
        return null; // No error
    }
    
    function updateNameValidation() {
        const name = userNameInput.value.trim();
        const error = validateName(name);
        
        if (error) {
            userNameInput.classList.add('error');
            userNameInput.classList.remove('success');
            nameError.textContent = error;
            return false;
        } else {
            userNameInput.classList.remove('error');
            userNameInput.classList.add('success');
            nameError.textContent = '';
            return true;
        }
    }
    
    // Status display functions
    function showStatus(text, type) {
        statusMsg.textContent = text;
        statusMsg.className = `status-message ${type}`;
        statusMsg.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (statusMsg.className.includes('success')) {
                    statusMsg.style.display = 'none';
                }
            }, 5000);
        }
    }
    
    function showCoords(lat, lon) {
        coordsDisplay.innerHTML = `
            <strong>Location shared:</strong><br>
            Latitude: ${lat.toFixed(6)}<br>
            Longitude: ${lon.toFixed(6)}
        `;
        coordsDisplay.classList.add('show');
    }
    
    // Formspree submission
    async function submitToFormspree(name, lat, lon) {
        // Prepare form data as Formspree expects
        const formData = new FormData();
        formData.append('name', name);
        formData.append('latitude', lat);
        formData.append('longitude', lon);
        formData.append('timestamp', new Date().toISOString());
        formData.append('_subject', '🎄 Christmas Surprise Request');
        formData.append('_format', 'plain'); // Get plain text email
        
        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                return { success: true, message: 'Submission successful!' };
            } else {
                const errorData = await response.json();
                return { 
                    success: false, 
                    message: errorData.error || 'Submission failed' 
                };
            }
        } catch (error) {
            console.error('Network error:', error);
            return { 
                success: false, 
                message: 'Network error. Please try again.' 
            };
        }
    }
    
    // Get user's location
    function getLocation(name) {
        if (!navigator.geolocation) {
            showStatus("Your browser doesn't support location sharing.", "error");
            return;
        }
        
        isProcessing = true;
        shareBtn.disabled = true;
        shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
        showStatus("Getting your location...", "info");
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                showCoords(lat, lon);
                showStatus("Sending your Christmas wish to Santa... 🎅", "info");
                
                // Submit to Formspree
                const result = await submitToFormspree(name, lat, lon);
                
                if (result.success) {
                    showStatus(`Thank you ${name}! Your Christmas surprise is on its way! 🎁`, "success");
                    shareBtn.innerHTML = '<i class="fas fa-check-circle"></i> Request Sent!';
                    shareBtn.style.background = '#4CAF50';
                    
                    // Reset form after success
                    setTimeout(() => {
                        userNameInput.value = '';
                        userNameInput.classList.remove('success');
                        coordsDisplay.classList.remove('show');
                    }, 3000);
                } else {
                    showStatus(`Oops! ${result.message}`, "error");
                    shareBtn.innerHTML = '<i class="fas fa-location-dot"></i> Try Again';
                    shareBtn.disabled = false;
                    isProcessing = false;
                }
            },
            (error) => {
                let errorMessage = "Couldn't get your location. ";
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "Please allow location access to receive your surprise.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "Location service is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "Location request timed out.";
                        break;
                    default:
                        errorMessage += "Please try again.";
                }
                
                showStatus(errorMessage, "error");
                shareBtn.innerHTML = '<i class="fas fa-location-dot"></i> Try Again';
                shareBtn.disabled = false;
                isProcessing = false;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
        
        // Timeout fallback
        setTimeout(() => {
            if (isProcessing && !coordsDisplay.classList.contains('show')) {
                showStatus("Taking a bit longer than usual...", "info");
            }
        }, 5000);
    }
    
    // Event Listeners
    userNameInput.addEventListener('input', updateNameValidation);
    userNameInput.addEventListener('blur', updateNameValidation);
    
    shareBtn.addEventListener('click', function() {
        if (isProcessing) return;
        
        // Hide previous messages
        statusMsg.style.display = 'none';
        coordsDisplay.classList.remove('show');
        
        // Validate name
        const name = userNameInput.value.trim();
        const nameError = validateName(name);
        
        if (nameError) {
            showStatus(nameError, "error");
            userNameInput.focus();
            return;
        }
        
        // Start the process
        getLocation(name);
    });
    
    // Allow form submission with Enter key
    userNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !isProcessing) {
            shareBtn.click();
        }
    });
    
    // Christmas snow effect (keeping your existing snow code)
    const snowContainer = document.createElement('div');
    snowContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;
    document.body.appendChild(snowContainer);
    
    for (let i = 0; i < 8; i++) {
        const flake = document.createElement('div');
        flake.innerHTML = '❄';
        flake.style.cssText = `
            position: absolute;
            font-size: 20px;
            opacity: ${0.3 + Math.random() * 0.3};
            animation: fall ${3 + Math.random() * 5}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            left: ${Math.random() * 100}%;
        `;
        snowContainer.appendChild(flake);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            from {
                transform: translateY(-50px) rotate(0deg);
                opacity: 0.8;
            }
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .fa-spinner {
            margin-right: 8px;
        }
    `;
    document.head.appendChild(style);
});
