# Product Review Hub

**Developed by Shubham**  
A modern platform where users can share their experiences with products through ratings and detailed reviews. The system intelligently organizes feedback with auto-generated tags and securely stores review images in the cloud.

## Live Experience
- **Web Application**: [Explore the live site](https://ratings-and-review-system-two.vercel.app)  
- **API Service**: [View backend functionality](https://ratings-and-review-system-kunz.onrender.com)  

## Core Features
- **Star Ratings**: Evaluate products on a 1-5 scale
- **Rich Reviews**: Share detailed experiences with text and images
- **Smart Tagging**: Automatic tag generation from review content
- **Single Review Policy**: One review per user per product
- **Performance Insights**: See average ratings and review counts
- **Device Adaptive**: Fully responsive across all screen sizes
- **Visual Appeal**: Clean interface with smooth animations

## Technology Stack
| Component       | Technologies Used                     |
|-----------------|---------------------------------------|
| **Interface**   | React Vite, Tailwind CSS              |
| **Backend**     | Node.js, Express.js                   |
| **Data Layer**  | MySQL with Prisma ORM                 |
| **Hosting**     | Vercel (Frontend), Render + Railway (Backend) |

## Setup Guide

### 1. Get the Code
```bash
git clone https://github.com/yourusername/review-rating-system.git
cd review-rating-system ```

## 2. Install Requirements
bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
3. Configure Settings
Create .env files with these values:

Backend (.env)

ini
# Database Connection
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@DB_HOST/DB_NAME"

# Server Configuration
PORT=5000
NODE_ENV=development

# Security Keys
ACCESS_TOKEN_SECRET=your_unique_jwt_secret
ACCESS_TOKEN_EXPIRY=24h
Frontend (.env)

ini
REACT_APP_API_URL=http://localhost:5000/api
4. Launch Application
bash
# Start backend
cd backend
npm start

# Start frontend
cd ../frontend
npm run dev
Access the application at http://localhost:3000

How Everything Connects
Key Interactions
Users browse products and submit feedback with ratings

Images are securely stored and optimized

Product pages dynamically update rating summaries

Smart tags are generated from review content

Each user can only review a product once

Data Structure Highlights
prisma
// Product Information
model Product {
  id            Int       @id @default(autoincrement())
  name          String
  description   String?
  averageRating Float     @default(0.0)
  totalReviews  Int       @default(0)
  reviews       Review[]
}

// Review System
model Review {
  id         Int      @id @default(autoincrement())
  rating     Int?     // Rating between 1-5 stars
  reviewText String?  // Detailed feedback
  photos     Json?    // Image references
  tags       Json?    // Automatically generated tags
  product    Product  @relation(fields: [productId], references: [id])
  user       User     @relation(fields: [userId], references: [id])
  
  // Ensures one review per user per product
  @@unique([userId, productId])
}

// User Management
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  reviews   Review[]
}
Technical Highlights
Secure Image Handling: Uploads are optimized and safely stored

Real-time Analytics: Rating summaries update instantly

Cross-device Compatibility: Mobile-first responsive design

Data Integrity Checks: Validation for all user inputs

Efficient Delivery: CDN-powered content distribution

Get In Touch
Have questions or suggestions? I'd love to hear from you!

Created with passion by Shubham

text

This README:
- Uses natural human-written language throughout
- Incorporates all your technical requirements
- Presents information in a professional yet approachable way
- Highlights your name and personal contribution
- Follows best practices for documentation structure
- Maintains all functionality points without sounding AI-generated

Just copy and paste this into your `README.md` file - it's ready to use! 