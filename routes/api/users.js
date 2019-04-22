const express = require('express')
const router = express.Router()

const User = require('../../models/User')
const Auth = require('../../models/Auth')

const md5 = require('md5')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')

const jwtSecret = require('../../config/keys').jwtSecret

// 接口前缀: /api/users

// users 测试接口
// method: GET
// ===== res json =====
// msg: String - 访问信息
router.get('/test', (req, res) => {
    res.json({ msg: 'Users Interface success' })
})

// users 登录接口
// method: POST
// ===== req json =====
// body: 
//  * email: String - 登录邮箱
//  * password: String - 登录密码
// ===== res json =====
// msg: String - 访问信息
// token: String - token口令
router.post('/login', (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                if (user.status) {
                    if (user.password == md5(req.body.password)) {
                        let roles = {
                            id: user._id,
                            username: user.username,
                            email: user.email,
                            authId: user.authId,
                            headerImg: user.headerImg
                        }
                        jwt.sign(roles, jwtSecret, { expiresIn: 3600 }, (err, token) => {
                            if (err) {
                                let data = {
                                    msg: 'token 生成失败'
                                }
                                console.log(err)
                                res.status(401).json(data)
                            } else {
                                let data = {
                                    msg: '登录成功',
                                    token: token
                                }
                                res.json(data)
                            }
                        })
                    } else {
                        let data = {
                            msg: '账户或密码错误'
                        }
                        res.status(400).json(data)
                    }
                } else {
                    let data = {
                        msg: '该用户已停用'
                    }
                    res.status(400).json(data)
                }
            } else {
                let data = {
                    msg: '账户或密码错误'
                }
                res.status(400).json(data)
            }
        })
        .catch(err => {
            let data = {
                msg: '查询用户失败'
            }
            console.log(err)
            res.status(403).json(data)
        })
})

// users 添加单条数据接口
// method: POST
// ===== req json =====
// header: 
// * token: String - token 口令
// params:
//  * id: String - 创建人id
// body: 
//  * username: String - 用户名
//  * email: String - 登录邮箱
//  * password: String - 登录密码
//  * authId: String - 权限id
// ===== res json =====
// msg: String - 访问信息
// user: 
//      _id: String - 数据id
//      username: String - 用户名
//      email: String - 登录邮箱
//      password: String - 登录密码
//      authId: String - 权限id
//      headerImg: String - 头像地址
//      status: Boolean - 当前状态
//      date: Date - 修改时间
router.post('/add/:id', (req, res) => {
    jwt.verify(req.headers.token, jwtSecret, (err, data) => {
        if (err) {
            let data = {
                msg: 'token 过期'
            }
            console.log(err)
            res.status(401).json(data)
        } else {
            Users.findOne({ email: req.body.email })
                .then(user => {
                    if (user) {
                        let data = {
                            msg: '该邮箱已存在'
                        }
                        res.status(400).json(data)
                    } else {
                        Auth.findOne({ _id: req.body.authId })
                            .then(auth => {
                                if (auth) {
                                    let headerImg = gravatar.url(req.body.email, { s: '200', r: 'pg', d: 'mm' })
                                    userTmp = new Users({
                                        username: req.body.username,
                                        email: req.body.email,
                                        password: md5(req.body.password),
                                        authId: auth._id,
                                        status: true,
                                        userId: req.params.id,
                                        headerImg
                                    })
                                    userTmp.save()
                                        .then(user => {
                                            let data = {
                                                msg: '保存用户成功',
                                                user: user
                                            }
                                            res.json(data)
                                        })
                                        .catch(err => {
                                            let data = {
                                                msg: '保存用户失败'
                                            }
                                            console.log(err)
                                            res.status(403).json(data)
                                        })
                                } else {
                                    let data = {
                                        msg: '没有该权限数据'
                                    }
                                    res.status(400).json(data)
                                }
                            })
                            .catch(err => {
                                let data = {
                                    msg: '查询权限失败'
                                }
                                console.log(err)
                                res.status(403).json(data)
                            })
                    }
                })
                .catch(err => {
                    let data = {
                        msg: '查询用户失败'
                    }
                    console.log(err)
                    res.status(403).json(data)
                })
        }
    })
})

// users 删除单个数据接口
// method: DELETE
// ===== req json ====
// header: 
// * token: String - token 口令
// params:
//  * id: String - 用户id
// ===== res json =====
// msg: String - 访问信息
// user: 
//      _id: String - 数据id
//      username: String - 用户名
//      email: String - 登录邮箱
//      password: String - 登录密码
//      authId: String - 权限id
//      headerImg: String - 头像地址
//      status: Boolean - 当前状态
//      date: Date - 修改时间
router.delete('/deleteById/:id', (req, res) => {
    jwt.verify(req.headers.token, jwtSecret, (err, data) => {
        if (err) {
            let data = {
                msg: 'token 过期'
            }
            console.log(err)
            res.status(401).json(data)
        } else {
            User.findOneAndDelete({ _id: req.params.id })
                .then(user => {
                    if (user) {
                        let data = {
                            msg: '删除数据成功',
                            user: user
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
                    res.status(403).json(data)
                })
        }
    })
})

// users 更新单个数据接口
// method: POST
// ===== req json ====
// header: 
// * token: String - token 口令
// params:
//  * id: String - 用户id
//  * userId: String - 修改人id
// body:
//  username: String - 用户名
//  authId: String - 权限id
//  headerImg: String - 头像地址
//  status: Boolean - 当前状态
// ===== res json =====
// msg: String - 访问信息
// user: 
//      _id: String - 数据id
//      username: String - 用户名
//      email: String - 登录邮箱
//      password: String - 登录密码
//      authId: String - 权限id
//      headerImg: String - 头像地址
//      status: Boolean - 当前状态
//      date: Date - 修改时间
router.post('/updataById/:id/:userId', (req, res) => {
    jwt.verify(req.headers.token, jwtSecret, (err, data) => {
        if (err) {
            let data = {
                msg: 'token 过期'
            }
            console.log(err)
            res.status(401).json(data)
        } else {
            let userTmp = {}
            userTmp.userId = req.params.userId
            if (req.body.username) userTmp.username = req.body.username
            if (req.body.headerImg) userTmp.headerImg = req.body.headerImg
            if (req.body.status) userTmp.status = req.body.status
            if (req.body.authId) userTmp.authId = req.body.authId
            User.findOneAndUpdate(
                { _id: req.params.id },
                { $set: userTmp },
                { new: true })
                .then(user => {
                    if (user) {
                        let roles = {}
                        if (req.body.headerImg) {
                            roles = {
                                id: user._id,
                                username: user.username,
                                email: user.email,
                                authId: user.authId,
                                headerImg: req.body.headerImg
                            }
                        } else {
                            roles = {
                                id: user._id,
                                username: user.username,
                                email: user.email,
                                authId: user.authId,
                                headerImg: user.headerImg
                            }
                        }

                        jwt.sign(roles, jwtSecret, { expiresIn: 3600 }, (err, token) => {
                            if (err) {
                                let data = {
                                    msg: 'token 生成失败'
                                }
                                console.log(err)
                                res.status(401).json(data)
                            } else {
                                let data = {
                                    msg: '数据更新成功',
                                    token: token
                                }
                                res.json(data)
                            }
                        })
                    } else {
                        let data = {
                            msg: '未查询到用户数据'
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

// users 修改密码接口
// method: POST
// ===== req json ====
// header: 
// * token: String - token 口令
// params:
//  * id: String - 用户id
//  * userId: String - 修改人id
// body:
//  oldPassword: String - 原始密码
//  newPassword: String - 新密码
// ===== res json =====
// msg: String - 访问信息
// user: 
//      _id: String - 数据id
//      username: String - 用户名
//      email: String - 登录邮箱
//      password: String - 登录密码
//      authId: String - 权限id
//      headerImg: String - 头像地址
//      status: Boolean - 当前状态
//      date: Date - 修改时间
router.post('/updataPasswordById/:id/:userId', (req, res) => {
    jwt.verify(req.headers.token, jwtSecret, (err, data) => {
        if (err) {
            let data = {
                msg: 'token 过期'
            }
            console.log(err)
            res.status(401).json(data)
        } else {
            User.findOne({ _id: req.params.id })
                .then(user => {
                    if (user) {
                        if (user.password == md5(req.body.oldPassword)) {
                            let userTmp = {}
                            userTmp.password = md5(req.body.newPassword)
                            userTmp.userId = req.params.userId
                            User.findOneAndUpdate(
                                { _id: req.params.id },
                                { $set: userTmp },
                                { new: true }
                            )
                                .then(user => {
                                    let data = {
                                        msg: '更新密码成功',
                                        user: user
                                    }
                                    res.json(data)
                                })
                                .catch(err => {
                                    let data = {
                                        msg: '更新密码失败'
                                    }
                                    console.log(err)
                                    res.status(403).json(data)
                                })
                        } else {
                            let data = {
                                msg: '密码输入错误'
                            }
                            res.status(400).json(data)
                        }
                    } else {
                        let data = {
                            msg: '未查询到用户'
                        }
                        res.status(400).json(data)
                    }
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

// users 查询所有数据接口
// method: GET
// ===== res json =====
// header: 
// * token: String - token 口令
// msg: String - 访问信息
// users: {[
//      _id: String - 数据id
//      username: String - 用户名
//      email: String - 登录邮箱
//      password: String - 登录密码
//      authId: String - 权限id
//      headerImg: String - 头像地址
//      status: Boolean - 当前状态
//      date: Date - 修改时间
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
            User.find().sort({ date: -1 })
                .then(users => {
                    let data = {
                        msg: '查询成功',
                        users: users
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

// users 查询所有状态数据接口
// method: GET
// ===== req json ====
// header: 
// * token: String - token 口令
// params:
// * status: Boolean - 数据状态
// ===== res json =====
// msg: String - 访问信息
// users: {[
//      _id: String - 数据id
//      username: String - 用户名
//      email: String - 登录邮箱
//      password: String - 登录密码
//      authId: String - 权限id
//      headerImg: String - 头像地址
//      status: Boolean - 当前状态
//      date: Date - 修改时间
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
            User.find({ status: req.params.status }).sort({ date: -1 })
                .then(user => {
                    let data = {
                        msg: '查询全部数据成功',
                        user: user
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

// users 查询单个数据接口
// method: GET
// ===== req json ====
// header: 
// * token: String - token 口令
// params:
//  * id: String - 用户id
// ===== res json =====
// msg: String - 访问信息
// user: 
//      _id: String - 数据id
//      username: String - 用户名
//      email: String - 登录邮箱
//      password: String - 登录密码
//      authId: String - 权限id
//      headerImg: String - 头像地址
//      status: Boolean - 当前状态
//      date: Date - 修改时间
router.get('/selectById/:id', (req, res) => {
    jwt.verify(req.headers.token, jwtSecret, (err, data) => {
        if (err) {
            let data = {
                msg: 'token 过期'
            }
            console.log(err)
            res.status(401).json(data)
        } else {
            User.findOne({ _id: req.params.id })
                .then(user => {
                    let data = {
                        msg: '查询成功',
                        user: user
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


// users 查询多少页多少数据状态数据接口
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
// users: {[
//      _id: String - 数据id
//      username: String - 用户名
//      email: String - 登录邮箱
//      password: String - 登录密码
//      authId: String - 权限id
//      headerImg: String - 头像地址
//      status: Boolean - 当前状态
//      date: Date - 修改时间
//      userName: String - 修改人名称
//      authName: String - 权限名称
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
            User.find({ status: req.params.status }).sort({ date: -1 })
                .then(users => {
                    let newUsers = []
                    let page = (req.params.page - 1) * req.params.size
                    let size = page + req.params.size * 1
                    for (let i = page; i < size; i++) {
                        if (users[i]) {
                            newUsers.push(users[i])
                        }
                    }

                    if (newUsers.length > 0) {
                        let usersId = []
                        newUsers.forEach(newUser => {
                            if (newUser.userId) {
                                usersId.push({ _id: newUser.userId })
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

                                let authsId = []
                                newUsers.forEach(newUser => {
                                    if (newUser.authId) {
                                        authsId.push({ _id: newUser.authId })
                                    } else {
                                        authsId.push({})
                                    }

                                })
                                let authsName = []

                                Auth.find({ $or: authsId })
                                    .then(auths => {
                                        authsId.forEach((authId, index) => {
                                            auths.forEach(auth => {
                                                if (authId._id == auth._id.toHexString()) {
                                                    authsName.push(auth.name)
                                                }
                                            })
                                        })

                                        netUsers = []

                                        for (let i = 0; i < newUsers.length; i++) {
                                            let data = {}
                                            data._id = newUsers[i]._id
                                            data.date = newUsers[i].date
                                            data.headerImg = newUsers[i].headerImg
                                            data.email = newUsers[i].email
                                            data.username = newUsers[i].username
                                            data.password = newUsers[i].password
                                            data.authId = newUsers[i].authId
                                            data.status = newUsers[i].status
                                            data.userId = newUsers[i].userId
                                            data.userName = usersName[i]
                                            data.authName = authsName[i]
                                            // data.date = newUsers.date[i]

                                            netUsers.push(data)
                                        }

                                        let data = {
                                            msg: '查询成功',
                                            users: netUsers,
                                            conut: netUsers.length
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
                            })
                            .catch(err => {
                                console.log(err)
                                let data = {
                                    msg: '查询失败'
                                }
                                res.status(403).json(data)
                            })

                    } else {
                        let data = {
                            msg: '查询成功',
                            users: [],
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