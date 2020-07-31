const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../keys')
const requireLogin = require('../middleware/requireLogin')






router.post('/signup', (req, res) => {
    const { name, email, password } = req.body
    if (!email || !password || !name) {
        return res.status(422).json({ error: "please enter all fiels" })
    }
    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(422).json({ error: "user alreday exists with that email" })

            }
            bcrypt.hash(password, 12)
                .then((hashedpassword) => {
                    const user = new User({
                        email,
                        password:hashedpassword,
                        name

                    })
                    user.save()
                        .then(user => {
                            res.json({ message: "user successfully saved " })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })

        })
        .catch((err) => {
            console.log(err)
        })

})

router.post('/signin',(req,res)=>{
    const{email,password} = req.body
    if(!email || !password){
        res.status(422).json({error:"please add email or password"})
    }
    User.findOne({email:email})
    .then((savedUser) =>{
        if(!savedUser){
            return req.status(422).json({error:"Invalid Email or password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then((doMatch)=>{
            if(doMatch){
                // res.json({message:"succesfully signed in "})
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                res.json({token})
            }

            else{
                return res.status(422).json({error:"Invalid Email or password"})
            }
        })
        .catch(err=>{
            console.log(err)
        })
    })
    

})
module.exports = router