// ゲーム本体の起動。1ファイル版と同じ順番で各ファイルを初期化する。
import { __init_core } from './core.js';
import { __init_draw_helpers } from './draw-helpers.js';
import { __init_sound } from './sound.js';
import { __init_upgrades } from './upgrades.js';
import { __init_game_state } from './game-state.js';
import { __init_bullets_fx } from './bullets-fx.js';
import { __init_enemies } from './enemies.js';
import { __init_bosses } from './bosses.js';
import { __init_player } from './player.js';
import { __init_update } from './update.js';
import { __init_draw_player } from './draw-player.js';
import { __init_draw_enemies } from './draw-enemies.js';
import { __init_draw_bosses } from './draw-bosses.js';
import { __init_draw_world } from './draw-world.js';
import { __init_screens } from './screens.js';
import { __init_input } from './input.js';
import { __init_loop } from './loop.js';
import { bindLocalizedNames } from './i18n-bind.js';

export function bootGame() {
  __init_core();
  __init_draw_helpers();
  __init_sound();
  __init_upgrades();
  __init_game_state();
  __init_bullets_fx();
  __init_enemies();
  __init_bosses();
  __init_player();
  __init_update();
  __init_draw_player();
  __init_draw_enemies();
  __init_draw_bosses();
  __init_draw_world();
  __init_screens();
  __init_input();
  __init_loop();
  bindLocalizedNames();
}
