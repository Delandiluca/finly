// Conventional-commit rules. Enforced locally by the `commit-msg` lefthook and in CI over the PR
// title (which becomes main's merge commit) and every commit in the PR. Inherits the standard
// Conventional Commits ruleset as-is — the spec is the single source of truth.
export default {
  extends: ['@commitlint/config-conventional'],
};
