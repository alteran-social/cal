# Contributing to atproto Cal

Thank you for your interest in contributing to atproto Cal! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and collaborative. We're building something useful for everyone.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/cal.git`
3. Create a new branch: `git checkout -b feature/my-feature`
4. Make your changes
5. Test your changes
6. Commit your changes: `git commit -m "Add my feature"`
7. Push to your fork: `git push origin feature/my-feature`
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

- `src/pages/` - Astro pages and API routes
- `src/layouts/` - Page layouts
- `src/components/` - Reusable components
- `src/lib/` - Core library code
  - `atproto/` - AT Protocol integration
  - `auth/` - Authentication & sessions
  - `db/` - Database schema
  - `utils/` - Utility functions

## Coding Standards

- Use TypeScript for type safety
- Follow existing code style and conventions
- Add comments for complex logic
- Keep functions small and focused
- Write meaningful commit messages

## Pull Request Guidelines

1. **Describe your changes**: Provide a clear description of what your PR does
2. **Reference issues**: If your PR fixes an issue, reference it with "Fixes #123"
3. **Keep it focused**: One feature or fix per PR
4. **Test your changes**: Ensure your changes work as expected
5. **Update documentation**: Update README or other docs if needed

## Reporting Issues

When reporting issues, please include:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, etc.)
- Any relevant error messages or logs

## Feature Requests

Feature requests are welcome! Please:

- Check if the feature has already been requested
- Clearly describe the feature and its use case
- Explain why this feature would be useful to most users

## Questions?

If you have questions, feel free to:

- Open an issue with the "question" label
- Start a discussion on GitHub Discussions

## License

By contributing to atproto Cal, you agree that your contributions will be licensed under the MIT License.
