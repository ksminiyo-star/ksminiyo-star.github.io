document.addEventListener('DOMContentLoaded', () => {
    initMicroscopeBg();
    initScrollReveal();
    initSmoothScroll();
    initLanguageToggle();
});

// --- Language Toggle ---
function initLanguageToggle() {
    const toggleBtn = document.getElementById('lang-toggle');
    if (!toggleBtn) return;

    // Check localStorage or default to Korean
    const currentLang = localStorage.getItem('suminweb-lang') || 'ko';
    setLanguage(currentLang);

    toggleBtn.addEventListener('click', () => {
        const isKo = document.body.classList.contains('lang-ko');
        setLanguage(isKo ? 'en' : 'ko');
    });
}

function setLanguage(lang) {
    document.body.classList.remove('lang-ko', 'lang-en');
    document.body.classList.add(`lang-${lang}`);
    localStorage.setItem('suminweb-lang', lang);

    // Update button text
    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
        // If current is KO, button offers EN switch, and vice versa.
        // Or just show current mode. Let's show "KO / EN" style but maybe highlight active.
        // Simple text: "English" when in KR mode, "한글" when in EN mode?
        // Or just toggle text "EN" / "KR"
        toggleBtn.textContent = lang === 'ko' ? 'English' : '한글';
    }
}

// --- Microscope Background Animation (Microbial Dark Matter) ---
function initMicroscopeBg() {
    const canvas = document.createElement('canvas');
    canvas.id = 'microscope-canvas';
    const container = document.querySelector('.hero-bg');

    if (!container) return;

    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    // Mouse tracking
    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    // Clear mouse position when leaving to prevent stuck effect
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        width = canvas.width = container.offsetWidth;
        height = canvas.height = container.offsetHeight;
        initParticles();
    }

    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;

            // Random velocity
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;

            // Type: visible (standard) or hidden (uncultured)
            // 30% visible, 70% hidden to emphasize the "Dark Matter" concept
            this.isHidden = Math.random() > 0.3;

            this.size = Math.random() * 5 + 2;

            // Colors: Visible = Primary/Dark, Hidden = Accent/Light (glows when revealed)
            // Using RGB for easy alpha manipulation
            if (this.isHidden) {
                // Secondary color / reddish tint? Or just slightly different
                this.baseColor = '94, 139, 126'; // #5E8B7E
            } else {
                this.baseColor = '47, 93, 98'; // #2F5D62
            }
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges? Or wrap. Let's bounce for network stability
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            // Distinguish interaction based on mouse
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Interaction: Revealed if close to mouse
            // Alpha:
            // Visible particles: Always ~0.6
            // Hidden particles: 0.1 normally, up to 1.0 when close to mouse

            if (this.isHidden) {
                if (distance < mouse.radius && mouse.x !== null) {
                    this.alpha = 1 - (distance / mouse.radius);
                    if (this.alpha < 0.1) this.alpha = 0.1;
                } else {
                    this.alpha = 0.05; // Almost invisible
                }
            } else {
                this.alpha = 0.5;
            }
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.baseColor}, ${this.alpha})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const particleCount = (width * height) / 9000; // Increase density
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, width, height);

        // Update and Draw Particles
        particles.forEach(p => {
            p.update();
            p.draw(ctx);
        });

        // Draw Connecting Lines (Community)
        connectParticles();
    }

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = dx * dx + dy * dy;

                if (distance < (100 * 100)) { // connection threshold
                    // Line opacity is derived from the minimum visibility of the two particles
                    // If both are hidden and far from mouse, line is invisible.
                    // If one is revealed, line might show faintly?

                    let minAlpha = Math.min(particles[a].alpha, particles[b].alpha);

                    if (minAlpha > 0.1) {
                        ctx.strokeStyle = `rgba(47, 93, 98, ${minAlpha * 0.5})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    resize();
    animate();
}

// --- Scroll Reveal Animation ---
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.card, .project-item, h2');
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Add global CSS class for visible state
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// --- Smooth Scrolling ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}
