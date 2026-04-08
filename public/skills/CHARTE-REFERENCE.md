# CHARTE GRAPHIQUE — LAWIA Skills
## Fichier de référence pour itérations

---

## FICHIERS DE LA CHARTE

| Fichier | Rôle |
|---------|------|
| `charte-graphique-lawia.css` | CSS complet à importer (variables, typo, composants) |
| `prompt-charte-graphique-lawia.md` | Prompts IA pour générer images cohérentes |
| `lawia-editorial-gravity.md` | Charte éditoriale (ton, structure des textes) |
| `Theme_LAWIA_Skills_Gamma.pptx` | Thème PowerPoint LAWIA |

---

## PALETTE COULEURS

| Variable CSS | Hex | Usage |
|-------------|-----|-------|
| `--bleu` | `#6A9BCC` | Accents, liens, highlights |
| `--bleu-f` | `#4A7BA8` | Hover, ombres offset, overlines |
| `--bleu-c` | `#A8C4E0` | Textes sur fond noir, icônes SVG |
| `--bleu-p` | `#D3E5F8` | Fonds de sections claires |
| `--dark` | `#141413` | Textes, fonds sombres, bordures |
| `--creme` | `#FAF9F5` | Fond principal |
| `--gris` | `#B0AEA5` | Textes secondaires |
| `--gris-c` | `#E8E6DC` | Séparateurs, bordures internes |
| `--negatif` | `#C4745B` | Terre cuite — items négatifs uniquement |

**RÈGLES ABSOLUES :**
- Zéro dégradé — aplats uniquement
- Zéro rouge / vert / orange / violet
- Bordures épaisses noires (3px)
- Ombres offset solides (ex: `8px 8px 0 var(--bleu-f)`)
- Coins arrondis : `--r: 12px`

---

## TYPOGRAPHIE

| Usage | Police |
|-------|--------|
| Titres H1-H4 | Georgia, serif |
| Corps, labels | Calibri, sans-serif |
| Accroche manuscrite | Caveat (Google Fonts), cursive |
| Code | Consolas, monospace |

**Google Fonts à ajouter dans `<head>` :**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap" rel="stylesheet">
```

---

## COMPOSANTS CLÉS

### Overline (label au-dessus des titres)
```css
.overline { font-size: 0.7rem; color: var(--bleu-f); text-transform: uppercase; letter-spacing: 3.5px; }
```

### Accent bleu sur un mot
```html
<span class="accent">mot clé</span>
```

### Texte manuscrit
```html
<span class="handwritten">accroche en écriture cursive</span>
```

### Bouton CTA principal
```css
background: var(--bleu-f); color: #fff; border: 2px solid var(--dark); box-shadow: 4px 4px 0 var(--dark);
```

### Card avec ombre offset
```css
border: 2px solid var(--dark); border-radius: var(--r); box-shadow: 6px 6px 0 var(--bleu-f);
```

---

## STRUCTURE DES PAGES

- **Alternance sections** : clair (`--creme`) / sombre (`--dark`)
- **Hero** : fond crème, grid 2 colonnes (texte gauche / image droite)
- **Images** : format WebP, srcset 3 tailles (480/1200/1920w)
- **Logo LAWIA** : "LawIA" en Georgia noir, "IA" en `--bleu`

---

## PAGES DU SITE

| Fichier | Description |
|---------|-------------|
| `index.html` | Page principale — hero "5 Skills" |
| `tarifs.html` | Tarifs et offres |
| `skill-assignation.html` | Skill Assignation |
| `skill-bordereau.html` | Skill Bordereau de pièces |
| `skill-consultation.html` | Skill Consultation |
| `skill-contre-argumentation.html` | Skill Contre-argumentation |
| `skill-convention.html` | Skill Convention d'honoraires |
| `cgv.html` | Conditions générales de vente |
| `mentions-legales.html` | Mentions légales |
| `pack-gratuit.html` | Pack gratuit |
| `telechargement.html` | Page téléchargement |
| `annulation.html` | Annulation commande |
