const express=require('express');
const dotenv=require('dotenv');
const cors=require('cors');
const mongoose=require('mongoose');

const MatchRoute=require('./routes/MatchRoute');
const app=express();
app.use(cors());
app.use(express.json());
dotenv.config();
app.use('/matches',MatchRoute);

const PORT=process.env.PORT||5000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});

