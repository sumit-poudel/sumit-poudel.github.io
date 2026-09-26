# Sumit Poudel

Go and web engineer, open source maintainer. Based in Chitwan, Nepal.

- GitHub — [github.com/sumit-poudel](https://github.com/sumit-poudel)
- Open source club — [BOSC](https://bosc.org.np/)
- Email — sumitpoudel.me@gmail.com · sumitpoudel@proton.me
- X — [@sum_itpoudel](https://x.com/sum_itpoudel/)
- Instagram — [goku_chann_](https://instagram.com/goku_chann_/)
- Facebook — [sumitpdl](https://www.facebook.com/sumitpdl/)

## Projects

**[datastar-lsp](https://github.com/sumit-poudel/datastar-lsp)** — a language
server for DataStar written in Go. Completion and hover for the `data-*`
attributes and `data-on-*` actions, wired up in Neovim through `vim.lsp.start`.

**Subha Fertility** — Astro and React site for a fertility clinic in Chitwan.

**oWtE** — my first AUR package. Took an Electron appimage, learned PKGBUILD the
hard way, and published it to the Arch User Repository.

Write-ups for the hackathon and the AUR package live in `src/content/blog`.

## Stack

Go, TypeScript, Astro, React, Next.js, Tailwind CSS, PostgreSQL, Java, C,
Neovim, Arch and CachyOS, Hyprland. I use Arch btw.

## This site

The site is [astro-vim](src): Astro with Tailwind, laid out like a Neovim
buffer. `j` and `k` move a cursor over the post and project lists, `Enter`
opens, `:` runs a command, and `/` searches every post by title, summary and
body, with `#tag` filtering. Commands and search run from the status bar, which
doubles as the command line. Every command on the landing page is also a link,
so the site works without a keyboard.

Blog posts and projects are markdown files with frontmatter validated by
`src/content.config.ts`. The post or project filename becomes its URL, so
`src/content/blog/owte.md` is served at `/blog/owte`.

```sh
bun install
bun run dev     # http://localhost:4321
bun run build   # astro check && astro build
bun run deploy  # build, then wrangler deploy
```

## Deploying

Static. Every page is prerendered at build time into `dist/`, so there is no
adapter and no server — the search index is just a prerendered
`dist/api/blog-posts.json`.

`wrangler.jsonc` uploads `dist/` as Workers static assets. It has no `main`
field, because there is no worker code to run; `not_found_handling` points
missing paths at the prerendered `404.html`.

On Cloudflare, set the build command to `bun run build` and leave the deploy
command at the default `npx wrangler deploy`. One catch: the build image ships
bun 1.2.15, which cannot read the `lockfileVersion: 2` lockfile that bun 1.4
writes. Add `BUN_VERSION=1.4.2` under **Settings → Build → Build variables**,
otherwise the install step fails with "Unknown lockfile version".

## Branches

- `main` — this site.
- `old-main` — the previous version of the site, kept for reference. It used
  React components with an `InfoLayout` shell and the old `blogCat` category
  tabs, and read `pubDate` / `snippet` / `category` frontmatter instead of the
  current schema.
