// 基本
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { getItem, setItem } from '../platform/storage.ts';
import { GS } from './state.js';

export let $;
export let cvs, stage, app;
export let INK, TEAL, TEAL_D, MUS, TOM, TOM_D, CRE, TIN, TIN_D, BRN, BRN_D, SLOT, WHL, WHL_D, PLUM, FOX, FOX_D, SHK, SHK_D, PINK;
export let TAU;
export let clamp, lerp, rnd, pick;
export let RM;
export let F;
export let fmt;
export function loadBest() {
  try {
    return +(getItem('zenmai-sky-best') || 0);
  } catch (e) {
    return 0;
  }
}
export function saveBest(v) {
  try {
    setItem('zenmai-sky-best', String(v));
  } catch (e) {}
}

export function __init_core() {
    $ = s => document.querySelector(s);
  cvs = $('#c');
  stage = $('#stage');
  app = $('#app');
  GS.ctx = cvs.getContext('2d');
  INK = '#2B1D16';
  TEAL = '#2E8C85';
  TEAL_D = '#1E5F5B';
  MUS = '#EDB43C';
  TOM = '#D8432F';
  TOM_D = '#9E2E20';
  CRE = '#F4E4BC';
  TIN = '#C7D0CF';
  TIN_D = '#8E9C9C';
  BRN = '#8B5A3C';
  BRN_D = '#5E3A25';
  SLOT = '#2A3850';
  WHL = '#6F8FA0';
  WHL_D = '#4E6A7A';
  PLUM = '#4A3358';
  FOX = '#E27A33';
  FOX_D = '#B35A1C';
  SHK = '#7FA3B8';
  SHK_D = '#557A90';
  PINK = '#F28DB2';
  TAU = Math.PI * 2;
  clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  lerp = (a, b, t) => a + (b - a) * t;
  rnd = (a, b) => a + Math.random() * (b - a);
  pick = a => a[Math.random() * a.length | 0];
  RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  GS.W = 360;
  GS.H = 640;
  GS.SC = 1;
  GS.DPR = Math.min(window.devicePixelRatio || 1, 2);
  GS.flashOn = false;
  F = c => GS.flashOn ? '#FFF6DA' : c;
  fmt = n => Math.floor(n).toLocaleString('ja-JP');
}
