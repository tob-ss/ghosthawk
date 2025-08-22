// Prevent Radix UI from disabling scroll
export function preventScrollLock() {
  // Override any attempts to set overflow: hidden on body
  const originalSetAttribute = Element.prototype.setAttribute;
  const originalStyle = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style');

  // Monitor body style changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const target = mutation.target as HTMLElement;
        if (target === document.body && target.style.overflow === 'hidden') {
          target.style.overflowY = 'auto';
          target.style.paddingRight = '0';
        }
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style', 'data-scroll-locked', 'class']
  });

  // Also prevent scroll lock through direct style manipulation
  let lastBodyOverflow = document.body.style.overflow;
  setInterval(() => {
    if (document.body.style.overflow === 'hidden' && lastBodyOverflow !== 'hidden') {
      document.body.style.overflowY = 'auto';
      document.body.style.paddingRight = '0px';
    }
    lastBodyOverflow = document.body.style.overflow;
  }, 50);

  return () => observer.disconnect();
}