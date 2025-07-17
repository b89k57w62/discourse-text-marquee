import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "text-marquee",
  
  initialize() {
    withPluginApi("0.8.31", (api) => {
      const themeSettings = api.container.lookup("service:theme-settings");
      
      console.log("Text Marquee: Initializing...");
      console.log("Text Marquee: Settings enabled:", themeSettings?.text_marquee_enabled);
      
      if (themeSettings?.text_marquee_enabled === false) {
        console.log("Text Marquee: Component disabled in settings");
        return;
      }
      
      function createMarqueeComponent() {
        const container = document.createElement('div');
        container.className = 'text-marquee-container';
        
        const marqueeText = themeSettings?.marquee_text || '最新推薦';
        const marqueeUrl = themeSettings?.marquee_url || 'https://fungps01.com/lists/recommendation';
        const duration = themeSettings?.marquee_animation_duration || 8;
        
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
          event.preventDefault();
          console.log("Text Marquee: Clicked, redirecting to:", marqueeUrl);
          window.location.href = marqueeUrl;
        }
        
        function handleKeyPress(event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick(event);
          }
        }
        
        container.addEventListener('click', handleClick);
        container.addEventListener('keypress', handleKeyPress);
        
        console.log("Text Marquee: Component created with text:", marqueeText);
        return container;
      }
      
      function insertMarquee() {
        console.log("Text Marquee: insertMarquee called, readyState:", document.readyState);
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', insertMarquee);
          return;
        }

        if (document.querySelector('.text-marquee-container')) {
          console.log("Text Marquee: Component already exists, skipping");
          return;
        }

        const targetSelectors = [
          '.navigation-container',
          '.list-controls',
          '#list-area',
          '#main-outlet',
          '.container.posts',
          '#main',
          '.wrap',
          'body'
        ];
        
        let targetElement = null;
        for (const selector of targetSelectors) {
          targetElement = document.querySelector(selector);
          if (targetElement) {
            console.log("Text Marquee: Found target element:", selector);
            break;
          }
        }
        
        if (targetElement) {
          const marqueeComponent = createMarqueeComponent();
          
          if (targetElement.firstChild) {
            targetElement.insertBefore(marqueeComponent, targetElement.firstChild);
          } else {
            targetElement.appendChild(marqueeComponent);
          }
          
          console.log("Text Marquee: Component inserted successfully into:", targetElement.tagName);
        } else {
          console.error("Text Marquee: No suitable target element found");
          console.log("Text Marquee: Available elements:", document.querySelectorAll('*').length);
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
      
      if (api.onThemeSettingsChange) {
        api.onThemeSettingsChange(() => {
          console.log("Text Marquee: Theme settings changed, reloading component");
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