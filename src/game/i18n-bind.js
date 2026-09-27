// ゲームデータの表示名を、今の言語の辞書（src/i18n/strings.ts）から読むようにする。
// 数値やルールは元のデータのまま。名前・説明文だけを getter に置き換えるので、使う側のコードは変わらない。
import { L } from '../i18n/index.ts';
import { BOSSDEF, SPNAME } from './bosses.js';
import { STAGES } from './game-state.js';
import { BONUS, CH, LINES, MIDNAME, MININAME, UPG } from './upgrades.js';

const def = (o, k, get) => Object.defineProperty(o, k, { get, enumerable: true, configurable: true });

export function bindLocalizedNames() {
  STAGES.forEach((s, i) => def(s, 'name', () => L().stages[i]));
  for (const k of Object.keys(BOSSDEF)) {
    def(BOSSDEF[k], 'name', () => L().boss[k].name);
    def(BOSSDEF[k], 'title', () => L().boss[k].title);
  }
  for (const k of Object.keys(SPNAME)) def(SPNAME, k, () => L().boss[k].sp);
  for (const k of Object.keys(MININAME)) def(MININAME, k, () => L().mini[k]);
  for (const k of Object.keys(MIDNAME)) def(MIDNAME, k, () => L().mid[k]);
  for (const k of Object.keys(CH)) for (const f of ['name', 'sp', 'sub']) def(CH[k], f, () => L().char[k][f]);
  for (const k of Object.keys(LINES)) def(LINES, k, () => L().lines[k]);
  for (const u of [...UPG, BONUS]) {
    def(u, 'g', () => L().upg[u.id].g);
    def(u, 'name', () => L().upg[u.id].name);
    def(u, 'desc', () => L().upg[u.id].desc);
  }
}
