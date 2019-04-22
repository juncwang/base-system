const mongoose = require('express')
const router = mongoose.Router()

const Auth = require('../../models/Auth')
const User = require('../../models/User')

const jwt = require('jsonwebtoken')
const jwtSecret = require('../../config/keys').jwtSecret

// 以后添加内容
// 该接口需要 jwt 验证

// 接口前缀: /api/auths

// auths 测试接口
// method: GET
// ===== res json =====
// msg: String - 返回信息
router.get('/test', (req, res) => {
    res.json({ msg: 'Auths Interface success' })
})

// auths 添加单个数据接口
// method: POST
// ===== req json =====
// header: 
// * token: String - token 口令
// body:
// * name: String - 权限名称
// status: Boolean - 是否启用
// auths: Object - 权限范围
// ===== res json =====
// msg: String - 访问信息
// auth: 
//      _id: String - 数据id
//      name: String - 权限名称
//      auths: Object - 权限范围
//      status: Boolean - 当前状态
//      createDate: Date - 创建时间
router.post('/add/:id', (req, res) => {
    jwt.verify(req.headers.token, jwtSecret, (err, data) => {
        if (err) {
            let data = {
                msg: 'token 过期'
            }
            console.log(err)
            res.status(401).json(data)
        } else {
            if (req.body.name) {
                Auth.findOne({ name: req.body.name })
                    .then(auth => {
                        if (auth) {
                            let data = {
                                msg: '数据已存在'
                            }
                            res.status(400).json(data)
                        } else {
                            let authTmp = {}
                            authTmp.name = req.body.name
                            authTmp.status = req.body.status
                            if (req.body.auths) authTmp.auths = req.body.auths
                            authTmp.userId = req.params.id

                            new Auth(authTmp).save()
                                .then(auth => {
                                    let data = {
                                        msg: '数据保存成功',
                                        auth: auth
                                    }
                                    res.json(data)
                                })
                                .catch(err => {
                                    let data = {
                                        msg: '数据保存失败'
                                    }
                                    console.log(err)
                                    res.status(403).json(data)
                                })
                        }
                    })
                    .catch(err => {
                        let data = {
                            msg: '查询数据库失败'
                        }
                        console.log(err)
                        res.status(403).json(data)
                    })
            } else {
                let data = {
                    msg: '权限名称不能为空',
                }
                res.status(400).json(data)
            }
        }
    })
})

// auths 删除单个数据
// method: DELETE
// ===== req json =====
// header: 
// * token: String - token 口令
// params:
// * id: String - 权限 ID
// ===== res json =====
// msg: String - 访问信息
// auth: 
//      _id: String - 数据id
//      name: String - 权限名称
//      auths: Object - 权限范围
//      status: Boolean - 当前状态
//      createDate: Date - 创建时间
router.delete('/deleteById/:id', (req, res) => {
    jwt.verify(req.headers.token, jwtSecret, (err, data) => {
        if (err) {
            let data = {
                msg: 'token 过期'
            }
            console.log(err)
            res.status(401).json(data)
        } else {
            Auth.findOneAndDelete({ _id: req.params.id })
                .then(auth => {
                    if (auth) {
                        let data = {
                            msg: '数据删除成功',
                            auth: auth
                        }
                        res.json(data)
                    } else {
                        let data = {
                            msg: '未查询到相关数据'
                        }
                        res.status(400).json(data)
                    }
                })
                .catch(err => {
                    let data = {
                        msg: '删除数据失败'
                    }
                    console.log(err)
                    res.status(403).json(data)
                })
        }
    })
})

// auths 更新单个数据
// method: POST
// ===== req json =====
// header: 
// * token: String - token 口令
// params:
// * id: String - 权限 ID
// body:
//      name: String - 权限名称
//      status: Boolean - 当前状态
//      auths: Object - 权限范围
// ===== res json =====
// msg: String - 访问信息
// auth: 
//      _id: String - 数据id
//      name: String - 权限名称
//      auths: Object - 权限范围
//      status: Boolean - 当前状态
//      createDate: Date - 创建时间
router.post('/updataById/:id/:userId', (req, res) => {
    jwt.verify(req.headers.token, jwtSecret, (err, data) => {
        if (err) {
            let data = {
                msg: 'token 过期'
            }
            console.log(err)
            res.status(401).json(data)
        } else {
            let authTmp = {}
            if (req.body.name) authTmp.name = req.body.name
            if (req.body.auths) authTmp.auths = req.body.auths
            authTmp.status = req.body.status
            authTmp.userId = req.params.userId
            Auth.findOneAndUpdate({ _id: req.params.id }, { $set: authTmp })
                .then(auth => {
                    if (auth) {
                        let data = {
                            msg: '数据更新成功',
                            auth: auth
                        }
                        res.json(data)
                    } else {
                        let data = {
                            msg: '未查询到相关数据'
                        }
                        res.status(400).json(data)
                    }
                })
                .catch(err => {
                    let data = {
                        msg: '数据更新失败'
                    }
                    console.log(err)
                    res.status(403).json(data)
                })
        }
    })
})

// auths 查询所有数据接口
// method: GET
// ===== res json =====
// header: 
// * token: String - token 口令
// msg: String - 访问信息
// auths: [{
//      _id: String - 数据id
//      name: String - 权限名称
//      auths: Object - 权限范围
//      status: Boolean - 当前状态
//      createDate: Date - 创建时间
// }]
router.get('/selectAll', (req, res) => {
    jwt.verify(req.headers.token, jwtSecret, (err, data) => {
        if (err) {
            let data = {
                msg: 'token 过期'
            }
            console.log(err)
            res.status(401).json(data)
        } else {
            Auth.find().sort({ date: -1 })
                .then(auths => {
                    let data = {
                        msg: '查询全部数据成功',
                        auths: auths
                    }
                    res.json(data)
                })
                .catch(err => {
                    let data = {
                        msg: '查询数据失败'
                    }
                    console.log(err)
                    res.status(403).json(data)
                })
        }
    })
})

// auths 查询所有状态数据接口
// method: GET
// ===== req json ====
// header: 
// * token: String - token 口令
// params:
// * status: Boolean - 数据状态
// ===== res json =====
// msg: String - 访问信息
// auths: [{
//      _id: String - 数据id
//      name: String - 权限名称
//      auths: Object - 权限范围
//      status: Boolean - 当前状态
//      createDate: Date - 创建时间
// }]
router.get('/selectAll/:status', (req, res) => {
    jwt.verify(req.headers.token, jwtSecret, (err, data) => {
        if (err) {
            let data = {
                msg: 'token 过期'
            }
            console.log(err)
            res.status(401).json(data)
        } else {
            Auth.find({ status: req.params.status }).sort({ date: -1 })
                .then(auths => {
                    let data = {
                        msg: '查询全部数据成功',
                        auths: auths
                    }
                    res.json(data)
                })
                .catch(err => {
                    let data = {
                        msg: '查询数据失败'
                    }
                    console.log(err)
                    res.status(403).json(data)
                })
        }
    })
})

// auths 查询单个数据
// method: GET
// ===== req json =====
// header: 
// * token: String - token 口令
// params:
// * name: String - 权限名称
// ===== res json =====
// msg: String - 访问信息
// auth: 
//      _id: String - 数据id
//      name: String - 权限名称
//      auths: Object - 权限范围
//      status: Boolean - 当前状态
//      createDate: Date - 创建时间
router.get('/selectByid/:id', (req, res) => {
    jwt.verify(req.headers.token, jwtSecret, (err, data) => {
        if (err) {
            let data = {
                msg: 'token 过期'
            }
            console.log(err)
            res.status(401).json(data)
        } else {
            Auth.findOne({ _id: req.params.id })
                .then(auth => {
                    let data = {
                        msg: '查询成功',
                        auth: auth
                    }
                    res.json(data)
                })
                .catch(err => {
                    let data = {
                        msg: '查询失败'
                    }
                    console.log(err)
                    res.status(403).json(data)
                })
        }
    })
})

// auths 查询多少页多少数据状态数据接口
// method: GET
// ===== req json ====
// header: 
// * token: String - token 口令
// params:
// * status: Boolean - 数据状态
// * page: Number - 数据状态
// * size: Number - 数据状态
// ===== res json =====
// msg: String - 访问信息
// auths: [{
//      _id: String - 数据id
//      name: String - 权限名称
//      auths: Object - 权限范围
//      status: Boolean - 当前状态
//      createDate: Date - 创建时间
// }]
router.get('/selectPageData/:status/:page/:size', (req, res) => {
    jwt.verify(req.headers.token, jwtSecret, (err, data) => {
        if (err) {
            console.log(err)
            let data = {
                msg: 'token 过期'
            }
            res.status(401).json(data)
        } else {
            Auth.find({ status: req.params.status }).sort({ date: -1 })
                .then(auths => {
                    let newAuths = []
                    let page = (req.params.page - 1) * req.params.size
                    let size = page + req.params.size * 1
                    for (let i = page; i < size; i++) {
                        if (auths[i]) {
                            newAuths.push(auths[i])
                        }
                    }

                    if (newAuths.length > 0) {

                        let usersId = []
                        newAuths.forEach(newAuth => {
                            if (newAuth.userId) {
                                usersId.push({ _id: newAuth.userId })
                            } else {
                                usersId.push({})
                            }

                        })
                        let usersName = []

                        User.find({ $or: usersId })
                            .then(users => {
                                usersId.forEach((userId, index) => {
                                    users.forEach(user => {
                                        if (userId._id == user._id.toHexString()) {
                                            usersName.push(user.username)
                                        }
                                    })
                                    if (usersName.length == index) {
                                        usersName.push('root')
                                    }
                                })

                                netAuth = []

                                for (let i = 0; i < newAuths.length; i++) {
                                    let data = {}
                                    data._id = newAuths[i]._id
                                    data.auths = newAuths[i].auths
                                    data.date = newAuths[i].date
                                    data.name = newAuths[i].name
                                    data.status = newAuths[i].status
                                    data.userId = newAuths[i].userId
                                    data.userName = usersName[i]

                                    netAuth.push(data)
                                }

                                let data = {
                                    msg: '查询成功',
                                    auths: netAuth,
                                    conut: auths.length
                                }
                                res.json(data)
                            })
                            .catch(err => {
                                console.log(err)
                                let data = {
                                    msg: '查询失败'
                                }
                                res.status(403).json(data)
                            })
                    }else{
                        let data = {
                            msg: '查询成功',
                            auths: [],
                            conut: 0
                        }
                        res.json(data)
                    }


                })
                .catch(err => {
                    console.log(err)
                    let data = {
                        msg: '查询失败'
                    }
                    res.status(403).json(data)
                })
        }
    })
})

module.exports = router