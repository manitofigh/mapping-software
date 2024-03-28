Dependencies: The script uses several Node.js modules, express for the server framework, bcrypt for hashing and checking passwords, passport for handling authentication, express-session for session management, express-flash for flashing messages between redirects, and dotenv for loading environment variables.

Middleware Configuration:
    express.urlencoded: Parses URL-encoded bodies (as sent by HTML forms).
    express-session: Session middleware for handling sessions.
    passport.initialize and passport.session: Initialize Passport and its session authentication.

Database Configuration: The database connection pool is imported from ./dbConfig. This should contain the PostgreSQL connection settings.

Authentication Checks:
    checkAuthenticated: A middleware function that redirects authenticated users to the dashboard page.
    checkNotAuthenticated: A middleware function that only allows unauthenticated users to proceed.

  Routes:
    The root route ("/") simply renders the index page.
    The /users/register route renders the registration form and handles user registration, including input validation, password hashing, and insertion into the database.
    The /users/login route renders the login form and uses Passport's authenticate method to handle login.
    The /users/admin and /users/user route checks if the user is authenticated (admin or not) and renders the dashboard page.
    The /users/logout route logs the user out and redirects to the index page with a logout success message.

  Password Hashing: Before storing the password in the database, it is hashed using bcrypt to ensure security.

  Environment Variables: Default port 4000.

