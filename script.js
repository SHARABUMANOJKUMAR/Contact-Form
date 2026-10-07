document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const cardWrapper = document.getElementById('card-wrapper');
    const contactCard = document.getElementById('contact-card');
    const successMessage = document.getElementById('success-message');
    const resetBtn = document.getElementById('reset-btn');
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. 3D Mouse Interaction
    if (!prefersReducedMotion && window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            
            cardWrapper.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        // Reset transform on mouse leave to prevent getting stuck
        document.addEventListener('mouseleave', () => {
            cardWrapper.style.transform = `rotateY(0deg) rotateX(0deg)`;
            cardWrapper.style.transition = `transform 0.5s ease`;
        });
        
        document.addEventListener('mouseenter', () => {
            cardWrapper.style.transition = `none`;
        });
    }

    // 2. Form Validation
    const validators = {
        fullName: (value) => {
            if (!value.trim()) return 'Please enter your full name';
            if (value.trim().length < 2) return 'Name must be at least 2 characters';
            return '';
        },
        phone: (value) => {
            if (!value.trim()) return 'Please enter your phone number';
            // Basic phone validation: allows +, numbers, spaces, dashes, parentheses. Length 7-15.
            const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
            if (!phoneRegex.test(value.trim()) && value.trim().length < 7) return 'Please enter a valid phone number';
            return '';
        },
        email: (value) => {
            if (!value.trim()) return 'Please enter your email address';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
            return '';
        },
        place: (value) => {
            if (!value.trim()) return 'Please enter your city / location';
            return '';
        },
        message: (value) => {
            if (!value.trim()) return 'Please enter your message';
            if (value.trim().length < 10) return 'Message must be at least 10 characters';
            return '';
        }
    };

    const validateField = (inputElement) => {
        const fieldName = inputElement.name;
        const value = inputElement.value;
        const errorMessage = validators[fieldName](value);
        
        const formGroup = inputElement.closest('.form-group') || inputElement.closest('.col');
        const errorDiv = document.getElementById(`${fieldName}-error`);
        
        if (errorMessage) {
            formGroup.classList.add('error');
            errorDiv.textContent = errorMessage;
            return false;
        } else {
            formGroup.classList.remove('error');
            return true;
        }
    };

    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            const parent = input.closest('.form-group') || input.closest('.col');
            if (parent.classList.contains('error')) {
                validateField(input);
            }
        });
    });

    // Google Apps Script Web App URL
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxz4tCReRQbUfdbWfrnXskiq6xZXoT8AInw_by6SRuYhxsm9WASgXMdP4cTVgaFfDn_2A/exec';

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let isValid = true;
        let firstInvalidField = null;

        inputs.forEach(input => {
            const isFieldValid = validateField(input);
            if (!isFieldValid) {
                isValid = false;
                if (!firstInvalidField) firstInvalidField = input;
            }
        });

        if (isValid) {
            const submitBtn = document.getElementById('submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            
            submitBtn.style.pointerEvents = 'none';
            btnText.textContent = 'Sending...';

            const formData = {
                fullName: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                place: document.getElementById('place').value,
                message: document.getElementById('message').value,
            };
            
            try {
                // Send data to Google Apps Script
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // IMPORTANT: This prevents CORS blocking by the browser
                    body: JSON.stringify(formData),
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    }
                });
                
                form.style.display = 'none';
                successMessage.style.display = 'flex';
                
                // Reset button for future
                submitBtn.style.pointerEvents = 'auto';
                btnText.textContent = originalText;
                form.reset();
            } catch (error) {
                console.error('Error:', error);
                alert('Something went wrong while sending your message. Please try again.');
                submitBtn.style.pointerEvents = 'auto';
                btnText.textContent = originalText;
            }
        } else {
            // Shake effect on error
            contactCard.classList.add('shake');
            setTimeout(() => {
                contactCard.classList.remove('shake');
            }, 400);
            
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }
    });

    // Reset Form
    resetBtn.addEventListener('click', () => {
        successMessage.style.display = 'none';
        form.style.display = 'flex';
        // Re-trigger animation
        form.style.animation = 'none';
        form.offsetHeight; /* trigger reflow */
        form.style.animation = 'fadeIn 0.5s ease forwards';
    });

    // 3. Background Particles
    const initParticles = () => {
        if (prefersReducedMotion) return;
        
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        window.addEventListener('resize', resize);
        resize();
        
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                // Random color between cyan, purple, and white
                const colors = ['rgba(0, 240, 255, 0.5)', 'rgba(191, 0, 255, 0.5)', 'rgba(255, 255, 255, 0.3)'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }
            
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        const init = () => {
            particles = [];
            const particleCount = Math.min(window.innerWidth / 15, 100); // Responsive particle count
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            requestAnimationFrame(animate);
        }
        
        init();
        animate();
    };

    initParticles();
});
