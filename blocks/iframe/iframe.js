import { createTag } from '../../scripts/shared.js';

const DEFAULT_HEIGHT = 600;
const HEIGHT_CLASS = /^(?:h-|height-)?(\d{2,4})(?:px)?$/i;

function getHeight(block) {
  const cls = [...block.classList].find((c) => HEIGHT_CLASS.test(c));
  const value = cls ? Number(cls.match(/(\d+)/)[1]) : NaN;
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_HEIGHT;
}

function getConfig(block) {
  const anchor = block.querySelector('a[href]');
  const rows = [...block.children];
  let url = '';
  let label = '';

  if (anchor) {
    url = anchor.href;
    const linkText = (anchor.textContent || '').trim();
    if (linkText && !/^https?:\/\//i.test(linkText) && linkText.length < 120) {
      label = linkText;
    }
  } else {
    const text = block.textContent.trim();
    try {
      url = new URL(text).href;
    } catch {
      url = '';
    }
  }

  const titleRow = rows.find((row) => !row.querySelector('a[href]'));
  if (titleRow) {
    const titleText = titleRow.textContent.trim();
    if (titleText) label = titleText;
  }

  if (!label && url) {
    try {
      label = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      label = '';
    }
  }

  return { url, label };
}

function buildLaunchAction(url, label) {
  return createTag('a', {
    class: 'button primary iframe-launch',
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
  }, label || url);
}

function buildLaunchCard(url, label) {
  const card = createTag('div', { class: 'iframe-launch-card' });
  if (label) card.append(createTag('h3', { class: 'iframe-launch-title' }, label));
  card.append(buildLaunchAction(url, label));
  return card;
}

export default function decorate(block) {
  const { url, label } = getConfig(block);
  block.textContent = '';
  if (!url) return;

  const isLinkMode = block.classList.contains('link');

  if (isLinkMode) {
    block.append(buildLaunchCard(url, label));
    return;
  }

  const height = getHeight(block);
  let hostname = '';
  try { hostname = new URL(url).hostname; } catch { /* fall back to generic title */ }

  const iframe = createTag('iframe', {
    src: url,
    title: hostname ? `Embedded content from ${hostname}` : 'Embedded content',
    loading: 'lazy',
    allowfullscreen: '',
    referrerpolicy: 'no-referrer-when-downgrade',
    style: `height: ${height}px;`,
  });

  const fallback = createTag('div', { class: 'iframe-fallback' });
  fallback.append(buildLaunchAction(url, label));

  block.append(iframe, fallback);
}
