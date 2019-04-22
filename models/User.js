const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    // 用户名
    username: {
        type: String,
        required: true
    },
    // 登录用邮箱地址
    email: {
        type: String,
        required: true
    },
    // 登录用密码
    password: {
        type: String,
        required: true
    },
    // 所属权限 id 
    authId: {
        type: String,
        required: true
    },
    // 头像地址
    headerImg: {
        type: String,
        required: true
    },
    // 状态
    status: {
        type: Boolean,
        required: true
    },
    // 创建人 id
    userId: {
        type: String,
        required: true
    },
    // 创建时间
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = User = mongoose.model('users', UserSchema)