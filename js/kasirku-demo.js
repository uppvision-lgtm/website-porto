(function () {
  'use strict';
  var dashboard = document.getElementById('view-dashboard');
  var transactionTable = dashboard.querySelector('table').cloneNode(true);
  var products = [
    { name: 'Americano Dingin', price: 20000, stock: 32 },
    { name: 'Nasi Goreng Gila', price: 18000, stock: 18 },
    { name: 'Croissant Butter', price: 28000, stock: 12 },
    { name: 'Es Teh Manis', price: 7000, stock: 45 },
    { name: 'Kopi Susu Senja', price: 22000, stock: 24 }
  ];
  var links = Array.from(document.querySelectorAll('[data-view]'));
  var search = document.getElementById('demo-search');
  var status = document.getElementById('search-status');
  var active = 'dashboard';
  function money(n) { return 'Rp ' + n.toLocaleString('id-ID'); }
  function node(tag, text) { var el = document.createElement(tag); if (text !== undefined) el.textContent = text; return el; }
  function panel(view, title) {
    var el = node('section'); el.className = 'panel'; el.appendChild(node('h2', title));
    document.getElementById('view-' + view).appendChild(el); return el;
  }
  panel('transaksi', 'Transaksi contoh').appendChild(transactionTable);
  var productPanel = panel('produk', 'Katalog produk contoh');
  var stockPanel = panel('stok', 'Stok contoh — perubahan hanya selama halaman ini dibuka');
  function productTable(parent, edit) {
    var table = node('table'), head = node('thead'), row = node('tr'), body = node('tbody');
    ['Produk', edit ? 'Stok' : 'Harga', edit ? 'Ubah stok' : 'Tersedia'].forEach(function (s) { row.appendChild(node('th', s)); });
    head.appendChild(row); table.append(head, body); parent.appendChild(table);
    products.forEach(function (product) {
      var tr = node('tr'); tr.append(node('td', product.name), node('td', edit ? product.stock : money(product.price)));
      var cell = node('td');
      if (edit) {
        [-1, 1].forEach(function (delta) {
          var button = node('button', delta < 0 ? '−' : '+'); button.type = 'button'; button.className = 'demo-button';
          button.setAttribute('aria-label', (delta < 0 ? 'Kurangi' : 'Tambah') + ' stok ' + product.name);
          button.disabled = delta < 0 && product.stock === 0;
          button.addEventListener('click', function () {
            product.stock = Math.max(0, product.stock + delta);
            refreshProducts();
            var updated = stockPanel.querySelector('[aria-label="' + button.getAttribute('aria-label') + '"]');
            if (updated && !updated.disabled) updated.focus();
          });
          cell.appendChild(button); cell.appendChild(document.createTextNode(' '));
        });
      } else cell.textContent = product.stock + ' item';
      tr.appendChild(cell); body.appendChild(tr);
    });
  }
  function refreshProducts() {
    [productPanel, stockPanel].forEach(function (el) { var old = el.querySelector('table'); if (old) old.remove(); });
    productTable(productPanel, false); productTable(stockPanel, true); filter();
  }
  var report = panel('laporan', 'Ringkasan lima transaksi contoh');
  report.appendChild(node('p', 'Total Rp 211.500 · 5 transaksi · bukan laporan bisnis nyata.'));
  var download = node('button', 'Unduh CSV contoh'); download.type = 'button'; download.className = 'demo-button';
  download.addEventListener('click', function () {
    var rows = Array.from(transactionTable.querySelectorAll('tr')).map(function (tr) {
      return Array.from(tr.cells).map(function (td) { return '"' + td.textContent.replace(/"/g, '""') + '"'; }).join(',');
    });
    var url = URL.createObjectURL(new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    var anchor = node('a'); anchor.href = url; anchor.download = 'kasirku-transaksi-contoh.csv'; anchor.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }); report.appendChild(download);
  var settings = panel('pengaturan', 'Pengaturan toko demo');
  var form = node('form'), label = node('label', 'Nama toko demo'), input = node('input');
  label.className = 'setting-label'; input.value = 'KasirKu'; input.required = true; input.maxLength = 40; input.name = 'shop'; label.appendChild(input);
  var save = node('button', 'Simpan selama sesi ini'); save.className = 'demo-button'; save.type = 'submit';
  var feedback = node('p'); feedback.setAttribute('role', 'status');
  form.append(label, save, feedback); settings.appendChild(form);
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var name = input.value.trim();
    if (!name) { input.setCustomValidity('Isi nama toko.'); input.reportValidity(); return; }
    document.querySelector('.brand').textContent = name; feedback.textContent = 'Nama toko diperbarui. Muat ulang untuk kembali ke data awal.';
  }); input.addEventListener('input', function () { input.setCustomValidity(''); });
  function filter() {
    var query = search.value.trim().toLocaleLowerCase('id-ID');
    var current = document.getElementById('view-' + active), rows = Array.from(current.querySelectorAll('tbody tr'));
    var found = 0;
    rows.forEach(function (tr) { var match = tr.textContent.toLocaleLowerCase('id-ID').includes(query); tr.hidden = !match; if (match) found++; });
    status.hidden = !query;
    status.textContent = rows.length ? (found ? found + ' baris cocok dengan pencarian.' : 'Tidak ada produk atau transaksi yang cocok.') : 'Pencarian tersedia di Dashboard, Transaksi, Produk, dan Stok.';
  }
  function show(view) {
    if (!links.some(function (a) { return a.dataset.view === view; })) view = 'dashboard';
    active = view;
    document.querySelectorAll('.demo-view').forEach(function (el) { el.hidden = el.id !== 'view-' + view; });
    links.forEach(function (a) { var on = a.dataset.view === view; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.querySelector('h1').textContent = view.charAt(0).toUpperCase() + view.slice(1);
    filter();
  }
  links.forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); history.pushState(null, '', a.hash); show(a.dataset.view); }); });
  window.addEventListener('popstate', function () { show(location.hash.slice(1)); });
  search.addEventListener('input', filter); refreshProducts(); show(location.hash.slice(1));
})();
