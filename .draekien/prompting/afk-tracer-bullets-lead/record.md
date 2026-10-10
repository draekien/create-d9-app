---
target: claude-fable-5-1
kind: product
guidance: 2026-10-07
---

**Target:** claude-fable-5-1 (user named Fable in the request; resolved to the session model ID) · **Kind:** product prompt · **Guidance:** 2026-10-07 (fable.md, general.md, general-product.md)
**Assumptions:** done per bullet = pull request open, owner merges; one pass over bullets unblocked at the start, bullets behind an unmerged PR wait for the next run; bullets that share files run stacked, not parallel; ticking issue task checkboxes is allowed; no changeset until .changeset/ exists
**Placement:** chat message, whole prompt as one user message; the "Finish the whole task" blocks, the progress-update line and the picking-models rule are omitted because this harness's system prompt and CLAUDE.md already carry them verbatim, so they would be no-ops here
**Task content:** paragraphs 1, 3, 4 (except the fence and sequencing lines), the authorization sentence, and the recap contents

**Sources**
- "I'm working through … With that in mind:" — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5 § Give the reason, not only the request (predecessor: Fable 5)
- "Act as the tech lead for this run." — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices § Give Claude a role
- "Use the using-subagents skill." — https://claude.dev/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models/ § Then: Put it all upfront (progressive disclosure: the skill holds the briefing, delivery and reconcile method instead of the prompt)
- "Fence the subagent … a note in its report, not a change." — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1 § Keep changes and tests to what the task asks for (adapted)
- "Blocked-by links are the gate … because the merge would otherwise be yours to untangle." — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices § Add context to improve performance
- "Delegate independent subtasks to subagents … missing relevant context." — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5 § Parallel subagents (predecessor: Fable 5), verbatim
- "Before opening a pull request, verify the bullet yourself …" — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5 § Ground progress claims during long runs (predecessor: Fable 5); https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices § Leverage thinking & interleaved thinking capabilities
- "Pushing branches, opening pull requests … are authorized for this run; merging, pushing to main … are not." — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices § Balancing autonomy and safety (names pushing code and editing issues as actions that otherwise warrant confirmation)
- "The run ends when … In the recap, list …" — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1 § Finish the whole task; § Ask for user-facing progress updates
