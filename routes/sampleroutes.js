const express = require('express');
const router = express.Router();
const University=require('../models/University');
const AddD = require('../models/AddD');
const multer = require('multer');
const GridFSBucket = require('mongodb').GridFSBucket;
const mongoose = require('mongoose');
//Dean Model
const User = require('../models/User');
const Sample = require('../models/Sample');
const path = require('path');

const storage =multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req,file,cb){
        cb(null,file.fieldname + '-' + Date.now() + 
        path.extname(file.originalname));
    }
});

const upload = multer({
    storage:storage,
    limits: {fileSize: 1000000},//limit to 10 mb
    fileFilter: function(req,file,cb){
        checkFileType(file,cb)
    }
}).single('fileDocu');

function checkFileType(file,cb){
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(mimetype && extname){
        return cb(null, true);
    }else{
        cb('Error: Pdf Only!');
    }

}

//Login Page
router.get('/', (req,res)=>res.render('sample'));
router.post('/',(req,res)=>{
    let{fileDocu,title}=req.body;
    console.log('Filedocu:',fileDocu );
    console.log('title:', title);
    if(!fileDocu||!title){
        req.flash('error_msg', 'Please fill all the fiels');
        return res.redirect('/sampleroutes');
    }else{
        const newSample = new Sample({
            fileDocu,
            title
        });
        newSample.save()
        .then(user =>{
            req.flash('success_msg', 'Success Upload!');
            return res.redirect('/sampleroutes');
        })
        .catch(err => console.log(err));
        upload(req,res,(err) =>{
            if(err){
                req.flash('error_msg', err);
                return res.redirect('/sampleroutes');
            }else{
                console.log(req.file);
                    
    
            }
        });
    }
    
});

module.exports=router;