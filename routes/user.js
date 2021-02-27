const express =require('express');
const router = express.Router();
const User = require('../models/user');


router.get('/register',(req,res)=>{
    res.render('users/register') //導向EJS
})
router.post('/register',async(req,res)=>{
    res.send(req.body);//{"username":"ss","email":"tusna08124@gmail.com","password":"ww"}
})
module.exports =router;
