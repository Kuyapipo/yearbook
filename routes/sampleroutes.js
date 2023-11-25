const express = require('express');
const router = express.Router();
const University=require('../models/University');
const AddD = require('../models/AddD');


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