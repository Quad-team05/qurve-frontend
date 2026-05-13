# Contributing

## Branch Strategy

- `main`: deployable branch
- feature branch naming: `feature/<topic>` or `fix/<topic>`

## Commit Convention

- `feat:` new feature
- `fix:` bug fix
- `chore:` maintenance
- `docs:` documentation
- `refactor:` refactor without behavior changes
- `test:` tests

## Before Opening a PR

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build` (if build script exists)

## Pull Request Rules

- Keep PRs focused and small.
- Add screenshots for UI changes.
- Explain why the change is needed.
