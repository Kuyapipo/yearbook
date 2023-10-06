const express = require('express');
const router = express.Router();

//Login Page
router.get('/', (req,res)=>res.render('sample'));

module.exports=router;