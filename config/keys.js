module.exports = {
    MongoURI: "mongodb://base:system@127.0.0.1:27017/base-system?authSource=admin",
    jwtSecret:'secret'
}

// jwt.verify(req.headers.token, jwtSecret, (err, data) => {
//     if(err){
//         let data = {
//             msg: 'token 过期'
//         }
//         console.log(err)
//         res.status(401).json(data)
//     }else{
        
//     }
// })