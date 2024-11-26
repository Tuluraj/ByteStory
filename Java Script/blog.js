// blog.js
class BlogApp {
    constructor() {
        // DOM Elements
        this.header = document.querySelector('.header');
        this.menuToggle = document.querySelector('.menu-toggle');
        this.navLinks = document.getElementById('nav-links');
        this.searchForm = document.querySelector('.search-bar');
        this.searchInput = document.querySelector('#search-input');
        this.newsletterForm = document.querySelector('.newsletter-form');
        this.featuredArticles = document.querySelector('.articles-grid');
        
        // Search Configuration
        this.searchConfig = {
            debounceTime: 300,
            minChars: 3,
            maxResults: 5
        };
  
        this.init();
    }
  
    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupSearch();
        this.initializeArticles();
        this.setupScrollEffects();
  
        // Initialize SearchHandler with minChars from searchConfig
        new SearchHandler({
            minChars: this.searchConfig.minChars
        });
    }
  
    setupEventListeners() {
        // Mobile menu toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }
  
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.navLinks?.classList.contains('active') && 
                !e.target.closest('nav') && 
                !e.target.closest('.menu-toggle')) {
                this.toggleMobileMenu();
            }
        });
  
        // Newsletter form submission
        if (this.newsletterForm) {
            this.newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
        }
  
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navLinks?.classList.contains('active')) {
                this.toggleMobileMenu();
            }
        });
  
        // Search form submission
        if (this.searchForm) {
            this.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch(this.searchInput.value);
            });
        }
    }
  
    toggleMobileMenu() {
        if (!this.menuToggle || !this.navLinks) return;
  
        const isExpanded = this.menuToggle.getAttribute('aria-expanded') === 'true';
        this.menuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
        this.navLinks.classList.toggle('active');
        this.menuToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? '' : 'hidden';
  
        // Ensure proper ARIA states
        this.menuToggle.setAttribute('aria-label', 
            isExpanded ? 'Open navigation menu' : 'Close navigation menu'
        );
    }
  
    setupIntersectionObserver() {
        const imageObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            },
            { rootMargin: '50px' }
        );
  
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
  
    setupSearch() {
        if (!this.searchInput) return;
  
        let searchTimeout;
        const searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        this.searchForm.appendChild(searchResults);
  
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value, searchResults);
            }, this.searchConfig.debounceTime);
        });
  
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar')) {
                searchResults.innerHTML = '';
            }
        });
  
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' && searchResults.firstChild) {
                e.preventDefault();
                searchResults.firstChild.focus();
            }
        });
    }
  
    async handleSearch(query, resultsContainer) {
        if (!query || query.length < this.searchConfig.minChars) {
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
            }
            return;
        }
  
        try {
            const results = await this.searchContent(query);
            if (resultsContainer) {
                this.displaySearchResults(results, query, resultsContainer);
            }
        } catch (error) {
            console.error('Search error:', error);
            if (resultsContainer) {
                resultsContainer.innerHTML = '<p class="search-error">An error occurred while searching</p>';
            }
        }
    }
  
    async searchContent(query) {
        const searchableContent = [
            { title: 'Free GooglePlay Redeem Code', content: 'Discover effective and safe methods...', url: '/google-play-code' },
            { title: 'Earn Money Online', content: 'A complete guide to earning money online...', url: '/online-earning' },
            { title: 'Top Refer-and-Earn Programs', content: 'Maximize Your Earnings with...', url: '/refer-and-earn' }
        ];
  
        return searchableContent
            .filter(item => 
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.content.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, this.searchConfig.maxResults);
    }
  
    displaySearchResults(results, query, container) {
        if (!results.length) {
            container.innerHTML = `
                <p class="no-results" role="status">
                    No results found for "${this.escapeHtml(query)}"
                </p>`;
            return;
        }
  
        const resultsHtml = results.map(result => `
            <a href="${this.escapeHtml(result.url)}" class="search-result">
                <h3>${this.highlightText(this.escapeHtml(result.title), query)}</h3>
                <p>${this.highlightText(this.escapeHtml(result.content), query)}</p>
            </a>
        `).join('');
  
        container.innerHTML = resultsHtml;
    }
  
    highlightText(text, query) {
        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
  
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
  
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
  
  // Updated SearchHandler with minChars configuration
  class SearchHandler {
    constructor(config = {}) {
        this.minChars = config.minChars || 1; // Set minChars from config
        this.searchInput = document.querySelector('#search-input');
        this.searchForm = document.querySelector('.search-bar');
        this.searchResults = document.createElement('div');
        this.searchResults.className = 'search-results';
        this.searchForm?.appendChild(this.searchResults);
  
        this.contentDatabase = [
            { title: 'Free GooglePlay Redeem Code', content: 'Discover effective and safe methods...', url: '/HTML/google_play_code.html' },
            { title: 'Earn Money Online', content: 'A complete guide to earning money online...', url: '/HTML/online_earning.html' },
            { title: 'Top Refer-and-Earn Programs', content: 'Maximize Your Earnings...', url: '/HTML/refer_and_earn.html' }
        ];
  
        this.currentSuggestion = '';
        this.suggestions = [];
        this.selectedIndex = -1;
  
        this.init();
    }
  
    init() {
        if (!this.searchInput || !this.searchForm) return;
  
        this.searchInput.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });
  
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
  
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
  
        document.addEventListener('click', (e) => {
            if (!this.searchForm.contains(e.target)) {
                this.clearSuggestions();
            }
        });
  
        this.setupSuggestionStyles();
    }
  
    setupSuggestionStyles() {
        this.suggestionPlaceholder = document.createElement('div');
        this.suggestionPlaceholder.className = 'search-suggestion-placeholder';
        this.suggestionPlaceholder.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            color: rgba(255, 255, 255, 0.3);
            padding: 0.8rem 2.5rem 0.8rem 1rem;
            white-space: nowrap;
            overflow: hidden;
        `;
        this.searchInput.parentElement.style.position = 'relative';
        this.searchInput.parentElement.appendChild(this.suggestionPlaceholder);
    }
  
    handleInput(value) {
        const query = value.toLowerCase().trim();
        
        if (query.length < this.minChars) {
            this.clearSuggestions();
            return;
        }
  
        this.suggestions = this.contentDatabase
            .filter(item => item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query))
            .slice(0, 5);
  
        this.displaySuggestions();
    }
  
    displaySuggestions() {
        if (!this.suggestions.length) {
            this.searchResults.innerHTML = `<div class="no-results">No matching content found</div>`;
            return;
        }
  
        const html = this.suggestions.map((item, index) => `
            <div class="search-suggestion ${index === this.selectedIndex ? 'selected' : ''}" data-url="${item.url}">
                <div class="suggestion-title">${this.highlightMatch(item.title)}</div>
                <div class="suggestion-content">${this.highlightMatch(item.content)}</div>
            </div>
        `).join('');
  
        this.searchResults.innerHTML = html;
  
        this.searchResults.querySelectorAll('.search-suggestion').forEach((el, index) => {
            el.addEventListener('click', () => {
                this.selectSuggestion(index);
            });
        });
    }
  
    highlightMatch(text) {
        const query = this.searchInput.value.toLowerCase();
        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
  
    clearSuggestions() {
        this.searchResults.innerHTML = '';
        this.suggestionPlaceholder.textContent = '';
        this.suggestions = [];
        this.selectedIndex = -1;
    }
  
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
  
  // Initialize BlogApp when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new BlogApp();
  });
  