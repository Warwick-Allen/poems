/**
 * Lazy Loading for Iframes using Intersection Observer
 * Loads iframes only when they're about to enter the viewport
 * Improves page load performance by deferring iframe loading
 */

(function() {
  'use strict';

  /**
   * Initialize lazy loading for all iframes with the .lazy-iframe class
   */
  function initLazyIframes() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      console.warn('Intersection Observer not supported, loading all iframes immediately');
      loadAllIframes();
      return;
    }

    const lazyIframes = document.querySelectorAll('iframe.lazy-iframe');
    
    if (lazyIframes.length === 0) {
      return;
    }

    // Configuration for the Intersection Observer
    // rootMargin: '200px' means the iframe will start loading 200px before it enters the viewport
    // threshold: 0 means the callback will be triggered as soon as any part of the iframe is visible
    const observerOptions = {
      root: null, // viewport
      rootMargin: '200px',
      threshold: 0
    };

    // Callback function when iframe enters the viewport
    const observerCallback = function(entries, observer) {
      entries.forEach(function(entry) {
        // Check if the iframe is intersecting (visible or about to be visible)
        if (entry.isIntersecting) {
          const iframe = entry.target;
          loadIframe(iframe);
          // Stop observing this iframe since it's already loaded
          observer.unobserve(iframe);
        }
      });
    };

    // Create the Intersection Observer
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Start observing each lazy iframe
    lazyIframes.forEach(function(iframe) {
      observer.observe(iframe);
    });
  }

  /**
   * Load an individual iframe by copying data-src to src
   * @param {HTMLIFrameElement} iframe - The iframe element to load
   */
  function loadIframe(iframe) {
    const dataSrc = iframe.getAttribute('data-src');
    
    if (!dataSrc) {
      console.warn('Lazy iframe missing data-src attribute', iframe);
      return;
    }

    // Check if iframe is already loaded
    if (iframe.src && iframe.src !== '') {
      return;
    }

    // Set the src attribute to start loading the iframe
    iframe.src = dataSrc;

    // Remove the loading placeholder when iframe loads
    iframe.addEventListener('load', function() {
      removeLoadingIndicator(iframe);
      iframe.classList.add('loaded');
    });

    // Also remove loading indicator on error
    iframe.addEventListener('error', function() {
      removeLoadingIndicator(iframe);
      iframe.classList.add('error');
      console.error('Error loading iframe:', dataSrc);
    });
  }

  /**
   * Remove the loading indicator for an iframe
   * @param {HTMLIFrameElement} iframe - The iframe element
   */
  function removeLoadingIndicator(iframe) {
    // Find the parent wrapper
    const wrapper = iframe.closest('.iframe-wrapper');
    if (wrapper) {
      const loadingDiv = wrapper.querySelector('.iframe-loading[data-loading="true"]');
      if (loadingDiv) {
        loadingDiv.style.opacity = '0';
        setTimeout(function() {
          loadingDiv.style.display = 'none';
        }, 300);
      }
    }
  }

  /**
   * Fallback function to load all iframes immediately
   * Used when Intersection Observer is not supported
   */
  function loadAllIframes() {
    const lazyIframes = document.querySelectorAll('iframe.lazy-iframe');
    lazyIframes.forEach(function(iframe) {
      loadIframe(iframe);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyIframes);
  } else {
    // DOM is already ready, initialize immediately
    initLazyIframes();
  }
})();

