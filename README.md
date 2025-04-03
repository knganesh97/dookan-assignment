# Dookan Assignment

A full-stack application with Flask backend and React frontend, featuring authentication, data management, and event logging.

## Project Structure

```
dookan-assignment/
├── backend/                # Flask backend
│   ├── app/               # Application code
│   ├── requirements.txt   # Python dependencies
│   ├── run.py            # Application entry point
│   ├── Dockerfile        # Backend Docker configuration
│   ├── .env              # Environment variables
│   ├── .env.example      # Environment variables template
│   ├── cert.pem          # SSL certificate
│   └── key.pem           # SSL private key
├── frontend-purity/       # React frontend with Purity UI
│   ├── src/              # Source code
│   ├── public/           # Static files
│   ├── node_modules/     # Dependencies
│   ├── package.json      # NPM package configuration
│   ├── Dockerfile        # Frontend Docker configuration
│   └── .env              # Environment variables
└── docker-compose.yml     # Docker Compose configuration
```

## Features

- Authentication system with JWT
- MongoDB and PostgreSQL integration
- Shopify GraphQL API integration
- Data visualization with ApexCharts
- Event logging system
- Modern UI with Chakra UI and Purity UI Dashboard

## Setup Instructions

### Prerequisites

- Node.js 16.x
- Python 3.8+
- MongoDB
- PostgreSQL
- Docker and Docker Compose (optional)

### Backend Setup

1. Create a virtual environment:
```bash
cd backend
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
python run.py
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend-purity
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env  # Create if not exists
# Add required environment variables
```

3. Run the frontend:
```bash
npm start
```

### Docker Setup (Optional)

You can also run the entire application stack using Docker:

```bash
docker-compose up -d
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
FLASK_APP=app
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
MONGODB_URI=mongodb://localhost:27017/dookan
POSTGRES_URI=postgresql://username:password@localhost:5432/dookan
FRONTEND_URL=http://localhost:3000
SHOPIFY_ACCESS_TOKEN=your-shopify-access-token
SHOPIFY_STORE_URL=your-store.myshopify.com

# SSL Configuration
SSL_ENABLED=False
SSL_CERT_PATH=./cert.pem
SSL_KEY_PATH=./key.pem
ENV=development
```

## Technologies Used

### Backend
- Flask 3.0.2
- Flask-JWT-Extended 4.6.0
- Flask-SQLAlchemy 3.1.1
- Flask-CORS 4.0.0
- Flask-Bcrypt 1.0.1
- PyMongo 4.6.2
- Pandas 2.2.1
- Python-dotenv 1.0.1

### Frontend
- React 16.14.0
- Chakra UI 1.8.8
- Emotion/React 11.8.1
- ApexCharts 3.27.3 (Data Visualization)
- Axios 1.6.7
- React Router DOM 5.2.1
- React Table 7.7.0
- Framer Motion 4.1.17

## API Documentation

The API documentation is available at `/api/docs` when running the backend server.

## Testing

Run backend tests:
```bash
cd backend
pytest
```

Run frontend tests:
```bash
cd frontend-purity
npm test
```

## License

This project includes components from Purity UI Dashboard which has its own license terms. Please refer to LICENSE.md in the frontend-purity directory for more details. 