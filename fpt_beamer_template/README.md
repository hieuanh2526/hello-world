# FPT University Beamer Template

A LaTeX Beamer presentation template for lecturers at **FPT University, Vietnam**.

## Files

| File | Description |
|------|-------------|
| `main.tex` | Main template – edit this file |
| `references.bib` | BibTeX bibliography file |
| `logo_fpt_white.png` | FPT logo (white version) – used on content slides |
| `logo_fpt_color.png` | FPT logo (colour version) – used on title/final page |
| `example_figure.pdf` | Replace with your figure |

## Quick Start

1. Add your logo files (`logo_fpt_white.png`, `logo_fpt_color.png`) to this folder.
2. Edit the metadata in `main.tex`:
   - `\title`, `\subtitle`, `\author`, `\institute`, `\date`
3. Fill in your content slides.
4. Add your references to `references.bib`.
5. Compile with:

```bash
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

## Colour Scheme

| Token | RGB | Usage |
|-------|-----|-------|
| `FPTOrange` | 240, 90, 34 | Headers, bullets, accents |
| `FPTDark` | 30, 30, 30 | Body text, alert blocks |
| `FPTGray` | 100, 100, 100 | Captions, sub-text |

## Custom Commands

| Command | Usage |
|---------|-------|
| `\TitleFinalPageLayout` | Place at top of title/final frame |
| `\highlightbox{text}` | Orange-tinted highlight box |
| `\findingbox{Title}{text}` | Titled result/finding box |
