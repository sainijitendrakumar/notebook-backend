var jwt = require('jsonwebtoken')
const JWT_SECRET = "I_AM_A_GOOD_BOY"

const fetchUser = (req,res,next)=>{
    const token = req.header('auth-token')
    if(!token){
       return res.status(401).json({error:"please authenticate with valid token"}) 
    }
    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user
        next()
    } catch (error) {
        return res.status(401).json({error:"please authenticate with valid token"})
    }

}

module.exports = fetchUser