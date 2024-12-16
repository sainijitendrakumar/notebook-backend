const express = require('express')
const {body, validationResult } = require('express-validator');
const User = require('../models/User')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchUser')

const JWT_SECRET = "I_AM_A_GOOD_BOY"

const validate = validations => {
  return async (req, res, next) => {
    // sequential processing, stops running validations chain if one fails.
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }
    }

    next();
  };
};

router.post('/signup', validate([
    body('name').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
]), async (req, res, next) => {
  let user  = await User.findOne({email:req.body.email})
  if(user){
    return res.status(400).json({error:"sorry user exists"})
  }
  const salt = await bcrypt.genSalt(10)
  const secPass = await bcrypt.hash(req.body.password,salt)
   user = await User.create({
    name:req.body.name,
    email:req.body.email,
    password:secPass
  })
 const data = {
  user:{
    id:user.id
  }
 }
  const authToken = jwt.sign(data,JWT_SECRET)
  res.send(user)
});

router.post('/signin', validate([
  body('email','enter a valid email').isEmail(),
  body('password','Password cannot be blank').exists()
]), async (req, res, next) => {
  const {email, password} = req.body;
  try {
    const user = await User.findOne({email})
    if(!user){
     return res.status(400).json({error:"please try to login with currect cradential"})
    }
    const passwordCompare = await bcrypt.compare(password,user.password)
    if(!passwordCompare){
      return res.status(400).json({error:"please try to login with currect cradential"})
    }
//     if(passwordCompare){
//   console.log("login success");
//   return res.status(200).json({success:'login success'})
// }
   const data = {
      user:{
        id:user.id
      }
 }
  const authToken = jwt.sign(data,JWT_SECRET)
   console.log(authToken);
  res.json(authToken)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error")
  }

});

router.get('/fetchuser',fetchuser,async(req,res)=>{
  try {
   let userId = await req.user.id
   const user = await User.findById(userId).select("-password")
   res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error")
  }
})

module.exports = router