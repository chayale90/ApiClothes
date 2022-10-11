const express = require("express");
const bcrypt = require("bcrypt");
const { UserModel, validUser, validLogin, createToken } = require("../models/userModel");
const { auth,authAdmin } = require("../middlewares/auth")
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ msg: "users work !" })
})


//The details of user by his token
router.get("/myInfo", auth, async (req, res) => {
  try {
    let userInfo = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 })
    res.json(userInfo)
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


// only admin can access to list of all users
router.get("/usersList", authAdmin , async(req,res) => {
  try{
    let data = await UserModel.find({},{password:0});
    res.json(data)
  }
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err",err})
  }  
})

//add 
router.post("/", async (req, res) => {
  let validBody = validUser(req.body)
  if (validBody.error) {
    return res.status(400).json(validBody.error.details)
  }
  try {
    let user = new UserModel(req.body)
    user.password = await bcrypt.hash(user.password, 10)
    await user.save();
    user.password = "*****"
    res.json(user)
  }
  catch (err) {
    if (err.code == 11000) {
      res.status(500).json({ msg: "Email already in system, try log in", code: 11000 })
    }
    console.log(err);
    return res.status(500).json({ msg: "err", err })
  }
})


//Enter to website and recieve Token
router.post("/login", async (req, res) => {
  let validBody = validLogin(req.body)
  if (validBody.error) {
    return res.status(400).json(validBody.error.details)
  }
  try {
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ msg: "Password or email is worng ,code:1" })
    }
    let authPassword = await bcrypt.compare(req.body.password, user.password)
    if (!authPassword) {
      return res.status(401).json({ msg: "Password or email is worng ,code:2" })
    }
    let token = await createToken(user._id, user.role)
    res.json({ token })
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "err", err })
  }
})






module.exports = router;