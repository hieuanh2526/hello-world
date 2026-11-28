---
name: lecture-prep
description: Turn a topic, reading, chapter, or syllabus entry into a ready-to-teach lecture plan — learning objectives, timed outline, worked examples, discussion questions, and a quick check for understanding. Use when the user asks to prepare, plan, outline, or restructure a lecture, class session, seminar, or tutorial, at any level from undergraduate to graduate.
---

# Lecture Prep

Produce a lecture plan the instructor can teach from with little further editing. Build it around what students should be able to do by the end, not around covering every point in the source material.

## Gather the inputs

Before drafting, establish (ask only for what is missing and matters):

1. **Topic and source material**: the reading, chapter, slides, or notes the lecture is based on. If the user supplies files, work from them.
2. **Audience**: course level (intro undergrad, advanced undergrad, master's, PhD), prior knowledge, class size.
3. **Length and format**: e.g. 50, 90, or 150 minutes; lecture, seminar, flipped, or tutorial.
4. **Place in the course**: what came before and what comes next, so the plan can link back and set up the next session.
5. **Language** of instruction, and any required framework, syllabus outcome, or textbook to follow.

If the user gives only a topic, state the assumptions you are making (level, length) at the top of the plan and proceed.

## Build the plan

### 1. Learning objectives
Write 3–5 objectives, each starting with an observable verb (explain, compute, compare, apply, evaluate, derive). Avoid "understand" and "know about". Every later section should serve at least one objective; cut material that serves none.

### 2. Timed outline
Break the session into blocks with minutes for each, adding up to the stated length. A typical shape:

| Block | Purpose | Share of time |
|---|---|---|
| Opening | Hook (a puzzle, data point, or real case), link to last session, state objectives | ~10% |
| Core segments (2–4) | One main idea each: explanation, then example, then a short student task | ~70% |
| Synthesis | Students connect the ideas; address common misconceptions | ~10% |
| Close | Quick check for understanding, preview of next session, assigned reading | ~10% |

Change the attention mode at least every 15–20 minutes (explanation → task → discussion).

### 3. Content for each core segment
For each segment give:
- **Key point** in one sentence.
- **Explanation notes** for the instructor: definitions, the main argument or derivation, and where students usually get stuck.
- **Worked example** with concrete numbers, a case, or a primary source. Prefer examples that fit the students' own context.
- **Student task** (2–5 minutes): a calculation, short prompt, think-pair-share, or quick poll, with the expected answer.

### 4. Discussion questions
Give 3–6 questions in increasing difficulty: recall → application → evaluation. Add brief notes on what a strong answer includes.

### 5. Check for understanding
A short exit check (2–4 items: multiple choice, short answer, or a one-minute paper) aligned to the objectives, with an answer key.

### 6. Materials and preparation
List what the instructor needs: slides, handouts, data, board work, readings to assign, and any setup.

## Rules

- Stay faithful to the source material. Do not invent quotations, statistics, dates, or citations; when a figure or reference is needed but unknown, insert a placeholder like `[DATA: latest unemployment rate]` or `[CITE: …]` and tell the user.
- Keep the amount of new material realistic for the time: as a rule of thumb, no more than one core idea per 15–20 minutes.
- Match terminology to the course's textbook or syllabus when one is given.
- Write in the language of instruction the user names.
- Flag any part of the topic that is contested or sensitive, and present it accurately rather than taking a side the source does not take.

## Output format

Return the plan in this order, in Markdown:

1. Header: course, topic, level, length, assumptions
2. Learning objectives
3. Timed outline table
4. Segment-by-segment content
5. Discussion questions with answer notes
6. Check for understanding with answer key
7. Materials and preparation checklist

Offer to turn the plan into slides, a handout, or a quiz as a next step.
