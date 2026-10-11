# TalentLens : AI Powered Resume & Interview Intelligence Platform

An AI-powered interview preparation app. Paste a job description, upload your resume (or write a short self-description), and the app generates a personalised interview strategy: a match score, technical and behavioural questions with model answers, skill gaps, and a day-by-day preparation roadmap. It can also produce a tailored, ATS-friendly resume as a downloadable PDF.

Built with the MERN stack (MongoDB, Express, React, Node.js) and Google's Gemini API.

## Features

- **Personalised interview report** from a job description plus your resume or a short self-description
- **Match score** (0-100) showing how well your profile fits the role
- **Technical and behavioural questions** (at least 5 of each), each with the interviewer's intention and guidance on how to answer
- **Skill gaps** tagged by severity (low, medium, high)
- **Preparation roadmap** of at least 7 days, with focused daily tasks
- **Tailored resume PDF**: Gemini writes an HTML resume from your own information, and headless Chromium renders it to PDF
- **PDF resume parsing** on the server, so you can upload an existing resume
- **Authentication** with register, login and logout, using JWTs stored in HTTP-only cookies and a token blacklist on logout
- **Report history**: every generated plan is saved to your account and listed on the home page
- **Structured, validated AI output**: Gemini is asked for JSON against a schema, and the response is validated with Zod before it is saved

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, Vite, React Router 7, Axios, Sass |
| Backend | Node.js 22, Express 5, Mongoose 9 |
| Database | MongoDB |
| AI | Google Gemini via `@google/genai` (`gemini-3-flash-preview`) |
| Auth | JSON Web Tokens, bcryptjs, cookie-parser |
| File handling | Multer (in-memory uploads), pdf-parse |
| PDF generation | puppeteer-core with `@sparticuz/chromium` |
| Validation | Zod |

## Project structure

```
.
├── Backend/
│   ├── server.js                    # Entry point
│   └── src/
│       ├── app.js                   # Express app, CORS, routes, error handler
│       ├── config/database.js       # MongoDB connection
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── interview.controller.js
│       ├── middlewares/
│       │   ├── auth.middleware.js   # JWT cookie check + blacklist lookup
│       │   └── file.middleware.js   # Multer upload config (3 MB limit)
│       ├── models/
│       │   ├── user.model.js
│       │   ├── interviewReport.model.js
│       │   └── blacklist.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── interview.route.js
│       └── services/ai.service.js   # Gemini prompts, schemas, resume PDF rendering
└── Frontend/
    └── src/
        ├── app.routes.jsx
        └── features/
            ├── auth/                # Login, Register, protected routes, auth context
            └── interview/           # Home (create plan), Interview (view plan), API calls
```

## Getting started

### Prerequisites

- Node.js 22.x
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Google Gemini API key](https://aistudio.google.com/)

### 1. Clone the repository

```bash
git clone https://github.com/CodaptorShafa/GenAI-MERN-Project.git
cd GenAI-MERN-Project
```

### 2. Set up the backend

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
GOOGLE_GENAI_API_KEY=your_gemini_api_key

# Optional
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:3000`.

### 3. Set up the frontend

```bash
cd ../Frontend
npm install
```

Create `Frontend/.env` so the app talks to your local backend:

```env
VITE_API_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

> **Note on PDF generation:** the resume PDF feature uses `@sparticuz/chromium`, which is built for serverless Linux environments. If it fails on your local machine, check the `[PDF DEBUG]` logs in the backend terminal.

## API reference

All interview routes require the auth cookie. Base path: `/api`.

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register with `username`, `email`, `password` | Public |
| POST | `/auth/login` | Log in with `email`, `password` | Public |
| GET | `/auth/logout` | Log out and blacklist the current token | Required |
| GET | `/auth/get-me` | Get the logged-in user | Required |

### Interview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/interview/` | Generate a report. `multipart/form-data` with `jobDescription` (required), `selfDescription`, and `resume` (PDF) | Required |
| GET | `/interview/` | List your reports (summary fields only) | Required |
| GET | `/interview/report/:interviewId` | Get one full report | Required |
| POST | `/interview/resume/pdf/:interviewReportId` | Generate and download a tailored resume PDF | Required |

A job description is always required, plus either a resume or a self-description. Resume uploads must be PDFs up to 3 MB.

## How it works

1. You submit a job description and a resume (or self-description) from the home page.
2. The backend extracts text from the PDF with `pdf-parse`.
3. The text is sent to Gemini with a strict JSON schema and instructions not to invent skills, experience or education.
4. The response is validated with Zod and saved to MongoDB against your user account.
5. The interview page shows the technical questions, behavioural questions and roadmap in tabs, with the match score and skill gaps in a sidebar.
6. Clicking **Download Resume** asks Gemini for an HTML resume built only from your information, then renders it to an A4 PDF with headless Chromium. Gemini calls are retried with backoff on 429, 500 and 503 errors.

## Deployment

The project is set up to be deployed on Vercel, with the frontend and backend deployed as separate projects. The backend's CORS rules allow the deployed frontend, `http://localhost:5173`, any origin set in `FRONTEND_URL`, and matching Vercel preview URLs. Set the frontend's `VITE_API_URL` to your deployed backend URL, and set all backend environment variables in your hosting dashboard. Cookies use `secure` and `sameSite: none` when `NODE_ENV=production`, so both sites must be served over HTTPS.

## Roadmap

- DOCX resume upload (the upload field already accepts `.docx`, but the server currently parses PDFs only)
- Mark preparation tasks as completed and save progress
- Report deletion and regeneration
- Automated tests

## Author

**Shafaullah Siddiqui**

## License

ISC (as declared in `Backend/package.json`)
