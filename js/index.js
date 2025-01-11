// DOM Elements and Constants
const elements = {
    navbar: document.querySelector('.navbar'),
    menuToggle: document.querySelector('.menu-toggle'),
    navLinks: document.querySelector('.navbar-links'),
    themeToggle: document.querySelector('#theme-toggle'),
    sections: document.querySelectorAll('.section'),
    skillBars: document.querySelectorAll('.skill-bar .progress'),
    scrollIndicator: document.querySelector('.scroll-indicator'),
    contactForm: document.querySelector('#contactForm')
};

const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// Theme Manager
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || THEMES.DARK;
        this.init();
    }

    init() {
        document.body.classList.add(`${this.currentTheme}-mode`);
        this.updateThemeIcon();
        elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const newTheme = this.currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
        document.body.classList.replace(
            `${this.currentTheme}-mode`,
            `${newTheme}-mode`
        );
        this.currentTheme = newTheme;
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const icon = elements.themeToggle.querySelector('i');
        icon.className = this.currentTheme === THEMES.LIGHT 
            ? 'fas fa-moon nav-icon'
            : 'fas fa-sun nav-icon';
    }
}

// Navigation Manager
class NavigationManager {
    constructor() {
        this.isMenuOpen = false;
        this.lastScrollTop = 0;
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupScrollEvents();
        this.setupIntersectionObserver();
    }

    setupMobileMenu() {
        elements.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !elements.navLinks.contains(e.target) && 
                !elements.menuToggle.contains(e.target)) {
                this.toggleMenu();
            }
        });

        // Close menu on link click
        elements.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMenuOpen) {
                    this.toggleMenu();
                }
            });
        });
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        elements.navLinks.classList.toggle('active');
        elements.menuToggle.classList.toggle('active');
        
        const icon = elements.menuToggle.querySelector('i');
        icon.className = this.isMenuOpen ? 'fas fa-times nav-icon' : 'fas fa-bars nav-icon';
        
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupScrollEvents() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }

            scrollTimeout = window.requestAnimationFrame(() => {
                this.handleScroll();
                this.updateScrollIndicator();
            });
        });
    }

    handleScroll() {
        const scrollTop = window.pageYOffset;
        
        // Navbar visibility
        if (scrollTop > this.lastScrollTop && scrollTop > 100) {
            elements.navbar.style.transform = 'translateY(-100%)';
        } else {
            elements.navbar.style.transform = 'translateY(0)';
        }
        
        this.lastScrollTop = scrollTop;
    }

    updateScrollIndicator() {
        if (!elements.scrollIndicator) return;
        
        const currentSection = this.getCurrentSection();
        const isLastSection = currentSection === elements.sections[elements.sections.length - 1];
        
        elements.scrollIndicator.style.display = isLastSection ? 'none' : 'block';
    }

    getCurrentSection() {
        let current = null;
        elements.sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                current = section;
            }
        });
        return current;
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    if (entry.target.classList.contains('skill-bar')) {
                        this.animateSkillBar(entry.target);
                    }
                }
            });
        }, { threshold: 0.2 });

        elements.sections.forEach(section => observer.observe(section));
        elements.skillBars.forEach(bar => observer.observe(bar.parentElement));
    }

    animateSkillBar(skillBar) {
        const progress = skillBar.querySelector('.progress');
        const targetWidth = progress.parentElement.previousElementSibling.dataset.value;
        progress.style.width = targetWidth;
    }
}

// Contact Form Manager
class ContactFormManager {
    constructor() {
        if (elements.contactForm) {
            this.init();
        }
    }

    init() {
        elements.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Simulate form submission (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show success message
            this.showMessage('Message sent successfully!', 'success');
            form.reset();

        } catch (error) {
            this.showMessage('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;

        elements.contactForm.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Scroll Animation Manager
class ScrollAnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollSnapping();
        this.setupScrollIndicator();
    }

    setupScrollSnapping() {
        let isScrolling = false;
        let scrollTimeout;

        window.addEventListener('wheel', (e) => {
            if (isScrolling) return;
            
            clearTimeout(scrollTimeout);
            isScrolling = true;

            const direction = e.deltaY > 0 ? 1 : -1;
            const currentSection = this.getCurrentSection();
            
            if (currentSection) {
                const sections = Array.from(elements.sections);
                const currentIndex = sections.indexOf(currentSection);
                const nextIndex = currentIndex + direction;

                if (nextIndex >= 0 && nextIndex < sections.length) {
                    sections[nextIndex].scrollIntoView({ behavior: 'smooth' });
                }
            }

            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }, { passive: true });
    }

    setupScrollIndicator() {
        if (elements.scrollIndicator) {
            elements.scrollIndicator.addEventListener('click', () => {
                const currentSection = this.getCurrentSection();
                const nextSection = currentSection.nextElementSibling;
                
                if (nextSection) {
                    nextSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    getCurrentSection() {
        return Array.from(elements.sections).find(section => {
            const rect = section.getBoundingClientRect();
            return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new NavigationManager();
    new ContactFormManager();
    new ScrollAnimationManager();

    // Update last modified date
    const lastUpdated = document.querySelector('.last-updated');
    if (lastUpdated) {
        lastUpdated.textContent = `Last Updated: January 10, 2025`;
    }
});