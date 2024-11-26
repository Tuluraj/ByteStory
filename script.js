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
      // Lazy loading for images
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

      // Observe all images with data-src
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

    // Debounced search input handler
    this.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            this.handleSearch(e.target.value.trim(), searchResults);
        }, this.searchConfig.debounceTime);
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-bar')) {
            searchResults.innerHTML = '';
        }
    });

    // Keyboard navigation for search results
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
      // Simulated search - replace with actual API call
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

//   async handleNewsletterSubmit(e) {
//       e.preventDefault();
//       const form = e.target;
//       const emailInput = form.querySelector('input[type="email"]');
//       const messageElement = document.getElementById('msg');

//       if (!emailInput || !messageElement) return;

//       const email = emailInput.value.trim();

//       try {
//           const response = await this.submitNewsletter(email);
//           this.showMessage(messageElement, response.success ? 'success' : 'error', response.message);
//           if (response.success) {
//               emailInput.value = '';
//           }
//       } catch (error) {
//           this.showMessage(messageElement, 'error', 'An error occurred. Please try again later.');
//       }
//   }

//   async submitNewsletter(email) {
//       // Replace with actual API call
//       return new Promise((resolve) => {
//           setTimeout(() => {
//               resolve({ 
//                   success: true, 
//                   message: 'Successfully subscribed to the ByteStory!' 
//               });
//           }, 1000);
//       });
//   }

  showMessage(element, type, message) {
      element.textContent = message;
      element.className = `message ${type}`;
      element.setAttribute('role', 'alert');
      
      setTimeout(() => {
          element.textContent = '';
          element.removeAttribute('role');
          element.className = 'message';
      }, 5000);
  }

  initializeArticles() {
      if (!this.featuredArticles) return;

      const articles = this.featuredArticles.querySelectorAll('article');
      articles.forEach((article, index) => {
          if (!article.classList.contains('article-card')) {
              article.classList.add('article-card');
          }
          article.style.animationDelay = `${index * 0.2}s`;
      });
  }

  setupScrollEffects() {
      let lastScroll = 0;

      window.addEventListener('scroll', () => {
          const currentScroll = window.pageYOffset;

          // Header show/hide on scroll
          if (currentScroll > lastScroll && currentScroll > 100) {
              this.header?.classList.add('header-hidden');
          } else {
              this.header?.classList.remove('header-hidden');
          }

          lastScroll = currentScroll;
      }, { passive: true });
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BlogApp();
});

// search Handle
class SearchHandler {
  constructor(config = {}) {
      this.searchInput = document.querySelector('#search-input');
      this.searchForm = document.querySelector('.search-bar');
      this.searchResults = document.createElement('div');
      this.searchResults.className = 'search-results';
      this.searchForm?.appendChild(this.searchResults);

      // Search content database
      this.contentDatabase = [
          { 
              title: 'Free GooglePlay Redeem Code',
              content: 'Discover effective and safe methods to earn free Google Play redeem codes.',
              url: '/HTML/google_play_code.html',
              keywords: ['google', 'play', 'redeem', 'code', 'free', 'earn']
          },
          {
              title: 'Earn Money Online',
              content: 'A complete guide to earning money online safely through proven methods and practical tips for success.',
              url: '/HTML/online_earning.html',
              keywords: ['earn', 'money', 'online', 'guide', 'tips']
          },
          {
              title: 'Top Refer-and-Earn Programs',
              content: 'Maximize Your Earnings with the Top Refer-and-Earn Programs in India',
              url: '/HTML/refer_and_earn',
              keywords: ['refer', 'earn', 'program', 'india', 'maximize']
          }
      ];

      this.currentSuggestion = '';
      this.suggestions = [];
      this.selectedIndex = -1;

      this.init();
  }

  init() {
      if (!this.searchInput || !this.searchForm) return;

      // Input event for real-time suggestions
      this.searchInput.addEventListener('input', (e) => {
          this.handleInput(e.target.value);
      });

      // Key events for navigation and completion
      this.searchInput.addEventListener('keydown', (e) => {
          this.handleKeyDown(e);
      });

      // Form submission
      this.searchForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleSubmit();
      });

      // Click outside to close
      document.addEventListener('click', (e) => {
          if (!this.searchForm.contains(e.target)) {
              this.clearSuggestions();
          }
      });

      // Style the suggestion placeholder
      this.setupSuggestionStyles();
  }

  setupSuggestionStyles() {
      // Create suggestion placeholder element
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
      
      if (!query) {
          this.clearSuggestions();
          return;
      }

      // Generate suggestions based on content and keywords
      this.suggestions = this.contentDatabase
          .filter(item => {
              const titleMatch = item.title.toLowerCase().includes(query);
              const contentMatch = item.content.toLowerCase().includes(query);
              const keywordMatch = item.keywords.some(keyword => 
                  keyword.toLowerCase().startsWith(query)
              );
              return titleMatch || contentMatch || keywordMatch;
          })
          .sort((a, b) => {
              // Prioritize title matches
              const aTitle = a.title.toLowerCase();
              const bTitle = b.title.toLowerCase();
              const aStartsWithQuery = aTitle.startsWith(query);
              const bStartsWithQuery = bTitle.startsWith(query);
              
              if (aStartsWithQuery && !bStartsWithQuery) return -1;
              if (!aStartsWithQuery && bStartsWithQuery) return 1;
              return 0;
          });

      // Show best matching suggestion in input
      // if (this.suggestions.length > 0) {
      //     const bestMatch = this.suggestions[0].title;
      //     if (bestMatch.toLowerCase().startsWith(query)) {
      //         this.currentSuggestion = bestMatch;
      //         this.suggestionPlaceholder.textContent = bestMatch;
      //     } else {
      //         this.currentSuggestion = '';
      //         this.suggestionPlaceholder.textContent = '';
      //     }
      // }

      this.displaySuggestions();
  }

  displaySuggestions() {
      if (!this.suggestions.length) {
          this.searchResults.innerHTML = `
              <div class="no-results">No matching content found</div>
          `;
          return;
      }

      const html = this.suggestions.map((item, index) => `
          <div class="search-suggestion ${index === this.selectedIndex ? 'selected' : ''}" 
               data-url="${item.url}">
              <div class="suggestion-title">${this.highlightMatch(item.title)}</div>
              <div class="suggestion-content">${this.highlightMatch(item.content)}</div>
          </div>
      `).join('');

      this.searchResults.innerHTML = html;

      // Add click handlers to suggestions
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

  handleKeyDown(e) {
      switch (e.key) {
          case 'Tab':
              if (this.currentSuggestion) {
                  e.preventDefault();
                  this.searchInput.value = this.currentSuggestion;
                  this.suggestionPlaceholder.textContent = '';
              }
              break;
          case 'ArrowDown':
              e.preventDefault();
              this.selectedIndex = Math.min(
                  this.selectedIndex + 1,
                  this.suggestions.length - 1
              );
              this.displaySuggestions();
              break;
          case 'ArrowUp':
              e.preventDefault();
              this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
              this.displaySuggestions();
              break;
              case 'Enter':
                e.preventDefault(); // Prevent default form submission
                if (this.selectedIndex >= 0 && this.suggestions[this.selectedIndex]) {
                    // If an item is selected, navigate to its URL
                    window.location.href = this.suggestions[this.selectedIndex].url;
                } else if (this.suggestions.length > 0) {
                    // If no item is selected but there are suggestions, navigate to the first one
                    window.location.href = this.suggestions[0].url;
                }
                break;
        }
    }

    handleSubmit() {
      // Prevent default form submission
      if (this.selectedIndex >= 0 && this.suggestions[this.selectedIndex]) {
          window.location.href = this.suggestions[this.selectedIndex].url;
      } else if (this.suggestions.length > 0) {
          window.location.href = this.suggestions[0].url;
      }
  }

  selectSuggestion(index) {
      const suggestion = this.suggestions[index];
      if (suggestion) {
          window.location.href = suggestion.url;
      }
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

// Initialize search handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SearchHandler();
});