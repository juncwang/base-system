const express = require('express')
const router = express.Router()

const User = require('../../models/User')

const multiparty = require('connect-multiparty')
const multipartyMiddeware = multiparty()
const fs = require('fs')

router.post('/updataHeadImg', multipartyMiddeware, (req, res) => {
    // 获取文件名字
    console.log(req.files.file)

    if (req.files.file.size > 100000) {
        fs.unlinkSync(req.files.file.path)
        let data = {
            msg: '只能上传小于 100kb 的图片'
        }
        res.status(400).json(data)
    } else {

        let filesData = req.files.file.path.split('\\')
        let fileName = filesData[filesData.length - 1]

        // req.files.file.path 文件路径 可以使用文件流进行调整
        var source = fs.createReadStream(req.files.file.path);
        var dest = fs.createWriteStream('./updata/image/headerImage/' + fileName);
        source.pipe(dest)
        // 删除临时文件
        source.on('end', () => {
            fs.unlinkSync(req.files.file.path)
            let data = {
                msg: '文件保存成功',
                url: 'http://192.168.78.113:5000/api/transfer/img/' + fileName
            }

            User.findOne({ _id: req.body.userId })
                .then(user => {
                    let tmpData = user.headerImg.split('/')
                    let tmpName = tmpData[tmpData.length - 1]
                    fs.unlinkSync('./updata/image/headerImage/' + tmpName)
                })

            res.json(data)
        });   //delete
        source.on('error', err => {
            console.log(err)
            let data = {
                msg: '文件保存出错'
            }
            res.status(400).json(data)
        })
    }
})

router.get('/downImg/:fileName', (req, res) => {
    res.download('./updata/image/headerImage/' + req.params.fileName)
    // res.json({msg: 'hello world'})
})

router.get('/img/:fileName', (req, res) => {
    const rs = fs.createReadStream('./updata/image/headerImage/' + req.params.fileName);//获取图片的文件名
    rs.pipe(res);
})

module.exports = router

