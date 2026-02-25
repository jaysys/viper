import fs from 'node:fs';
import path from 'node:path';

const root = '/Users/jaehojoo/Desktop/codex-lgcns-workspace/viper/app';
const bad = [];
const expectedPages = [
  'portal/dashboard/page.tsx',
  'portal/requests/new/page.tsx',
  'portal/orders/page.tsx',
  'portal/orders/[requestId]/captures/page.tsx',
  'portal/feasibility/[requestId]/page.tsx',
  'portal/quotes/[requestId]/page.tsx',
  'portal/templates/page.tsx',
  'ops/dashboard/page.tsx',
  'ops/templates/page.tsx',
  'ops/admin/page.tsx',
  'ops/tasking/uplink/page.tsx',
  'ops/tasking/reception/page.tsx'
];
const missing = [];

function hasDirectMockImport(src) {
  return src.includes('from "@/lib/mock"') || src.includes("from '@/lib/mock'");
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      const rel = path.relative(root, p).replaceAll('\\\\', '/');
      const src = fs.readFileSync(p, 'utf8');
      if (!rel.startsWith('api/') && hasDirectMockImport(src)) bad.push(rel);
    }
  }
}

walk(root);

for (const rel of expectedPages) {
  const p = path.join(root, rel);
  const src = fs.readFileSync(p, 'utf8');
  if (!src.includes('@/lib/mock-api')) missing.push(rel);
}

if (bad.length || missing.length) {
  console.error('[FAIL] fetch conversion verify');
  if (bad.length) console.error('direct lib/mock imports:', bad.join(', '));
  if (missing.length) console.error('missing lib/mock-api imports:', missing.join(', '));
  process.exit(1);
}

console.log('[PASS] fetch conversion verify');
console.log(`checked=${expectedPages.length}`);
