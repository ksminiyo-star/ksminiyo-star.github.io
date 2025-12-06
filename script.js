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

// --- Microscope Background Animation ---
function initMicroscopeBg() {
    const canvas = document.createElement('canvas');
    canvas.id = 'microscope-canvas';
    const container = document.querySelector('.hero-bg');

    if (!container) return;

    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = container.offsetWidth;
        height = canvas.height = container.offsetHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.input();
        }

        input() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 20 + 5;
            this.color = `rgba(94, 139, 126, ${Math.random() * 0.2})`; // variable opacity
            this.hasNucleus = Math.random() > 0.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Wrap around screen
            if (this.x < -50) this.x = width + 50;
            if (this.x > width + 50) this.x = -50;
            if (this.y < -50) this.y = height + 50;
            if (this.y > height + 50) this.y = -50;
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            // Draw "nucleus" for some particles
            if (this.hasNucleus) {
                ctx.beginPath();
                ctx.arc(this.x + this.size * 0.2, this.y - this.size * 0.2, this.size * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(47, 93, 98, 0.1)';
                ctx.fill();
            }

            // Simple membrane effect (stroke)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    function initParticles() {
        particles = [];
        const particleCount = Math.floor(width * height / 15000); // Density based on area
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    initParticles();

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw(ctx);
        });
        requestAnimationFrame(animate);
    }

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
