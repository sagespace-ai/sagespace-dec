# Contributing to Stitch - SageSpace

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## 📋 Development Guidelines

### Code Style

- Follow existing code patterns
- Use TypeScript for all new code
- Follow the component structure in `DEVELOPMENT.md`
- Use Tailwind CSS for styling
- Keep components small and focused

### TypeScript

- Always define types for props
- Use interfaces for object types
- Avoid `any` type
- Use type inference where appropriate

### Components

- One component per file
- Use functional components
- Extract reusable logic to hooks
- Keep components under 200 lines when possible

### Testing

- Test your changes manually
- Verify all routes work
- Test in multiple browsers
- Test responsive design
- Test dark mode

## 🔍 Pull Request Process

1. **Update Documentation**: Update README if needed
2. **Add Comments**: Comment complex logic
3. **Test Thoroughly**: Test all affected features
4. **Check Linting**: Run `npm run lint`
5. **Write Clear PR**: Describe changes and why

### PR Template

\`\`\`markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested on mobile
- [ ] Tested dark mode

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
\`\`\`

## 🐛 Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Step-by-step instructions
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Environment**: Browser, OS, version

## 💡 Suggesting Features

When suggesting features:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other solutions considered
4. **Additional Context**: Any other relevant info

## 📝 Code Review

All code will be reviewed for:

- Code quality and style
- TypeScript correctness
- Performance implications
- Accessibility
- Browser compatibility
- Documentation

## 🎯 Priorities

Current focus areas:

1. Backend API integration
2. Real-time features
3. Performance optimization
4. Accessibility improvements
5. Testing coverage

## 📞 Questions?

Feel free to:
- Open an issue for questions
- Ask in team discussions
- Review existing code for examples

Thank you for contributing! 🎉
