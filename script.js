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
    let geolocationTimeout;
    
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
        if (!/^[a-zA-Z\s\-'.]+$/.test(name)) {
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
    async function submitToFormspree(name, lat = null, lon = null) {
        // Prepare form data as Formspree expects
        const formData = new FormData();
        formData.append('name', name);
        
        if (lat && lon) {
            formData.append('latitude', lat);
            formData.append('longitude', lon);
            formData.append('has_location', 'true');
        } else {
            formData.append('has_location', 'false');
            formData.append('latitude', 'Not provided');
            formData.append('longitude', 'Not provided');
        }
        
        formData.append('timestamp', new Date().toISOString());
        formData.append('_subject', '🎄 Christmas Surprise Request');
        formData.append('_format', 'plain');
        formData.append('_replyto', 'noreply@christmassurprise.com');
        
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
    
    // Reset button state
    function resetButton() {
        isProcessing = false;
        shareBtn.disabled = false;
        shareBtn.innerHTML = '<i class="fas fa-location-dot"></i> Share My Location for a Surprise';
        shareBtn.style.background = '';
        
        if (geolocationTimeout) {
            clearTimeout(geolocationTimeout);
            geolocationTimeout = null;
        }
    }
    
    // Get user's location with better timeout handling
    function getLocation(name) {
        if (!navigator.geolocation) {
            showStatus("Your browser doesn't support location sharing.", "error");
            return;
        }
        
        isProcessing = true;
        shareBtn.disabled = true;
        shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
        showStatus("Getting your location... This might take a moment.", "info");
        
        // Clear any existing timeout
        if (geolocationTimeout) {
            clearTimeout(geolocationTimeout);
        }
        
        // Set a timeout for the entire geolocation process
        geolocationTimeout = setTimeout(() => {
            if (isProcessing) {
                handleLocationError({
                    code: 3,
                    message: 'Location request is taking longer than expected'
                }, name);
            }
        }, 15000); // 15 second total timeout
        
        // Try to get location with different strategies
        const geolocationOptions = {
            enableHighAccuracy: true,  // Try for best accuracy first
            timeout: 10000,           // 10 seconds for high accuracy attempt
            maximumAge: 300000        // Accept cached location up to 5 minutes old
        };
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                // Clear the timeout since we got a response
                if (geolocationTimeout) {
                    clearTimeout(geolocationTimeout);
                    geolocationTimeout = null;
                }
                
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                showCoords(lat, lon);
                showStatus(`Found you! Accuracy: ${Math.round(accuracy)} meters. Sending to Santa... 🎅`, "info");
                
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
                        resetButton();
                    }, 3000);
                } else {
                    showStatus(`Form submitted but: ${result.message}`, "info");
                    shareBtn.innerHTML = '<i class="fas fa-check-circle"></i> Name Submitted';
                    shareBtn.style.background = '#4CAF50';
                    setTimeout(resetButton, 3000);
                }
            },
            (error) => {
                // Clear the timeout since we got an error
                if (geolocationTimeout) {
                    clearTimeout(geolocationTimeout);
                    geolocationTimeout = null;
                }
                
                handleLocationError(error, name);
            },
            geolocationOptions
        );
    }
    
    // Handle location errors gracefully
    async function handleLocationError(error, name) {
        let errorMessage = "";
        let showRetryOption = true;
        
        switch(error.code) {
            case 1: // PERMISSION_DENIED
                errorMessage = "📍 Location access was denied. We'll still send your name to Santa!";
                showRetryOption = false;
                break;
            case 2: // POSITION_UNAVAILABLE
                errorMessage = "📍 Location service is unavailable. We'll still send your name to Santa!";
                break;
            case 3: // TIMEOUT
                errorMessage = "📍 Location request timed out. We'll still send your name to Santa!";
                break;
            default:
                errorMessage = "📍 Couldn't get location. We'll still send your name to Santa!";
                break;
        }
        
        showStatus(errorMessage, "warning");
        
        // Even without location, submit the name
        const result = await submitToFormspree(name, null, null);
        
        if (result.success) {
            showStatus(`Thank you ${name}! Santa has your name! 🎅`, "success");
            shareBtn.innerHTML = '<i class="fas fa-check-circle"></i> Name Submitted!';
            shareBtn.style.background = '#4CAF50';
            
            setTimeout(() => {
                userNameInput.value = '';
                userNameInput.classList.remove('success');
                resetButton();
            }, 3000);
        } else {
            showStatus("Couldn't submit. Please try again.", "error");
            resetButton();
        }
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
    
    // Add location troubleshooting tips
    const troubleshootingTips = document.createElement('div');
    troubleshootingTips.className = 'troubleshooting';
    troubleshootingTips.innerHTML = `
        <details style="margin-top: 20px; background: #f0f8ff; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
            <summary style="font-weight: bold; cursor: pointer; color: var(--christmas-green);">
                <i class="fas fa-question-circle"></i> Location not working?
            </summary>
            <div style="margin-top: 10px; font-size: 0.9rem;">
                <p><strong>Try these tips:</strong></p>
                <ol style="margin-left: 20px;">
                    <li>Make sure location/GPS is enabled on your device</li>
                    <li>Check browser permissions (allow location access)</li>
                    <li>Try refreshing the page</li>
                    <li>Use a device with GPS (phones work best)</li>
                    <li>Connect to WiFi for better accuracy</li>
                </ol>
                <p><em>Don't worry - we'll still send your name to Santa even without location! 🎅</em></p>
            </div>
        </details>
    `;
    
    // Insert troubleshooting after the action div
    document.querySelector('.action').appendChild(troubleshootingTips);
    
    // Christmas snow effect
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
        
        .status-message.warning {
            display: block;
            background-color: #fff3cd;
            color: #856404;
            border: 2px solid #ffeaa7;
        }
        
        .troubleshooting summary {
            list-style: none;
        }
        
        .troubleshooting summary::-webkit-details-marker {
            display: none;
        }
        
        .troubleshooting summary:after {
            content: '▼';
            float: right;
            transition: transform 0.3s;
        }
        
        .troubleshooting[open] summary:after {
            transform: rotate(180deg);
        }
    `;
    document.head.appendChild(style);
});
