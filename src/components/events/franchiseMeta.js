export const FRANCHISES = {
  unknown: {
    label: 'Crossd Unknown',
    short: 'UNKNOWN',
    color: '#6B4CCB',
    accent: '#2B1B54',
    desc: 'Mystery experiences in unusual locations. You won\'t know where you\'re going until hours before.',
    tagline: 'Mystery social',
  },
  after_hours: {
    label: 'Crossd After Hours',
    short: 'AFTER HOURS',
    color: '#E70F72',
    accent: 'rgba(231, 15, 114, 0.25)',
    desc: 'Galleries, museums, rooftops and unique venues after hours — drinks, music, conversation.',
    tagline: 'Gallery · drinks · music',
  },
  table: {
    label: 'Crossd Table',
    short: 'TABLE',
    color: '#F59E0B',
    accent: 'rgba(245, 158, 11, 0.25)',
    desc: 'Communal supper clubs and long-table dining. Spend an evening eating with an interesting room of single people.',
    tagline: 'Late-night dinner',
  },
  sunday: {
    label: 'Crossd Sunday',
    short: 'SUNDAY',
    color: '#10B981',
    accent: 'rgba(16, 185, 129, 0.25)',
    desc: 'Coffee, walks, markets and daytime socials. Meeting singles doesn\'t mean a nightclub at 10pm.',
    tagline: 'Coffee · walk · market',
  },
  play: {
    label: 'Crossd Play',
    short: 'PLAY',
    color: '#3B82F6',
    accent: 'rgba(59, 130, 246, 0.25)',
    desc: 'Social competitive nights — darts, shuffleboard, mini golf, arcade bars and team games.',
    tagline: 'Games · teams',
  },
};

export const FRANCHISE_ORDER = ['unknown', 'after_hours', 'table', 'sunday', 'play'];

export function getFranchiseMeta(key) {
  return FRANCHISES[key] || { label: key, short: (key || '').toUpperCase(), color: '#E70F72', accent: 'rgba(231,15,114,0.25)', desc: '', tagline: '' };
}

// Unknown events reveal the venue 4 hours before start
export function isVenueRevealed(event) {
  if (!event?.starts_at) return true;
  const revealAt = new Date(event.starts_at).getTime() - 4 * 60 * 60 * 1000;
  return Date.now() >= revealAt;
}

export function formatEventDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
  } catch { return ''; }
}

export function formatEventTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

export function formatPrice(priceCents, currency = 'gbp') {
  if (!priceCents || priceCents <= 0) return 'Free';
  const symbol = currency.toLowerCase() === 'gbp' ? '£' : currency.toLowerCase() === 'usd' ? '$' : '';
  return `${symbol}${(priceCents / 100).toFixed(0)}`;
}