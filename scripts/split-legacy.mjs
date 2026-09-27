// 一度きりの移行スクリプト：legacy/wind-up-wings-original.html（1ファイル版）を
// Vite用のES modulesへ機械的に分割する。挙動を変えないことが最優先。
//
// 変換ルール
//  1. トップレベルの let（書き換えのある共有状態）は、すべて state.js の GS へ移す（P → GS.P）。
//  2. トップレベルの const は `export let` にし、値の代入は各ファイルの __init_xxx() へ移す。
//  3. トップレベルの function はそのまま export する（巻き上げで常に呼べる）。
//  4. それ以外のトップレベル文（イベント登録など）も __init_xxx() へ入れる。
//  5. index.js の bootGame() が __init を元のファイルの上から順に呼ぶので、実行順は1ファイル版と完全に一致する。
import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';

const traverse = _traverse.default ?? _traverse;
const generate = _generate.default ?? _generate;

const ROOT = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'legacy/wind-up-wings-original.html'), 'utf8');
const OUT = path.join(ROOT, 'src/game');
fs.mkdirSync(OUT, { recursive: true });

// ---- CSS と HTML本体 ----
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1].trim() + '\n';
fs.mkdirSync(path.join(ROOT, 'src/styles'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/styles/game.css'), css);
const body = html.match(/<body>([\s\S]*?)<script>/)[1].trim();
fs.writeFileSync(path.join(ROOT, 'scripts/.body.html'), body + '\n');

// ---- スクリプト ----
const src = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const SECTIONS = {
  '基本': 'core',
  '描画ヘルパー': 'draw-helpers',
  'サウンド': 'sound',
  '強化': 'upgrades',
  'ゲーム状態': 'game-state',
  '弾・演出': 'bullets-fx',
  'ザコ敵': 'enemies',
  'ボス': 'bosses',
  'プレイヤー': 'player',
  '更新': 'update',
  '描画：プレイヤー': 'draw-player',
  '描画：ザコ': 'draw-enemies',
  '描画：ボス': 'draw-bosses',
  '描画：背景・UI': 'draw-world',
  'HUD・画面': 'screens',
  '入力': 'input',
  'リサイズ・ループ': 'loop',
};
const marks = [];
src.split('\n').forEach((line, i) => {
  const m = line.match(/^\/\* =+ (.+?) =+ \*\/$/);
  if (m) {
    if (!SECTIONS[m[1]]) throw new Error('未知のセクション: ' + m[1]);
    marks.push({ line: i + 1, mod: SECTIONS[m[1]], title: m[1] });
  }
});
const modOfLine = (line) => {
  let cur = null;
  for (const m of marks) if (m.line <= line) cur = m.mod;
  if (!cur) throw new Error('セクション外の文: line ' + line);
  return cur;
};

const ast = parse(src, { sourceType: 'module' });
ast.program.directives = []; // 'use strict'（moduleは常にstrict）

// トップレベル束縛の収集
const owner = new Map(); // name -> module
const stateNames = new Set();
for (const st of ast.program.body) {
  const mod = modOfLine(st.loc.start.line);
  st._mod = mod;
  if (t.isFunctionDeclaration(st)) owner.set(st.id.name, mod);
  else if (t.isVariableDeclaration(st)) {
    for (const d of st.declarations) {
      if (!t.isIdentifier(d.id)) throw new Error('分割代入のトップレベル宣言は未対応: line ' + st.loc.start.line);
      if (st.kind === 'const') owner.set(d.id.name, mod);
      else stateNames.add(d.id.name);
    }
  }
}

// 参照の書き換え（let → S.xxx）と、ファイルごとの外部参照の収集
const uses = new Map(); // module -> Set(names)
let programScope;
traverse(ast, {
  Program(p) { programScope = p.scope; },
  ReferencedIdentifier(p) { handleRef(p); },
  AssignmentExpression(p) { handleLval(p.get('left')); },
  UpdateExpression(p) { handleLval(p.get('argument')); },
  ForXStatement(p) { handleLval(p.get('left')); },
});
function topStmt(p) {
  let q = p;
  while (q.parentPath && !q.parentPath.isProgram()) q = q.parentPath;
  return q.node;
}
function isTop(p, name) {
  const b = p.scope.getBinding(name);
  return b && b.scope === programScope;
}
function toS(p, name) {
  const mem = t.memberExpression(t.identifier('GS'), t.identifier(name));
  if (p.parentPath.isObjectProperty({ shorthand: true }) && p.parentPath.node.value === p.node) {
    p.parentPath.node.shorthand = false;
  }
  p.replaceWith(mem);
  p.skip();
}
function note(p, name) {
  const mod = topStmt(p)._mod;
  if (!uses.has(mod)) uses.set(mod, new Set());
  uses.get(mod).add(name);
}
function handleRef(p) {
  const name = p.node.name;
  if (!isTop(p, name)) return;
  if (stateNames.has(name)) { note(p, 'GS'); toS(p, name); return; }
  note(p, name);
}
function handleLval(lp) {
  if (!lp.isIdentifier()) return;
  const name = lp.node.name;
  if (!isTop(lp, name)) return;
  if (stateNames.has(name)) { note(lp, 'GS'); toS(lp, name); return; }
  throw new Error('const/function への再代入: ' + name);
}

if (/\bGS\b/.test(src)) throw new Error('GS が元コードと衝突');

// ファイルごとに組み立て
const mods = [...new Set(marks.map((m) => m.mod))];
const out = new Map(mods.map((m) => [m, { decls: [], init: [], exports: [] }]));
const stateInit = [];
for (const st of ast.program.body) {
  const o = out.get(st._mod);
  if (t.isFunctionDeclaration(st)) {
    o.decls.push(t.exportNamedDeclaration(st, []));
  } else if (t.isVariableDeclaration(st) && st.kind === 'const') {
    const names = st.declarations.map((d) => d.id.name);
    o.decls.push(t.exportNamedDeclaration(
      t.variableDeclaration('let', names.map((n) => t.variableDeclarator(t.identifier(n)))), []));
    for (const d of st.declarations) {
      const a = t.expressionStatement(t.assignmentExpression('=', t.identifier(d.id.name), d.init));
      o.init.push(a);
    }
    if (st.leadingComments) o.init[o.init.length - st.declarations.length].leadingComments = st.leadingComments;
  } else if (t.isVariableDeclaration(st)) {
    st.declarations.forEach((d, i) => {
      stateInit.push(d.id.name);
      const a = t.expressionStatement(t.assignmentExpression('=',
        t.memberExpression(t.identifier('GS'), t.identifier(d.id.name)), d.init ?? t.identifier('undefined')));
      if (i === 0 && st.leadingComments) a.leadingComments = st.leadingComments;
      o.init.push(a);
    });
    if (!uses.has(st._mod)) uses.set(st._mod, new Set());
    uses.get(st._mod).add('GS');
  } else {
    o.init.push(st);
  }
}

const header = (title) => `// ${title}\n// scripts/split-legacy.mjs で1ファイル版から機械的に分割。\n`;
const initName = (m) => '__init_' + m.replace(/-/g, '_');
for (const m of mods) {
  const o = out.get(m);
  const title = marks.find((x) => x.mod === m).title;
  const imports = new Map();
  for (const n of uses.get(m) ?? []) {
    if (n === 'GS') { imports.set('state', ['GS']); continue; }
    const from = owner.get(n);
    if (!from || from === m) continue;
    if (!imports.has(from)) imports.set(from, []);
    imports.get(from).push(n);
  }
  let code = header(title);
  for (const [from, names] of [...imports].sort()) code += `import { ${names.sort().join(', ')} } from './${from}.js';\n`;
  code += '\n';
  const prog = t.program([
    ...o.decls,
    t.exportNamedDeclaration(t.functionDeclaration(t.identifier(initName(m)), [], t.blockStatement(o.init)), []),
  ]);
  code += generate(prog, { comments: true, jsescOption: { minimal: true } }).code
    .replace(/\/\* =+ [^*]+ =+ \*\/\n?/g, '') + '\n';
  fs.writeFileSync(path.join(OUT, m + '.js'), code);
}

fs.writeFileSync(path.join(OUT, 'state.js'),
  `// 1ファイル版でトップレベル let だった共有状態。ファイルをまたいで書き換えるため1か所にまとめる。\n` +
  `// 値の初期化は各ファイルの __init_xxx() が元の順番どおりに行う。\n` +
  `export const GS = {};\n`);

fs.writeFileSync(path.join(OUT, 'index.js'),
  `// ゲーム本体の起動。1ファイル版と同じ順番で各ファイルを初期化する。\n` +
  mods.map((m) => `import { ${initName(m)} } from './${m}.js';`).join('\n') + '\n\n' +
  `export function bootGame() {\n` + mods.map((m) => `  ${initName(m)}();`).join('\n') + `\n}\n`);

console.log('modules:', mods.length, 'state vars:', stateInit.length, [...stateNames].join(','));
