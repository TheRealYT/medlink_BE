### Format:
```
<type>(<scope>): <short description>

<body> (optional)

<footer> (optional)
```

### Types:
- **feat**: A new feature or functionality
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (e.g., formatting, missing semicolons)
- **refactor**: Code changes that neither fix a bug nor add a feature (e.g., improving code structure)
- **test**: Adding or modifying tests
- **chore**: Changes that do not affect the application logic (e.g., build scripts, dependencies)
- **perf**: Performance improvements
- **ci**: Continuous Integration-related changes

### Scope (optional):
- Specify the area of the codebase being affected, e.g., `auth`, `api`, `db`, `config`.

### Example:
```
feat(auth): add JWT authentication middleware

- Implemented middleware to verify JWT tokens for protected routes.
- Added utility function for token creation and validation.

closes #45
```

### Notes:
1. **Subject line**: Keep it concise and under 72 characters.
2. **Body**: Explain the "what" and "why," not just the "how." Use bullet points if necessary.
3. **Footer**: Use it for referencing issues or tasks (e.g., `closes #123`).