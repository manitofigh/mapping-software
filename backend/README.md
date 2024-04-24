Follow steps to setup local database and test backend

1) Have postgresql setup on your local machine. (Make sure you save your password somewhere for     safekeeping)
  Install PostGIS extension using Application Stack Builder program on your pc. (spatial extension during installation)
  Once in your database enter all the commands from sqlCommands.sql in your git foler.

2) Create a .env file using (.env.sample) as a guideline
    **Dont need to change secret key for now**

3) Install all dependencies
    npm install
    npm install express
    npm install bcrypt
    npm install multer
    npm install axios

4) To start the server run, npm run dev

5) To test backend post services, you will simulate a front end call to the servers. 
