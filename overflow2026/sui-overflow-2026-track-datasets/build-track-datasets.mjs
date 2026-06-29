import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..', '..', '..');
const requireFromApp = createRequire(path.join(root, 'paperproof-app', 'package.json'));
const JSZip = requireFromApp('jszip');

const sourceDir = path.join(root, 'paperproof-app', 'private', 'overflow2026');
const outputDir = __dirname;

const tracks = [
  {
    slug: 'defi-payments',
    title: 'Sui Overflow 2026 DeFi & Payments Project Intelligence',
    sourceFile: 'Sui Overflow 2026 DeFi Payments Project Intelligence.md',
    datasetTitle: 'Sui Overflow 2026 DeFi & Payments Project Intelligence Dataset',
    datasetDescription:
      'Structured research package for the Sui Overflow 2026 DeFi & Payments track. Useful for studying product categories, deployment posture, public links, repeated submission patterns, and how payment / DeFi teams present themselves across an open hackathon pipeline.',
    keywords: ['Sui Overflow 2026', 'DeFi', 'payments', 'hackathon intelligence', 'project dataset', 'ecosystem research'],
    categoryLabel: 'DeFi & Payments',
  },
  {
    slug: 'special-deepbook',
    title: 'Sui Overflow 2026 Special - DeepBook Project Intelligence',
    sourceFile: 'Sui Overflow 2026 Special DeepBook Project Intelligence.md',
    datasetTitle: 'Sui Overflow 2026 Special - DeepBook Project Intelligence Dataset',
    datasetDescription:
      'Structured research package for the Sui Overflow 2026 DeepBook special track. Useful for comparing trading, market structure, prediction, execution, and liquidity-oriented submissions built around DeepBook and adjacent exchange primitives.',
    keywords: ['Sui Overflow 2026', 'DeepBook', 'trading', 'market structure', 'hackathon intelligence', 'project dataset'],
    categoryLabel: 'Special - DeepBook',
  },
  {
    slug: 'special-walrus',
    title: 'Sui Overflow 2026 Special - Walrus Project Intelligence',
    sourceFile: 'Sui Overflow 2026 Special Walrus Project Intelligence.md',
    datasetTitle: 'Sui Overflow 2026 Special - Walrus Project Intelligence Dataset',
    datasetDescription:
      'Structured research package for the Sui Overflow 2026 Walrus special track. Useful for mapping storage-native applications, memory systems, content infrastructure, AI workflows, and how teams frame Walrus as an application primitive.',
    keywords: ['Sui Overflow 2026', 'Walrus', 'storage', 'AI', 'content infrastructure', 'hackathon intelligence'],
    categoryLabel: 'Special - Walrus',
  },
  {
    slug: 'agentic-web',
    title: 'Sui Overflow 2026 The Agentic Web Project Intelligence',
    sourceFile: 'Sui Overflow 2026 The Agentic Web Project Intelligence.md',
    datasetTitle: 'Sui Overflow 2026 The Agentic Web Project Intelligence Dataset',
    datasetDescription:
      'Structured research package for the Sui Overflow 2026 Agentic Web track. Useful for studying how teams frame AI agents, policy layers, wallets, execution boundaries, and human-in-the-loop trust models on Sui.',
    keywords: ['Sui Overflow 2026', 'agentic web', 'AI agents', 'wallets', 'policy', 'hackathon intelligence'],
    categoryLabel: 'The Agentic Web',
  },
];

function sha256Hex(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function normalizeLine(text) {
  return text.replace(/\r\n/g, '\n');
}

function parseSnapshotValue(line) {
  const index = line.indexOf(':');
  return index >= 0 ? line.slice(index + 1).trim() : '';
}

function parseMarkdownStats(markdown) {
  const lines = normalizeLine(markdown).split('\n');
  const snapshot = {};
  const categoryCounts = new Map();
  const deployCounts = new Map();
  const packagePresence = { listed: 0, missing: 0 };
  const websiteCount = { yes: 0, no: 0 };
  const githubCount = { yes: 0, no: 0 };
  const youtubeCount = { yes: 0, no: 0 };
  let projectRows = 0;

  for (const line of lines) {
    if (line.startsWith('- Source:')) snapshot.source = parseSnapshotValue(line);
    if (line.startsWith('- Last refreshed:')) snapshot.lastRefreshed = parseSnapshotValue(line);
    if (line.startsWith('- Raw project records captured from DeepSurge API:')) snapshot.rawProjectRecords = Number(parseSnapshotValue(line).replace(/[^\d]/g, ''));
    if (line.startsWith('- Deployment mix:')) snapshot.deploymentMix = parseSnapshotValue(line);
    if (line.startsWith('- Newly observed project records compared with the previous local baseline:')) {
      snapshot.newlyObserved = Number(parseSnapshotValue(line).replace(/[^\d]/g, ''));
    }
  }

  const tableStart = lines.findIndex((line) => line.trim() === '| # | Project | Category | Deploy | Package ID | Links |');
  if (tableStart >= 0) {
    for (let i = tableStart + 2; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line.startsWith('|')) break;
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      if (cells.length < 6) continue;
      projectRows += 1;
      const category = cells[2];
      const deploy = cells[3];
      const packageId = cells[4];
      const links = cells[5];
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
      deployCounts.set(deploy, (deployCounts.get(deploy) ?? 0) + 1);
      if (packageId && packageId !== 'None listed') packagePresence.listed += 1;
      else packagePresence.missing += 1;
      if (links.includes('[website](')) websiteCount.yes += 1;
      else websiteCount.no += 1;
      if (links.includes('[github](')) githubCount.yes += 1;
      else githubCount.no += 1;
      if (links.includes('[youtube](')) youtubeCount.yes += 1;
      else youtubeCount.no += 1;
    }
  }

  const categorySummary = [...categoryCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([name, count]) => ({ name, count }));
  const deploySummary = [...deployCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([name, count]) => ({ name, count }));

  return {
    snapshot,
    projectRows,
    categorySummary,
    deploySummary,
    packagePresence,
    websiteCount,
    githubCount,
    youtubeCount,
    wordCount: markdown.split(/\s+/).filter(Boolean).length,
    lineCount: lines.length,
  };
}

function buildReadme(track, stats, archiveName) {
  const categories = stats.categorySummary.slice(0, 8).map((item) => `- ${item.name}: ${item.count}`).join('\n');
  const deployments = stats.deploySummary.map((item) => `- ${item.name}: ${item.count}`).join('\n');
  return `# ${track.datasetTitle}

This dataset packages a track-specific PaperProof research snapshot of public Sui Overflow 2026 submission fields for **${track.categoryLabel}**.

It is designed for:

- ecosystem researchers comparing project archetypes across a live hackathon funnel;
- builders studying how teams describe deployment status, links, and product scope;
- investors, scouts, and community analysts looking for structured raw material instead of anecdotal impressions;
- AI agents or scripts that need a stable, downloadable package instead of scraping a changing website.

## Why Download It

Unlike a short summary post, this package preserves the full long-form intelligence file together with machine-readable metadata about the snapshot. It can be used to:

- inspect the full project index offline;
- compare category concentration and deployment mix;
- analyze how many teams expose GitHub, website, and demo links;
- build your own follow-on benchmark, watchlist, or tagging pipeline.

## Contents

- \`README.md\`: package overview and intended uses.
- \`dataset_overview.json\`: dataset-level metadata and summary stats.
- \`schema.json\`: schema for the overview file and summary structures.
- \`sources.json\`: source provenance and file mapping.
- \`${track.sourceFile}\`: the full original intelligence markdown snapshot.

## Snapshot Summary

- Track: ${track.categoryLabel}
- Source: ${stats.snapshot.source ?? 'Unknown'}
- Last refreshed: ${stats.snapshot.lastRefreshed ?? 'Unknown'}
- Raw project records reported in source: ${stats.snapshot.rawProjectRecords ?? 'Unknown'}
- Indexed project rows in this package: ${stats.projectRows}
- Word count of the research note: ${stats.wordCount}
- Archive file: \`${archiveName}\`

## Deployment Mix

${deployments || '- No deployment summary detected'}

## Top Categories

${categories || '- No category summary detected'}

## Link Coverage

- GitHub links present: ${stats.githubCount.yes}
- Website links present: ${stats.websiteCount.yes}
- YouTube/demo links present: ${stats.youtubeCount.yes}
- Package IDs explicitly listed: ${stats.packagePresence.listed}
- Package IDs missing or not listed: ${stats.packagePresence.missing}

## Notes

- This is a community research dataset, not an official Sui Foundation export.
- Repeated project names are preserved when the source snapshot treated them as separate raw records.
- The package intentionally keeps the source markdown intact so readers can audit conclusions against the underlying text.

## License

Prepared for research, benchmarking, and ecosystem analysis. Use with attribution to the cited public sources and this community package.
`;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  const outputs = [];
  for (const track of tracks) {
    const sourcePath = path.join(sourceDir, track.sourceFile);
    const markdown = await fs.readFile(sourcePath, 'utf8');
    const stats = parseMarkdownStats(markdown);
    const datasetDir = path.join(outputDir, track.slug);
    const archiveName = `${track.slug}-dataset.zip`;
    const archivePath = path.join(outputDir, archiveName);

    await ensureDir(datasetDir);

    const datasetOverview = {
      dataset_title: track.datasetTitle,
      track: track.categoryLabel,
      source_file: track.sourceFile,
      source_path: sourcePath,
      generated_at: new Date().toISOString(),
      snapshot: stats.snapshot,
      project_rows: stats.projectRows,
      word_count: stats.wordCount,
      line_count: stats.lineCount,
      category_summary: stats.categorySummary,
      deployment_summary: stats.deploySummary,
      package_presence: stats.packagePresence,
      link_coverage: {
        github: stats.githubCount,
        website: stats.websiteCount,
        youtube: stats.youtubeCount,
      },
      description: track.datasetDescription,
      keywords: track.keywords,
    };

    const schema = {
      title: track.datasetTitle,
      type: 'object',
      required: ['dataset_title', 'track', 'generated_at', 'project_rows', 'category_summary', 'deployment_summary'],
      properties: {
        dataset_title: { type: 'string' },
        track: { type: 'string' },
        source_file: { type: 'string' },
        source_path: { type: 'string' },
        generated_at: { type: 'string' },
        snapshot: { type: 'object' },
        project_rows: { type: 'integer' },
        word_count: { type: 'integer' },
        line_count: { type: 'integer' },
        category_summary: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'count'],
            properties: {
              name: { type: 'string' },
              count: { type: 'integer' },
            },
          },
        },
        deployment_summary: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'count'],
            properties: {
              name: { type: 'string' },
              count: { type: 'integer' },
            },
          },
        },
      },
    };

    const sources = {
      description: 'Source provenance for the community-packaged Sui Overflow 2026 track dataset.',
      public_source_basis: stats.snapshot.source ?? 'DeepSurge public project API snapshot referenced inside the markdown file.',
      original_markdown_file: {
        path: sourcePath,
        name: track.sourceFile,
      },
      package_generated_from: 'paperproof-docs/overflow2026/sui-overflow-2026-track-datasets/build-track-datasets.mjs',
      notes: [
        'This package preserves the original markdown snapshot as its core research artifact.',
        'Summary JSON is generated locally from the markdown snapshot for easier indexing and downstream analysis.',
      ],
    };

    const readme = buildReadme(track, stats, archiveName);

    await fs.writeFile(path.join(datasetDir, 'README.md'), readme, 'utf8');
    await fs.writeFile(path.join(datasetDir, 'dataset_overview.json'), `${JSON.stringify(datasetOverview, null, 2)}\n`, 'utf8');
    await fs.writeFile(path.join(datasetDir, 'schema.json'), `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
    await fs.writeFile(path.join(datasetDir, 'sources.json'), `${JSON.stringify(sources, null, 2)}\n`, 'utf8');
    await fs.writeFile(path.join(datasetDir, track.sourceFile), markdown, 'utf8');

    const zip = new JSZip();
    for (const name of ['README.md', 'dataset_overview.json', 'schema.json', 'sources.json', track.sourceFile]) {
      const bytes = await fs.readFile(path.join(datasetDir, name));
      zip.file(name, bytes);
    }
    const archiveBytes = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });
    await fs.writeFile(archivePath, archiveBytes);

    outputs.push({
      slug: track.slug,
      datasetDir,
      archivePath,
      archiveName,
      archiveBytes: archiveBytes.length,
      archiveSha256: `sha256:${sha256Hex(archiveBytes)}`,
      projectRows: stats.projectRows,
      wordCount: stats.wordCount,
      trackTitle: track.datasetTitle,
      trackDescription: track.datasetDescription,
      keywords: track.keywords,
    });
  }

  const reportPath = path.join(outputDir, 'build-report.json');
  await fs.writeFile(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), outputs }, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ reportPath, outputs }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
