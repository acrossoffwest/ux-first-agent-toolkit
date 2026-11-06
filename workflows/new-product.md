# Workflow: new product (greenfield)

1. `/ux-init` — product-discovery interview → `product-intent.md`.
2. `user-story-architect` story map → walking skeleton (3–7 stories max).
3. For each skeleton story: `/ux-story` (artifacts + critique + approval).
4. Prototype review session: user clicks through the linked prototypes for the
   whole skeleton before any implementation. Navigation problems found here
   cost minutes; found after implementation they cost days.
5. `/ux-build` story by story; `/ux-test` after each.
6. `/ux-video` for the stories that define the product (demo material).
7. `/ux-audit` before the first release.

Anti-pattern this workflow exists to prevent: implementing a CRUD backbone
first and "adding UX later". The skeleton is chosen by user outcome, not by
data model convenience.
