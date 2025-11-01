// scripts/validate-pr.mjs
// Node 20+（原生 fetch）— 無外部套件

import { readFileSync } from 'node:fs';

const MAX_SIZE = 100 * 1024; // 100 KB
const REQUIRE_INDEX_HTML = true;
const LIMIT_ONE_PNG = true;
const LIMIT_ONE_CSS = true;

// 收集錯誤訊息，而非立即退出
const errors = [];

function fail(msg) {
  console.error(`❌ ${msg}`);
  errors.push(msg);
}
function ok(msg) {
  console.log(`✅ ${msg}`);
}

const extOf = (p) => {
  const i = p.lastIndexOf('.');
  return i >= 0 ? p.slice(i + 1).toLowerCase() : '';
};
const isLowerRomanized = (s) => /^[a-z0-9-]+$/.test(s);
const isDate = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  return true;
};

const token = process.env.GITHUB_TOKEN;
const eventPath = process.env.GITHUB_EVENT_PATH;
if (!token) {
  console.error('❌ Missing GITHUB_TOKEN');
  process.exit(1);
}
if (!eventPath) {
  console.error('❌ Missing GITHUB_EVENT_PATH');
  process.exit(1);
}

const event = JSON.parse(readFileSync(eventPath, 'utf8'));
const pr = event.pull_request;
if (!pr?.number || !pr?.base?.repo?.full_name || !pr?.head?.repo?.full_name) {
  console.error('❌ Cannot read pull_request info (base/head repo).');
  process.exit(1);
}

const [baseOwner, baseRepo] = pr.base.repo.full_name.split('/');
const [headOwner, headRepo] = pr.head.repo.full_name.split('/');

async function gh(path, { ownerRepo = `${baseOwner}/${baseRepo}`, method = 'GET', headers = {}, body } = {}) {
  const url = `https://api.github.com/repos/${ownerRepo}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      ...headers,
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`❌ GitHub API error (${res.status} ${res.statusText}): ${url}\n${text}`);
    throw new Error(`GitHub API error: ${res.status}`);
  }
  return res.json();
}

(async () => {
  // 1) 取得 PR 變更檔案（自動分頁）
  const files = [];
  for (let page = 1; ; page++) {
    const batch = await gh(`/pulls/${pr.number}/files?per_page=100&page=${page}`);
    files.push(...batch);
    if (batch.length < 100) break;
  }
  if (files.length === 0) fail('偵測不到 PR 變更檔案。');

  // 2) 僅允許 students/ 路徑 + 僅允許 "新增"
  for (const f of files) {
    if (!f.filename.startsWith('students/')) {
      fail(`不允許變更非 students/ 路徑：${f.filename}`);
    }
    if (f.status !== 'added') {
      fail(`只允許新增檔案，偵測到 ${f.status}: ${f.filename}`);
    }
  }

  // 3) 限制路徑層級：students/<folder>/<file>（無子資料夾）
  const folderOf = (p) => {
    const parts = p.split('/');
    if (parts.length !== 3) return null;    // 有子資料夾或層級不符
    if (parts[0] !== 'students') return null;
    return parts[1];
  };

  const folders = new Set();
  for (const f of files) {
    const folder = folderOf(f.filename);
    if (!folder) {
      fail(`不允許子資料夾或錯誤層級：${f.filename}（僅允許 students/<folder>/<file>）`);
    }
    folders.add(folder);
  }
  if (folders.size !== 1) {
    fail(`一次 PR 只能新增一個個人資料夾；目前偵測到：${[...folders].join(', ')}`);
  }
  const folder = [...folders][0];

  // 4) 檢查 <folder> 命名：YYYY-MM-DD-romanized
  const parts = folder.split('-');
  if (parts.length < 4) {
    fail(`簽到資料夾需為 YYYY-MM-DD-羅馬拼音，例如 2025-10-03-liaoweichieh；收到：${folder}`);
  }
  const datePart = parts.slice(0, 3).join('-');
  const romanPart = parts.slice(3).join('-');
  if (!isDate(datePart)) {
    fail(`日期格式錯誤（YYYY-MM-DD）：${datePart}`);
  }
  if (!isLowerRomanized(romanPart)) {
    fail(`羅馬拼音僅允許小寫英數與連字號：${romanPart}`);
  }

  // 5) 精準檢查每個檔案大小（≤ 100 KB）
  //    使用「head repo」存取 blob，因為 PR 內容來自 head 分支
  for (const f of files) {
    // f.sha 是該檔案在 head 的 blob SHA
    if (!f.sha) {
      fail(`無法取得檔案 SHA：${f.filename}`);
    }
    const blob = await gh(`/git/blobs/${f.sha}`, { ownerRepo: `${headOwner}/${headRepo}` });
    // blob.size 為位元組數（未解碼）
    if (typeof blob.size !== 'number') {
      fail(`無法判定檔案大小：${f.filename}`);
    }
    if (blob.size > MAX_SIZE) {
      fail(`檔案過大：${f.filename} (${blob.size} bytes) 超過 100 KB 限制`);
    }
  }

  // 6) 檔名白名單：必須 index.html；可選 ≤1 png、≤1 css；其他一律拒絕
  const names = files
    .filter((f) => f.filename.startsWith(`students/${folder}/`))
    .map((f) => f.filename.split('/')[2]); // 只取檔名

  let hasIndex = false;
  let pngCount = 0;
  let cssCount = 0;

  for (const name of names) {
    if (name === 'index.html') {
      hasIndex = true;
      continue;
    }
    const ext = extOf(name);
    if (ext === 'png') {
      if (LIMIT_ONE_PNG && ++pngCount > 1) {
        fail(`最多允許 1 個 PNG（偵測到第 2 個）：${name}`);
      }
      continue;
    }
    if (ext === 'css') {
      if (LIMIT_ONE_CSS && ++cssCount > 1) {
        fail(`最多允許 1 個 CSS（偵測到第 2 個）：${name}`);
      }
      continue;
    }
    fail(`不允許的檔名或副檔名：${name}（僅允許 index.html，及可選 1 個 .png / 1 個 .css）`);
  }

  if (REQUIRE_INDEX_HTML && !hasIndex) {
    fail(`缺少必要檔案：students/${folder}/index.html`);
  }

  // 7) 額外保險：所有新增都必須屬於該單一資料夾
  for (const f of files) {
    if (!f.filename.startsWith(`students/${folder}/`)) {
      fail(`偵測到非目標資料夾的變更：${f.filename}`);
    }
  }

  // 8) 判斷檢核結果
  const hasErrors = errors.length > 0;

  if (!hasErrors) {
    ok(`檢核通過：僅新增資料夾 ${folder}，命名正確、檔案合規且皆 ≤ 100 KB 🎉`);
  }

  // 9) 在 PR 上留言顯示檢核結果（無論成功或失敗）
  await postPRComment({
    folder,
    fileCount: files.length,
    datePart,
    romanPart,
    pngCount,
    cssCount,
    hasIndex,
    errors: hasErrors ? errors : null
  });

  // 10) 根據結果決定 exit code
  if (hasErrors) {
    console.error(`\n❌ 檢核失敗，共 ${errors.length} 個錯誤`);
    process.exit(1);
  }
})();

async function postPRComment({ folder, fileCount, datePart, romanPart, pngCount, cssCount, hasIndex, errors }) {
  // 只在 PR 事件時留言
  if (process.env.GITHUB_EVENT_NAME !== 'pull_request') {
    console.log('ℹ️  非 PR 環境，跳過留言');
    return;
  }

  const prNumber = pr?.number;
  if (!prNumber) {
    console.log('⚠️  無法取得 PR 編號，跳過留言');
    return;
  }

  // 建立留言內容
  const lines = [];

  if (errors) {
    // 失敗情境的留言
    lines.push('## ❌ 簽到檢核失敗');
    lines.push('');
    lines.push('### 🚨 錯誤清單');
    lines.push('');
    errors.forEach((error, index) => {
      lines.push(`${index + 1}. ❌ ${error}`);
    });
    lines.push('');
    lines.push('### 📋 檢核詳情');
    lines.push('');
    lines.push('| 項目 | 結果 |');
    lines.push('|------|------|');
    if (folder) {
      lines.push(`| 資料夾名稱 | \`${folder}\` |`);
    }
    if (datePart) {
      lines.push(`| 日期格式 | ${datePart} ${isDate(datePart) ? '✅' : '❌'} |`);
    }
    if (romanPart) {
      lines.push(`| 羅馬拼音 | ${romanPart} ${isLowerRomanized(romanPart) ? '✅' : '❌'} |`);
    }
    lines.push(`| 檔案數量 | ${fileCount} 個 |`);
    lines.push(`| index.html | ${hasIndex ? '✅ 存在' : '❌ 缺少'} |`);
    lines.push(`| PNG 圖片 | ${pngCount} 個 ${pngCount <= 1 ? '✅' : '❌'} |`);
    lines.push(`| CSS 檔案 | ${cssCount} 個 ${cssCount <= 1 ? '✅' : '❌'} |`);
    lines.push('');
    lines.push('### 💡 解決方法');
    lines.push('');
    lines.push('請根據上方錯誤訊息修正後，重新推送到此分支。');
    lines.push('修正後 CI 會自動重新檢查。');
    lines.push('');
    lines.push('如有疑問，請參考 [README.md](../blob/main/README.md) 的常見問題部分。');
  } else {
    // 成功情境的留言
    lines.push('## ✅ 簽到檢核通過！');
    lines.push('');
    lines.push('### 📋 檢核結果');
    lines.push('');
    lines.push('| 項目 | 結果 |');
    lines.push('|------|------|');
    lines.push(`| 資料夾名稱 | \`${folder}\` |`);
    lines.push(`| 日期格式 | ${datePart} ✅ |`);
    lines.push(`| 羅馬拼音 | ${romanPart} ✅ |`);
    lines.push(`| 檔案數量 | ${fileCount} 個 |`);
    lines.push(`| index.html | ${hasIndex ? '✅ 存在' : '❌ 缺少'} |`);
    lines.push(`| PNG 圖片 | ${pngCount} 個 ✅ |`);
    lines.push(`| CSS 檔案 | ${cssCount} 個 ✅ |`);
    lines.push(`| 檔案大小 | 全部 ≤ 100 KB ✅ |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('*🤖 自動檢核 by 六角學院 Vibe Coding Camp*');

  const commentBody = lines.join('\n');

  try {
    await gh(`/issues/${prNumber}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: commentBody })
    });
    console.log(`✅ 已在 PR #${prNumber} 留言`);
  } catch (err) {
    console.error('❌ 留言失敗:', err.message);
    console.error('提示：請確認 GITHUB_TOKEN 權限包含 pull-requests: write');
  }
}