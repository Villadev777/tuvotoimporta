export interface BrowserFingerprint {
  fingerprint: string;
  components: {
    canvas: string;
    webgl: string;
    audio: string;
    fonts: string[];
    plugins: string[];
    screenResolution: string;
    timezone: number;
    language: string;
    platform: string;
    hardwareConcurrency: number;
    deviceMemory: number | undefined;
    colorDepth: number;
    pixelRatio: number;
    touchSupport: boolean;
    cookieEnabled: boolean;
  };
}

async function getCanvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('BrowserFingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('BrowserFingerprint', 4, 17);

    const dataUrl = canvas.toDataURL();
    return hashString(dataUrl);
  } catch {
    return 'canvas-error';
  }
}

async function getWebGLFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'no-debug-info';

    const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}~${renderer}`;
  } catch {
    return 'webgl-error';
  }
}

async function getAudioFingerprint(): Promise<string> {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return 'no-audio';

    const context = new AudioContext();

    if (context.state === 'suspended') {
      await context.resume().catch(() => {});
    }

    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();

    analyser.fftSize = 2048;
    gainNode.gain.value = 0;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1000, context.currentTime);

    oscillator.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(0);

    return new Promise((resolve) => {
      let cleaned = false;

      const cleanup = async () => {
        if (cleaned) return;
        cleaned = true;

        try {
          oscillator.stop();
        } catch {}

        try {
          if (context.state !== 'closed') {
            await context.close();
          }
        } catch {}
      };

      setTimeout(async () => {
        const frequencyData = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(frequencyData);

        const hash = hashString(
          Array.from(frequencyData.slice(0, 30))
            .map(v => Math.round(v))
            .join(',')
        );

        await cleanup();
        resolve(hash);
      }, 100);
    });
  } catch {
    return 'audio-error';
  }
}

async function getAvailableFonts(): Promise<string[]> {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
    'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
    'Impact', 'Lucida Console', 'Tahoma', 'Helvetica', 'Century Gothic'
  ];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  const baselineWidths: { [key: string]: number } = {};

  for (const baseFont of baseFonts) {
    ctx.font = `${testSize} ${baseFont}`;
    baselineWidths[baseFont] = ctx.measureText(testString).width;
  }

  const availableFonts: string[] = [];

  for (const testFont of testFonts) {
    let detected = false;
    for (const baseFont of baseFonts) {
      ctx.font = `${testSize} "${testFont}", ${baseFont}`;
      const width = ctx.measureText(testString).width;
      if (width !== baselineWidths[baseFont]) {
        detected = true;
        break;
      }
    }
    if (detected) {
      availableFonts.push(testFont);
    }
  }

  return availableFonts;
}

function getPlugins(): string[] {
  const plugins: string[] = [];
  for (let i = 0; i < navigator.plugins.length; i++) {
    const plugin = navigator.plugins[i];
    if (plugin && plugin.name) {
      plugins.push(plugin.name);
    }
  }
  return plugins.sort();
}

function getTouchSupport(): boolean {
  return ('ontouchstart' in window) ||
         (navigator.maxTouchPoints > 0) ||
         ((navigator as unknown as { msMaxTouchPoints: number }).msMaxTouchPoints > 0);
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function generateFingerprint(): Promise<BrowserFingerprint> {
  const [canvas, webgl, audio, fonts] = await Promise.all([
    getCanvasFingerprint(),
    getWebGLFingerprint(),
    getAudioFingerprint(),
    getAvailableFonts(),
  ]);

  const plugins = getPlugins();
  const screenResolution = `${screen.width}x${screen.height}`;
  const timezone = new Date().getTimezoneOffset();
  const language = navigator.language;
  const platform = navigator.platform;
  const hardwareConcurrency = navigator.hardwareConcurrency || 0;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const colorDepth = screen.colorDepth;
  const pixelRatio = window.devicePixelRatio;
  const touchSupport = getTouchSupport();
  const cookieEnabled = navigator.cookieEnabled;

  const components = {
    canvas,
    webgl,
    audio,
    fonts,
    plugins,
    screenResolution,
    timezone,
    language,
    platform,
    hardwareConcurrency,
    deviceMemory,
    colorDepth,
    pixelRatio,
    touchSupport,
    cookieEnabled,
  };

  const fingerprintString = JSON.stringify(components);
  const fingerprint = hashString(fingerprintString);

  return {
    fingerprint,
    components,
  };
}

export function getUserHash(): string {
  const storageKey = 'user_unique_hash';

  let userHash = localStorage.getItem(storageKey);

  if (!userHash) {
    userHash = hashString(
      Date.now().toString() +
      Math.random().toString() +
      navigator.userAgent
    );
    localStorage.setItem(storageKey, userHash);
  }

  return userHash;
}

export function getBrowserInfo(): Record<string, unknown> {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    vendor: navigator.vendor,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
    screen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
    },
    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      devicePixelRatio: window.devicePixelRatio,
    },
    timezone: {
      offset: new Date().getTimezoneOffset(),
      name: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };
}
