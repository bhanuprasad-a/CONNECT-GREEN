**CONNECT GREEN**

*Smart Web Platform for Sustainable Tourism*

**TECH STACK DOCUMENT**

**Technology: MERN Stack (MongoDB • Express.js • React.js • Node.js)**

College Project \| Green Technologies Domain \| 2026

**1. What is the MERN Stack?**

MERN is a collection of four technologies that together allow you to build a complete, full-stack web application using only JavaScript. Each letter stands for one technology:

|            |                |                     |                                                           |
|------------|----------------|---------------------|-----------------------------------------------------------|
| **Letter** | **Technology** | **Type**            | **What It Does**                                          |
| **M**      | **MongoDB**    | Database            | Stores all the data --- users, trips, businesses, reviews |
| **E**      | **Express.js** | Backend Framework   | Handles all server logic and API routes                   |
| **R**      | **React.js**   | Frontend Library    | Builds all the pages and UI the user sees                 |
| **N**      | **Node.js**    | Runtime Environment | Runs JavaScript on the server (powers Express)            |

> *Why MERN for CONNECT GREEN? MERN uses JavaScript for both frontend and backend --- meaning you only need to learn one language to build the entire platform. It is fast, widely used, and has massive free learning resources online.*

**2. Complete Tech Stack Overview**

Beyond the core MERN stack, CONNECT GREEN needs several supporting tools and libraries. The full stack is organized into 5 layers:

|               |                            |                                                              |
|---------------|----------------------------|--------------------------------------------------------------|
| **Layer**     | **Technology**             | **Purpose for CONNECT GREEN**                                |
| **FRONTEND**  | **React.js**               | Builds all website pages and UI components                   |
|               | React Router DOM           | Handles page navigation (Trip Planner, Dashboard, etc.)      |
|               | Tailwind CSS               | Styles all pages with the dark green Tulinovskyi design      |
|               | Axios                      | Sends requests from React to the Express backend API         |
|               | Recharts                   | Carbon footprint charts and site capacity graphs             |
|               | Framer Motion              | Smooth page animations and scroll effects                    |
|               | Google Maps API            | Interactive map for the trip planner page                    |
| **BACKEND**   | **Node.js**                | Server runtime --- runs all backend JavaScript code          |
|               | Express.js                 | Creates all API routes for the platform                      |
|               | JWT (JSON Web Tokens)      | Secure user authentication and login sessions                |
|               | Bcrypt.js                  | Encrypts and hashes user passwords securely                  |
|               | Multer                     | Handles file uploads (business images, profile photos)       |
|               | Nodemailer                 | Sends emails --- badge approval, welcome, reset password     |
|               | Cors                       | Allows React frontend to communicate with Express backend    |
|               | Dotenv                     | Keeps secret keys (DB password, API keys) safe and hidden    |
| **DATABASE**  | **MongoDB**                | Main database --- stores all platform data as JSON documents |
|               | Mongoose                   | Connects Node.js to MongoDB and defines data schemas         |
|               | MongoDB Atlas              | Free cloud hosting for the MongoDB database                  |
| **DEV TOOLS** | **VS Code**                | Code editor for writing the entire project                   |
|               | Postman                    | Tests all API routes before connecting to React frontend     |
|               | Git + GitHub               | Version control --- saves and tracks all code changes        |
|               | Nodemon                    | Auto-restarts the server when backend code changes           |
| **HOSTING**   | **Vercel (Frontend)**      | Free hosting for the React frontend                          |
|               | Render / Railway (Backend) | Free hosting for the Node.js/Express server                  |
|               | MongoDB Atlas (DB)         | Free cloud MongoDB database (512MB free tier)                |
|               | Cloudinary                 | Free cloud storage for uploaded images                       |

**3. How the MERN Stack Works Together**

The four MERN technologies connect to each other in a clear flow. Here is how data moves through the CONNECT GREEN platform:

> *Flow: User opens the website in browser → React sends a request → Express receives it → Node processes it → MongoDB stores/retrieves data → Response goes back to React → User sees the result on screen.*

|          |                         |                                                                             |
|----------|-------------------------|-----------------------------------------------------------------------------|
| **Step** | **Layer**               | **What Happens**                                                            |
| 1        | **React (Frontend)**    | Tourist clicks \'Plan My Green Trip\' button on the website                 |
| 2        | **Axios (HTTP Client)** | React uses Axios to send a GET/POST request to the Express API              |
| 3        | **Express.js (Routes)** | Express receives the request and runs the correct route handler function    |
| 4        | **Node.js (Logic)**     | Node.js processes the business logic --- checks user, validates data, etc.  |
| 5        | **Mongoose (ORM)**      | Mongoose sends a query to MongoDB to read or write the required data        |
| 6        | **MongoDB (Database)**  | MongoDB stores or retrieves the data and returns it to Node.js              |
| 7        | **Express (Response)**  | Express sends the result back to React as a JSON response                   |
| 8        | **React (Display)**     | React receives the JSON and updates the UI --- tourist sees their trip plan |

**4. Project Folder Structure**

This is how the CONNECT GREEN project files will be organized. It follows the standard MERN stack folder structure used in real projects.

**4.1 Root Project Structure**

|                    |                                                 |
|--------------------|-------------------------------------------------|
| **Folder / File**  | **What is Inside**                              |
| **connect-green/** | Root project folder                             |
| **/client**        | All React frontend code lives here              |
| **/server**        | All Node.js / Express backend code lives here   |
| **.gitignore**     | Tells Git to ignore node_modules and .env files |
| **README.md**      | Project description and setup instructions      |

**4.2 Frontend Folder --- /client**

|                               |                                                                                           |
|-------------------------------|-------------------------------------------------------------------------------------------|
| **Path**                      | **What is Inside**                                                                        |
| **client/src/pages/**         | One file per page: Home, TripPlanner, Businesses, NatureSites, Dashboard, Login, Register |
| **client/src/components/**    | Reusable UI pieces: Navbar, Footer, FeatureCard, GreenBadge, CarbonMeter, TrafficLight    |
| **client/src/context/**       | AuthContext.js --- stores logged-in user state globally using React Context API           |
| **client/src/api/**           | Axios API call functions --- one file per feature (auth.js, trips.js, businesses.js)      |
| **client/src/assets/**        | Images, icons, logo, hero visual files                                                    |
| **client/tailwind.config.js** | Tailwind config with CONNECT GREEN custom colors                                          |
| **client/src/App.jsx**        | Main React app --- defines all page routes using React Router                             |

**4.3 Backend Folder --- /server**

|                         |                                                                                     |
|-------------------------|-------------------------------------------------------------------------------------|
| **Path**                | **What is Inside**                                                                  |
| **server/server.js**    | Entry point --- starts the Express server and connects to MongoDB                   |
| **server/config/db.js** | MongoDB connection setup using Mongoose                                             |
| **server/models/**      | Mongoose schemas: User.js, Business.js, Trip.js, NatureSite.js, Review.js           |
| **server/routes/**      | Express route files: authRoutes.js, tripRoutes.js, businessRoutes.js, siteRoutes.js |
| **server/controllers/** | Logic for each route: authController.js, tripController.js, businessController.js   |
| **server/middleware/**  | authMiddleware.js --- protects private routes by checking JWT token                 |
| **server/.env**         | Secret environment variables: MONGO_URI, JWT_SECRET, PORT --- NEVER share this file |

**5. MongoDB Database Design**

MongoDB stores data as documents (like JSON). Below are all the collections (tables) needed for CONNECT GREEN and what data each one stores.

**5.1 Users Collection**

|                 |               |                                                               |
|-----------------|---------------|---------------------------------------------------------------|
| **Field**       | **Type**      | **Description**                                               |
| **\_id**        | ObjectId      | Auto-generated unique ID by MongoDB                           |
| **name**        | String        | Full name of the user                                         |
| **email**       | String        | User email --- must be unique, used for login                 |
| **password**    | String        | Bcrypt hashed password --- never stored as plain text         |
| **role**        | String (Enum) | One of: \'tourist\', \'business\', \'siteManager\', \'admin\' |
| **greenPoints** | Number        | Points earned for making low-carbon travel choices            |
| **createdAt**   | Date          | Automatically set when account is created                     |

**5.2 Businesses Collection**

|                 |                      |                                                                               |
|-----------------|----------------------|-------------------------------------------------------------------------------|
| **Field**       | **Type**             | **Description**                                                               |
| **\_id**        | ObjectId             | Auto-generated unique ID                                                      |
| **owner**       | ObjectId (ref: User) | Links to the User who owns this business                                      |
| **name**        | String               | Business name                                                                 |
| **category**    | String (Enum)        | One of: \'hotel\', \'restaurant\', \'transport\', \'activity\'                |
| **location**    | String               | City and country of the business                                              |
| **description** | String               | Short description of the business                                             |
| **image**       | String (URL)         | Cloudinary URL of business photo                                              |
| **badgeStatus** | String (Enum)        | One of: \'none\', \'pending\', \'bronze\', \'silver\', \'gold\', \'platinum\' |
| **isVerified**  | Boolean              | True if admin has approved the Green Badge                                    |
| **avgRating**   | Number               | Average star rating calculated from reviews                                   |

**5.3 Trips Collection**

|                        |                              |                                            |
|------------------------|------------------------------|--------------------------------------------|
| **Field**              | **Type**                     | **Description**                            |
| **\_id**               | ObjectId                     | Auto-generated unique ID                   |
| **user**               | ObjectId (ref: User)         | Which tourist created this trip            |
| **destination**        | String                       | Trip destination name                      |
| **startDate**          | Date                         | Trip start date                            |
| **endDate**            | Date                         | Trip end date                              |
| **selectedBusinesses** | \[ObjectId\] (ref: Business) | Array of business IDs chosen for this trip |
| **carbonScore**        | Number                       | Total CO2 kg calculated for this trip      |
| **carbonSaved**        | Number                       | CO2 saved vs average non-green trip (kg)   |

**5.4 NatureSites Collection**

|                     |                      |                                                    |
|---------------------|----------------------|----------------------------------------------------|
| **Field**           | **Type**             | **Description**                                    |
| **\_id**            | ObjectId             | Auto-generated unique ID                           |
| **manager**         | ObjectId (ref: User) | The site manager user who manages this site        |
| **name**            | String               | Name of the nature site                            |
| **location**        | String               | City and country                                   |
| **maxCapacity**     | Number               | Maximum safe number of visitors at one time        |
| **currentVisitors** | Number               | Current live visitor count (updated by manager)    |
| **status**          | String (Enum)        | Auto-calculated: \'green\', \'yellow\', or \'red\' |
| **image**           | String (URL)         | Cloudinary URL of site photo                       |

**5.5 Reviews Collection**

|               |                          |                                  |
|---------------|--------------------------|----------------------------------|
| **Field**     | **Type**                 | **Description**                  |
| **\_id**      | ObjectId                 | Auto-generated unique ID         |
| **user**      | ObjectId (ref: User)     | Tourist who wrote the review     |
| **business**  | ObjectId (ref: Business) | Business being reviewed          |
| **rating**    | Number (1--5)            | Star rating given by the tourist |
| **comment**   | String                   | Written review text              |
| **createdAt** | Date                     | Date the review was submitted    |

**6. API Routes (Express.js)**

These are all the API endpoints the Express backend will expose. React calls these using Axios. All routes return JSON responses.

**6.1 Authentication Routes --- /api/auth**

|            |                        |            |                                             |
|------------|------------------------|------------|---------------------------------------------|
| **Method** | **Route**              | **Access** | **What It Does**                            |
| **POST**   | **/api/auth/register** | Public     | Create a new user account                   |
| **POST**   | **/api/auth/login**    | Public     | Login and receive a JWT token               |
| **GET**    | **/api/auth/me**       | Private    | Get the currently logged-in user\'s profile |

**6.2 Business Routes --- /api/businesses**

|            |                               |                    |                                      |
|------------|-------------------------------|--------------------|--------------------------------------|
| **Method** | **Route**                     | **Access**         | **What It Does**                     |
| **GET**    | **/api/businesses**           | Public             | Get all verified green businesses    |
| **GET**    | **/api/businesses/:id**       | Public             | Get one business by its ID           |
| **POST**   | **/api/businesses**           | Private (Business) | Create a new business listing        |
| **PUT**    | **/api/businesses/:id**       | Private (Owner)    | Update business details              |
| **PUT**    | **/api/businesses/:id/badge** | Private (Admin)    | Approve or update Green Badge status |
| **DELETE** | **/api/businesses/:id**       | Private (Admin)    | Delete a business listing            |

**6.3 Trip Routes --- /api/trips**

|            |                    |                   |                                         |
|------------|--------------------|-------------------|-----------------------------------------|
| **Method** | **Route**          | **Access**        | **What It Does**                        |
| **GET**    | **/api/trips**     | Private (Tourist) | Get all trips for the logged-in tourist |
| **POST**   | **/api/trips**     | Private (Tourist) | Create and save a new trip plan         |
| **GET**    | **/api/trips/:id** | Private (Tourist) | Get details of one trip                 |
| **DELETE** | **/api/trips/:id** | Private (Tourist) | Delete a saved trip                     |

**6.4 Nature Sites Routes --- /api/sites**

|            |                             |                   |                                                |
|------------|-----------------------------|-------------------|------------------------------------------------|
| **Method** | **Route**                   | **Access**        | **What It Does**                               |
| **GET**    | **/api/sites**              | Public            | Get all nature sites with live capacity status |
| **POST**   | **/api/sites**              | Private (Manager) | Register a new nature site                     |
| **PUT**    | **/api/sites/:id/visitors** | Private (Manager) | Update the live visitor count for a site       |

**6.5 Reviews Routes --- /api/reviews**

|            |                              |                       |                                         |
|------------|------------------------------|-----------------------|-----------------------------------------|
| **Method** | **Route**                    | **Access**            | **What It Does**                        |
| **GET**    | **/api/reviews/:businessId** | Public                | Get all reviews for a specific business |
| **POST**   | **/api/reviews**             | Private (Tourist)     | Submit a new review for a business      |
| **DELETE** | **/api/reviews/:id**         | Private (Owner/Admin) | Delete a review                         |

**7. All npm Packages to Install**

Use these exact commands in your terminal to install all required packages.

**7.1 Backend Packages (inside /server folder)**

|                  |             |                                                   |
|------------------|-------------|---------------------------------------------------|
| **Package**      | **Version** | **Why It Is Needed**                              |
| **express**      | \^4.18.x    | Core web framework --- handles all API routes     |
| **mongoose**     | \^8.x.x     | Connects to MongoDB and defines schemas           |
| **jsonwebtoken** | \^9.x.x     | Creates and verifies JWT login tokens             |
| **bcryptjs**     | \^2.4.x     | Encrypts user passwords before saving             |
| **cors**         | \^2.8.x     | Allows frontend React to call the API             |
| **dotenv**       | \^16.x.x    | Loads environment variables from .env file        |
| **multer**       | \^1.4.x     | Handles image and file uploads                    |
| **cloudinary**   | \^1.x.x     | Uploads images to Cloudinary cloud storage        |
| **nodemailer**   | \^6.x.x     | Sends emails for badge approval, welcome messages |
| **nodemon**      | \^3.x.x     | Auto-restarts server on code change (dev only)    |

> *Install all backend packages: npm install express mongoose jsonwebtoken bcryptjs cors dotenv multer cloudinary nodemailer && npm install \--save-dev nodemon*

**7.2 Frontend Packages (inside /client folder)**

|                            |             |                                                |
|----------------------------|-------------|------------------------------------------------|
| **Package**                | **Version** | **Why It Is Needed**                           |
| **react**                  | \^18.x.x    | Core React library                             |
| **react-dom**              | \^18.x.x    | Renders React components to the browser        |
| **react-router-dom**       | \^6.x.x     | Handles all page navigation and URL routing    |
| **axios**                  | \^1.x.x     | Sends HTTP requests to the Express backend API |
| **tailwindcss**            | \^3.x.x     | Utility CSS framework for all styling          |
| **recharts**               | \^2.x.x     | Carbon charts, capacity graphs, progress rings |
| **framer-motion**          | \^11.x.x    | Smooth animations for sections and transitions |
| **lucide-react**           | \^0.x.x     | Clean SVG icon library for feature icons       |
| **@react-google-maps/api** | \^2.x.x     | Google Maps integration for trip planner       |
| **react-hot-toast**        | \^2.x.x     | Shows success/error notification popups        |

> *Create React app with Vite: npm create vite@latest client \-- \--template react then cd client && npm install then install above packages*

**8. User Authentication Flow**

CONNECT GREEN uses JWT (JSON Web Tokens) for secure login. Here is how it works step by step:

**8.1 Registration Flow**

1.  Tourist fills Register form (name, email, password, role) in React

2.  React sends POST /api/auth/register to Express via Axios

3.  Express validates the data and checks email is not already used

4.  Bcrypt hashes the password (turns \'password123\' into a secure encrypted string)

5.  Mongoose saves the new User document to MongoDB

6.  Express returns a success message to React

7.  React redirects user to Login page

**8.2 Login Flow**

8.  Tourist fills Login form (email, password) in React

9.  React sends POST /api/auth/login to Express via Axios

10. Express finds the user in MongoDB by email

11. Bcrypt compares the entered password with the stored hashed password

12. If correct, Express creates a JWT token (contains user ID and role, valid 7 days)

13. Express returns the JWT token to React

14. React stores the token in memory (AuthContext) and redirects to Dashboard

**8.3 Protecting Private Routes**

- Every private API route (e.g. creating a trip) has the authMiddleware applied

- authMiddleware checks the JWT token sent in the request header

- If the token is valid, the request continues and the user is identified

- If the token is missing or invalid, the API returns a 401 Unauthorized error

- On the React side, private pages (Dashboard, Trip Planner) check if user is logged in --- if not, redirect to Login

**9. How Each CONNECT GREEN Feature Uses the Stack**

|                           |                                              |                                 |                                                                                   |
|---------------------------|----------------------------------------------|---------------------------------|-----------------------------------------------------------------------------------|
| **Feature**               | **React (Frontend)**                         | **Express (API)**               | **MongoDB (Data)**                                                                |
| **Trip Planner**          | TripPlanner.jsx page + Google Maps component | POST /api/trips                 | Trips collection --- stores destination, dates, selected businesses, carbon score |
| **Green Badge System**    | BadgeApplication.jsx + Admin panel           | PUT /api/businesses/:id/badge   | Businesses collection --- badgeStatus and isVerified fields updated               |
| **Carbon Tracker**        | CarbonMeter component + Recharts ring        | GET/POST /api/trips             | Trips collection --- carbonScore and carbonSaved fields                           |
| **Site Capacity Monitor** | TrafficLight component on NatureSites page   | PUT /api/sites/:id/visitors     | NatureSites collection --- currentVisitors and status updated                     |
| **Business Directory**    | Businesses.jsx + BusinessCard component      | GET /api/businesses             | Businesses collection --- returns all isVerified businesses                       |
| **Reviews & Ratings**     | ReviewForm + StarRating components           | POST /api/reviews               | Reviews collection --- user, business, rating, comment stored                     |
| **User Dashboard**        | Dashboard.jsx with stat cards and charts     | GET /api/trips GET /api/auth/me | Trips and Users collections --- greenPoints, carbonSaved, tripHistory             |
| **Admin Panel**           | AdminPanel.jsx with badge review table       | PUT /api/businesses/:id/badge   | Businesses collection --- admin reads pending applications and approves           |

**10. How to Set Up and Run the Project**

Follow these steps in order to get CONNECT GREEN running on your computer.

**Step 1 --- Install Required Software**

- Download and install Node.js from nodejs.org (includes npm)

- Download and install VS Code from code.visualstudio.com

- Create a free MongoDB Atlas account at mongodb.com/atlas

- Create a free Cloudinary account at cloudinary.com

- Install Git from git-scm.com

**Step 2 --- Clone or Create the Project**

> *Run in your terminal: mkdir connect-green && cd connect-green*

**Step 3 --- Set Up the Backend**

15. Open terminal, go to server folder: cd server

16. Run: npm init -y

17. Install packages: npm install express mongoose jsonwebtoken bcryptjs cors dotenv multer cloudinary nodemailer

18. Install dev tool: npm install \--save-dev nodemon

19. Create .env file in server folder and add: MONGO_URI=your_mongodb_connection_string, JWT_SECRET=any_secret_word, PORT=5000

20. Create server.js and start building routes

**Step 4 --- Set Up the Frontend**

21. Open new terminal, go back to root folder: cd ..

22. Create React app: npm create vite@latest client \-- \--template react

23. Go into client folder: cd client

24. Install packages: npm install axios react-router-dom recharts framer-motion lucide-react @react-google-maps/api react-hot-toast

25. Install Tailwind: npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p

26. Add CONNECT GREEN colors to tailwind.config.js

**Step 5 --- Run Both Servers**

- Backend: cd server && npx nodemon server.js --- runs on http://localhost:5000

- Frontend: cd client && npm run dev --- runs on http://localhost:5173

- Use Postman to test API routes before connecting to React

**11. Tech Stack Summary**

A quick reference of every technology used in CONNECT GREEN.

|               |                     |               |                                  |
|---------------|---------------------|---------------|----------------------------------|
| **Category**  | **Technology**      | **Free?**     | **Used For**                     |
| **Frontend**  | React.js + Vite     | **Yes**       | All website pages and components |
|               | React Router DOM    | **Yes**       | Page navigation                  |
|               | Tailwind CSS        | **Yes**       | All styling and the green design |
|               | Axios               | **Yes**       | API calls from React to Express  |
|               | Recharts            | **Yes**       | Carbon charts and progress rings |
|               | Framer Motion       | **Yes**       | Page animations                  |
|               | Lucide React        | **Yes**       | Icons                            |
| **Backend**   | Node.js             | **Yes**       | Server runtime                   |
|               | Express.js          | **Yes**       | API routes and server logic      |
|               | JWT + Bcrypt        | **Yes**       | Secure authentication            |
|               | Multer + Cloudinary | **Free tier** | Image uploads                    |
| **Database**  | MongoDB             | **Yes**       | All platform data storage        |
|               | Mongoose            | **Yes**       | MongoDB schemas and queries      |
|               | MongoDB Atlas       | **Free tier** | Cloud hosted database            |
| **Hosting**   | Vercel              | **Free**      | Frontend deployment              |
|               | Render / Railway    | **Free tier** | Backend deployment               |
| **Dev Tools** | VS Code             | **Free**      | Code editor                      |
|               | Postman             | **Free**      | API testing                      |
|               | Git + GitHub        | **Free**      | Version control                  |
