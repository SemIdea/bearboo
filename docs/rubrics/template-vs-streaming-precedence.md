# Rubric — frozen template (offline) vs streaming learning (online): precedence, never a sum

> **Load-bearing finding from AWM (arXiv:2409.07429):** **offline** knowledge (an architectural template frozen via `export-template`) and **online** knowledge (learning that `reconcile`/`restructure` accumulate in streaming during the project's life) are **non-additive — combining the two hurts** (the result lands *between* the two and matches neither). AFM has both layers, so it needs an explicit rule of **precedence + tombstone**, never fusion.

The single rule: when offline and online collide, **pick ONE and tombstone the other** (provenance preserved). Never keep the two "summed", never merge the content.

## Decision table

| Situation | Rule |
| --- | --- |
| A **template-origin** project (`docs/.template` was the seed) AND `reconcile` wants to propose a rule/gotcha that **contradicts** a template-inherited artifact | **Streaming wins locally.** Apply the new rule/gotcha and mark the inherited artifact with `*(overridden — see reconcile NNN / cycle NNN)*`. **Do NOT merge** the two (non-additivity: mixing = worse than either alone). |
| The **same knowledge** exists in the frozen template **AND** in a streaming learning (a duplicate, not a contradiction) | **Pick ONE** (the more recent/local one in general) and tombstone the other. Keeping the two copies "summed" is forbidden — it becomes the inflation `diagnose A6` later flags. |
| `export-template` is about to **freeze** a project that already accumulated streaming learnings | Consolidate the streaming learnings **via `/afm:generalize` BEFORE** the export — they become part of the frozen template (offline), not a parallel layer. It avoids freezing half and leaving the other half for the consumer's reconcile to collide with later. |

## Why not merge

- **AWM measured:** offline+online combined land *between* the two and match neither. Silent fusion is the worst of both worlds.
- **Tombstone, not deletion:** precedence preserves provenance (the losing artifact becomes a note, does not disappear) — the same discipline as `generalize` (a merged gotcha becomes a tombstone) and principle #6 (deletion is a bright line).
- **`reflect`/`generalize` stay valid** *within* each layer — what this rubric forbids is mixing **between** layers without deciding the precedence.

## Anti-examples

- ❌ Keeping the template-inherited rule **and** the new reconcile rule that contradicts it, hoping "both hold" — it violates non-additivity; decide the precedence.
- ❌ `export-template` freezing with pending streaming learnings without consolidating first — the consumer inherits a partial layer that will fight its own reconcile.
- ❌ Merging the text of the two into a third "combined" version — it is exactly the *between the two* result AWM showed to be worse.
