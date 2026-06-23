#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const labsRoot = path.resolve(__dirname, '..', '..', '..', '..');
const outputDir = path.join(labsRoot, 'paperproof-app', 'private', 'overflow2026');

const hackathonId = 'b587dc0c-4cb8-4e63-ada5-519df38103bf';
const base = 'https://www.deepsurge.xyz';

const tracks = [
  { name: 'Special - Walrus', file: 'Sui Overflow 2026 Special Walrus Project Intelligence.md' },
  { name: 'DeFi & Payments', file: 'Sui Overflow 2026 DeFi Payments Project Intelligence.md' },
  { name: 'Special - DeepBook', file: 'Sui Overflow 2026 Special DeepBook Project Intelligence.md' },
  { name: 'The Agentic Web', file: 'Sui Overflow 2026 The Agentic Web Project Intelligence.md' },
];

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check-only') || !args.has('--write');
const write = args.has('--write');
const trackArgIndex = process.argv.indexOf('--track');
const selectedTrackName = trackArgIndex >= 0 ? process.argv[trackArgIndex + 1] : null;
if (trackArgIndex >= 0 && !selectedTrackName) {
  throw new Error('Missing value after --track');
}
const selectedTracks = selectedTrackName
  ? tracks.filter((track) => track.name.toLowerCase() === selectedTrackName.toLowerCase())
  : tracks;
if (selectedTrackName && selectedTracks.length === 0) {
  throw new Error(`Unknown track: ${selectedTrackName}`);
}

function currentIds(file) {
  let text = '';
  try {
    text = fs.readFileSync(path.join(outputDir, file), 'utf8');
  } catch {
    return new Set();
  }
  return new Set([...text.matchAll(/Project ID: `([^`]+)`/g)].map((m) => m[1]));
}

function stripTags(value) {
  return String(value).replace(/<[^>]+>/g, '');
}

function decodeEntities(value) {
  return String(value)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;|&ndash;/g, '-')
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&rdquo;|&ldquo;/g, '"')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');
}

function cleanHtml(html) {
  if (!html) return 'No About text captured from the public API.';
  let text = String(html);
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<\/h[1-6]\s*>/gi, '\n\n')
    .replace(/<h[1-6][^>]*>/gi, '\n### ')
    .replace(/<li[^>]*>\s*<p[^>]*>/gi, '- ')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/li\s*>/gi, '\n')
    .replace(/<\/ul\s*>|<\/ol\s*>/gi, '\n')
    .replace(/<ul[^>]*>|<ol[^>]*>/gi, '\n')
    .replace(/<strong[^>]*>|<b[^>]*>/gi, '**')
    .replace(/<\/strong>|<\/b>/gi, '**')
    .replace(/<em[^>]*>|<i[^>]*>/gi, '*')
    .replace(/<\/em>|<\/i>/gi, '*')
    .replace(/<code[^>]*>/gi, '`')
    .replace(/<\/code>/gi, '`');
  text = text.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis, (_m, href, linkText) => {
    return `[${stripTags(linkText).trim() || href}](${href})`;
  });
  text = decodeEntities(stripTags(text))
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text || 'No About text captured from the public API.';
}

function cleanMarkdownText(markdown) {
  let text = markdown
    .replace(/\*{4,}/g, '***')
    .replace(/\*\[\*([^\]]+?)\*\]\(([^\)]+)\)\*/g, '[$1]($2)')
    .replace(/\[\*([^\]]+?)\*\]\(([^\)]+)\)/g, '[$1]($2)')
    .replace(/\| ([^|]*?)\s{2,} \|/g, '| $1 |')
    .replace(/\r\n/g, '\n');
  return `${text.split('\n').map((line) => line.replace(/[ \t]+$/g, '')).join('\n').replace(/\n+$/g, '')}\n`;
}

function escCell(value) {
  return String(value ?? '').replace(/\r?\n/g, '<br>').replace(/\|/g, '\\|');
}

function linkTable(links) {
  if (!Array.isArray(links) || links.length === 0) return 'None listed';
  return links.map((link) => `[${link.type || 'link'}](${link.url})`).join('<br>');
}

function linkBullets(links) {
  if (!Array.isArray(links) || links.length === 0) return '- None listed';
  return links.map((link) => `- ${link.type || 'link'}: ${link.url}`).join('\n');
}

function mediaBullets(urls) {
  if (!Array.isArray(urls) || urls.length === 0) return '- None listed';
  return urls.map((url) => `- ${url}`).join('\n');
}

function projectText(project) {
  return `${project.projectName || ''}\n${cleanHtml(project.description || '')}`.toLowerCase();
}

function categoryFor(project) {
  const text = projectText(project);
  const tests = [
    ['DeFi / payments', /defi|payment|pay|swap|lend|borrow|stablecoin|yield|vault|liquidity|escrow|invoice|merchant|credit|loan|rwa|token/i],
    ['DeepBook / trading', /deepbook|order book|trading|market maker|market-making|liquidity|strategy|arbitrage|limit order|clob/i],
    ['AI / agent workflow', /\bai\b|agent|copilot|assistant|llm|prompt|memory|memwal|autonomous|chatbot/i],
    ['Walrus storage tooling', /walrus|blob|storage|file|document|media|archive|quilt|seal|decentralized storage/i],
    ['Proof / audit / provenance', /proof|audit|verify|verification|provenance|credential|certificate|attestation|hash|citation|lineage/i],
    ['Social / creator / content', /creator|social|community|blog|forum|post|content|publish|media|video|music|game/i],
  ];
  for (const [name, pattern] of tests) {
    if (pattern.test(text)) return name;
  }
  return 'General application';
}

function deploymentMix(items) {
  const counts = {};
  for (const item of items) counts[item.deployNetwork || 'Unknown'] = (counts[item.deployNetwork || 'Unknown'] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([key, value]) => `${key} ${value}`).join(', ');
}

async function fetchJson(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Codex/PaperProof track intelligence update',
      },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const json = await response.json();
    if (!json.success) throw new Error('DeepSurge API success=false');
    return json;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTrack(track) {
  let cursor = null;
  const items = [];
  for (;;) {
    const url = new URL(`${base}/api/projects`);
    url.searchParams.set('hackathonId', hackathonId);
    url.searchParams.set('tracks', track);
    url.searchParams.set('statuses', 'submitted');
    url.searchParams.set('listOnProjectPage', 'true');
    url.searchParams.set('sortBy', 'Newest First');
    url.searchParams.set('limit', '1000');
    if (cursor) url.searchParams.set('after', cursor);
    const json = await fetchJson(url.toString(), 20000);
    items.push(...(json.data?.items || []));
    if (!json.data?.pagination?.hasNext) break;
    cursor = json.data.pagination.nextCursor;
  }
  return items;
}

async function mapLimit(items, limit, fn) {
  const output = new Array(items.length);
  let index = 0;
  async function worker() {
    for (;;) {
      const current = index++;
      if (current >= items.length) return;
      output[current] = await fn(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return output;
}

async function refreshDetails(items) {
  return mapLimit(items, 8, async (item) => {
    try {
      const json = await fetchJson(`${base}/api/projects/${item.id}`, 10000);
      return json.data || item;
    } catch {
      return item;
    }
  });
}

function renderTrack(track, items, baselineIds) {
  const now = new Date().toISOString();
  const newItems = items.filter((item) => !baselineIds.has(item.id));

  const lines = [];
  lines.push(`# Sui Overflow 2026 ${track} Project Intelligence`);
  lines.push('');
  lines.push('> Neutral working notes compiled from public DeepSurge project fields. This is not an official Sui Foundation or DeepSurge ranking, and it should be treated as a content snapshot that can change as teams edit submissions.');
  lines.push('');
  lines.push('## Snapshot');
  lines.push('');
  lines.push(`- Source: DeepSurge public project API for Sui Overflow 2026, track \`${track}\`.`);
  lines.push(`- Last refreshed: ${now}.`);
  lines.push(`- Raw project records captured from DeepSurge API: ${items.length}.`);
  lines.push(`- Deployment mix: ${deploymentMix(items) || 'None captured'}.`);
  lines.push(`- Newly observed project records compared with the previous local baseline: ${newItems.length}.`);
  lines.push('- Repeated project names are kept as separate raw records when DeepSurge exposes separate project IDs.');
  lines.push('- This file is a public-field aggregation only. It intentionally does not include Top 5, Top 10, scores, or project rankings.');
  lines.push('');
  lines.push('## Newly Observed Records');
  lines.push('');
  if (newItems.length === 0) {
    lines.push('No newly observed records compared with the previous local baseline. Existing records may still have updated About text, links, deployment metadata, or media.');
  } else {
    lines.push('| # | Project | Deploy | Links | Updated |');
    lines.push('|---:|---|---|---|---|');
    newItems.forEach((project, index) => {
      lines.push(`| ${index + 1} | ${escCell(project.projectName)} | ${escCell(project.deployNetwork || 'Unknown')} | ${linkTable(project.links)} | ${escCell(project.updatedAt || '')} |`);
    });
  }
  lines.push('');
  lines.push('## Project Index');
  lines.push('');
  lines.push('| # | Project | Category | Deploy | Package ID | Links |');
  lines.push('|---:|---|---|---|---|---|');
  items.forEach((project, index) => {
    lines.push(`| ${index + 1} | ${escCell(project.projectName)} | ${categoryFor(project)} | ${escCell(project.deployNetwork || 'Unknown')} | ${project.packageId ? `\`${project.packageId}\`` : 'None listed'} | ${linkTable(project.links)} |`);
  });
  lines.push('');
  lines.push('## Project Details');
  lines.push('');
  items.forEach((project, index) => {
    lines.push(`### ${index + 1}. ${String(project.projectName || 'Untitled project').trim()}`);
    lines.push('');
    lines.push(`- DeepSurge project: ${base}/projects/${project.id}`);
    lines.push(`- Project ID: \`${project.id}\``);
    lines.push(`- Track: ${project.track || track}`);
    lines.push(`- Category: ${categoryFor(project)}`);
    lines.push(`- Bounties: ${Array.isArray(project.bounties) && project.bounties.length ? project.bounties.join(', ') : 'None listed'}`);
    lines.push(`- Status: ${project.status || 'Unknown'}`);
    lines.push(`- Deploy network: ${project.deployNetwork || 'Unknown'}`);
    lines.push(`- Package ID: ${project.packageId ? `\`${project.packageId}\`` : 'None listed'}`);
    lines.push(`- Created: ${project.createdAt || 'Unknown'}`);
    lines.push(`- Updated: ${project.updatedAt || 'Unknown'}`);
    lines.push(`- Like count: ${project.likeCount ?? 0}`);
    lines.push(`- Logo: ${project.projectLogoUrl || 'None listed'}`);
    lines.push('');
    lines.push('Links:');
    lines.push(linkBullets(project.links));
    lines.push('');
    lines.push('Media:');
    lines.push(mediaBullets(project.mediaFileUrls));
    lines.push('');
    lines.push('About:');
    lines.push('');
    lines.push(cleanHtml(project.description));
    lines.push('');
  });

  return { text: cleanMarkdownText(lines.join('\n')), newItems };
}

async function main() {
  if (!checkOnly && !write) {
    throw new Error('Use --check-only or --write');
  }
  if (write) fs.mkdirSync(outputDir, { recursive: true });

  const summary = [];
  for (const track of selectedTracks) {
    const baseline = currentIds(track.file);
    const listed = await fetchTrack(track.name);
    const freshFromList = listed.filter((item) => !baseline.has(item.id));

    if (checkOnly && !write) {
      summary.push({
        track: track.name,
        localCount: baseline.size,
        apiCount: listed.length,
        newCount: freshFromList.length,
        newProjects: freshFromList.map((project) => ({
          name: project.projectName,
          id: project.id,
          deploy: project.deployNetwork || 'Unknown',
          packageId: project.packageId || null,
          updatedAt: project.updatedAt,
          links: (project.links || []).map((link) => `${link.type}:${link.url}`),
        })),
      });
      continue;
    }

    const detailed = await refreshDetails(listed);
    const rendered = renderTrack(track.name, detailed, baseline);
    fs.writeFileSync(path.join(outputDir, track.file), rendered.text, 'utf8');
    summary.push({
      track: track.name,
      count: detailed.length,
      newCount: rendered.newItems.length,
    });
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
