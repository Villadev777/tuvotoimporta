interface EnvironmentVariables {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_RECAPTCHA_SITE_KEY?: string;
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

export function validateEnvironment(): EnvironmentVariables {
  const missingVars: string[] = [];

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  if (!supabaseUrl) {
    missingVars.push('VITE_SUPABASE_URL');
  }

  if (!supabaseKey) {
    missingVars.push('VITE_SUPABASE_ANON_KEY');
  }

  if (missingVars.length > 0) {
    throw new EnvironmentError(
      `Variables de entorno críticas faltantes: ${missingVars.join(', ')}`
    );
  }

  if (!supabaseUrl.startsWith('https://')) {
    throw new EnvironmentError('VITE_SUPABASE_URL debe comenzar con https://');
  }

  const isRecaptchaValid = recaptchaKey && recaptchaKey !== 'your_recaptcha_site_key_here';

  if (!isRecaptchaValid) {
    console.warn('⚠️ reCAPTCHA no está configurado. La protección contra spam será limitada.');
  }

  return {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseKey,
    VITE_RECAPTCHA_SITE_KEY: isRecaptchaValid ? recaptchaKey : undefined,
  };
}

export function isEnvironmentValid(): boolean {
  try {
    validateEnvironment();
    return true;
  } catch {
    return false;
  }
}
