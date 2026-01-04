# The Philippine Artisan
## Project Overview
The Philippine Artisan is a student organization in Technological University of the Philippines that engage in news, writing, and broadcasting events within or outside the university. The website is created by the student of Bachelor of Science in Information System (BSIS) as a part of their requirements for Web Development course.
## Purpose
The objective of this website is to provide another level of accessibility to The Philippines Artisan and to centralized an information in web environment equal to the big news organization in the country.
## Team Members & Roles
- **Ferdinand Cedrick B. Gelito** – Full-Stack Developer 
- **Jewel Sarvida** – Project Manager
- **Jhanleur Balberan** – Designer
- **Nicholai Santos** – Content Writer
## Tools Used
- HTML, CSS, JavaScript and JSON, PHP
- Visual Studio Code
- Git & GitHub
- GitHub Pages
## Site Structure
- `index.html` – Homepage
- `about.html` – Organization profile
- `headlines.html` – News headlines overview
- `events.html` – Events page
- `test-profile.php` – Test user profile (PHP)
- `user-profile.html` – User profile page
- `nav-links.js` – Navigation links script
- `assets/` – Images and icons
- `src/` – Main source folder
  - HTML pages (admin, articles, news, sign in/up, etc.)
  - `admin module/` – Admin-specific modules (AddNews, etc.)
  - `php/` – Backend PHP code
    - `config.php`, `email.php`
    - `api/` – API endpoints
      - `admin/`, `articles/`, `auth/`, `users/` (modular PHP endpoints)
    - `data/` – JSON data files (articles, users)
    - `helpers/` – Helper PHP classes (JWT, Response)
    - `middleware/` – Middleware (Auth)
    - `models/` – Data models (Article, User)
  - `scripts/` – JavaScript modules (admin, articles, nav, etc.)
  - `styles/` – CSS stylesheets (per page/module)
- `vendor/` – Composer dependencies (autoload, PHPMailer, etc.)
## Design Concept
- **Color Scheme**: Blue (#003366) and White (#FFFFFF) reflect the official colors of The Philippine Artisan, used for backgrounds, headers, and accents.
- **Typography**:
  - Roboto – Used for body text and general readability.
  - Pirata One – Used for titles, headers, and branding elements.
- **Layout**: Consistent spacing, mobile-friendly grid system, and use of Flexbox and CSS Grid for responsive design.
- **Imagery & Icons**: Custom icons and images stored in the assets folder, supporting visual storytelling.
- **Accessibility**: Semantic HTML and ARIA attributes for improved accessibility.
## Deployment
- GitHub Repository: https://github.com/ferdicoder/the-philippine-artisan.git
- Live Site: https://ferdicoder.github.io/the-philippine-artisan/
## Lessons Learned
- Improved collaboration using Git and GitHub
- Learned how to deploy static and dynamic sites via GitHub Pages and XAMPP
- Practiced responsive design and semantic HTML
- Mastered Flex and Grid display property in CSS
- Understood the concept and usage of at-rules in CSS
- Applied DOM manipulation and dynamic HTML generation for interactivity
- Utilized JavaScript built-in functions and modular scripts
- Integrated PHP for backend API and authentication
- Managed JSON data for articles and users
- Implemented modular folder structure for scalability
- Used Composer and PHPMailer for backend email functionality

## Timeline
| Phase | Task | Date |
|----------|----------|----------|
| Proposal | Planning & wireframe | Oct 14, 2025 |
| Development | Coding & testing | Nov 20, 2025 |
| Deployment | GitHub setup & launch | December 12, 2025 |
| Submission | Final documentation | December 19, 2025 |



