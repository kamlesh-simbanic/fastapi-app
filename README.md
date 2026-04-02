# FastAPI School Management System

A comprehensive, modular school management application built with a FastAPI backend and a Next.js frontend. This project features student management, class organization, fee payment portals, and more, all packaged for easy deployment with Docker.

## 🚀 Features

- **Modular Backend**: Scalable FastAPI architecture with clear separation of routers, models, and controllers.
- **Modern Frontend**: Responsive Next.js application with Tailwind CSS and static-export support.
- **Authentication**: Secure JWT-based authentication for students, staff, and admins.
- **Database Architecture**: Robust relational schema managed via SQLAlchemy with MySQL.
- **Public Portal**: Unauthenticated access for GR number verification and UPI-based fee payments.
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
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript

## 📁 Project Structure

```text
.
├── app/                # FastAPI Backend application
│   ├── controllers/    # Business logic
│   ├── models/         # SQLAlchemy database models
│   ├── routers/        # API route definitions
│   ├── schemas/        # Pydantic models for validation
│   ├── utils.py        # Shared utilities
│   └── main.py         # Application entry point
├── frontend/           # Next.js Frontend application
│   ├── src/            # Application source code
│   └── public/         # Static assets
├── Dockerfile          # Multi-stage Docker configuration
├── pyproject.toml      # Python project configuration
└── requirements.txt    # Python dependencies
```

## ⚙️ Getting Started

### Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher
- **MySQL Server**: A running MySQL instance

### Backend Setup

1.  **Create a Virtual Environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add:
    ```env
    DATABASE_URL=mysql+pymysql://user:password@localhost/dbname
    SECRET_KEY=your-secret-key-here
    ```
4.  **Run the Server**:
    ```bash
    uvicorn app.main:app --reload
    ```

### Frontend Setup

1.  **Navigate to Frontend Directory**:
    ```bash
    cd frontend
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run in Development Mode**:
    ```bash
    npm run dev
    ```

## 🐳 Docker Deployment

To build and run the entire application using Docker:

1.  **Build the Image**:
    ```bash
    docker build -t school-mgmt-app .
    ```
2.  **Run the Container**:
    ```bash
    docker run -p 8000:8000 --env-file .env school-mgmt-app
    ```
    The application will be accessible at `http://localhost:8000`.

## 🧪 Testing and Linting

- **Run backend tests**: `pytest`
- **Run linting (Ruff)**: `ruff check app`
- **Type checking**: `mypy app`
