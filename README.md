# Studio Parama — Landing Page

Landing page statis untuk **Studio Parama**, studio kreatif yang mengerjakan yearbook, graduation, apparel, dan printing untuk angkatan sekolah/kampus.

Dibuat dengan HTML, CSS, dan JavaScript murni (tanpa framework, tanpa build step).

## Struktur

```
.
├── index.html            # Satu halaman: Hero, Karya, Layanan, Proses, Kontak, Footer
└── assets/
    ├── css/style.css     # Seluruh styling (responsive, tema gelap di bagian Kontak)
    ├── js/script.js      # Loader, menu fullscreen, rotasi kata hero, animasi reveal
    ├── fonts/            # Plus Jakarta Sans (latin, woff2)
    └── images/           # Foto karya (work-01..03.jpg) dan YEARBOOK.gif
```

## Menjalankan

Buka `index.html` langsung di browser, atau jalankan server lokal:

```bash
npx serve .
# atau
python -m http.server 8000
```

## Catatan Desain

- **Font:** Plus Jakarta Sans (dimuat dari Google Fonts, file woff2 lokal tersedia di `assets/fonts/`)
- **Bahasa:** Indonesia (`lang="id"`)
- **Section:** Hero dengan kata berputar → Karya (grid 2 kolom selang-seling besar/kecil) → Layanan → Proses (4 langkah) → Kontak (tema gelap) → Footer
- **Aksesibilitas:** menghormati `prefers-reduced-motion`, ARIA pada menu dan navigasi

## Hak Cipta

© Studio Parama. Seluruh hak dilindungi. Foto, logo, dan teks adalah milik Studio Parama dan dibagikan di sini hanya sebagai referensi desain.
