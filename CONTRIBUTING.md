# Contributing to School Management System

Welcome! We're glad you're here. Following these guidelines helps us keep the project high quality and consistent.

## Local Setup

1. **Clone the Repo**: `git clone ...`
2. **Backend Setup**:
   - `python -m venv venv`
   - `source venv/bin/activate`
   - `pip install -r requirements.txt`
3. **Frontend Setup**:
   - `cd frontend`
   - `npm install`

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes.
3. Ensure linting passes:
   - Backend: `venv/bin/ruff check app scripts`
   - Frontend: `npm run lint`
4. Commit your changes (Husky will run pre-commit hooks).
5. Push and create a Pull Request.

## Pull Request Process

1. Use the PR template provided.
2. Ensure your PR description is clear.
3. At least one reviewer must approve before merging to `main`.
4. CI checks must pass.
