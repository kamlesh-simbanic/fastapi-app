# FastAPI School Management System

A comprehensive, modular school management application built with a FastAPI backend and a Next.js frontend. This project features student management, class organization, fee payment portals, and more, all packaged for easy deployment with Docker.

## 🚀 Features

- **Modular Backend**: Scalable FastAPI architecture with clear separation of routers, models, and controllers.
- **Modern Frontend**: Responsive Next.js application with Tailwind CSS and static-export support.
- **Authentication**: Secure JWT-based authentication with role-based access control.
- **Modules**:
  - **Student & Staff Management**: Comprehensive profiles and records.
  - **Leave Management**: Automated leave request and approval workflows.
  - **Attendance & Holidays**: Track daily attendance and manage school calendars.
  - **Timetable & Subjects**: Interactive schedule grid and subject assignment.
  - **Fee Management**: Structure definition and UPI-integrated payment portals.
- **Data Persistence**: Robust relational schema managed via SQLAlchemy with MySQL.
- **PDF Generation**: Automated PDF generation for receipts and reports using ReportLab.
- **Dockerized Deployment**: Multi-stage Dockerfile for optimized production builds.

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database Layer**: [SQLAlchemy](https://www.sqlalchemy.org/) with [PyMySQL](https://github.com/PyMySQL/PyMySQL)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **Auth**: JWT (python-jose), Passlib (bcrypt)
- **Tools**: Ruff (linting), MyPy (type checking), Pytest (testing)

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **State Management**: React Context (Global & Auth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript

### Developer Tools
- **Git Hooks**: [Husky](https://typicode.github.io/husky/) & [lint-staged](https://github.com/lint-staged/lint-staged)
- **CI/CD**: GitHub Actions (Linting, Testing, QA Deployment)

## 🎨 Design & Theming

The application features a modern, premium design system built with **Tailwind v4** and structured around semantic CSS variables.

### Key Principles
- **Semantic Tokenization**: Instead of hardcoded color values, the UI strictly uses semantic tokens (e.g., `primary`, `secondary`, `card`, `muted`, `background`, `foreground`).
- **Mode-Aware Surfaces**: All surfaces and text colors automatically adapt to Light and Dark modes using `next-themes`.
- **Vibrant Aesthetic**: Utilizes a curated HSL-based palette with smooth gradients and glassmorphism (backdrop-blur) for a professional look.

### Theme Configuration
The theme is defined in `frontend/src/app/globals.css` within the Tailwind `@theme` block.

| Token | Usage | Light Value | Dark Value |
| :--- | :--- | :--- | :--- |
| `primary` | Main actions, highlights | Indigo (vibrant) | Indigo (vibrant) |
| `secondary` | Secondary surfaces, buttons | Zinc-100 | Zinc-800 |
| `accent` | Decorative accents, branding | Purple | Purple |
| `background` | Page background | White | Black (#0a0a0a) |
| `card` | Container surfaces | White (bordered) | Zinc-900/50 |
| `muted` | De-emphasized info | Zinc-50 | Zinc-900/30 |
| `border` | Dividers and outlines | Zinc-200 | Zinc-800 |

### Component Development
When building new components, always prefer semantic classes:
- **Backgrounds**: `bg-background`, `bg-card`, `bg-secondary`
- **Text**: `text-foreground`, `text-muted-foreground`, `text-primary`
- **Borders**: `border-border`

## 📁 Project Structure

```text
.
├── .github/workflows/  # CI/CD pipeline definitions
├── .husky/             # Git hook configurations
├── app/                # FastAPI Backend application
│   ├── controllers/    # Business logic
│   ├── models/         # SQLAlchemy database models
│   ├── routers/        # API route definitions
│   ├── schemas/        # Pydantic models for validation
│   └── main.py         # Application entry point
├── frontend/           # Next.js Frontend application
│   ├── src/            # Application source code
│   └── public/         # Static assets
├── package.json        # Root Node.js deps (Husky, lint-staged)
├── pyproject.toml      # Python project configuration
├── requirements.txt    # Python dependencies
└── Dockerfile          # Multi-stage Docker configuration
```

## ⚙️ Getting Started

### Prerequisites

- **Python**: 3.10+
- **Node.js**: 18.x+
- **MySQL Server**: Running instance

### 1. Root & Git Hooks Setup
From the project root:
```bash
npm install
```
This installs Husky and registers the git hooks.

### 2. Backend Setup
1. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
2. **Install Deps**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Env Configuration**:
   Create `.env` with:
   ```env
   DATABASE_URL=mysql+pymysql://user:password@localhost/dbname
   SECRET_KEY=your-secret-key
   ```
4. **Run Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

### 3. Frontend Setup
1. **Navigate**: `cd frontend`
2. **Install**: `npm install`
3. **Run**: `npm run dev`

## 🐳 Docker Deployment

Note: Ensure Docker is installed on your system.
1. **Build**: `docker build -t school-mgmt-app .`
2. **Run**: `docker run -p 8000:8000 --env-file .env school-mgmt-app`

## 🧪 Testing and Quality
- **Backend Tests**: `pytest`
- **Linting**: `ruff check app`
- **Frontend Lint**: `npm run lint` (inside frontend/)
- **Git Hooks**: Pre-commit hooks will automatically run linting on staged files.
