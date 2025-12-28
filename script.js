// Simple Christmas Location Sharing
document.addEventListener('DOMContentLoaded', function() {
    const shareBtn = document.getElementById('shareLocationBtn');
    const statusMsg = document.getElementById('statusMessage');
    const coordsDisplay = document.getElementById('coordinates');
    
    // Your Formspree Form ID
    const FORMSPREE_ID = "mgoeyjon";
    
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
        if (!navigator.geolocation) {
            showStatus("Your browser doesn't support location sharing. Merry Christmas! 🎄", "error");
            return;
        }
        
        showStatus("Please allow location access...", "info");
        
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                
                showCoords(lat, lon);
                showStatus("Sending location...", "info");
                
                const sent = await sendToBackend(lat, lon);
                
                if (sent) {
                    showStatus("Thank you! Your surprise is on its way! 🎅", "success");
                    shareBtn.disabled = true;
                    shareBtn.innerHTML = '<i class="fas fa-check-circle"></i> Location Shared!';
                    shareBtn.style.background = '#4CAF50';
                } else {
                    showStatus("Location saved! 🎄", "success");
                    shareBtn.disabled = true;
                    shareBtn.innerHTML = '<i class="fas fa-check-circle"></i> Location Saved';
                }
            },
            (error) => {
                let msg = "Location not shared. Merry Christmas anyway! 🎄";
                
                if (error.code === error.PERMISSION_DENIED) {
                    msg = "No problem! Location not shared. Merry Christmas! 🎄";
                }
                
                showStatus(msg, "error");
                shareBtn.innerHTML = '<i class="fas fa-heart"></i> That\'s Okay - Merry Christmas!';
                shareBtn.style.background = '#666';
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }
    
    shareBtn.addEventListener('click', function() {
        statusMsg.style.display = 'none';
        coordsDisplay.classList.remove('show');
        getLocation();
    });
    
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
    `;
    document.head.appendChild(style);
});
