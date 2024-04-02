require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes.js');
const app = express();
const PORT = process.env.PORT || 5454;

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.listen(PORT, () => 
    console.log(`Server running on port ${PORT}`)
);
