#!/usr/bin/env node
// 装字体.mjs：把 $SKILL/fonts/ 里的越南语 / 英语字体（都是 SIL OFL 开源字体）装到当前用户的字体文件夹。
//   macOS：~/Library/Fonts    Linux：~/.local/share/fonts/dashi（装完跑 fc-cache）
// 用法：node 装字体.mjs        装过的会覆盖，可以重复跑。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fonts');
const dst = process.platform === 'darwin' ? path.join(os.homedir(), 'Library/Fonts') : path.join(os.homedir(), '.local/share/fonts/dashi');
fs.mkdirSync(dst, { recursive: true });
const files = fs.readdirSync(src).filter((f) => /\.(ttf|otf)$/i.test(f));
for (const f of files) fs.copyFileSync(path.join(src, f), path.join(dst, f));
if (process.platform !== 'darwin') { try { execFileSync('fc-cache', ['-f', dst], { stdio: 'ignore' }); } catch { console.log('  ! 没有 fc-cache，字体可能要重开 Chrome 才认'); } }
console.log(`✓ 装了 ${files.length} 个字体文件到 ${dst}`);
