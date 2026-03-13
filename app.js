/**
 * ================================================================
 *  İzmir Devlet Tiyatrosu - Ana Uygulama
 *
 *  Dahili sayfalar: home, oyunlar (detay), arsiv-oyunlar, gorevli-olmayan
 *  Harici dosyalar: turne.html, turne_mobil.html, yonetici.html
 *    (Bu dosyalar bağımsız çalışır, buradan müdahale edilmez.)
 * ================================================================
 */

/* ----------------------------------------------------------------
   ŞİFRE AYARI
   Varsayılan şifre: 525327
   Değiştirmek için localStorage'da "idt_pin" anahtarına bakılır.
   ---------------------------------------------------------------- */
const AUTH_KEY   = 'idt_auth';   // session storage: giriş durumu
const PIN_KEY    = 'idt_pin';    // local storage:   pin kodu
const DEFAULT_PIN = '525327';

/* Şifreli sayfalar (harici değil, iç sayfalar) */
const PROTECTED_PAGES = ['arsiv-oyunlar', 'gorevli-olmayan'];

/* ================================================================
   YARDIMCI FONKSİYONLAR
   ================================================================ */
function getPin()   { return localStorage.getItem(PIN_KEY) || DEFAULT_PIN; }
function isAuth()   { return sessionStorage.getItem(AUTH_KEY) === '1'; }
function setAuth()  { sessionStorage.setItem(AUTH_KEY, '1'); }

function el(id) { return document.getElementById(id); }

function kategoriSinif(kategori) {
  const MAP = {
    'Oyuncu'      : 'badge-blue',
    'Rejisör'     : 'badge-purple',
    'Asistan'     : 'badge-green',
    'Sahne Amiri' : 'badge-orange',
    'Işıkçı'      : 'badge-yellow',
    'Ses'         : 'badge-red',
    'Kostüm'      : 'badge-green',
  };
  return (window.KATEGORI_RENKLER && window.KATEGORI_RENKLER[kategori])
    || MAP[kategori]
    || 'badge-blue';
}

/* ================================================================
   AUTH OVERLAY
   ================================================================ */
function setupAuth(targetPage) {
  const overlay   = el('auth-overlay');
  const inp       = el('auth-input');
  const errDiv    = el('auth-error');
  const btn       = el('auth-btn');
  const homeBtn   = el('auth-home-btn');
  const changeBtn = el('auth-change-btn');
  const changeDiv = el('auth-change-form');
  const oldInp    = el('auth-old-input');
  const newInp    = el('auth-new-input');
  const changeMsg = el('auth-change-msg');
  const saveBtn   = el('auth-save-btn');

  overlay.classList.remove('hidden');
  setTimeout(() => inp.focus(), 50);

  function tryLogin() {
    if (inp.value === getPin()) {
      setAuth();
      overlay.classList.add('hidden');
      renderPage(targetPage);
    } else {
      inp.style.borderColor = '#e05c5c';
      errDiv.textContent = 'Hatalı şifre!';
      errDiv.style.color = '#e05c5c';
      setTimeout(() => {
        inp.style.borderColor = '';
        errDiv.textContent = '';
      }, 2000);
    }
  }

  btn.onclick = tryLogin;
  inp.onkeydown = (e) => { if (e.key === 'Enter') tryLogin(); };

  homeBtn.onclick = () => {
    overlay.classList.add('hidden');
    renderPage('home');
  };

  changeBtn.onclick = () => {
    const open = changeDiv.classList.toggle('hidden');
    changeMsg.textContent = '';
  };

  saveBtn.onclick = () => {
    const op = (oldInp.value || '').trim();
    const np = (newInp.value || '').trim();
    if (op !== getPin()) {
      changeMsg.style.color = '#e05c5c';
      changeMsg.textContent = 'Mevcut şifre yanlış!';
      setTimeout(() => { changeMsg.textContent = ''; }, 2000);
      return;
    }
    if (np.length < 4) {
      changeMsg.style.color = '#e05c5c';
      changeMsg.textContent = 'Yeni şifre en az 4 karakter olmalı!';
      setTimeout(() => { changeMsg.textContent = ''; }, 2000);
      return;
    }
    localStorage.setItem(PIN_KEY, np);
    oldInp.value = '';
    newInp.value = '';
    changeMsg.style.color = '#4ade80';
    changeMsg.textContent = 'Şifre değiştirildi!';
    setTimeout(() => { changeMsg.textContent = ''; }, 2500);
  };
}

/* ================================================================
   SAYFA ROUTER
   ================================================================ */
let currentPage = 'home';
let currentOyun = null;

function renderPage(page, params) {
  /* Şifreli sayfa kontrolü */
  if (PROTECTED_PAGES.includes(page) && !isAuth()) {
    setupAuth(page);
    return;
  }

  currentPage = page;
  el('auth-overlay').classList.add('hidden');

  const tpl = document.getElementById('tpl-' + page);
  if (!tpl) return;

  const container = el('page-container');
  container.innerHTML = '';
  container.appendChild(tpl.content.cloneNode(true));

  /* Delegasyon: data-page butonları ve back butonları */
  container.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => renderPage(btn.dataset.page));
  });

  /* Sayfaya özgü render */
  if (page === 'home')             renderHome();
  if (page === 'oyunlar')          renderOyunDetay(params);
  if (page === 'arsiv-oyunlar')    renderArsiv();
  if (page === 'gorevli-olmayan')  renderGorevliOlmayan();
}

/* ================================================================
   ANA SAYFA
   ================================================================ */
function renderHome() {
  const data = window.TIYATRO_DATA || {};
  const oyunlar = (data.oyunlar || []).filter(o => !o.arsiv);

  /* İstatistikler */
  const kisiler = new Set();
  let toplamKayit = 0;
  oyunlar.forEach(o => {
    (o.kadro || []).forEach(k => {
      toplamKayit++;
      k.kisi.split(',').forEach(p => kisiler.add(p.trim()));
    });
  });
  const turneOyunlar = oyunlar.filter(o => o.turne);

  el('val-oyunlar').textContent = oyunlar.length;
  el('val-kisi').textContent    = kisiler.size;
  el('val-kayit').textContent   = toplamKayit;
  el('val-turne').textContent   = turneOyunlar.length;

  /* Arama */
  const searchInp = el('search-oyun');
  searchInp.addEventListener('input', () => listeleOyunlar(oyunlar, searchInp.value));
  listeleOyunlar(oyunlar, '');
}

function listeleOyunlar(oyunlar, filtre) {
  const listEl = el('oyun-listesi');
  if (!listEl) return;

  const f = filtre.trim().toLowerCase();
  const filtreli = f
    ? oyunlar.filter(o =>
        o.ad.toLowerCase().includes(f) ||
        (o.kadro || []).some(k => k.kisi.toLowerCase().includes(f))
      )
    : oyunlar;

  if (filtreli.length === 0) {
    listEl.innerHTML = '<div class="bos-durum"><div class="bos-durum-icon">🔍</div><p>Sonuç bulunamadı.</p></div>';
    return;
  }

  listEl.innerHTML = filtreli.map(oyun => {
    const kadroBadge = oyun.turne
      ? '<span class="oyun-badge badge-turne">🚌 Turne</span>'
      : '';
    const kayitSayisi = (oyun.kadro || []).length;
    return `
      <div class="oyun-kart" data-oyun="${escHtml(oyun.ad)}">
        <div class="oyun-kart-baslik">${escHtml(oyun.ad)}</div>
        <div class="oyun-kart-meta">
          ${kadroBadge}
          <span class="oyun-badge badge-blue">${kayitSayisi} kayıt</span>
        </div>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.oyun-kart').forEach(kart => {
    kart.addEventListener('click', () => {
      renderPage('oyunlar', { oyunAd: kart.dataset.oyun });
    });
  });
}

/* ================================================================
   OYUN DETAY SAYFASI
   ================================================================ */
function renderOyunDetay(params) {
  const data   = window.TIYATRO_DATA || {};
  const oyunAd = params && params.oyunAd;
  const oyun   = (data.oyunlar || []).find(o => o.ad === oyunAd);

  if (!oyun) {
    el('oyunlar-icerik').innerHTML = '<div class="bos-durum"><p>Oyun bulunamadı.</p></div>';
    return;
  }

  const baslikEl = el('oyun-detay-ad');
  if (baslikEl) baslikEl.textContent = oyun.ad;

  const searchInp = el('search-kisi');
  searchInp.addEventListener('input', () =>
    listeleKadro(oyun.kadro || [], searchInp.value)
  );
  listeleKadro(oyun.kadro || [], '');
}

function listeleKadro(kadro, filtre) {
  const icerikEl = el('oyunlar-icerik');
  if (!icerikEl) return;

  const f = filtre.trim().toLowerCase();
  const filtreli = f
    ? kadro.filter(k => k.kisi.toLowerCase().includes(f) || (k.rol || '').toLowerCase().includes(f))
    : kadro;

  if (filtreli.length === 0) {
    icerikEl.innerHTML = '<div class="bos-durum"><div class="bos-durum-icon">🔍</div><p>Sonuç bulunamadı.</p></div>';
    return;
  }

  /* Kategoriye göre grupla */
  const gruplar = {};
  filtreli.forEach(k => {
    const kat = k.kategori || 'Diğer';
    if (!gruplar[kat]) gruplar[kat] = [];
    gruplar[kat].push(k);
  });

  icerikEl.innerHTML = Object.entries(gruplar).map(([kat, items]) => `
    <div class="kategori-grup">
      <div class="kategori-baslik">
        <span class="oyun-badge ${kategoriSinif(kat)}">${escHtml(kat)}</span>
        <span>${items.length} kayıt</span>
      </div>
      <div class="kayit-items">
        ${items.map(k => `
          <div class="kayit-item">
            <span class="kayit-kisi">${escHtml(k.kisi)}</span>
            ${k.rol ? `<span class="kayit-rol">${escHtml(k.rol)}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/* ================================================================
   ARŞİV SAYFASI
   ================================================================ */
function renderArsiv() {
  const data    = window.TIYATRO_DATA || {};
  const arsivEl = el('arsiv-icerik');
  const arsiv   = (data.oyunlar || []).filter(o => o.arsiv);

  const searchInp = el('search-arsiv');
  searchInp.addEventListener('input', () => listeleArsiv(arsiv, searchInp.value));
  listeleArsiv(arsiv, '');
}

function listeleArsiv(arsiv, filtre) {
  const arsivEl = el('arsiv-icerik');
  if (!arsivEl) return;

  const f = filtre.trim().toLowerCase();
  const filtreli = f
    ? arsiv.filter(o => o.ad.toLowerCase().includes(f))
    : arsiv;

  if (filtreli.length === 0) {
    arsivEl.innerHTML = '<div class="bos-durum"><div class="bos-durum-icon">📁</div><p>Arşivde oyun bulunmuyor.</p></div>';
    return;
  }

  arsivEl.innerHTML = filtreli.map(oyun => `
    <div class="oyun-kart" data-oyun="${escHtml(oyun.ad)}">
      <div class="oyun-kart-baslik">${escHtml(oyun.ad)}</div>
      <div class="oyun-kart-meta">
        <span class="oyun-badge badge-orange">📁 Arşiv</span>
        <span class="oyun-badge badge-blue">${(oyun.kadro || []).length} kayıt</span>
      </div>
    </div>
  `).join('');

  arsivEl.querySelectorAll('.oyun-kart').forEach(kart => {
    kart.addEventListener('click', () => {
      renderPage('oyunlar', { oyunAd: kart.dataset.oyun });
    });
  });
}

/* ================================================================
   GÖREVLİ OLMAYAN SAYFASI
   ================================================================ */
function renderGorevliOlmayan() {
  const data    = window.TIYATRO_DATA || {};
  const liste   = data.gorevliOlmayan || [];
  const icerikEl = el('gorevli-olmayan-icerik');
  if (!icerikEl) return;

  if (liste.length === 0) {
    icerikEl.innerHTML = '<div class="bos-durum"><div class="bos-durum-icon">✅</div><p>Görevsiz sanatçı bulunmuyor.</p></div>';
    return;
  }

  icerikEl.innerHTML = `
    <div class="kategori-grup">
      <div class="kategori-baslik">
        <span class="oyun-badge badge-red">🚫 Görevsiz</span>
        <span>${liste.length} sanatçı</span>
      </div>
      <div class="kayit-items">
        ${liste.map(s => `
          <div class="kayit-item">
            <span class="kayit-kisi">${escHtml(s.kisi)}</span>
            ${s.neden ? `<span class="kayit-rol">${escHtml(s.neden)}</span>` : ''}
            ${s.tarih ? `<span class="kayit-rol">${escHtml(s.tarih)}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ================================================================
   YARDIMCI: HTML Escape
   ================================================================ */
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ================================================================
   BAŞLAT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderPage('home');
});
