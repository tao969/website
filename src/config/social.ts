/**
 * Social — Platform links
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type SocialPlatformIcon =
  | 'github'
  | 'linkedin'
  | 'x'
  | 'instagram'
  | 'discord'
  | 'telegram';

export interface SocialPlatform {
  readonly name:   string;
  readonly icon:   SocialPlatformIcon;
  readonly url:    string;
  readonly active: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = [
  { name: 'GitHub',    icon: 'github',    url: 'https://github.com/SataoshiNakamotao',           active: true },
  { name: 'LinkedIn',  icon: 'linkedin',  url: 'https://linkedin.com/in/Sataoshi',               active: true },
  { name: 'X',         icon: 'x',         url: 'https://x.com/Sataoshi3301',                     active: true },
  { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com/sataoshi.nakamotao',       active: true },
  { name: 'Discord',   icon: 'discord',   url: 'https://discord.com/users/Sataoshi.Nakamotao',   active: true },
  { name: 'Telegram',  icon: 'telegram',  url: 'https://t.me/sataoshinakamotao',                 active: true },
] as const;
