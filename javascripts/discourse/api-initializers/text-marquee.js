import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "text-marquee",
  
  initialize() {
    withPluginApi("0.8.31", (api) => {
      const settings = api.container.lookup("service:site-settings");
      
      if (!settings.text_marquee_enabled) {
        return;
      }
      
      function createMarqueeComponent() {
        const container = document.createElement('div');
        container.className = 'text-marquee-container';
        container.setAttribute('role', 'button');
        container.setAttribute('tabindex', '0');
        container.setAttribute('aria-label', `点击跳转: ${settings.marquee_text || '最新推薦'}`);
        
        const duration = settings.marquee_animation_duration || 8;
        container.style.setProperty('--marquee-duration', `${duration}s`);
        
        const content = document.createElement('div');
        content.className = 'text-marquee-content';
        
        const text = document.createElement('span');
        text.className = 'marquee-text';
        text.textContent = settings.marquee_text || '最新推薦';
        
        content.appendChild(text);
        container.appendChild(content);
        
        function handleClick(event) {
          event.preventDefault();
          const url = settings.marquee_url || 'https://fungps01.com/lists/recommendation';
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        
        function handleKeyPress(event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick(event);
          }
        }
        
        container.addEventListener('click', handleClick);
        container.addEventListener('keypress', handleKeyPress);
        
        return container;
      }
      
      function insertMarquee() {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', insertMarquee);
          return;
        }

        const targetElement = document.querySelector('#main-outlet');
        
        if (targetElement && !document.querySelector('.text-marquee-container')) {
          const marqueeComponent = createMarqueeComponent();
          
          targetElement.insertBefore(marqueeComponent, targetElement.firstChild);
        }
      }
      
      api.onPageChange(() => {
        const existingMarquee = document.querySelector('.text-marquee-container');
        if (existingMarquee) {
          existingMarquee.remove();
        }
        
        setTimeout(insertMarquee, 100);
      });
      
      insertMarquee();
      
      if (api.onSettingsChange) {
        api.onSettingsChange(() => {
          const existingMarquee = document.querySelector('.text-marquee-container');
          if (existingMarquee) {
            existingMarquee.remove();
          }
          setTimeout(insertMarquee, 100);
        });
      }
    });
  }
}; 