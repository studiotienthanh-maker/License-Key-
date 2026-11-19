'use strict';
const http = require('node:http');
const crypto = require('node:crypto');

const html = "<!doctype html>\n<html lang=\"vi\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'\">\n  <meta name=\"theme-color\" content=\"#101a24\">\n  <title>Tạo License Key | Tiến Adobe 5.0</title>\n  <style>\n    * { box-sizing: border-box; }\n    body { margin: 0; background: #101a24; color: #eaf2f6; font: 16px/1.5 system-ui, sans-serif; }\n    main { max-width: 920px; margin: auto; padding: clamp(20px, 5vw, 56px) clamp(14px, 4vw, 30px); }\n    header p { color: #86dcca; margin: 0; font-weight: 650; }\n    h1 { font-size: clamp(30px, 6vw, 48px); margin: 4px 0 22px; line-height: 1.12; }\n    h2 { font-size: 20px; margin: 0 0 16px; }\n    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; }\n    .panel { min-width: 0; padding: clamp(16px, 3vw, 24px); border: 1px solid #354856; border-radius: 16px; background: #192735; }\n    fieldset { margin: 0; padding: 0; border: 0; min-width: 0; }\n    label { display: block; font-weight: 650; margin: 14px 0 6px; }\n    label:first-child { margin-top: 0; }\n    input, select, textarea, button { width: 100%; min-height: 48px; border-radius: 9px; font: inherit; }\n    input, select, textarea { background: #101a24; color: inherit; border: 1px solid #516474; padding: 10px 12px; color-scheme: dark; }\n    textarea { min-height: 112px; resize: vertical; overflow-wrap: anywhere; }\n    button { padding: 9px 12px; border: 1px solid #536b79; background: #253c49; color: #eaf2f6; cursor: pointer; font-weight: 700; }\n    button:disabled { opacity: .55; cursor: default; }\n    #generate { margin-top: 18px; background: #8ce3cb; color: #10271f; border-color: transparent; }\n    :focus-visible { outline: 2px solid #98efdc; outline-offset: 2px; }\n    .hint, dt { color: #becdd6; font-size: .875rem; }\n    .hint { margin: 6px 0 0; }\n    .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }\n    #status { color: #ffdfa4; margin: 12px 0 0; }\n    #status:empty { display: none; }\n    dl { display: grid; gap: 8px; margin: 14px 0 0; padding-top: 14px; border-top: 1px solid #354856; }\n    dl div { display: flex; justify-content: space-between; gap: 10px; }\n    dd { margin: 0; text-align: right; }\n    @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } }\n  </style>\n</head>\n<body>\n  <main>\n    <header>\n      <p>Ảnh Hồ Sơ AI Tiến Adobe 5.0</p>\n      <h1>Tạo License Key</h1>\n    </header>\n    <div class=\"layout\">\n      <form class=\"panel\" id=\"license-form\">\n        <h2>Thông tin cấp phép</h2>\n        <fieldset id=\"inputs\">\n          <label for=\"device\">Mã máy của khách (Device ID)</label>\n          <input id=\"device\" autocomplete=\"off\" autocapitalize=\"characters\" spellcheck=\"false\" placeholder=\"Dán mã 32 ký tự từ phần mềm Windows\" required>\n          <label for=\"customer\">Tên khách hàng</label>\n          <input id=\"customer\" autocomplete=\"off\" maxlength=\"100\" required>\n          <label for=\"days\">Thời hạn sử dụng</label>\n          <select id=\"days\">\n            <option value=\"7\">7 ngày</option>\n            <option value=\"30\">30 ngày</option>\n            <option value=\"90\">90 ngày</option>\n            <option value=\"180\">180 ngày</option>\n            <option value=\"365\" selected>365 ngày</option>\n            <option value=\"forever\">Vĩnh viễn</option>\n          </select>\n        </fieldset>\n        <button id=\"generate\" type=\"submit\">Tạo License Key</button>\n      </form>\n      <section class=\"panel\" aria-labelledby=\"output-heading\">\n        <h2 id=\"output-heading\">License Key đã tạo</h2>\n        <textarea id=\"key\" aria-labelledby=\"output-heading\" readonly spellcheck=\"false\" placeholder=\"Key sẽ xuất hiện tại đây\"></textarea>\n        <div class=\"actions\">\n          <button id=\"copy\" type=\"button\" disabled>Sao chép key</button>\n          <button id=\"save\" type=\"button\" disabled>Tải tệp TXT</button>\n        </div>\n        <p id=\"status\" role=\"status\"></p>\n        <dl>\n          <div><dt>Ngày cấp</dt><dd id=\"start\">—</dd></div>\n          <div><dt>Hết hạn</dt><dd id=\"expiry\">—</dd></div>\n        </dl>\n      </section>\n    </div>\n  </main>\n  <script>\nconst $ = id => document.getElementById(id);\nconst date = value => new Intl.DateTimeFormat('vi-VN', {\n  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh'\n}).format(value);\nfunction clearLicense() {\n  $('key').value = '';\n  $('copy').disabled = true;\n  $('save').disabled = true;\n  $('status').textContent = '';\n  $('start').textContent = '—';\n  $('expiry').textContent = '—';\n}\n\nfor (const id of ['device', 'customer', 'days']) {\n  $(id).addEventListener('input', clearLicense);\n}\n\n$('license-form').addEventListener('submit', async event => {\n  event.preventDefault();\n  clearLicense();\n  const device = $('device').value.trim().toUpperCase();\n  const customer = $('customer').value.trim();\n  const term = $('days').value;\n  if (!/^[0-9A-F]{32}$/.test(device)) {\n    $('status').textContent = 'Mã máy phải có 32 ký tự HEX (0–9, A–F). Hãy sao chép mã máy từ phần mềm Windows.';\n    return;\n  }\n  if (!customer) {\n    $('status').textContent = 'Vui lòng nhập tên khách hàng.';\n    return;\n  }\n  $('generate').disabled = true;\n  $('inputs').disabled = true;\n  try {\n    const response = await fetch('/api/license', {\n      method: 'POST',\n      headers: {'Content-Type': 'application/json'},\n      body: JSON.stringify({device, customer, term})\n    });\n    const result = await response.json();\n    if (!response.ok) {\n      $('status').textContent = result.error || 'Chưa thể tạo License Key.';\n      return;\n    }\n    $('key').value = result.token;\n    $('start').textContent = date(new Date(result.issuedAt));\n    $('expiry').textContent = result.expiresAt === null ? 'Vĩnh viễn' : date(new Date(result.expiresAt));\n    $('copy').disabled = false;\n    $('save').disabled = false;\n    $('status').textContent = 'Đã tạo License Key cho ' + customer + '.';\n  } catch {\n    $('status').textContent = 'Không kết nối được với trang cấp key. Hãy tải lại trang và thử lại.';\n  } finally {\n    $('generate').disabled = false;\n    $('inputs').disabled = false;\n  }\n});\n$('copy').addEventListener('click', async () => {\n  const key = $('key');\n  if (!key.value) return;\n  try {\n    await navigator.clipboard.writeText(key.value);\n    $('status').textContent = 'Đã sao chép License Key.';\n  } catch {\n    key.focus();\n    key.select();\n    $('status').textContent = 'Đã chọn toàn bộ key. Hãy dùng lệnh Sao chép của thiết bị.';\n  }\n});\n\n$('save').addEventListener('click', () => {\n  const token = $('key').value;\n  if (!token) return;\n  const blob = new Blob([token], {type: 'text/plain;charset=utf-8'});\n  const url = URL.createObjectURL(blob);\n  const link = document.createElement('a');\n  link.href = url;\n  link.download = 'Tien-Adobe-License.txt';\n  link.click();\n  setTimeout(() => URL.revokeObjectURL(url), 1000);\n});\n</script>\n</body>\n</html>\n";
const der = 'MCowBQYDK2VwAyEAnOGc5fPWuIhPk71tKCP/fXjsNVFYP5lXPW/mounBf7E=';
const signingKey = crypto.createPrivateKey(Buffer.from(process.env.LICENSE_SIGNING_KEY || '', 'base64'));
if (crypto.createPublicKey(signingKey).export({type:'spki',format:'der'}).toString('base64') !== der) {
  throw new Error('Signing key does not match Windows 5.0');
}
const password = process.env.LICENSE_ADMIN_PASSWORD;
if (!password || password.length < 28) throw new Error('Missing administrator password');
const digest = value => crypto.createHash('sha256').update(value).digest();
const expected = digest('Basic ' + Buffer.from('admin:' + password).toString('base64'));
const origin = process.env.RENDER_EXTERNAL_URL || 'http://localhost:' + (process.env.PORT || 3000);
const terms = new Map([['7',7], ['30',30], ['90',90], ['180',180], ['365',365], ['forever',null]]);

function json(response, status, data) {
  response.writeHead(status, {'Content-Type':'application/json; charset=utf-8'});
  response.end(JSON.stringify(data));
}

async function issue(request, response) {
  if (request.headers.origin !== origin || request.headers['content-type'] !== 'application/json') {
    json(response, 403, {error:'Yêu cầu không hợp lệ.'});
    return;
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 2048) {
      json(response, 413, {error:'Dữ liệu vượt quá giới hạn.'});
      return;
    }
    chunks.push(chunk);
  }
  let data;
  try { data = JSON.parse(Buffer.concat(chunks)); } catch {
    json(response, 400, {error:'Dữ liệu không hợp lệ.'});
    return;
  }
  const device = typeof data?.device === 'string' ? data.device.trim().toUpperCase() : '';
  const customer = typeof data?.customer === 'string' ? data.customer.trim() : '';
  if (!/^[0-9A-F]{32}$/.test(device) || !customer || customer.length > 100 || !terms.has(data?.term)) {
    json(response, 400, {error:'Hãy kiểm tra mã máy 32 ký tự, tên khách và thời hạn.'});
    return;
  }
  const days = terms.get(data.term);
  const issuedAt = Date.now();
  const expiresAt = days === null ? null : issuedAt + days * 86400000;
  const payload = {product:'anh-ho-so-ai-5.0', device, issuedAt, expiresAt, licenseId:crypto.randomUUID(), customer};
  const message = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.sign(null, Buffer.from(message), signingKey).toString('base64url');
  json(response, 200, {token:message + '.' + signature, issuedAt, expiresAt});
}

http.createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'no-referrer');
  if (!crypto.timingSafeEqual(digest(request.headers.authorization || ''), expected)) {
    response.setHeader('WWW-Authenticate', 'Basic realm="Tien Adobe License", charset="UTF-8"');
    json(response, 401, {error:'Cần đăng nhập quản trị viên.'});
    return;
  }
  if (request.method === 'GET' && request.url === '/') {
    response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
    response.end(html);
    return;
  }
  if (request.method === 'POST' && request.url === '/api/license') {
    try { await issue(request, response); } catch {
      if (!response.headersSent) json(response, 500, {error:'Không thể tạo License Key.'});
    }
    return;
  }
  json(response, 404, {error:'Không tìm thấy trang.'});
}).listen(Number(process.env.PORT || 3000), '0.0.0.0');
