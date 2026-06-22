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

function hasLink(project, type) {
  return Array.isArray(project.links) && project.links.some((link) => String(link.type || '').toLowerCase() === type);
}

function linkUrl(project, type) {
  const link = Array.isArray(project.links) && project.links.find((item) => String(item.type || '').toLowerCase() === type);
  return link && link.url;
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

function scoreProject(project, track) {
  const text = projectText(project);

  let deployment = 0;
  const network = String(project.deployNetwork || '').toLowerCase();
  if (network === 'mainnet') deployment += 16;
  else if (network === 'testnet') deployment += 11;
  else if (network === 'devnet') deployment += 7;
  else deployment += 2;
  if (project.packageId) deployment += 9;
  deployment = Math.min(25, deployment);

  let materials = 0;
  if (hasLink(project, 'github')) materials += 4;
  if (hasLink(project, 'website')) materials += 4;
  if (hasLink(project, 'youtube')) materials += 3;
  if (hasLink(project, 'pitch')) materials += 2;
  if (hasLink(project, 'x')) materials += 1;
  if (Array.isArray(project.mediaFileUrls) && project.mediaFileUrls.length > 0) materials += 1;
  materials = Math.min(15, materials);

  const trackWords = {
    'Special - Walrus': ['walrus', 'blob', 'storage', 'seal', 'quilt', 'file', 'archive', 'content-addressed', 'decentralized storage', 'memwal'],
    'DeFi & Payments': ['defi', 'payment', 'pay', 'swap', 'lend', 'borrow', 'stablecoin', 'yield', 'vault', 'liquidity', 'escrow', 'invoice', 'wallet', 'merchant', 'loan', 'rwa'],
    'Special - DeepBook': ['deepbook', 'order book', 'trading', 'market maker', 'market-making', 'liquidity', 'strategy', 'arbitrage', 'clob', 'limit order'],
    'The Agentic Web': ['agent', 'ai', 'llm', 'copilot', 'assistant', 'autonomous', 'prompt', 'memory', 'memwal', 'tool', 'workflow', 'mcp'],
  }[track] || [];
  let trackFit = Math.min(20, trackWords.reduce((score, word) => score + (text.includes(word) ? 4 : 0), 0));
  if (trackFit === 0 && String(project.track) === track) trackFit = 6;

  const techWords = ['sui', 'move', 'object', 'ptb', 'transaction', 'contract', 'package', 'walrus', 'blob', 'hash', 'proof', 'zklogin', 'seal', 'sdk', 'indexer', 'api', 'encryption', 'formal', 'governance', 'oracle', 'deepbook', 'agent', 'memory', 'capability', 'mainnet', 'testnet'];
  const technical = Math.min(20, techWords.filter((word) => text.includes(word)).length * 2 + (project.packageId ? 2 : 0));

  let product = 0;
  if (hasLink(project, 'website')) product += 5;
  if (hasLink(project, 'youtube')) product += 4;
  if (/demo|live|app|dashboard|marketplace|browser|wallet|website|interface|ui|portal/.test(text)) product += 4;
  if (Array.isArray(project.mediaFileUrls) && project.mediaFileUrls.length >= 2) product += 2;
  product = Math.min(15, product);

  const about = cleanHtml(project.description || '');
  let clarity = about.length > 2500 ? 10 : about.length > 1200 ? 8 : about.length > 500 ? 6 : about.length > 150 ? 4 : 2;
  if (/problem|solution|architecture|how it works|features|why|impact|technical|stack/i.test(about)) clarity = Math.min(10, clarity + 1);

  return {
    dep: deployment,
    mat: materials,
    fit: trackFit,
    tech: technical,
    product,
    clarity,
    total: deployment + materials + trackFit + technical + product + clarity,
  };
}

function projectKey(project) {
  return [
    String(project.projectName || '').trim().toLowerCase(),
    String(project.packageId || '').toLowerCase(),
    String(linkUrl(project, 'github') || '').toLowerCase(),
  ].join('|');
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
  const scored = items.map((project) => ({ project, score: scoreProject(project, track) }));
  const bestByKey = new Map();
  for (const row of scored) {
    const key = projectKey(row.project) || row.project.id;
    const old = bestByKey.get(key);
    if (!old || row.score.total > old.score.total || (row.score.total === old.score.total && String(row.project.updatedAt || '') > String(old.project.updatedAt || ''))) {
      bestByKey.set(key, row);
    }
  }
  const ranked = [...bestByKey.values()]
    .sort((a, b) => b.score.total - a.score.total || String(b.project.updatedAt || '').localeCompare(String(a.project.updatedAt || '')))
    .slice(0, 5);

  const lines = [];
  lines.push(`# Sui Overflow 2026 ${track} Project Intelligence`);
  lines.push('');
  lines.push('> Neutral working notes compiled from public DeepSurge project fields. This is not an official Sui Foundation or DeepSurge ranking, and it should be treated as a snapshot that can change as teams edit submissions.');
  lines.push('');
  lines.push('## Snapshot');
  lines.push('');
  lines.push(`- Source: DeepSurge public project API for Sui Overflow 2026, track \`${track}\`.`);
  lines.push(`- Last refreshed: ${now}.`);
  lines.push(`- Raw project records captured from DeepSurge API: ${items.length}.`);
  lines.push(`- Deployment mix: ${deploymentMix(items) || 'None captured'}.`);
  lines.push(`- Newly observed project records compared with the previous local baseline: ${newItems.length}.`);
  lines.push('- Repeated project names are kept as separate raw records when DeepSurge exposes separate project IDs; ranked lists deduplicate records that share the same project name, package ID, and GitHub link.');
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
  lines.push('## Heuristic Top 5');
  lines.push('');
  lines.push('This section uses a simple evidence-based heuristic so the comparison stays reproducible from public fields. It rewards visible deployment evidence, public verification materials, direct track fit, technical specificity, product/demo clarity, and About-text clarity. It does not inspect private repositories or judge real product quality beyond the submitted public information.');
  lines.push('');
  lines.push('| Dimension | Max | What is considered |');
  lines.push('|---|---:|---|');
  lines.push('| Deployment and protocol evidence | 25 | Mainnet/Testnet/Devnet declaration and whether a Sui package ID is listed |');
  lines.push('| Public verification materials | 15 | GitHub, website, demo video, pitch deck, social links, and media |');
  lines.push(`| ${track} fit | 20 | Keywords and claims that directly match this track's stated theme |`);
  lines.push('| Technical depth | 20 | Concrete Sui/Move/Walrus/DeepBook/agent/contract/API/security details rather than only product claims |');
  lines.push('| Product/demo clarity | 15 | Evidence of a usable app, dashboard, workflow, wallet flow, developer surface, or live demo |');
  lines.push('| Submission clarity | 10 | Clear problem/solution/architecture/features narrative and enough About detail to assess the project |');
  lines.push('');
  lines.push('| Rank | Project | Deploy | Score | Analysis basis | Visible limitations |');
  lines.push('|---:|---|---|---:|---|---|');
  ranked.forEach((row, index) => {
    const project = row.project;
    const score = row.score;
    const basis = [];
    basis.push(`${project.deployNetwork || 'Unknown'} deployment${project.packageId ? ' with package ID' : ''}`);
    const materialLinks = ['github', 'website', 'youtube', 'pitch', 'x'].filter((type) => hasLink(project, type));
    if (materialLinks.length) basis.push(`${materialLinks.join(', ')} link${materialLinks.length > 1 ? 's' : ''}`);
    if (score.fit >= 16) basis.push('strong track-language match');
    else if (score.fit >= 8) basis.push('partial track-language match');
    if (score.tech >= 16) basis.push('technical implementation detail in About text');
    if (score.product >= 12) basis.push('clear product/demo surface');

    const limits = [];
    if (String(project.deployNetwork || '').toLowerCase() !== 'mainnet') limits.push('not declared as Mainnet');
    if (!project.packageId) limits.push('no package ID listed');
    if (!hasLink(project, 'github')) limits.push('no GitHub link listed');
    if (!hasLink(project, 'website')) limits.push('no website link listed');
    if (!hasLink(project, 'youtube')) limits.push('no demo video link listed');
    lines.push(`| ${index + 1} | ${escCell(project.projectName)} | ${escCell(project.deployNetwork || 'Unknown')} | ${score.total}/105 | ${escCell(basis.join('; ') || 'Public metadata available')} | ${escCell(limits.join('; ') || 'no major metadata gap visible from captured fields')} |`);
  });
  lines.push('');
  lines.push('### Top 5 Score Breakdown');
  lines.push('');
  lines.push('| Rank | Project | Deployment | Materials | Track fit | Technical | Product | Clarity |');
  lines.push('|---:|---|---:|---:|---:|---:|---:|---:|');
  ranked.forEach((row, index) => {
    const score = row.score;
    lines.push(`| ${index + 1} | ${escCell(row.project.projectName)} | ${score.dep}/25 | ${score.mat}/15 | ${score.fit}/20 | ${score.tech}/20 | ${score.product}/15 | ${score.clarity}/10 |`);
  });
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

  return { text: cleanMarkdownText(lines.join('\n')), ranked, newItems };
}

async function main() {
  if (!checkOnly && !write) {
    throw new Error('Use --check-only or --write');
  }
  if (write) fs.mkdirSync(outputDir, { recursive: true });

  const summary = [];
  for (const track of tracks) {
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
      top5: rendered.ranked.map((row) => ({
        name: row.project.projectName,
        score: row.score.total,
        deploy: row.project.deployNetwork || 'Unknown',
      })),
    });
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
