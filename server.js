const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const Users = require('./Modal');
const app = express();
// const axios = require("axios");

const port = process.env.PORT || 3000;
app.use(express.json());
require("./db");
require('dotenv').config();
app.get("/",async(req,res)=>{
  res.json({success:true})
})
app.post("/login",async(req,res)=>{
  try {
    const {email,password}=req.body;
  const user =await Users.findOne({email:email});
  
  if(user){
    if(user.password==password){
      return res.json({
        success:true
      })
    }
    else{
      return res.json({
        success:false
      })
    }
  }
  else{
    return res.json({
      success:false,
      error:"user is not exist"
    })
  }
  
  } catch (error) {
    res.json({
      success:false,
      error:error
    })
  }

});
app.post("/register",async(req,res)=>{
  const {name,email,phone,city,state,gender,how_did_you}=req.body;
 try {
    const user =  await Users.create({
    name,email,phone,city,state,gender,how_did_you
   });
   res.json({
    success:true,user:user
   })

 } catch (error) {
  res.json({
    error:error,
    success:false
  })
 }
});
app.post("/registerall",async(req,res)=>{
  const {array}=req.body;
  console.log(array);
 try {
      for(const item of array){
       try {
        const user =  await Users.create({
          name:item.name,
          city:item.city,
          phone:item.phone,
          gender:item.gender,
          state:item.state,
          email:item.email,
          how_did_you:item.how_did_you
});
       } catch (error) {
        console.log(error)
       }
      }
      res.json({success:true})


 } catch (error) {
  res.json({
    error:error,
    success:false
  })
 }
})
app.get("/allusers",async(req,res)=>{
   try {
      const allusers = await Users.find();
      res.json({
        success:true,
        data:allusers
      })
   } catch (error) {
    res.json({
      success:false,
      error:error
    })
   }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
