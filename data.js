/**
 * ================================================================
 *  İzmir Devlet Tiyatrosu - VERİ DOSYASI
 *  Bu dosyayı düzenleyerek oyun ve sanatçı bilgilerini güncelleyin.
 * ================================================================
 *
 *  OYUN KATEGORİLERİ:
 *    Oyuncu, Rejisör, Asistan, Sahne Amiri, Işıkçı, Ses, Kostüm
 *
 *  KATEGORİ RENKLERİ data.js dosyasında değiştirilebilir.
 * ================================================================
 */

window.TIYATRO_DATA = {

  /* ===========================================================
     OYUNLAR
     Her oyun için:
       ad       : Oyunun adı
       turne    : true/false  (Turneye gidiyor mu?)
       arsiv    : true/false  (Arşivde mi? - aktif listede çıkmaz)
       kadro    : Sanatçı listesi
                    kisi     : Ad Soyad (virgülle birden fazla olabilir)
                    kategori : Rolün kategorisi
                    rol      : Oyundaki rolü/karakteri
     =========================================================== */
  oyunlar: [
    {
      ad: "Örnek Oyun 1",
      turne: false,
      arsiv: false,
      kadro: [
        { kisi: "Ahmet Yılmaz", kategori: "Oyuncu", rol: "Baş Karakter" },
        { kisi: "Fatma Kaya", kategori: "Oyuncu", rol: "Yardımcı Karakter" },
        { kisi: "Mehmet Demir", kategori: "Rejisör", rol: "" },
        { kisi: "Ayşe Çelik", kategori: "Kostüm", rol: "" },
        { kisi: "Ali Öztürk", kategori: "Işıkçı", rol: "" }
      ]
    },
    {
      ad: "Örnek Oyun 2",
      turne: true,
      arsiv: false,
      kadro: [
        { kisi: "Can Arslan", kategori: "Oyuncu", rol: "Protagonist" },
        { kisi: "Zeynep Güler", kategori: "Oyuncu", rol: "Antagonist" },
        { kisi: "Burak Şahin", kategori: "Asistan", rol: "" },
        { kisi: "Selin Aydın", kategori: "Ses", rol: "" }
      ]
    },
    {
      ad: "Arşiv Oyun Örneği",
      turne: false,
      arsiv: true,
      kadro: [
        { kisi: "Hasan Polat", kategori: "Oyuncu", rol: "Kral" },
        { kisi: "Elif Yıldız", kategori: "Oyuncu", rol: "Kraliçe" }
      ]
    }
  ],

  /* ===========================================================
     TURNE VERİSİ
     turne listesine katılacakları ve detaylarını girin.
     Alanlar:
       oyun   : Oyunun adı
       kisi   : Katılacak sanatçı adı
       tarih  : Turne tarihi (opsiyonel)
       sehir  : Gidilecek şehir (opsiyonel)
       not    : Ekstra not (opsiyonel)
     =========================================================== */
  turne: [
    {
      oyun: "Örnek Oyun 2",
      kisi: "Can Arslan",
      tarih: "15.03.2025",
      sehir: "Ankara",
      not: ""
    },
    {
      oyun: "Örnek Oyun 2",
      kisi: "Zeynep Güler",
      tarih: "15.03.2025",
      sehir: "Ankara",
      not: ""
    }
  ],

  /* ===========================================================
     GÖREVLİ OLMAYAN SANATÇILAR
     Şu an aktif oyunda görev almayan sanatçılar
     =========================================================== */
  gorevliOlmayan: [
    { kisi: "Orhan Kılıç", neden: "İzinli", tarih: "2025" },
    { kisi: "Hatice Şen", neden: "Prova", tarih: "2025" }
  ]

};

/* ===========================================================
   KATEGORİ RENKLERİ - İstediğiniz gibi değiştirin
   =========================================================== */
window.KATEGORI_RENKLER = {
  "Oyuncu":       "badge-blue",
  "Rejisör":      "badge-purple",
  "Asistan":      "badge-green",
  "Sahne Amiri":  "badge-orange",
  "Işıkçı":       "badge-yellow",
  "Ses":          "badge-red",
  "Kostüm":       "badge-green",
  "Diğer":        "badge-blue"
};
