// QA warnings from inside compositions. Components report fixable problems with
//   console.warn('[QA] <Component>: <message>')
// (e.g. HeroNumber auto-shrinking a value that doesn't fit). frames.mjs and render-all.mjs pass
// collector.onBrowserLog to Remotion, print each distinct warning once, and write them to
// out/qa/<Id>-qa.json so make-short Stage 3 can list them in its QA report.
import { writeFileSync, mkdirSync, rmSync, readdirSync } from 'fs';
import path from 'path';

// Wipe out/qa/ so it holds exactly the latest QA run (called at the START of a run, by frames.mjs
// unless --keep-qa is passed: use --keep-qa on the 2nd+ call of the same run, e.g. the --safe pass).
export const resetQaDir = (root) => {
  const dir = path.join(root, 'out', 'qa');
  mkdirSync(dir, { recursive: true });
  // empty it rather than delete it: on Windows a folder open in Explorer/a shell can't be removed
  for (const name of readdirSync(dir)) rmSync(path.join(dir, name), { recursive: true, force: true });
  console.log('  out/qa/ wiped (new QA run; pass --keep-qa to add to the current run)');
};

export const qaCollector = (root, id) => {
  const seen = new Set();
  return {
    onBrowserLog: (log) => {
      const text = String(log?.text ?? '');
      if (!text.startsWith('[QA]') || seen.has(text)) return;
      seen.add(text);
      console.warn(`  ⚠ ${text}`);
    },
    write: () => {
      const dir = path.join(root, 'out', 'qa');
      mkdirSync(dir, { recursive: true });
      const out = path.join(dir, `${id}-qa.json`);
      writeFileSync(out, JSON.stringify({ id, warnings: [...seen] }, null, 2));
      if (seen.size) console.warn(`  ⚠ ${seen.size} QA warning(s) → ${path.relative(root, out)}`);
      return [...seen];
    },
  };
};
