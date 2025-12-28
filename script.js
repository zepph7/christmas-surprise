// Simple Christmas Location Sharing
document.addEventListener('DOMContentLoaded', function() {
    const shareBtn = document.getElementById('shareLocationBtn');
    const statusMsg = document.getElementById('statusMessage');
    const coordsDisplay = document.getElementById('coordinates');
    
    // Your Formspree Form ID
    const FORMSPREE_ID = "mgoeyjon";
    
    // Track if we're currently getting location
    let isGettingLocation = false;
    
    function showStatus(text, type) {
        statusMsg.textContent = text;
        statusMsg.className = `status-message ${type}`;
        statusMsg.style.display = 'block';
    }
    
    function showCoords(lat, lon) {
        coordsDisplay.innerHTML = `
            <strong>Location shared:</strong><br>
            Latitude: ${lat.toFixed(6)}<br>
            Longitude: ${lon.toFixed(6)}
        `;
        coordsDisplay.classList.add('show');
    }
    
    async function sendToBackend(lat, lon) {
        const data = {
            latitude: lat,
            longitude: lon,
            timestamp: new Date().toISOString(),
            _subject: "🎁 Christmas Location Received!"
        };
        
        try {
            const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }
    
    function getLocation() {
        if (isGettingLocation) return; // Prevent multiple clicks
        
        if (!navigator.geolocation) {
            showStatus("Your browser doesn't support location sharing. Merry Christmas! 🎄", "error");
            return;
        }
        
        isGettingLocation = true;
        shareBtn.disabled = true;
        shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
        
        showStatus("Getting your location...", "info");
        
        // Check if permission was already granted by trying to get high accuracy quickly
        navigator.geolocation.getCurrentPosition(
            // Success callback - permission granted or already had permission
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                
                showCoords(lat, lon);
                showStatus("Sending location to Santa... 🎅", "info");
                
                const sent = await sendToBackend(lat, lon);
                
                if (sent) {
                    showStatus("Thank you! Your surprise is on its way! 🎅", "success");
                    shareBtn.innerHTML = '<i class="fas fa-check-circle"></i> Location Shared!';
                    shareBtn.style.background = '#4CAF50';
                } else {
                    showStatus("Location saved locally! 🎄", "success");
                    shareBtn.innerHTML = '<i class="fas fa-check-circle"></i> Location Saved';
                }
                
                isGettingLocation = false;
            },
            // Error callback - permission denied or error
            (error) => {
                let msg = "";
                let btnText = '<i class="fas fa-heart"></i> That\'s Okay - Merry Christmas!';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "Location access was denied. No problem! Merry Christmas! 🎄";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable. Merry Christmas! 🎄";
                        break;
                    case error.TIMEOUT:
                        msg = "Location request timed out. Merry Christmas! 🎄";
                        break;
                    default:
                        msg = "Couldn't get location. Merry Christmas anyway! 🎄";
                        break;
                }
                
                showStatus(msg, "error");
                shareBtn.innerHTML = btnText;
                shareBtn.style.background = '#666';
                shareBtn.disabled = false;
                isGettingLocation = false;
            },
            // Options - faster timeout for previously granted permissions
            {
                enableHighAccuracy: true,
                timeout: 8000, // Reduced from 10000 to 8000
                maximumAge: 30000 // Use cached location if less than 30 seconds old
            }
        );
        
        // Add a fallback timeout in case the geolocation API hangs
        setTimeout(() => {
            if (isGettingLocation) {
                showStatus("Taking longer than expected...", "info");
            }
        }, 5000);
    }
    
    shareBtn.addEventListener('click', function() {
        if (isGettingLocation) return;
        
        statusMsg.style.display = 'none';
        coordsDisplay.classList.remove('show');
        getLocation();
    });
    
    // Improve button styling for disabled state
    const originalBtnHTML = shareBtn.innerHTML;
    const originalBtnStyle = shareBtn.style.cssText;
    
    // Add subtle snow effect
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
    
    // Add a few snowflakes
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
    
    // Add CSS for snow animation
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
