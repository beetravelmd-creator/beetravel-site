# beetravel.md

Site-ul BEE TRAVEL (Astro, găzduit pe Netlify).

- **Administrare:** https://beetravel.md/admin/ — tururi și prețuri, articole, setări (telefon, prețuri transfer).
- **Tururi:** `src/content/tours/*.json` (un fișier per tur; prețurile se scriu în română, RU/EN se traduc automat).
- **Articole:** `src/content/blog/*.md`.
- **Pagini fixe:** `src/fragments/{ro,ru,en}/*.html` (texte copiate exact de pe site-ul vechi).
- **Recenzii:** funcția `netlify/functions/bee-reviews.mjs` (Netlify Blobs, store `bee-reviews-v1`); parola de administrare e în variabila `BEE_REVIEWS_ADMIN_PASSWORD`.
- **Construire:** `npm install && npm run build` → `dist/`.

Site BEE TRAVEL (Astro + Decap CMS), publicat pe Netlify.
