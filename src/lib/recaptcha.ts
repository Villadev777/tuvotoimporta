declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks: Array<() => void> = [];

export function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (scriptLoaded) {
      resolve();
      return;
    }

    if (scriptLoading) {
      loadCallbacks.push(resolve);
      return;
    }

    scriptLoading = true;

    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey || siteKey === 'your_recaptcha_site_key_here') {
      console.warn('reCAPTCHA site key not configured');
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
    };

    script.onerror = () => {
      scriptLoading = false;
      reject(new Error('Failed to load reCAPTCHA script'));
    };

    document.head.appendChild(script);
  });
}

export async function executeRecaptcha(action: string): Promise<string | null> {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  if (!siteKey || siteKey === 'your_recaptcha_site_key_here') {
    console.warn('reCAPTCHA not configured, skipping verification');
    return null;
  }

  try {
    await loadRecaptchaScript();

    if (!window.grecaptcha) {
      console.warn('reCAPTCHA not available');
      return null;
    }

    return new Promise((resolve) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(siteKey, { action });
          resolve(token);
        } catch (error) {
          console.error('reCAPTCHA execution error:', error);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('reCAPTCHA error:', error);
    return null;
  }
}
