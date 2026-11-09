// Run against the local server. Set PLAYWRIGHT_MODULE if Playwright is not in node_modules.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:8137';
const out = path.resolve(process.env.QA_OUTPUT || 'artifacts/fix-2026-11-10');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(7000);
  const errors = [], results = [];
  page.on('pageerror', e => errors.push(e.message));
  const go = async file => { await page.goto(base + '/' + file, { waitUntil: 'domcontentloaded' }); };
  const test = async (name, fn) => {
    try { await fn(); results.push({ name, pass: true }); console.log('PASS', name); }
    catch (e) { results.push({ name, pass: false, error: e.message }); console.log('FAIL', name, e.message); }
  };
  const screenshot = async name => { await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true }); };
  await test('FAQ page opens and closes with keyboard', async () => {
    await go('faq.html'); const button = page.locator('.faq-toggle').nth(1);
    await button.focus(); await page.keyboard.press('Enter');
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('#faq-answer-2').isVisible(), true);
    await screenshot('faq-expanded'); await page.keyboard.press('Space');
    assert.equal(await page.locator('#faq-answer-2').isVisible(), false);
  });
  await test('Homepage FAQ and WhatsApp URL', async () => {
    await go('index.html'); await page.locator('.faq-toggle').nth(1).click();
    assert.equal(await page.locator('#faq-answer-2').isVisible(), true);
    assert.match(await page.getByRole('link', { name: 'Konsultasi via WhatsApp', exact: true }).getAttribute('href'), /^https:\/\/wa.me\/\d+$/);
    await page.locator('.menu a').filter({ hasText: /^Proses$/ }).click();
    assert.match(page.url(), /proses.html$/);
    await screenshot('proses-desktop');
  });
  await test('Desktop dropdown mouse path and keyboard Escape', async () => {
    await go('index.html'); const button = page.locator('.work-toggle'); await button.hover();
    const target = page.locator('#nav-work-links a').first(); const rect = await target.boundingBox();
    await page.mouse.move(rect.x + 25, rect.y + 12, { steps: 15 });
    assert.equal(await target.isVisible(), true);
    await button.focus(); await page.keyboard.press('Escape');
    assert.equal(await button.getAttribute('aria-expanded'), 'false');
    await page.keyboard.press('Enter'); assert.equal(await target.isVisible(), true);
  });
  await test('Mobile menu opens, dropdown works, navigation and Escape', async () => {
    await page.setViewportSize({ width: 390, height: 844 }); await go('index.html');
    const toggle = page.getByRole('button', { name: 'Buka menu', exact: true });
    await toggle.click(); assert.equal(await page.locator('#site-menu').isVisible(), true);
    await page.locator('.work-toggle').click(); assert.equal(await page.locator('#nav-work-links a').first().isVisible(), true);
    await screenshot('mobile-menu');
    await page.locator('#nav-work-links a').first().click(); assert.match(page.url(), /karya.html#apk$/);
    await page.locator('.nav-toggle').click(); await page.keyboard.press('Escape');
    assert.equal(await page.locator('#site-menu').isVisible(), false);
  });
  await test('No page overflow at 320, 390, 768 and 1440', async () => {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const file of ['index.html', 'faq.html', 'projects/kasirku.html', 'projects/smartcast.html']) {
        await go(file);
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        assert.ok(sw <= width + 1, `${file}: ${sw} > ${width}`);
      }
    }
  });
  await test('Jajan.in reset restores history, budget and switches', async () => {
    await go('projects/jajanin.html'); const history = await page.locator('#riwayat').innerText();
    await page.locator('.qbtn:not(.tgt)').first().click();
    await page.locator('.tab[data-v="target"]').click(); await page.locator('.tgt').last().click();
    await page.locator('.tab[data-v="profil"]').click(); const switches = await page.locator('.sw').evaluateAll(es => es.map(e => e.getAttribute('aria-pressed')));
    await page.locator('.sw').first().click(); await page.locator('#reset-demo').click();
    assert.deepEqual(await page.locator('.sw').evaluateAll(es => es.map(e => e.getAttribute('aria-pressed'))), switches);
    await page.locator('.tab[data-v="beranda"]').click();
    assert.equal(await page.locator('#saldo').innerText(), 'Rp 842.000');
    assert.equal(await page.locator('#riwayat').innerText(), history);
    await page.locator('.tab[data-v="target"]').click();
    assert.equal(await page.locator('#target-nominal').innerText(), 'Rp 2.000.000');
  });
  await test('GoKantin rapid add while cart feedback is showing', async () => {
    await go('projects/gokantin.html'); const start = errors.length;
    await page.locator('button.add').first().click(); await page.locator('#cart').click();
    await page.locator('button.add').first().click(); await page.locator('button.add').nth(1).click();
    assert.equal(await page.locator('#cartN').innerText(), '3');
    assert.equal(errors.length, start); await screenshot('gokantin-cart');
  });
  await test('Automasi rendering twice keeps exactly three hook lines', async () => {
    await go('projects/automasi-demo.html'); await page.locator('.tab').nth(1).click();
    for (let i = 0; i < 2; i++) {
      await page.locator('#ebtn').click(); await page.waitForFunction(() => !document.getElementById('ebtn').disabled);
      assert.equal(await page.locator('#ehook b').count(), 3);
    }
    await screenshot('automasi-second-render');
  });
  await test('KasirKu navigation, search, stock, CSV and settings', async () => {
    await go('projects/kasirku.html'); await page.locator('[data-view="transaksi"]').click();
    assert.equal(await page.locator('h1').innerText(), 'Transaksi');
    await page.locator('#demo-search').fill('INV-1284');
    assert.equal(await page.locator('#view-transaksi tbody tr:visible').count(), 1);
    await page.locator('#demo-search').fill('');
    await page.locator('[data-view="stok"]').click();
    await page.getByRole('button', { name: 'Tambah stok Americano Dingin', exact: true }).click();
    assert.equal(await page.locator('#view-stok tbody tr').first().locator('td').nth(1).innerText(), '33');
    await page.locator('[data-view="produk"]').click();
    assert.equal(await page.locator('#view-produk tbody tr').first().locator('td').nth(2).innerText(), '33 item');
    await page.locator('[data-view="laporan"]').click();
    const downloadEvent = page.waitForEvent('download'); await page.getByRole('button', { name: 'Unduh CSV contoh' }).click();
    const download = await downloadEvent; assert.equal(download.suggestedFilename(), 'kasirku-transaksi-contoh.csv');
    await download.saveAs(path.join(out, download.suggestedFilename()));
    assert.match(fs.readFileSync(path.join(out, download.suggestedFilename()), 'utf8'), /INV-1284/);
    await page.locator('[data-view="pengaturan"]').click();
    await page.getByRole('textbox', { name: 'Nama toko demo' }).fill('Toko Uji');
    await page.getByRole('button', { name: 'Simpan selama sesi ini' }).click();
    assert.equal(await page.locator('.brand').innerText(), 'Toko Uji');
  });
  await test('SmartCast plays real demo audio and pauses', async () => {
    await go('projects/smartcast.html'); await page.locator('#playHero').click();
    await page.waitForFunction(() => document.getElementById('demo-audio').currentTime > 0.1);
    assert.equal(await page.locator('#demo-audio').evaluate(e => e.paused), false);
    await page.locator('#playBtn').click(); assert.equal(await page.locator('#demo-audio').evaluate(e => e.paused), true);
  });
  await test('ScrapPulse demo video has decodable metadata', async () => {
    await go('projects/scrap.html');
    await page.waitForFunction(() => { const v = document.querySelector('video'); return v && v.readyState >= 1 && v.duration > 0; });
    assert.equal(await page.locator('video').evaluate(e => e.error), null);
  });
  await test('All 16 mobile demo tabs still work', async () => {
    for (const file of ['jajanin', 'gymkuy', 'fokusin', 'racunin']) {
      await go('projects/' + file + '.html');
      for (const tab of await page.locator('.tabbar .tab').all()) {
        const view = await tab.getAttribute('data-v'); await tab.click();
        assert.equal(await page.locator('#v-' + view).isVisible(), true);
      }
    }
  });
  await test('No uncaught browser errors during regressions', async () => { assert.deepEqual(errors, []); });
  fs.writeFileSync(path.join(out, 'regression.json'), JSON.stringify({ results, errors }, null, 2));
  await browser.close(); if (results.some(r => !r.pass)) process.exitCode = 1;
})();
