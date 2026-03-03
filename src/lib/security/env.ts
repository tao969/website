/**
 * Environment variable validation and security
 * Ensures all required environment variables are present and valid
 */

interface EnvConfig {
  NODE_ENV: string;
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_APP_NAME: string;
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  API_RATE_LIMIT_MAX: number;
  API_RATE_LIMIT_WINDOW: number;
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
  NEXT_PUBLIC_GA_ID?: string;
  NEXT_PUBLIC_GTM_ID?: string;
  NEXT_PUBLIC_ALLOWED_ORIGINS?: string;
}

class EnvValidator {
  private config: Partial<EnvConfig> = {};

  constructor() {
    this.validate();
  }

  private validate(): void {
    // Required environment variables
    const required = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    };

    // Check required variables
    for (const [key, value] of Object.entries(required)) {
      if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }

    // Validate URL format
    try {
      new URL(required.NEXT_PUBLIC_APP_URL!);
    } catch {
      throw new Error('NEXT_PUBLIC_APP_URL must be a valid URL');
    }

    // Optional but validated variables
    this.config = {
      ...required,
      NEXTAUTH_SECRET: this.validateNextAuthSecret(process.env.NEXTAUTH_SECRET),
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      API_RATE_LIMIT_MAX: this.parseNumber(process.env.API_RATE_LIMIT_MAX, 100),
      API_RATE_LIMIT_WINDOW: this.parseNumber(process.env.API_RATE_LIMIT_WINDOW, 900000),
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: this.parseNumber(process.env.SMTP_PORT),
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_FROM: process.env.SMTP_FROM,
      NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
      NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
      NEXT_PUBLIC_ALLOWED_ORIGINS: process.env.NEXT_PUBLIC_ALLOWED_ORIGINS,
    };

    // Validate SMTP configuration if provided
    if (this.config.SMTP_HOST || this.config.SMTP_USER || this.config.SMTP_PASS) {
      if (!this.config.SMTP_HOST || !this.config.SMTP_USER || !this.config.SMTP_PASS) {
        throw new Error('SMTP configuration is incomplete. All SMTP variables must be provided together.');
      }
    }

    // Validate allowed origins format
    if (this.config.NEXT_PUBLIC_ALLOWED_ORIGINS) {
      const origins = this.config.NEXT_PUBLIC_ALLOWED_ORIGINS.split(',');
      for (const origin of origins) {
        try {
          new URL(origin.trim());
        } catch {
          throw new Error(`Invalid origin in NEXT_PUBLIC_ALLOWED_ORIGINS: ${origin}`);
        }
      }
    }
  }

  private parseNumber(value: string | undefined, defaultValue?: number): number | undefined {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Invalid number: ${value}`);
    }
    return parsed;
  }

  private validateNextAuthSecret(secret: string | undefined): string | undefined {
    if (!secret) {
      // In production, NextAuth secret is required
      if (process.env.NODE_ENV === 'production') {
        throw new Error('NEXTAUTH_SECRET is required in production');
      }
      return undefined;
    }

    // Validate secret strength
    if (secret.length < 32) {
      throw new Error('NEXTAUTH_SECRET must be at least 32 characters long');
    }

    // Check for common weak patterns
    const weakPatterns = [
      /^password/i,
      /^123456/,
      /^admin/i,
      /^secret/i,
      /^token/i,
      /^key/i
    ];

    if (weakPatterns.some(pattern => pattern.test(secret))) {
      throw new Error('NEXTAUTH_SECRET contains common weak patterns');
    }

    // Check entropy (basic check) - warning handled at application level if needed
    const uniqueChars = new Set(secret).size;
    const entropyRatio = uniqueChars / secret.length;

    // Low entropy check - consider logging at application level instead
    if (entropyRatio < 0.7) {
      // Entropy ratio below recommended threshold
    }

    return secret;
  }

  public getConfig(): EnvConfig {
    return this.config as EnvConfig;
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public getAllowedOrigins(): string[] {
    if (!this.config.NEXT_PUBLIC_ALLOWED_ORIGINS) {
      return [this.config.NEXT_PUBLIC_APP_URL!];
    }
    return this.config.NEXT_PUBLIC_ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }
}

// Create singleton instance
const envValidator = new EnvValidator();

export const env = envValidator.getConfig();
export const isProduction = envValidator.isProduction();
export const isDevelopment = envValidator.isDevelopment();
export const getAllowedOrigins = envValidator.getAllowedOrigins();

export default envValidator;
