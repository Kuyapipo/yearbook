const express = require('express');
const router = express.Router();
const University=require('../models/University');
const AddD = require('../models/AddD');
//Dean Model
const User = require('../models/User');
//Login Page
router.get('/', async(req,res)=>{
    try {

        const universityData = await University.find({ changeStatus: { $ne: 'Pending' } }, 'addUniversity');
        const departmentData =await AddD.find({changeStatusD:{$ne: 'Pending'}},'addDepartment');

        if (!universityData || universityData.length === 0) {
            // Handle the case when no data is found
            return res.status(404).send('No universities found');
        }
        if(!departmentData||departmentData.length===0){
            return res.status(404).send('No department found');
        }
        res.render('sample', {
            universityData: universityData,
            departmentData: departmentData
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports=router;