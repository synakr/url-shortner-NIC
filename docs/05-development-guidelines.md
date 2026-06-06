# Development Guidelines

## Branching Strategy

Protected Branches:

* main
* develop

Feature Branches:

* feature/architecture
* feature/backend-core
* feature/authentication
* feature/database-analytics
* feature/frontend
* feature/devops
* feature/docs

Rules:

1. Never commit directly to main.
2. Never commit directly to develop.
3. All work must happen on feature branches.
4. All changes must be merged through Pull Requests.


## Commit Message Convention

Format:

type(scope): description

Examples:

feat(auth): implement login endpoint

feat(url): create URL shortening service

fix(auth): resolve JWT validation issue

docs(api): update authentication endpoints

refactor(database): simplify repository queries

test(auth): add login unit tests


## Pull Request Rules

Every Pull Request must:

* Build successfully
* Follow project architecture
* Include meaningful commit messages
* Update documentation when necessary
* Be reviewed before merging

Pull Requests should target:

feature branch → develop

Only stable releases should be merged:

develop → main


## Code Review Checklist

Architecture

* Follows Controller → Service → Repository pattern
* No business logic inside controllers

Security

* No secrets committed
* Proper validation applied

Code Quality

* Meaningful names
* No duplicated code
* Proper exception handling

Testing

* Relevant tests added

Documentation

* Documentation updated if behavior changes
