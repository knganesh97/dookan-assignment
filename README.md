# Dookan Assignment

A full-stack application with Flask backend and React frontend, featuring authentication, data management, and event logging.

## Project Structure

```
dookan-assignment/
├── backend/             # Flask backend
│   ├── app/            # Application code
│   ├── config/         # Configuration files
│   └── tests/          # Backend tests
├── frontend/           # React frontend
│   ├── src/           # Source code
│   ├── public/        # Static files
│   └── tests/         # Frontend tests
└── docker/            # Docker configuration
```

## Features

- Authentication system with JWT
- MongoDB and PostgreSQL integration
- Shopify GraphQL API integration
- Data visualization with Plotly
- Event logging system
- Modern UI with Chakra UI and Purity UI Dashboard

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the backend:
```bash
cd backend
flask run
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the frontend:
```bash
npm start
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
FLASK_APP=app
FLASK_ENV=development
SECRET_KEY=your-secret-key
MONGODB_URI=your-mongodb-uri
POSTGRES_URI=your-postgres-uri
SHOPIFY_ACCESS_TOKEN=your-shopify-token
```

## API Documentation

The API documentation will be available at `/api/docs` when running the backend server.

## Testing

Run backend tests:
```bash
cd backend
pytest
```

Run frontend tests:
```bash
cd frontend
npm test
``` 