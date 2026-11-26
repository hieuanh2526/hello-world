---
name: research-literature-synthesis
description: Turn papers, working papers, reports, and policy documents into a sourced evidence note that keeps findings, authors' interpretations, and your own inference apart. Use when a task requires reading several sources, mapping the evidence on one research question, or drafting a literature or evidence note. Do not use for single-fact lookups, for inventing or padding citations, or for meta-analysis with statistical pooling.
version: 1.1
updated: 2026-11-26
---

# Research Literature Synthesis

## When to use

- The user asks for a literature review, an evidence summary, or "what do we know about X".
- Several sources must be compared for one research question.
- A project needs a defensible evidence base before design or writing.

**Do not use when:** the answer is a single known fact; the sources cannot be obtained; the user wants citations invented or padded; a formal meta-analysis or risk-of-bias protocol is required.

## Inputs

- A bounded question: one sentence, with population, context, and period where relevant. If the question is unbounded, narrow it, write the narrowed version down, and confirm it with the user.
- A source set: files, links, or references. Start from the project's `SOURCES.md`.
- The project folder and its `INDEX.md`.

**Finding new sources.** Search for sources only if the user allows it. Record the search (where, query terms, date, how many hits were kept) in the note's scope. A source found by search is registered and read like any other; a search hit is not evidence.

## Procedure

1. **Fix the question and inclusion rules.** Write the question, what counts as relevant evidence, and what is excluded. They go at the top of the note.

2. **Register provenance before reading.** Put each original in `raw/` with a dated name and never edit it. Register it in `SOURCES.md` with the template's columns: ID, title, author/publisher, date, type, file/locator, accessed, reliability, status. Status uses the register's vocabulary only: `acquired`, `partial`, `unavailable`, `superseded`.
   - For papers, record which version you hold (working paper series and number, or journal and year). Versions of the same paper can report different estimates; treat them as separate entries and mark the older one `superseded`.
   - A source that cannot be obtained is registered as `unavailable`. It can be listed as missing, never used as support.

3. **Extract one claim per row.** For each source you read, record: source ID, locator (page, section, or table), the claim, evidence type (experiment, quasi-experiment, descriptive, model, opinion), direction, and the authors' own interpretation. Quote sparingly and exactly; paraphrase the rest. Record also how much of the source you read: `full` or `partial` (which sections).

4. **Separate the layers.** Label every statement as one of:
   - **Finding**: what was observed, with magnitude, units, and uncertainty if reported.
   - **Interpretation**: what the authors say it means.
   - **Inference**: what you conclude across sources. It is yours, and labelled as yours.
   - **Speculation**: plausible but untested.

5. **Judge the evidence in plain words.** For each source, note the design, sample and context, identification strategy, and the main threat to it. Name the assumption the design rests on, for example parallel trends (difference-in-differences), exclusion restriction (instrumental variables), no manipulation at the cutoff (regression discontinuity). Say whether the authors test it. Do not invent quality scores.

6. **Map agreement and conflict.** List where sources converge, where they disagree, and the likely reason: population, definitions, period, or method. Never average away a conflict.

7. **Answer the question.** Give a 3 to 6 sentence answer with a confidence level and its reason, then state what evidence would change it. If the evidence is insufficient, say so plainly.

8. **Verify before writing anything down.** Reopen each source and check every quotation, number, and locator in the note against it. Remove or correct anything that does not match, and say what you changed.

9. **Write to the vault.** Follow the order in [WIKI_WORKFLOW.md](../../../agent/WIKI_WORKFLOW.md):
   - provenance to `SOURCES.md`, including the "Missing sources" table;
   - the bottom line, convergence, conflicts, and confidence to the project's `CURRENT_STATE.md`, as a dated section headed `Evidence: <question>`;
   - contradictions in the warning format of WIKI_WORKFLOW;
   - the full note (both tables) to `wiki/evidence-<short-slug>.md` only if it meets the workflow's promotion test, linked from `INDEX.md`. Otherwise show the full note to the user and ask whether to keep it as a wiki page.
   - Add a `LOG.md` entry. Decisions taken on the basis of the note go to `DECISIONS.md`, not into the note.

## Output format

```markdown
## Evidence note: <question> (<YYYY-MM-DD>)

**Question:** one sentence.
**Scope:** inclusion and exclusion rules, period, contexts, search done (if any).

### Bottom line
3 to 6 sentences. Confidence: high / medium / low, because ...

### Evidence by source
| Source | Version | Design / type | Finding (locator) | Authors' interpretation | Main threat |
|---|---|---|---|---|---|

### Claims extracted
| Source | Locator | Claim | Evidence type | Direction | Read |
|---|---|---|---|---|---|

### Where the evidence converges
- Claim, supported by S-xxx (locator), S-yyy (locator).

### Where it conflicts or is thin
- Conflict or gap, sources, what would settle it.

### Inference (mine, not the sources')
- ...

### What would change the answer
- ...

### Sources
- S-xxx: reference as recorded in SOURCES.md. Status: acquired | partial | unavailable | superseded. Read: full | partial (sections).
```

## Quality bar

- Every factual sentence traces to a source ID and a locator, or is labelled as inference.
- Only sources that were acquired and read support a finding; a partly read source supports only claims from the parts read.
- Findings and interpretations never share a bullet without labels.
- Numbers carry units, period, and context; no number is invented or silently converted.
- Contradictions are visible, dated, and unresolved until evidence settles them.
- "Not enough evidence" appears when true, instead of a confident synthesis.
- A reader who has not read the sources can follow the note.

## Failure modes to avoid

- **Citation theatre:** plausible-looking references that were never opened.
- **Consensus laundering:** presenting one study as the literature.
- **Interpretation drift:** reporting the authors' enthusiasm as the finding.
- **Version mixing:** citing the working paper's estimate with the journal article's reference.
- **Scope creep:** answering a broader question than the one asked.
- **False precision:** decimal estimates from descriptive evidence.
- **Wiki-first writing:** creating an elaborate page before updating the project's core files.

## Handoff

Use the project's [SOURCES template](../../../templates/project-slug-SOURCES.md) when the project has no source register yet. Record verified decisions in the project's `DECISIONS.md`.
