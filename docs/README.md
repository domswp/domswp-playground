# GitHub Pages (domswp-playground)

Folder ini dipakai untuk hosting statis di GitHub Pages.

## Aktifkan (sekali saja)

1. Buka https://github.com/domswp/domswp-playground/settings/pages
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **main** · Folder: **/docs**
4. Save — tunggu 1–3 menit

## URL setelah aktif

- Hub: https://domswp.github.io/domswp-playground/
- Orbit Viewer: https://domswp.github.io/domswp-playground/threejs-orbit/

Portfolio utama (repo lain, tidak tertimpa):
https://domswp.github.io/profile-domswp/

## Update isi Orbit Viewer

Setelah ubah kode di `threejs-orbit/`:

```bash
cd threejs-orbit
npm run build:pages
rm -rf ../docs/threejs-orbit/*
cp -r dist/* ../docs/threejs-orbit/
git add docs/threejs-orbit
git commit -m "chore(pages): refresh orbit viewer build"
```

Atau merge PR yang menjalankan workflow `github-pages.yml` setelah Source diubah ke **GitHub Actions**.
