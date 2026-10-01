# Open Time Roadmap

> **Release:** v26.09.30  
> **Last Updated:** 2026-09-30  
> **Status:** Sprint 0 — first package on Central  
> **APP code:** OT  
> **Grounded Rules:** SubTerraCo/grounded-rules  

Open Time is `packages/open-time`. Former code `OD` (Open Day) and `BK` (Blocks) stay address aliases. Drafting (tasks, crew, coverage, time clock) lives on Central. Metro shows the finished schedule only when the owner grants it.

Shell build order is on the Central roadmap: Windows, then Linux, then the Metro PWA.

## Batch log

| Batch | Status | Notes |
|-------|--------|-------|
| v26.09.30b1 | draft | Package renamed from Open Day. First pass of the Blocks board and Festy crew draft is in the tree. Deeper Blocks notes were rate-limited. |

## Active sprint 0 (v26.09.30)

- [ ] Keep the package at `packages/open-time`, code `OT`, panel title Open Time, hub domain `time`.
- [ ] Stay in the Central catalog for the Windows smoke: add a task, move it on the board, draft a crew row, leave the bridge off.
- [ ] Repeat that smoke on the Linux AppImage.
- [ ] On the Metro PWA, expose the granted public schedule only. Drafting stays on Central.
- [ ] Deeper Blocks notes (kanban, timeline, quick-add, task fields) after the Windows window. The follow-up write-up was rate-limited.

## After this sprint

- [ ] Hub domain `time` moves onto SQLite + Yjs with the Central hub. The bridge allowlist is Open Books, Open Bill, Open Time, and Anytype, off by default.
- [ ] Pepper tool `tasks` stays bound to code `OT`.
