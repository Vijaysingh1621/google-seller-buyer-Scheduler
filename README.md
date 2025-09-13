# Next.js Scheduler - Google Calendar Integration

A full-stack appointment booking application built with Next.js that enables seamless scheduling between buyers and sellers with Google Calendar integration.

## Features

### 🗓️ Google Calendar Integration
- Seamless sync with Google Calendar
- Real-time availability checking
- Automatic calendar event creation
- Two-way booking (events created on both participants' calendars)
- Google Meet integration for virtual meetings

### 👥 Dual User Roles
- **Sellers**: Set availability, manage appointments, view dashboard
- **Buyers**: Browse sellers, book appointments, view bookings

### 🔐 Authentication
- Google OAuth2 integration with NextAuth.js
- Secure token management and refresh
- Role-based access control

### 📱 Responsive Design
- Modern UI with Tailwind CSS
- Mobile-friendly responsive design
- Intuitive user experience

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js v5
- **Database**: MongoDB with Mongoose
- **API Integration**: Google Calendar API, Google APIs
- **Deployment**: Vercel

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v18 or higher)
2. **MongoDB** database (local or MongoDB Atlas)
3. **Google Cloud Console** project with OAuth2 credentials

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd scheduler-intern
npm install
```

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Calendar API
   - Google People API

4. Create OAuth2 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://your-vercel-domain.vercel.app/api/auth/callback/google` (production)

5. Note down your:
   - Client ID
   - Client Secret

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/scheduler-app
# OR use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/scheduler-app

# Environment
NODE_ENV=development
```

**Required Environment Variables:**
- `NEXTAUTH_SECRET`: Generate with: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID`: From Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- `MONGODB_URI`: Your MongoDB connection string

### 4. Database Setup

The application will automatically create the required collections when you first run it. Make sure your MongoDB instance is running.

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Application Flow

### For Sellers:
1. Sign in with Google (select "Seller" role)
2. Grant Google Calendar permissions
3. Set weekly availability in the dashboard
4. Receive and manage appointment bookings
5. View appointments in unified dashboard

### For Buyers:
1. Sign in with Google (select "Buyer" role)
2. Browse available sellers
3. Select seller and view available time slots
4. Book appointment with details
5. Receive calendar invite and meeting link

## API Routes

### Authentication
- `GET|POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Appointments
- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments/book` - Book new appointment
- `GET /api/appointments/seller` - Get seller's appointments

### Sellers
- `GET /api/sellers` - List all available sellers
- `GET /api/sellers/[sellerId]/availability` - Get seller availability

### Availability
- `GET|POST /api/availability` - Manage seller availability

### User Management
- `POST /api/user/role` - Update user role

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── buyer/             # Buyer-specific pages
│   ├── seller/            # Seller-specific pages
│   └── appointments/      # Shared appointments page
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── calendar.ts       # Google Calendar utilities
│   └── mongodb.ts        # MongoDB connection
├── models/               # MongoDB/Mongoose models
│   ├── User.ts
│   ├── Appointment.ts
│   └── Availability.ts
└── types/               # TypeScript type definitions
```

## Deployment

### Deploy to Vercel

1. **Connect Repository**:
   - Connect your GitHub repository to Vercel
   - Or use Vercel CLI: `vercel --prod`

2. **Environment Variables**:
   Add all environment variables in Vercel dashboard:
   - `NEXTAUTH_URL`: `https://your-app.vercel.app`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `MONGODB_URI`

3. **Google OAuth Setup**:
   Update authorized redirect URIs in Google Cloud Console:
   - Add: `https://your-app.vercel.app/api/auth/callback/google`

4. **Deploy**:
   ```bash
   vercel --prod
   ```

## Key Features Implemented

✅ **Authentication**
- Google OAuth2 with NextAuth.js
- Role-based access (Seller/Buyer)
- Secure token management

✅ **Google Calendar Integration**
- Real-time availability checking
- Automatic event creation
- Google Meet link generation
- Two-way calendar sync

✅ **Seller Features**
- Dashboard with appointment overview
- Weekly availability settings
- Appointment management

✅ **Buyer Features**
- Seller browsing and selection
- Real-time slot viewing
- Easy appointment booking

✅ **Shared Features**
- Unified appointments view
- Responsive design
- MongoDB data persistence

## Troubleshooting

### Common Issues

1. **Google Calendar API Errors**
   - Ensure APIs are enabled in Google Cloud Console
   - Check OAuth consent screen configuration
   - Verify redirect URIs are correct

2. **Database Connection Issues**
   - Ensure MongoDB is running
   - Check MONGODB_URI format
   - Verify network access for MongoDB Atlas

3. **Authentication Issues**
   - Generate new NEXTAUTH_SECRET
   - Check Google OAuth credentials
   - Verify environment variables

### Support

For issues and questions:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure all required APIs are enabled in Google Cloud Console

## License

This project is built for educational purposes as part of an internship assignment.

---

**Built with ❤️ using Next.js, TypeScript, and Google Calendar API**
