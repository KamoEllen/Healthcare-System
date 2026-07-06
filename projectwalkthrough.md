# Project Walkthrough — a reusable method

How to build a **code-anchored walkthrough** for *any* codebase: a single, self-contained
document that explains an entire project so well that someone who never wrote a line of it
can be dropped on any file and explain what it does, how it works, who calls it, and where
it sits in the architecture.

This guide is the recipe. The worked example throughout is `Healthcare-System-Walkthrough.html`,
but nothing here is healthcare-specific — the *method* transfers to any project in any language.

---

## 1. What you are building

A **walkthrough**, not a summary and not API reference docs. Its defining property:

> **Every claim is anchored to real code**, and the document is organized around
> **journeys and behaviours**, not a component inventory.

Deliverable shape:

- **One file**, fully self-contained (all CSS/JS inline, code samples embedded, nothing
  loaded from a network). Open it offline, commit it beside the code, host it anywhere.
- Output as **HTML** (best: sticky table-of-contents, code cards, theming) or **Markdown**
  (simpler, renders on GitHub). HTML is recommended because the code-display and navigation
  matter a lot for usability.

The promise it must be able to make:

> *"Study this and no file in the repo can be shown to you that you can't place, explain,
> and justify"* — because every file is provably one of: an instance of a repeating pattern,
> a cross-cutting concern, a domain rule, or a named one-of-a-kind file — and all four are
> covered.

---

## 2. Why the obvious approaches fail

Before the method, understand the two failure modes it avoids. (Both were real: the project
already had an 8,700-word `Healthcare-System.md` that was topic-complete and still unusable.)

1. **Prose that describes code without showing it.** The reader opens a file and the doc's
   sentences don't line up with what's on screen. Reading the doc and reading the code become
   two disconnected activities. → *Fix: paste the actual code, with its path, next to every
   explanation.*

2. **Organizing by component inventory.** The things that confuse a newcomer are **emergent** —
   they live in *no single file* (e.g. "how does the browser's `/api` call reach the backend?"
   spanned three files that never reference each other). A file-list doc skips exactly these.
   → *Fix: organize around journeys/behaviours so the emergent stuff surfaces.*

Length is never the problem. A long doc that violates these two rules is still useless.

---

## 3. The five principles

Everything below is an application of these. They are the transferable core.

1. **Anchor every claim to real code.** No claim without a snippet + file path.
2. **Organize by journeys and behaviours, not a component list.** Trace what actually happens.
3. **Exploit repetition.** Most codebases are a small template stamped many times plus a few
   specials. Teach the template *once*; then only describe what's *distinctive* per instance.
   This is what stops the doc from being N× too long.
4. **Give every unit a fixed schema.** Each folder/file answers the *same* questions every time.
   A fixed schema is what turns prose into a *reference* you can trust to be complete.
5. **Be honest where docs and code disagree.** The highest-value context is the contradictions
   a newcomer can't discover alone. When docs and code conflict, **the code wins, and you say so.**

---

## 4. The method — step by step

### Step 0 — Read the whole tree first
Enumerate every leaf folder; read every file (or enough to characterize each). You cannot
anchor to code you haven't read, and this pass is what surfaces the drift and the emergent
behaviours. List leaf folders with something like:

```bash
find <src-roots> -type d -not -path '*/node_modules/*' -not -path '*/.git/*' | sort
```

### Step 1 — Find the template and the specials
Identify the **repeating unit** (e.g. "one 5-file module × 6 features") and the handful of
**one-of-a-kind files** (entry point, config, DB access, build files). This split defines your
effort budget: template = explain once; specials = explain individually.

### Step 2 — Pick 3–5 real journeys
Choose the traces a newcomer *must* understand. Good candidates in most systems:
- A request end-to-end (the main read or write path).
- The client↔server seam / any "invisible glue" that spans multiple files.
- The most safety-critical transaction (money, auth, data integrity).
- The auth/session lifecycle.

Trace each **file by file, in execution order, with the real code at each hop.**

### Step 3 — Write the folder-by-folder reference
Every leaf folder gets the **six-dimension schema** (see §5). This is the "open any file"
guarantee.

### Step 4 — Add the honest layer
- A **why-over-what ledger** (decisions, tied to the file where each shows up).
- A **doc-vs-code drift list** (where README/comments/specs disagree with reality).
- A **reverse index**: file path → the section that explains it (also your completeness audit).

### Step 5 — Justify every decision
A closing rationale section in a **"do X, so that Y — not Z, because Z costs W"** frame:
tooling choices *and* design decisions, including the ones that **changed mid-build** (the
`started → changed → so that` story is the most honest justification — it names the failure
that forced the change).

### Step 6 — Render as self-contained HTML and verify
Inline everything; use the code-embedding trick in §6; then **actually open it** (headless
browser screenshot) and check it renders — don't assume.

---

## 5. The six-dimension schema (per folder / per file)

The fixed schema that makes the reference complete and scannable. For **every** leaf folder:

1. **What the folder exists for** — one-line purpose.
2. **What each file exists for** — its job *and how* (mechanism).
3. **Which files call it** — the callers.
4. **What it connects to** — its collaborators / dependencies.
5. **A representative code snippet** — real code from the folder.
6. **How it fits into the overall architecture** — where this sits in the whole (which layer,
   upstream/downstream of what, what behaviour it makes possible).

Dimension 6 is the one most easily skipped and the one that turns a file list into an
architectural map. Make it an explicit, recurring line on every folder — not something the
reader has to infer.

---

## 6. Technical construction (HTML)

What makes the HTML version work:

- **One file**, sticky-sidebar layout: a table-of-contents `<nav>` + scrollable `<main>`.
- **Theme via CSS custom properties.** A handful of variables (e.g. two accent colors, a
  background, a text color) so the whole look is a few values you can swap.
- **The code-embedding trick — the important one.** Store raw source inside
  `<script type="text/plain">` blocks. A browser treats a script tag's contents as *literal
  text*, so `<`, `>`, `&&`, generics like `<T>` — every character that would otherwise break
  HTML — stays intact with **zero escaping**. A tiny inline script then reads each block's
  `.textContent`, escapes it, adds light comment highlighting, and renders it into a styled
  code card. This is what lets you paste real TypeScript/SQL/YAML without corrupting the page.
  (The only string that would end such a block early is a literal `</script`, which source
  code virtually never contains.)

  ```html
  <script type="text/plain" class="src" data-file="path/to/file.ts" data-lang="TypeScript">
  ... paste raw code here, unescaped ...
  </script>
  ```

  ```js
  // render each block into a <pre> code card
  document.querySelectorAll('script.src').forEach(s => {
    const raw = s.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    const pre = document.createElement('pre');
    pre.innerHTML = '<code>' + highlight(raw, s.dataset.lang) + '</code>';
    // ...wrap with a header showing s.dataset.file / s.dataset.lang, insert before s...
  });
  ```

- **Light highlighting only.** Escape HTML, then color line comments (`//` for C-like, `--`
  for SQL) — with a guard so `//` inside `http://` isn't mistaken for a comment. Full syntax
  highlighting is not worth the fragility.
- **Scrollspy** with one `IntersectionObserver` to highlight the current section in the sidebar.
  That's the entire JS footprint.
- **Recurring visual components** so structure reads at a glance: code cards, callout boxes
  (why / gotcha / architecture-fit), tables, and flow chips for request paths.

### Verify, don't assume
Render it headless and screenshot before shipping. Chromium is usually available; e.g.:

```js
const { chromium } = require('playwright');
const b = await chromium.launch({ executablePath: '<chromium-path>' });
const p = await b.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file:///abs/path/walkthrough.html');
console.log('code cards:', await p.$$eval('figure.code', els => els.length), 'errors:', errs);
await p.screenshot({ path: 'check.png' });
```

Check: code cards rendered, zero console errors, theme intact, tables/sections present.

---

## 7. Section blueprint

The full section list used for the healthcare walkthrough. Reuse as a checklist; drop what a
smaller project doesn't need.

| # | Section | Purpose |
|---|---------|---------|
| 00 | How to read this | Set expectations; state the "one idea that makes it learnable" |
| 01 | The 60-second mental model | The whole system in one breath + the 2–3 organizing ideas |
| 02 | Where everything lives | A map table: location → what's there → when you open it |
| 03 | The repeating pattern | The template, taught once, with the "tell" for recognizing each layer |
| 04 | Trace A — a request end to end | The main path, file by file, with code |
| 05 | Trace B — the invisible glue | The emergent behaviour that lives in no single file |
| 06 | Trace C — the crown jewel | The most safety-critical transaction |
| 07 | Trace D — the lifecycle | Auth/session/state lifecycle |
| 08 | Cross-cutting concerns | Middleware/guards + the assembly order and why |
| 09 | Domain rules | The constraints that make it *this* system, not generic CRUD |
| 10 | Data layer | Schema, key indexes, migrations |
| 11 | Runtime & deploy | Config, tiers, containers, CI |
| 12 | Trade-off ledger | Compact "chosen / over / because / in-code" table |
| 13 | Docs vs code | Honest contradictions; code wins |
| 14 | Reverse index | File → section (completeness audit) |
| 15 | Every folder, every file | The six-dimension reference for all leaf folders |
| 16 | Justifying every decision | Tooling + evolved decisions, "do X so that Y" |

Not every project needs 17 sections. The **non-negotiables** are: mental model, the map,
at least one code-anchored trace, the six-dimension folder reference, the drift list, and the
reverse index. The rest scale with the project.

---

## 8. Style rules that keep it useful

- **Show, then explain.** Code card first (or beside), prose second.
- **One representative snippet per unit**, not the whole file. Cross-reference the traces
  instead of re-pasting large blocks.
- **Name the failure each rule prevents.** "So that X" is weaker than "so that X — otherwise Y
  happens." The concrete failure is what makes a justification land.
- **Prefer `started → changed → so that`** for any decision that evolved. It's the most honest
  and most instructive form.
- **Every folder gets the same schema.** Consistency is what makes it a reference, not an essay.
- **Flag drift inline.** When the code contradicts a README/spec/comment, say so at that spot —
  that's the context nobody else can give the reader.

---

## 9. A prompt you can reuse

To generate one of these for a new repo, an instruction like this works:

> Build a **code-anchored walkthrough** of this codebase as a single self-contained HTML file.
> First read every leaf folder and file. Then: (1) state a 60-second mental model and a
> where-everything-lives map; (2) identify the repeating template and teach it once; (3) trace
> 3–5 real journeys file-by-file **with the actual code**, including any "invisible glue" that
> spans multiple files; (4) write a folder-by-folder reference where **every** leaf folder gets
> the same six dimensions — folder purpose, each file's purpose+mechanism, callers, connections,
> a representative snippet, and how it fits the overall architecture; (5) add a trade-off ledger,
> a docs-vs-code drift list, and a reverse file→section index; (6) close with a rationale section
> justifying every tooling and design decision in a "do X so that Y, not Z because W" frame,
> including decisions that changed mid-build. Store code inside `<script type="text/plain">`
> blocks and render them with a small inline script so `<`, `>`, `&&` survive. Inline all CSS/JS.
> Then render it headless and confirm it displays with no console errors.

---

## 10. Checklist

- [ ] Read every leaf folder and file
- [ ] Found the repeating template + the specials
- [ ] 60-second mental model + organizing ideas
- [ ] Where-everything-lives map
- [ ] The template taught once, with recognition "tells"
- [ ] 3–5 journeys traced file-by-file, with real code
- [ ] The "invisible glue" trace (emergent, multi-file behaviour)
- [ ] Every leaf folder covered with the six-dimension schema
- [ ] Trade-off ledger
- [ ] Docs-vs-code drift list
- [ ] Reverse file → section index
- [ ] "Justify every decision" section ("do X so that Y")
- [ ] Self-contained (no external requests), code embedded safely
- [ ] Rendered headless, verified: renders, no console errors, theme intact
