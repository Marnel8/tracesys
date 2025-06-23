# TracèSys - Planning Document

## 📋 Overview
TracèSys is a role-based student-instructor practicum management system that provides secure authentication, attendance tracking, requirement/report submission, and dashboard analytics. Built as a full-stack TypeScript application using modern tooling.

## ⚙️ Tech Stack

### 🖥️ Frontend
- **Framework**: Next.js (App Router)
- **UI**: React + ShadCN UI
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query
- **Forms & Validation**: React Hook Form + Zod
- **Language**: TypeScript

### 🔧 Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: MySQL
- **Language**: TypeScript

## 👥 Roles & Permissions

### Instructor (Adviser)
- Manage assigned students and sections
- Review and approve attendance, requirements, and reports
- Post announcements and provide feedback

### Student (Trainee)
- Submit attendance, requirements, and reports
- View announcements, feedback, and progress
- Access own records only

## 🔐 Authentication & Role-Based Access

### Auth Flow
1. **/select-role Page**
   - Role options:
     - Student Trainee
     - Instructor / Adviser
   - On selection, redirect to:
     - `/login/student`
     - `/login/instructor`

2. **Login Pages**
   - `/login/student`: Student ID + Password
   - `/login/instructor`: Email + Password
   - OTP-based Forgot Password flows for both roles

3. **Post-login Routing**
   - Student ➜ `/dashboard/student`
   - Instructor ➜ `/dashboard/instructor`

4. **RBAC Enforcement**
   - Protected routes and UI logic via role-based context & middleware

## 👨‍🏫 Instructor Features

### 🔐 Account Management
- Register with email verification
- Profile editing
- Change password
- Forgot Password (OTP via email)

### 📊 Dashboard
- Total students per section
- % passed requirements
- % submitted reports
- Pie chart: gender distribution

### 👥 Student Management
- Create student accounts (ID, password, name, course, section, email)
- Auto-send credentials
- Sections limited to assigned only

### 📢 Announcements
- Post/edit/delete announcements
- Filter by course/section
- Comment (public/private)

### 👤 Student Profiles
- Full profile view:
  - Name, course, year, semester, section
  - Contact info, assigned agency

### ⏰ Attendance
- View and approve attendance logs
- Fields:
  - Photo (Time In/Out), timestamp, agency, status
  - Auto-lock Time In
  - Optional location capture
- History view per date/student

### 📋 Requirements
- View submissions grouped by title & student
- Status: Pending / Approved / Returned
- Add comments, auto-notify student
- File download support

### 📝 Reports
- Same structure as requirements
- Weekly/Narrative uploads

### ⚙️ Settings
- Change theme (Light/Dark)
- Update account info
- Logout confirmation
- About/System Info

## 👨‍🎓 Student Features

### 🔐 Account
- Created by instructor
- Credentials sent via email
- Login with ID + password

### 📊 Dashboard
- Progress tracker (completed vs. remaining hours)
- Recent announcements
- Submission reminders (optional)

### 📢 Announcements
- View + comment
- No edit/delete permissions

### ⏰ Attendance Submission
- Real-time photo capture (via camera API)
- Time In auto-locks
- Fields: photo, timestamp, agency
- View status: Pending / Approved / Declined
- Optional: capture location

### 📅 Attendance History
- Organized by date
- Time In/Out photo with timestamp

### 📋 Requirement Submission
- Upload per instructor-defined list
- View status/comments
- Table grouped by title

### 📝 Report Submission
- Weekly/Narrative reports
- View status/comments

### 👤 Profile
- Editable fields:
  - Name, course, section, year, semester
  - Contact, agency/school info

### ⚙️ Settings
- Change password
- Select theme
- View policies
- Logout confirmation

## 🔔 General Features

### 📱 Notification System
- Real-time/periodic alerts:
  - Announcement comments
  - Status changes (attendance, reports, requirements)
  - Account creation / OTP reset

### 🔒 Access Control
- Instructor: assigned sections only
- Student: own data only

### 📁 File Uploads
- Allowed formats & size restrictions enforced

### 📋 Audit Trail (Optional)
- Logs: login/logout, file submission, status updates

### 📱 Responsive UI
- Mobile-first for students
- Desktop-first for instructors

## 🖥️ Frontend Details (Next.js)

### App Structure
- App Router with nested layouts
- useUser() hook for role/permissions
- Middleware protection per route
- Context-based theme + auth state

### Auth Components
- `<RoleSelection />` ➜ `/select-role`
- `<StudentLoginForm />` ➜ `/login/student`
- `<InstructorLoginForm />` ➜ `/login/instructor`
- `<OTPVerification />`, `<ResetPasswordForm />`

### Core UI Components
- Sidebar, Navbar, ThemeToggle, Toasts
- RoleGuard, LogoutModal

### Dashboard Widgets
- **Instructor**: Totals, Percentages, Charts
- **Student**: HoursProgress, AnnouncementFeed

### Feature Modules
- StudentTable, StudentForm
- AttendanceTable, PhotoCapture
- AnnouncementCard, CommentSection
- FileUploadInput, SubmissionTable

### State & Query
- **TanStack Query**
  - Query Keys scoped per resource & role
  - Optimistic mutations where relevant

### Form Handling
- React Hook Form + Zod validation
- Controlled inputs (ShadCN)

## 🧪 Testing
- **Unit**: Jest + React Testing Library / Vitest
- **Backend**: Supertest + Jest
- **E2E**: Cypress or Playwright (optional)

## 🚀 Deployment
- **Frontend**: Vercel or Netlify
- **Backend**: Render / Railway / Docker VPS
- **DB**: PlanetScale / Managed MySQL
- **CI/CD**: GitHub Actions

## 📅 Development Phases

| Phase | Focus |
|-------|-------|
| Phase 1 | Env setup, auth flow, DB schema |
| Phase 2 | Role select, login forms, routing |
| Phase 3 | Instructor dashboard, student CRUD |
| Phase 4 | Attendance, requirements, reports |
| Phase 5 | Announcements, notifications, profile mgmt |
| Phase 6 | Responsive UI polish, RBAC, role guards |
| Phase 7 | Audit trail (optional), final QA + deployment |

## 📝 Notes
- All logic is strictly typed end-to-end
- RBAC enforced in routes and UI
- API layer should expose `/auth`, `/students`, `/attendance`, `/requirements`, `/reports`, etc.
- **Authentication**: JWT with refresh token support
- Consider lazy loading non-essential widgets
\`\`\`

Now let's add the images to the project:
