# CareerVoid - AI-Powered Career Management Platform

CareerVoid is an advanced career management platform that leverages AI to help users maximize their job opportunities, optimize their career paths, and improve their application materials.

## Core Features

- **Smart Job Matching**: AI-powered job recommendations based on your resume and preferences
- **Resume Analysis**: Get intelligent feedback to improve your resume
- **Cover Letter Generation**: AI-generated, tailored cover letters for specific job applications
- **Interview Preparation**: Practice with AI-generated interview questions specific to the job
- **Career Path Visualization**: Plot your career trajectory and explore growth opportunities

## Project Structure

This project is a monorepo containing:

- **client**: React frontend application
- **server**: Node.js backend API
- **shared**: Shared TypeScript types and utilities

### Technology Stack

#### Frontend
- React with Next.js
- TypeScript
- Tailwind CSS
- Axios for API calls

#### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database with Sequelize ORM
- JWT authentication
- OpenAI API integration

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v13+)
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/careervoid.git
   cd careervoid
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the server directory based on `.env.example`
   - Add your OpenAI API key and database credentials

4. Set up the database:
   ```
   cd server
   npm run db:create
   npm run db:migrate
   ```

5. Start the development servers:
   ```
   npm run dev
   ```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

Key endpoints:

- `/api/auth`: Authentication routes (register, login)
- `/api/users`: User management
- `/api/resumes`: Resume management and analysis
- `/api/jobs`: Job searching and matching
- `/api/cover-letters`: Cover letter generation
- `/api/interviews`: Interview preparation
- `/api/career-path`: Career path visualization

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 