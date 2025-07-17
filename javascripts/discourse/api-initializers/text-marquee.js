import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "text-marquee",
  
  initialize() {
    withPluginApi("0.8.31", (api) => {
      // 获取主题设置的正确方式
      const themeSettings = api.container.lookup("service:theme-settings");
      
      console.log("Text Marquee: Initializing...");
      console.log("Text Marquee: Settings enabled:", themeSettings?.text_marquee_enabled);
      
      // 如果设置为 false 则不显示
      if (themeSettings?.text_marquee_enabled === false) {
        console.log("Text Marquee: Component disabled in settings");
        return;
      }
      
      function createMarqueeComponent() {
        const container = document.createElement('div');
        container.className = 'text-marquee-container';
        container.setAttribute('role', 'button');
        container.setAttribute('tabindex', '0');
        
        // 获取设置值
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
          window.open(marqueeUrl, '_blank', 'noopener,noreferrer');
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

        // 检查是否已存在
        if (document.querySelector('.text-marquee-container')) {
          console.log("Text Marquee: Component already exists, skipping");
          return;
        }

        // 尝试多个可能的插入位置
        const targetSelectors = [
          '#main-outlet',
          '.container.posts', 
          '#main',
          '.wrap',
          '.d-header',
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
          
          // 在目标元素顶部插入
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
      
      // 监听主题设置变化（如果可用）
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