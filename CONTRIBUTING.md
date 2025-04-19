# Contributing to SignSpeak

Thank you for considering contributing to SignSpeak! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

Bugs are tracked as GitHub issues. Create an issue and provide the following information:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed after following the steps
- Explain which behavior you expected to see instead and why
- Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are also tracked as GitHub issues. When creating an enhancement suggestion, please include:

- A clear and descriptive title
- A detailed description of the proposed enhancement
- An explanation of why this enhancement would be useful
- Possible implementation details if you have them

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Submit a pull request

## Development Setup

### Frontend

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/signspeak.git
   cd signspeak
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

### Backend

1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Create a virtual environment
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

4. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file with your Gemini API key
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

6. Start the Flask server
   ```bash
   python app.py
   ```

## Coding Guidelines

### JavaScript/TypeScript

- Use TypeScript for type safety
- Follow the ESLint configuration in the project
- Use functional components with hooks for React components
- Document complex functions and components

### Python

- Follow PEP 8 style guide
- Use type hints where appropriate
- Document functions and classes with docstrings

## Testing

- Write tests for new features
- Ensure all tests pass before submitting a pull request

## Documentation

- Update documentation for any changes to the API or user interface
- Document new features thoroughly

## Commit Messages

Use clear and descriptive commit messages. Follow the format:

```
type(scope): Brief description

Detailed description if necessary
```

Types include:
- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code changes that neither fix bugs nor add features
- test: Adding or modifying tests
- chore: Changes to the build process or auxiliary tools

## Questions?

If you have any questions, feel free to create an issue or contact the maintainers.

Thank you for contributing to SignSpeak!
