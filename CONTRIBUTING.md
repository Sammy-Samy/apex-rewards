# Contributing to Apex Rewards

Thank you for your interest in contributing! This document explains how to get involved.

## Getting Started

1. Fork the repository and clone your fork
2. Create a branch: `feat/<description>`, `fix/<description>`, or `docs/<description>`
3. Make your changes following the code style guidelines below
4. Run all checks before pushing:

```bash
# Contracts
cd contracts
cargo fmt --all && cargo clippy -- -D warnings && cargo test

# Frontend
cd apexRewards/frontend
pnpm lint && pnpm type-check && pnpm test

# Backend
cd apexRewards/backend
npm run lint && npm run typecheck && npm test
```

5. Open a pull request against `main` and fill in the PR template

## Code Style

- **Rust**: `rustfmt` + `clippy` with `-D warnings`
- **TypeScript**: ESLint + Prettier
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)

## Reporting Issues

- **Bugs**: Use the Bug Report template
- **Features**: Use the Feature Request template
- **Security**: See [SECURITY.md](SECURITY.md) — do **not** open public issues for vulnerabilities

## Pull Request Requirements

- All CI checks must pass
- At least one maintainer approval required
- PRs are squash-merged

## License

By contributing, you agree your contributions will be licensed under the [MIT License](LICENSE).
