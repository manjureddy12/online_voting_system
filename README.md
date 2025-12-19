# College Voting System

A secure, real-time online voting system for college elections built with Node.js, Express, MongoDB, and modern web technologies.

## Features

- 🔐 Secure user authentication with JWT
- 🗳️ One vote per user with vote locking mechanism
- 📊 Real-time result dashboard
- 👥 Admin panel for election management
- 🎨 Modern, responsive UI
- 🔒 Password hashing with bcrypt
- ✅ Input validation and sanitization
- 🚀 RESTful API architecture

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Express Validator for input validation

### Frontend

- HTML5, CSS3, JavaScript (ES6+)
- Responsive design
- Real-time updates

## Project Structure

```
college-voting-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── voteController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Candidate.js
│   │   └── Vote.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── voteRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   └── validators.js
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── vote.js
│   │   ├── results.js
│   │   └── admin.js
│   ├── login.html
│   ├── register.html
│   ├── vote.html
│   ├── results.html
│   └── admin.html
├── .gitignore
├── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Steps

1. Clone the repository:

```bash
git clone <repository-url>
cd college-voting-system
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college-voting
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=24h
NODE_ENV=development
```

4. Start MongoDB (if running locally):

```bash
mongod
```

5. Run the application:

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

6. Access the application:

- Frontend: Open `frontend/login.html` in your browser
- API: `http://localhost:5000/api`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Voting

- `GET /api/votes/candidates` - Get all candidates
- `POST /api/votes/cast` - Cast a vote
- `GET /api/votes/status` - Check if user has voted
- `GET /api/votes/results` - Get election results

### Admin

- `POST /api/admin/candidates` - Add new candidate
- `GET /api/admin/candidates` - Get all candidates (admin)
- `DELETE /api/admin/candidates/:id` - Delete candidate
- `GET /api/admin/stats` - Get election statistics

## Security Features

1. **Password Security**: Passwords are hashed using bcrypt with salt rounds
2. **JWT Authentication**: Secure token-based authentication
3. **Vote Locking**: Once a user votes, they cannot vote again
4. **Input Validation**: All inputs are validated and sanitized
5. **Error Handling**: Comprehensive error handling middleware
6. **CORS Protection**: Configured CORS policies
7. **Environment Variables**: Sensitive data stored in .env

## Coding Principles Applied

- **SOLID Principles**: Single Responsibility, Dependency Injection
- **DRY (Don't Repeat Yourself)**: Reusable middleware and utilities
- **Separation of Concerns**: Clear separation between routes, controllers, and models
- **RESTful Design**: Standard REST API conventions
- **Error Handling**: Centralized error handling
- **Async/Await**: Modern asynchronous JavaScript
- **Input Validation**: Server-side validation for all inputs

## Git Workflow

This project follows Git best practices:

1. **Feature Branches**: Create branches for new features
2. **Meaningful Commits**: Descriptive commit messages
3. **Version Tags**: Semantic versioning (v1.0.0, v1.1.0, etc.)

### Common Git Commands

```bash
# Create a new feature branch
git checkout -b feature/candidate-photos

# Stage and commit changes
git add .
git commit -m "feat: add candidate photo upload feature"

# Push to remote
git push origin feature/candidate-photos

# Create a version tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Development Guidelines

1. Always create a new branch for features/fixes
2. Write descriptive commit messages
3. Test thoroughly before committing
4. Update documentation as needed
5. Follow the existing code style

## Testing

```bash
# Run tests (when implemented)
npm test

# Check code linting
npm run lint
```

## Deployment

### Production Checklist

- [ ] Set NODE_ENV to 'production'
- [ ] Use strong JWT_SECRET
- [ ] Configure MongoDB Atlas or production database
- [ ] Enable HTTPS
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Set up logging
- [ ] Enable monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Authors

- Your Name - Initial work

## Acknowledgments

- Express.js documentation
- MongoDB documentation
- JWT best practices
