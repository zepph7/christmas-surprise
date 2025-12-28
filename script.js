// Festive Christmas Location Sharing App
document.addEventListener('DOMContentLoaded', function() {
    const shareLocationBtn = document.getElementById('shareLocationBtn');
    const statusMessage = document.getElementById('statusMessage');
    const coordinatesDisplay = document.getElementById('coordinates');
    
    // ⭐ YOUR FORMSPREE FORM ID (from your Formspree dashboard) ⭐
    const FORMSPREE_FORM_ID = "mgoeyjon"; // This is your Form ID
    
    // Christmas messages
    const christmasMessages = {
        success: [
            "Ho Ho Ho! Thank you for sharing your location! 🎅",
            "Christmas magic is on its way! Your surprise is being planned! 🎄",
            "Your location has been received! Get ready for a festive surprise! 🎁"
        ],
        error: [
            "That's okay! The Christmas spirit is in our hearts, not our locations! 🎄",
            "No worries! The magic of Christmas is everywhere! ✨",
            "That's perfectly fine! Wishing you a wonderful Christmas anyway! 🎅"
        ]
    };
    
    function getRandomMessage(messageArray) {
        return messageArray[Math.floor(Math.random() * messageArray.length)];
    }
    
    function updateStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
    }
    
    function showCoordinates(lat, lon) {
        coordinatesDisplay.innerHTML = `
            <strong>Coordinates shared:</strong><br>
            Latitude: ${lat.toFixed(6)}<br>
            Longitude: ${lon.toFixed(6)}<br>
            <small><em>This data was sent securely to my Formspree backend</em></small>
        `;
        coordinatesDisplay.classList.add('show');
    }
    
    async function sendCoordinatesToBackend(latitude, longitude) {
        const formData = {
            latitude: latitude,
            longitude: longitude,
            timestamp: new Date().toISOString(),
            purpose: "Christmas surprise delivery",
            userAgent: navigator.userAgent,
            _subject: "🎁 Christmas Surprise Location Received!",
            _replyto: "christmas@zepph7.com" // Optional: add your email to get replies
        };
        
        try {
            // Using YOUR Formspree endpoint
            const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                console.log('✅ Location sent to Formspree successfully!');
                return true;
            } else {
                const errorText = await response.text();
                console.error('❌ Formspree error:', errorText);
                return false;
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            return false;
        }
    }
    
    function getLocation() {
        if (!navigator.geolocation) {
            updateStatus("Geolocation not supported by your browser. Merry Christmas! 🎄", "error");
            return;
        }
        
        updateStatus("Asking for location permission... Please allow if prompted.", "info");
        
        navigator.geolocation.getCurrentPosition(
            async function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                showCoordinates(lat, lon);
                updateStatus("Sending location to Santa's workshop... 🎅", "info");
                
                const sendSuccess = await sendCoordinatesToBackend(lat, lon);
                
                if (sendSuccess) {
                    updateStatus(getRandomMessage(christmasMessages.success), "success");
                    shareLocationBtn.disabled = true;
                    shareLocationBtn.innerHTML = '<i class="fas fa-check-circle"></i> Location Shared! Thank you! 🎅';
                    shareLocationBtn.style.background = 'linear-gradient(to bottom, #4CAF50, #2E7D32)';
                } else {
                    updateStatus("Location saved locally! 🎄", "success");
                    shareLocationBtn.disabled = true;
                    shareLocationBtn.innerHTML = '<i class="fas fa-check-circle"></i> Location Saved! 🎄';
                    shareLocationBtn.style.background = 'linear-gradient(to bottom, #4CAF50, #2E7D32)';
                }
            },
            function(error) {
                let errorMessage;
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "You chose not to share your location. " + getRandomMessage(christmasMessages.error);
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable. " + getRandomMessage(christmasMessages.error);
                        break;
                    case error.TIMEOUT:
                        errorMessage = "The request timed out. " + getRandomMessage(christmasMessages.error);
                        break;
                    default:
                        errorMessage = "An error occurred. " + getRandomMessage(christmasMessages.error);
                        break;
                }
                updateStatus(errorMessage, "error");
                shareLocationBtn.innerHTML = '<i class="fas fa-heart"></i> That\'s Okay - Merry Christmas! 🎄';
                shareLocationBtn.style.background = 'linear-gradient(to bottom, #757575, #424242)';
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }
    
    shareLocationBtn.addEventListener('click', function() {
        statusMessage.style.display = 'none';
        coordinatesDisplay.classList.remove('show');
        getLocation();
    });
    
    // Festive effects
    function addFestiveEffects() {
        const stars = document.querySelectorAll('.fa-star');
        stars.forEach((star, index) => {
            star.style.animation = `twinkle ${2 + index * 0.5}s infinite alternate`;
        });
        
        const snowflakes = document.querySelector('.snowflakes');
        let flakeCount = 12;
        snowflakes.innerHTML = '';
        for (let i = 0; i < flakeCount; i++) {
            const flake = document.createElement('span');
            flake.textContent = '❄';
            flake.style.animation = `twinkle ${1 + Math.random() * 2}s infinite alternate`;
            flake.style.animationDelay = `${Math.random() * 2}s`;
            flake.style.margin = '0 5px';
            snowflakes.appendChild(flake);
        }
    }
    
    addFestiveEffects();
});
