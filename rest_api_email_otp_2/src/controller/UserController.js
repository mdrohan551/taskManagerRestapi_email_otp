const UsersModel = require("../model/UsersModel");
const jwt=require('jsonwebtoken');
const SendEmailUtility = require("../utility/SendEmailUtility");
const OTPModel = require("../model/OTPModel");


exports.registration=async (req,res)=>{
    try{
        let reqBody=req.body;
        await UsersModel.create(reqBody);
        res.json({status:"success",message:"Registration Completed"})

    }catch (err) {
        res.json({status:"fail",message:err})
    }
}


exports.login=async (req,res)=>{
    try{
        let reqBody=req.body;
        let user= await UsersModel.find(reqBody)
        if(user.length>0){
            let Payload={exp:Math.floor(Date.now()/1000)+(24*60*60),data:reqBody['email']}
            let token=jwt.sign(Payload,'123-xyz-abc');
            res.json({status:"success",message:"User Found",token:token})
        }else {
            res.json({status:"fail",message:"No User Found"})
        }
        res.json({status:"success",message:user})

    }catch (err) {
        res.json({status:"fail",message:err})
    }
}


exports.profileDetails=async (req,res)=>{
    try{

        let email=req.headers['email'];
        let result=await UsersModel.find({email:email})
        res.json({status:"success",data:result})

    }catch (err) {
        res.json({status:"fail",message:err})
    }
}


exports.profileUpdate=async (req,res)=>{
    try{
        let email=req.headers['email'];
        let reqBody=req.body;
        await UsersModel.updateOne({email:email},reqBody);
        res.json({status:"success",message:"Update Completed"})

    }catch (err) {
        res.json({status:"fail",message:err})
    }

}


exports.verifyEmail=async (req,res)=>{
    try {
            //object desturctue
        const {email}=req.params;
        let user= await UsersModel.find({email:email})
        if (user.length>0){
            // Send Email
            let otp=Math.floor(100000+Math.random()*900000)
            await SendEmailUtility(email,`Your PIN=${otp}`,"MERN 5 Task Manager Code");

            await OTPModel.create({email:email,otp:otp,status:'active'})

            res.json({status:"success",message:"Verification code has been sent to your email"})


        }
        else{

            res.json({status:"fail",message:"No User Found"})
        }

    }catch (e) {
        res.json({status:"fail",message:err})
    }

}


exports.verifyOTP=async (req,res)=>{

    try {
        const {email,otp}=req.params;
        let user= await OTPModel.find({email:email,otp:otp,status:'active'})
        if (user.length>0){
            await OTPModel.updateOne({email:email,otp:otp},{status:'verified'})
            res.json({status:"success",message:"Code Verification Success"})
        }
        else{
            res.json({status:"fail",message:"Invalid Code"})
        }

    }catch (err) {
        res.json({status:"fail",message:err})
    }

}


exports.passwordReset=async (req,res)=>{

    try {
        const {email,otp,password}=req.params;
        let user= await OTPModel.find({email:email,otp:otp,status:'verified'})
        if (user.length>0){
            await OTPModel.deleteOne({email:email,otp:otp})
            await UsersModel.updateOne({email:email}, {password:password});
            res.json({status:"success",message:"Password Update Success"})
        }
        else{
            res.json({status:"fail",message:"Invalid Request"})
        }

    }catch (err) {
        res.json({status:"fail",message:err})
    }



}


