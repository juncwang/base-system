// 使用 express 创建服务
const express = require('express')
const app = express()

// 使用 mongoose 连接 mongoDB 数据库
const mongoose = require('mongoose')
const MongoURI = require('./config/keys').MongoURI
mongoose.connect(MongoURI, {useNewUrlParser: true})
    .then(res => console.log('MongoDB Connect Success'))
    .catch(err => console.log('MongoDB Connect Failure'))

// 使用 body-parser 解析 body 内容
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false, limit: '100mb'}))
app.use(bodyParser.json({limit: '100mb'}))

app.get('/test', (req, res) => {
    res.json({msg: 'Base Syetem Interface Success'})
})

// 添加路由接口
const auths = require('./routes/api/auths')
const users = require('./routes/api/users')
const transfer = require('./routes/api/transfer')
app.use('/api/auths', auths)
app.use('/api/users', users)
app.use('/api/transfer', transfer)

// 配置端口号
port = process.env.PORT || 5000

// 开启网络端口监听
app.listen(port, () => {
    console.log(`Server Running On Port ${port}`)
})