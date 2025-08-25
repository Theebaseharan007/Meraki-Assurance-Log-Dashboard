# TestRunner Dashboard

A production-ready, enterprise-grade web application for managing test runs and team analytics. Built with React 18, Node.js, Express, and MongoDB Atlas.

## 🚀 Features

### For Managers
- **Real-time Analytics**: Interactive charts and dashboards with detailed test run insights
- **Team Overview**: Comprehensive view of all teams and their performance
- **Date-based Filtering**: Filter test runs by specific dates and teams
- **Detailed Reports**: Drill-down into individual test runs with section/subsection breakdowns

### For Team Leads
- **Test Run Submission**: Easy-to-use form for submitting test results
- **Submission Management**: View, edit, and manage all past submissions
- **Structured Testing**: Support for sections and subsections with individual status tracking
- **Real-time Updates**: Changes reflect immediately in manager dashboards

### Shared Features
- **Role-based Access Control**: Secure authentication with JWT
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark/Light Mode**: Theme switching with system preference detection
- **Real-time Synchronization**: Instant updates across all user sessions
- **Enterprise Security**: Production-ready security with bcrypt and JWT

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for styling with custom design system
- **Framer Motion** for smooth animations
- **Recharts** for interactive data visualization
- **React Query** for efficient data fetching and caching
- **React Router** for client-side routing

### Backend
- **Node.js** with Express.js framework
- **MongoDB Atlas** for cloud database
- **Mongoose** for elegant MongoDB object modeling
- **JWT** for secure authentication
- **bcrypt** for password hashing
- **Express Validator** for input validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (free tier available)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd testrunner-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/dashboardApp?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for production CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Start Development Servers

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 🎯 Usage Guide

### First Time Setup

1. **Visit the Landing Page**: Navigate to http://localhost:3000
2. **Select Your Role**: Choose between Manager or Team Lead
3. **Create Account**: Sign up with your details
   - **Managers**: Just need name, email, and password
   - **Team Leads**: Also need team name and manager's email (manager must exist first)

### For Managers

1. **Dashboard Overview**: See all team activities and statistics
2. **Filter by Date**: Use the date picker to view runs for specific days
3. **Filter by Team**: Select specific teams to focus on their results
4. **Interactive Charts**: Hover over chart elements to see detailed test names
5. **Team Management**: View all teams under your management

### For Team Leads

1. **Submit Test Runs**: Use the structured form to submit test results
2. **Add Sections**: Create sections for different test categories
3. **Add Subsections**: Break down sections into detailed test cases
4. **Set Results**: Mark each section/subsection as Passed, Failed, Skipped, or Errored
5. **Manage Submissions**: View and edit all your past submissions

## 🏗 Project Structure

```
testrunner-dashboard/
├── backend/
│   ├── controllers/         # Request handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx         # Main app component
│   ├── public/             # Static assets
│   └── package.json        # Dependencies
└── README.md               # This file
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Strict role-based route protection
- **Input Validation**: Comprehensive server-side validation
- **CORS Protection**: Configured CORS for production environments
- **Security Headers**: Helmet.js for security headers

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Submissions (Team Leads)
- `POST /api/submissions` - Create new submission
- `GET /api/submissions/mine` - Get user's submissions
- `GET /api/submissions/:id` - Get specific submission
- `PUT /api/submissions/:id` - Update submission
- `DELETE /api/submissions/:id` - Delete submission

### Manager Reports
- `GET /api/manager/runs` - Get runs by date/team
- `GET /api/manager/teams` - Get managed teams
- `GET /api/manager/dashboard` - Dashboard summary
- `GET /api/manager/stats` - Detailed statistics

### Health Check
- `GET /api/health` - Server health status

## 🚀 Production Deployment

### Backend Deployment (Render/Heroku)

1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas is configured for production
3. Update CORS origins for your production frontend URL

### Frontend Deployment (Vercel/Netlify)

```bash
cd frontend
npm run build
```

The `dist` folder contains the production build ready for deployment.

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-frontend-domain.com
```

## 🧪 Testing

### Demo Credentials

The application includes demo data for testing:

**Manager Account:**
- Email: manager@demo.com
- Password: demo123

**Team Lead Account:**
- Email: lead@demo.com  
- Password: demo123

## 🎨 Customization

### Theming
The application uses a custom design system built on Tailwind CSS. Colors and spacing can be customized in:
- `frontend/tailwind.config.js` - Tailwind configuration
- `frontend/src/index.css` - CSS custom properties and components

### Adding Features
The modular architecture makes it easy to add new features:
1. Add new API endpoints in `backend/routes/`
2. Create corresponding controllers in `backend/controllers/`
3. Add frontend pages in `frontend/src/pages/`
4. Update navigation in `frontend/src/layouts/DashboardLayout.jsx`

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the Vite proxy is configured correctly in `vite.config.js`
2. **Database Connection**: Verify MongoDB Atlas connection string and network access
3. **JWT Errors**: Check that JWT_SECRET is set in environment variables
4. **Build Errors**: Ensure all dependencies are installed with `npm install`

### Development Tips

- Use `npm run dev` for both frontend and backend during development
- Check browser console and terminal for error messages
- Use MongoDB Atlas dashboard to verify database operations
- Test API endpoints using tools like Postman or Thunder Client

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

Built with ❤️ using React, Node.js, and MongoDB Atlas
