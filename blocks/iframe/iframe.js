import { createTag } from '../../scripts/shared.js';

const DEFAULT_HEIGHT = 600;
const HEIGHT_CLASS = /^(?:h-|height-)?(\d{2,4})(?:px)?$/i;

function getHeight(block) {
  const cls = [...block.classList].find((c) => HEIGHT_CLASS.test(c));
  const value = cls ? Number(cls.match(/(\d+)/)[1]) : NaN;
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_HEIGHT;
}

function getUrl(block) {
  const anchor = block.querySelector('a[href]');
  if (anchor) return anchor.href;
  const text = block.textContent.trim();
  try {
    return new URL(text).href;
  } catch {
    return '';
  }
}

export default function decorate(block) {
  const url = getUrl(block);
  block.textContent = '';
  if (!url) return;

  const height = getHeight(block);
  let hostname = '';
  try { hostname = new URL(url).hostname; } catch { /* invalid URL — fall back to generic title */ }

  const iframe = createTag('iframe', {
    src: url,
    title: hostname ? `Embedded content from ${hostname}` : 'Embedded content',
    loading: 'lazy',
    allowfullscreen: '',
    referrerpolicy: 'no-referrer-when-downgrade',
    style: `height: ${height}px;`,
  });

  block.append(iframe);
}
