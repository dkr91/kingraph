# Dependency audit

Record of the dependency refresh performed on 2026-08-17. Regenerate the
numbers below with `yarn audit` (or `npm audit` after `npm install
--package-lock-only`).

## Summary

| | Before | After |
|---|---|---|
| Vulnerable packages (npm audit total) | 41 | **0** |
| — critical / high / moderate / low | 11 / 20 / 10 / 0 | **0 / 0 / 0 / 0** |
| Distinct advisories affecting the tree | 61 | **0** |
| — critical / high / moderate / low | 6 / 29 / 24 / 2 | **0 / 0 / 0 / 0** |
| Installed packages (production) | 178 | 67 |
| Installed packages (total, incl. dev) | 201 | 188 |

npm counts each vulnerable package once, at its highest severity — that is the
41. Several packages are hit by more than one advisory, so the number of
distinct package/advisory pairs is 61.

**There are no open CVEs against kingraph's dependency tree.**

## What changed

| Package | Before | After | Why |
|---|---|---|---|
| `js-yaml` | `3.6.1` | `^5.3.0` | Code injection + several DoS advisories. `safeLoad()` is now `load()`; the 4.x/5.x default schema is already the safe one. |
| `meow` | `3.7.0` | `^9.0.0` | Pulled vulnerable `trim-newlines`, `yargs-parser` and `minimist`. Held at 9 because 10+ is ESM-only and kingraph is CommonJS. Flag declarations moved to meow's `flags` option. |
| `svg2png` | `4.1.0` | *removed*, replaced by `@resvg/resvg-js` `^2.6.2` | `svg2png` carries an unfixed XSS advisory and drags in PhantomJS, which brought `request`, `extract-zip`, `hawk`, `hoek`, `tough-cookie`, `sshpk`, `stringstream`, `tunnel-agent`, `bl` and `extend` — the bulk of the advisories. resvg is a prebuilt Rust binary with no JavaScript dependencies. |
| `viz.js` | `1.3.0` | *removed*, replaced by `@viz-js/viz` `^3.29.0` | `viz.js` 1.x/2.x are deprecated and unmaintained (Graphviz 2.38, 2016). `@viz-js/viz` ships Graphviz 15.x as WebAssembly. |
| `object-loops` | `0.8.0` | *removed* | Depends on `101`, which has a **critical** prototype-pollution advisory with no fixed version available. Its `map`/`values`/`reduce` helpers were replaced with `Object.keys(...)` one-liners. |
| `object-assign` | `4.1.0` | *removed* | Superseded by the built-in `Object.assign`, which the codebase was already using elsewhere. |
| `strip-indent` | `2.0.0` | *removed* | Declared but never imported anywhere in the source. |
| `read-input` | `0.3.1` | `^0.3.1` | Already at the latest published version, no runtime dependencies, no advisories. Kept. |
| `tape` (dev) | `4.6.2` | `^5.10.2` | Old `minimist`/`resolve`/`glob` advisories. |

Version specifiers moved from exact pins to caret ranges; `yarn.lock` (which
had drifted into a state where `yarn install` resolved `meow@^9.0.0` back to
`3.7.0`) was regenerated from scratch and remains the source of truth for
reproducible installs.

## Advisories resolved

Counted as unique advisory-per-package pairs, grouped by the direct dependency
that introduced them.

<details>
<summary><b>Critical (6)</b></summary>

| Package | Advisory |
|---|---|
| `101` (via `object-loops`) | [GHSA-cwcx-rxgc-cmw3](https://github.com/advisories/GHSA-cwcx-rxgc-cmw3) — prototype pollution |
| `form-data` (via `svg2png`) | [GHSA-fjxv-7rqg-78g4](https://github.com/advisories/GHSA-fjxv-7rqg-78g4) — unsafe random boundary |
| `json-schema` (via `svg2png`) | [GHSA-896r-f27r-55mw](https://github.com/advisories/GHSA-896r-f27r-55mw) — prototype pollution |
| `lodash` (via `svg2png`) | [GHSA-jf85-cpcp-j695](https://github.com/advisories/GHSA-jf85-cpcp-j695) — prototype pollution |
| `minimist` (via `meow`, `tape`) | [GHSA-xvch-5gv4-984h](https://github.com/advisories/GHSA-xvch-5gv4-984h) — prototype pollution (both `<0.2.4` and `>=1.0.0 <1.2.6` ranges) |

</details>

<details>
<summary><b>High (29)</b></summary>

| Package | Advisory |
|---|---|
| `async` | [GHSA-fwr7-v2mv-hh25](https://github.com/advisories/GHSA-fwr7-v2mv-hh25) — prototype pollution |
| `brace-expansion` | [GHSA-832h-xg76-4gv6](https://github.com/advisories/GHSA-832h-xg76-4gv6), [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp), [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg), [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895) — ReDoS / unbounded expansion |
| `debug` | [GHSA-9vvw-cc9w-f27h](https://github.com/advisories/GHSA-9vvw-cc9w-f27h) — inefficient regex complexity |
| `extract-zip` (via `svg2png`) | [GHSA-jmr9-qjv8-65gv](https://github.com/advisories/GHSA-jmr9-qjv8-65gv) — symlink path traversal |
| `form-data` | [GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx) — CRLF injection |
| `hawk` | [GHSA-44pw-h2cw-w3vq](https://github.com/advisories/GHSA-44pw-h2cw-w3vq) — uncontrolled resource consumption |
| `hoek` | [GHSA-c429-5p7v-vgjp](https://github.com/advisories/GHSA-c429-5p7v-vgjp), [GHSA-jp4x-w63m-7wgm](https://github.com/advisories/GHSA-jp4x-w63m-7wgm) — prototype pollution |
| `js-yaml` | [GHSA-8j8c-7jfh-h6hx](https://github.com/advisories/GHSA-8j8c-7jfh-h6hx) — code injection; [GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m), [GHSA-5p4m-2wfm-xmqj](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) — quadratic CPU consumption |
| `lodash` | [GHSA-35jh-r3h4-6jhm](https://github.com/advisories/GHSA-35jh-r3h4-6jhm) — command injection; [GHSA-4xc9-xhrj-v574](https://github.com/advisories/GHSA-4xc9-xhrj-v574), [GHSA-p6mc-m468-83gw](https://github.com/advisories/GHSA-p6mc-m468-83gw) — prototype pollution; [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) — code injection via `_.template` |
| `minimatch` | [GHSA-f8q6-p94x-37v3](https://github.com/advisories/GHSA-f8q6-p94x-37v3), [GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26), [GHSA-7r86-cg39-jmmj](https://github.com/advisories/GHSA-7r86-cg39-jmmj), [GHSA-23c5-xmqv-rm74](https://github.com/advisories/GHSA-23c5-xmqv-rm74) — ReDoS |
| `qs` | [GHSA-gqgv-6jq5-jjj9](https://github.com/advisories/GHSA-gqgv-6jq5-jjj9), [GHSA-hrpp-h998-j3pp](https://github.com/advisories/GHSA-hrpp-h998-j3pp) — prototype pollution |
| `semver` | [GHSA-c2qf-rxjj-qqgw](https://github.com/advisories/GHSA-c2qf-rxjj-qqgw) — ReDoS |
| `sshpk` | [GHSA-2m39-62fm-q8r3](https://github.com/advisories/GHSA-2m39-62fm-q8r3) — ReDoS |
| `tough-cookie` | [GHSA-g7q5-pjjr-gqvp](https://github.com/advisories/GHSA-g7q5-pjjr-gqvp) — ReDoS |
| `trim-newlines` (via `meow`) | [GHSA-7p7h-4mm5-852v](https://github.com/advisories/GHSA-7p7h-4mm5-852v) — uncontrolled resource consumption |
| `y18n` | [GHSA-c4w7-xm78-47vh](https://github.com/advisories/GHSA-c4w7-xm78-47vh) — prototype pollution |

</details>

<details>
<summary><b>Moderate (24) and low (2)</b></summary>

| Package | Advisory |
|---|---|
| `bl` | [GHSA-pp7h-53gx-mx7r](https://github.com/advisories/GHSA-pp7h-53gx-mx7r) — remote memory exposure |
| `brace-expansion` | [GHSA-f886-m6hf-6m8v](https://github.com/advisories/GHSA-f886-m6hf-6m8v), [GHSA-v6h2-p8h4-qcjw](https://github.com/advisories/GHSA-v6h2-p8h4-qcjw) |
| `concat-stream` | [GHSA-g74r-ffvr-5q9f](https://github.com/advisories/GHSA-g74r-ffvr-5q9f) — memory exposure |
| `debug` | [GHSA-gxpj-cx7g-858c](https://github.com/advisories/GHSA-gxpj-cx7g-858c) — ReDoS |
| `extend` | [GHSA-qrmc-fj45-qfc2](https://github.com/advisories/GHSA-qrmc-fj45-qfc2) — prototype pollution |
| `hosted-git-info` | [GHSA-43f8-2h32-f4cj](https://github.com/advisories/GHSA-43f8-2h32-f4cj) — ReDoS |
| `is-my-json-valid` | [GHSA-4hpf-3wq7-5rpr](https://github.com/advisories/GHSA-4hpf-3wq7-5rpr) — ReDoS |
| `js-yaml` | [GHSA-2pr6-76vf-7546](https://github.com/advisories/GHSA-2pr6-76vf-7546), [GHSA-mh29-5h37-fv8m](https://github.com/advisories/GHSA-mh29-5h37-fv8m), [GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68) |
| `jsonpointer` | [GHSA-282f-qqgm-c34q](https://github.com/advisories/GHSA-282f-qqgm-c34q) — prototype pollution |
| `lodash` | [GHSA-fvqr-27wr-82fm](https://github.com/advisories/GHSA-fvqr-27wr-82fm), [GHSA-29mw-wpgm-hmr9](https://github.com/advisories/GHSA-29mw-wpgm-hmr9), [GHSA-x5rq-j2xg-h7qm](https://github.com/advisories/GHSA-x5rq-j2xg-h7qm), [GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh), [GHSA-xxjr-mmjv-4gpg](https://github.com/advisories/GHSA-xxjr-mmjv-4gpg) |
| `minimist` | [GHSA-vh95-rmgr-6w4m](https://github.com/advisories/GHSA-vh95-rmgr-6w4m) — prototype pollution |
| `qs` | [GHSA-6rw7-vpxm-498p](https://github.com/advisories/GHSA-6rw7-vpxm-498p) — `arrayLimit` bypass |
| `request` (via `svg2png`) | [GHSA-p8p7-x288-28g6](https://github.com/advisories/GHSA-p8p7-x288-28g6) — SSRF |
| `stringstream` | [GHSA-mf6x-7mm4-x2g7](https://github.com/advisories/GHSA-mf6x-7mm4-x2g7) — out-of-bounds read |
| `svg2png` | [GHSA-mpp5-2x55-49xw](https://github.com/advisories/GHSA-mpp5-2x55-49xw) — XSS (never fixed upstream) |
| `tough-cookie` | [GHSA-72xf-g2v4-qvf3](https://github.com/advisories/GHSA-72xf-g2v4-qvf3) — prototype pollution |
| `tunnel-agent` | [GHSA-xc7v-wxcw-j472](https://github.com/advisories/GHSA-xc7v-wxcw-j472) — memory exposure |
| `yargs-parser` (via `meow`) | [GHSA-p9pc-299p-vxgp](https://github.com/advisories/GHSA-p9pc-299p-vxgp) — prototype pollution |

</details>

## Breaking changes

- **`render()` always returns a Promise.** Graphviz now runs as WebAssembly,
  which can only be instantiated asynchronously, so `render(data, { format:
  'dot' })` and `render(data, { format: 'svg' })` no longer return a value
  synchronously. `{ async: true }` is still accepted and is now a no-op. The
  `kingraph` command line is unaffected. Version bumped to `0.2.0`.
- **Node.js 18 or newer is required** (`engines` field added). Every dependency
  line older than that is end-of-life.
- PNGs render at 96 dpi instead of PhantomJS's 72 dpi, so output is about 1.33×
  larger in each dimension for the same input.
- Graphviz jumped from 2.38 to 15.x, so layouts can differ slightly (sibling
  ordering in particular). `dot` output from kingraph itself is byte-identical
  to the previous release for every file in `examples/`.

## Known residual risk

Nothing with an open advisory, but worth tracking:

- **`read-input@0.3.1`** has no known vulnerabilities and no runtime
  dependencies, but it is unmaintained. It is ~150 lines and could be inlined
  if it ever becomes a problem.
- **`meow` is held at 9.x** because 10+ is ESM-only. 9.x is clean today; moving
  to the current major would require converting kingraph to ESM.
- **A missing input file exits 0** with an empty graph rather than reporting an
  error — `read-input` reports failures via `res.failures` rather than
  rejecting, and the CLI does not check it. This behaviour predates this
  refresh and was left unchanged.

## Fixed along the way

The `browser` field pointed `lib/to_png.js` at `lib/to_png.browser.js`, which
does not exist in the repository. It now points at `lib/to_png_image.js`, the
actual browser implementation. This also keeps bundlers away from the native
resvg binary.
