#!/bin/bash

# 1. Create project directories
mkdir saskpolytech-events
cd saskpolytech-events
mkdir frontend backend

# 2. Set up React frontend with Vite
cd frontend
npm create vite@latest . -- --template react
echo 'Frontend setup completed.'
npm install axios react-router-dom
npm install
echo 'Installed frontend dependencies.'

# 3. Set up Node.js backend with Express & Sequelize (for PostgreSQL)
cd ../backend
npm init -y
npm install express cors sequelize pg pg-hstore jsonwebtoken bcrypt dotenv
npm install nodemon --save-dev
echo 'Installed backend dependencies.'

# 4. Create basic server file
cat <<EOL > index.js
const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Server running'));

app.listen(5000, () => console.log('Server started on port 5000'));
EOL

echo 'Created backend entry file.'

# 5. Setup .env file for backend
cat <<EOL > .env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=saskpolytech_events
DB_PORT=5432
JWT_SECRET=your_jwt_secret
EOL

# 6. Return to root directory
cd ..

# 7. Provide instructions
echo "Setup Complete.\n\nTo start frontend, run:\ncd frontend && npm run dev\n\nTo start backend, run:\ncd backend && npx nodemon index.js"
