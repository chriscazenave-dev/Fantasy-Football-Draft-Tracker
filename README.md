# Splitwise Clone

A simplified clone of Splitwise, a web application for splitting expenses with friends and groups.

## Features

- User authentication (register, login, profile)
- Create and manage groups
- Add members to groups
- Add expenses and split them among group members
- Track balances and settlements
- View expense history

## Tech Stack

- **Backend**: Python with Flask
- **Database**: SQLite (can be configured to use PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: Coming soon (React)

## Getting Started

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/splitwise-clone.git
   cd splitwise-clone/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

5. Run the development server:
   ```bash
   python run.py
   ```

   The API will be available at `http://localhost:5000`

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `GET /api/auth/me` - Get current user profile

### Groups

- `GET /api/groups` - Get all groups for the current user
- `POST /api/groups` - Create a new group
- `GET /api/groups/<group_id>` - Get group details
- `POST /api/groups/<group_id>/members` - Add a member to a group

### Expenses

- `GET /api/expenses` - Get all expenses for the current user
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/balances` - Get balances for all users
- `POST /api/expenses/settle` - Mark an expense as settled

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=sqlite:///app.db
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
