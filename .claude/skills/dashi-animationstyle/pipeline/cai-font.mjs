#!/usr/bin/env node
// cai-font.mjs：把 $SKILL/fonts/ 里的越南语 / 英语字体（都是 SIL OFL 开源字体）装到当前用户的字体文件夹。
//   macOS：~/Library/Fonts    Linux：~/.local/share/fonts/dashi（装完跑 fc-cache）
// 用法：node cai-font.mjs        装过的会覆盖，可以重复跑。
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
if (process.platform !== 'darwin') { try { execFileSync('fc-cache', ['-f', dst], { stdio: 'ignore' }); } catch { console.log('  ! Không có fc-cache, có thể phải mở lại Chrome thì font mới nhận'); } }
console.log(`✓ Đã cài ${files.length} file font vào ${dst}`);
