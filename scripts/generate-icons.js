const fs = require("fs");
const path = require("path");

// SVGベースのアイコンを生成
const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="40" fill="#2563eb"/>
  <text x="96" y="120" font-size="100" text-anchor="middle" fill="white" font-family="sans-serif">家</text>
</svg>`;

const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#2563eb"/>
  <text x="256" y="330" font-size="280" text-anchor="middle" fill="white" font-family="sans-serif">家</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, "../public/icon-192.svg"), svg192);
fs.writeFileSync(path.join(__dirname, "../public/icon-512.svg"), svg512);

console.log("SVGアイコンを生成しました");
console.log("注意: PNG変換はVercelのビルド時に自動的に処理されます");
