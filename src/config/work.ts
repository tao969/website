/**
 * Work — Project categories
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProjectType   = 'infra' | 'app' | 'tool' | 'research';
export type ProjectStatus = 'live' | 'wip' | 'coming-soon' | 'archived';

export interface ProjectCategory {
  readonly name:        string;
  readonly type:        ProjectType;
  readonly description: string;
  readonly status:      ProjectStatus;
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const PROJECT_CATEGORIES: readonly ProjectCategory[] = [
  { name: 'Account Abstraction', type: 'infra', description: 'Smart contract wallets',    status: 'coming-soon' },
  { name: 'Analytics',           type: 'infra', description: 'Data analysis tools',        status: 'coming-soon' },
  { name: 'AI',                  type: 'app',   description: 'Artificial intelligence',    status: 'wip'         },
  { name: 'DeFi',                type: 'app',   description: 'Decentralized finance',      status: 'coming-soon' },
  { name: 'Gaming',              type: 'app',   description: 'Blockchain gaming',          status: 'coming-soon' },
  { name: 'NFT',                 type: 'app',   description: 'Non-fungible tokens',        status: 'coming-soon' },
  { name: 'Payments',            type: 'app',   description: 'Crypto payments',            status: 'coming-soon' },
  { name: 'Social',              type: 'app',   description: 'Decentralized social',       status: 'coming-soon' },
] as const;
