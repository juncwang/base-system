const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AuthSchema = new Schema({
    // 权限名称
    name: {
        type: String,
        required: true
    },
    // 权限集合
    auths: {
        type: Object
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

module.exports = Auth = mongoose.model('auths', AuthSchema)