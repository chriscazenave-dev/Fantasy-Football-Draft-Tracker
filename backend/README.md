# Fantasy Football Draft Tracker - Backend API

Flask REST API for managing fantasy football draft leagues, teams, prospects, and trades.

## Features

- **League Management**: Create and manage fantasy football leagues
- **Team Management**: Manage teams within leagues with customizable names, icons, and colors
- **Prospect Management**: Add and manage football prospects with positions and colleges
- **Draft Operations**: Execute draft picks, track draft order, and manage the draft process
- **Trade System**: Trade draft picks between teams

## API Endpoints

### Leagues
- `GET /api/leagues` - Get all leagues
- `GET /api/leagues/<id>` - Get league by ID
- `POST /api/leagues` - Create new league
- `PUT /api/leagues/<id>` - Update league
- `DELETE /api/leagues/<id>` - Delete league
- `POST /api/leagues/<id>/initialize` - Initialize league with teams and draft picks

### Teams
- `GET /api/teams?league_id=<id>` - Get teams for a league
- `GET /api/teams/<id>` - Get team by ID
- `PUT /api/teams/<id>` - Update team
- `DELETE /api/teams/<id>` - Delete team
- `GET /api/teams/<id>/roster` - Get team roster

### Prospects
- `GET /api/prospects?league_id=<id>` - Get prospects for a league
- `GET /api/prospects/<id>` - Get prospect by ID
- `POST /api/prospects` - Create prospect
- `POST /api/prospects/bulk` - Create multiple prospects
- `PUT /api/prospects/<id>` - Update prospect
- `DELETE /api/prospects/<id>` - Delete prospect

### Draft
- `GET /api/draft/picks?league_id=<id>` - Get all draft picks for a league
- `GET /api/draft/picks/<id>` - Get draft pick by ID
- `POST /api/draft/execute` - Execute a draft pick
- `POST /api/draft/undraft` - Undraft a prospect
- `GET /api/draft/current?league_id=<id>` - Get current draft pick

### Trades
- `GET /api/trades?league_id=<id>` - Get trades for a league
- `GET /api/trades/<id>` - Get trade by ID
- `POST /api/trades` - Execute a trade
- `DELETE /api/trades/<id>` - Delete trade

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Initialize the database:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

4. Run the development server:
```bash
python run.py
```

The API will be available at `http://localhost:5000`

## Database Models

- **League**: Main container for a draft league
- **Team**: Teams participating in the draft
- **Prospect**: Football players available for drafting
- **DraftPick**: Individual draft picks with snake draft order
- **Trade**: Record of draft pick trades between teams

## Environment Variables

- `DATABASE_URL`: Database connection string (defaults to SQLite)
- `FLASK_DEBUG`: Enable debug mode (default: True)
- `SECRET_KEY`: Flask secret key for sessions
