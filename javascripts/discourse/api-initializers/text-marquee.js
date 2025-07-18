import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "text-marquee",
  
  initialize() {
    withPluginApi("0.8.31", (api) => {
      const themeSettings = api.container.lookup("service:theme-settings");
      
      if (themeSettings?.text_marquee_enabled === false) {
        return;
      }
      
      let cachedTargetElement = null;
      let lastRoute = null;
      let lastRouteCheck = 0;
      let routeCheckCache = null;
      const ROUTE_CACHE_DURATION = 100;
      
      function getExistingMarquee() {
        return document.querySelector('.text-marquee-container');
      }
      
      function removeExistingMarquee() {
        const existingMarquee = getExistingMarquee();
        if (existingMarquee) {
          existingMarquee.remove();
          return true;
        }
        return false;
      }
      
      function isHomePage() {
        const now = Date.now();
        
        if (now - lastRouteCheck < ROUTE_CACHE_DURATION && routeCheckCache !== null) {
          return routeCheckCache;
        }
        
        try {
          const router = api.container.lookup('router:main');
          if (router && router.currentRouteName) {
            const currentRoute = router.currentRouteName;
            
            const homeRoutes = [
              'discovery.latest',
              'discovery.categories', 
              'discovery.top',
              'discovery.new',
              'discovery.unread'
            ];
            
            const isHomeRoute = homeRoutes.includes(currentRoute);
            lastRouteCheck = now;
            routeCheckCache = isHomeRoute;
            lastRoute = currentRoute;
            return isHomeRoute;
          }
          
          const pathname = window.location.pathname;
          const homeUrlPatterns = [
            '/',
            '/latest',
            '/categories',
            '/top',
            '/new',
            '/unread'
          ];
          
          const isHomePath = homeUrlPatterns.some(pattern => {
            if (pattern === '/') {
              return pathname === '/' || pathname === '';
            }
            return pathname === pattern || pathname.startsWith(pattern + '?');
          });
          
          lastRouteCheck = now;
          routeCheckCache = isHomePath;
          return isHomePath;
          
        } catch (error) {
          const pathname = window.location.pathname;
          const result = pathname === '/' || pathname === '' || pathname === '/latest' || pathname === '/categories';
          lastRouteCheck = now;
          routeCheckCache = result;
          return result;
        }
      }
      
      function findOptimalTargetElement() {
        try {
          if (cachedTargetElement && document.contains && document.contains(cachedTargetElement)) {
            return cachedTargetElement;
          }
        } catch (e) {
          cachedTargetElement = null;
        }
        
        const targetSelectors = [
          '.welcome-message',
          '.topic-list-header',
          '.ember-view .container',
          '#main-outlet',
          '.container.posts',
          '#main',
          '.wrap',
          'body'
        ];
        
        for (const selector of targetSelectors) {
          try {
            const element = document.querySelector(selector);
            if (element && element.parentNode) {
              cachedTargetElement = element;
              return element;
            }
          } catch (e) {
            continue;
          }
        }
        
        cachedTargetElement = null;
        return null;
      }
      
      function createMarqueeComponent() {
        try {
          const container = document.createElement('div');
          container.className = 'text-marquee-container';
          
          const marqueeText = themeSettings?.marquee_text || '最新推薦';
          const marqueeUrl = themeSettings?.marquee_url || 'https://fungps01.com/lists/recommendation';
          const duration = themeSettings?.marquee_animation_duration || 8;
          
          if (typeof marqueeText !== 'string' || marqueeText.length === 0) {
            return null;
          }
          
          container.setAttribute('aria-label', `点击跳转: ${marqueeText}`);
          container.style.setProperty('--marquee-duration', `${duration}s`);
          
          const content = document.createElement('div');
          content.className = 'text-marquee-content';
          
          const text = document.createElement('span');
          text.className = 'marquee-text';
          text.textContent = marqueeText;
          
          content.appendChild(text);
          container.appendChild(content);
          
          function handleClick(event) {
            try {
              event.preventDefault();
              if (marqueeUrl && typeof marqueeUrl === 'string') {
                window.location.href = marqueeUrl;
              }
            } catch (e) {
              // Silently fail if navigation fails
            }
          }
          
          function handleKeyPress(event) {
            try {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleClick(event);
              }
            } catch (e) {
            }
          }
          
          try {
            container.addEventListener('click', handleClick);
            container.addEventListener('keypress', handleKeyPress);
          } catch (e) {
          }
          
          return container;
          
        } catch (error) {
          return null;
        }
      }
      
      function insertMarquee() {
        try {
          if (!isHomePage()) {
            removeExistingMarquee();
            cachedTargetElement = null;
            return;
          }
          
          if (document.readyState === 'loading') {
            try {
              document.addEventListener('DOMContentLoaded', insertMarquee);
            } catch (e) {
              setTimeout(insertMarquee, 500);
            }
            return;
          }

          if (getExistingMarquee()) {
            return;
          }

          const targetElement = findOptimalTargetElement();
          
          if (!targetElement) {
            return;
          }

          const marqueeComponent = createMarqueeComponent();
          
          if (!marqueeComponent) {
            return;
          }
          
          try {
            const welcomeText = document.querySelector('p');
            if (welcomeText && welcomeText.textContent && welcomeText.textContent.includes('很高兴在这里见到您') && welcomeText.parentNode) {
              welcomeText.parentNode.insertBefore(marqueeComponent, welcomeText.nextSibling);
            } else {
              if (targetElement.firstChild) {
                targetElement.insertBefore(marqueeComponent, targetElement.firstChild);
              } else {
                targetElement.appendChild(marqueeComponent);
              }
            }
          } catch (insertError) {
            try {
              if (targetElement && targetElement.appendChild) {
                targetElement.appendChild(marqueeComponent);
              }
            } catch (fallbackError) {
              // Final fallback: append to body if possible
              try {
                document.body.appendChild(marqueeComponent);
              } catch (bodyError) {
                // If all insertion methods fail, give up silently
              }
            }
          }
          
        } catch (error) {
          clearCache();
        }
      }
      
      function clearCache() {
        cachedTargetElement = null;
        lastRoute = null;
        lastRouteCheck = 0;
        routeCheckCache = null;
      }
      
      function handlePageTransition() {
        try {
          removeExistingMarquee();
          clearCache();
          
          if (isHomePage()) {
            setTimeout(() => {
              try {
                insertMarquee();
              } catch (e) {
              }
            }, 100);
          }
        } catch (error) {
          try {
            clearCache();
          } catch (e) {
          }
        }
      }
      
      try {
        api.onPageChange(handlePageTransition);
      } catch (error) {
      }
      
      try {
        insertMarquee();
      } catch (error) {
      }
      
      if (api.onThemeSettingsChange) {
        try {
          api.onThemeSettingsChange(handlePageTransition);
        } catch (error) {
        }
      }
    });
  }
}; 