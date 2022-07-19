const express = require('express');
const flash = require('express-flash');
var router = express.Router()
var User = require('../models/user')
var Pizza = require('../models/pizza')
var Feedback = require('../models/feedback')
var Order = require('../models/order')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const path = require('path')


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, '../pizzaFront/src/assets/pizza');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });
router.get('/check', verifyToken, (req, res, next) => {
    res.json({ msg: "All ok" })
})


router.get('/getalluser', verifyToken, (req, res, next) => {
    User.find({ role: "customer" }, (err, users) => {
        if (err) {
            res.status(500).json({ errmsg: err })
        }
        res.status(200).json({ msg: users })
    })
})

// admin side block user
router.delete("/blockuser/:id", verifyToken, (req, res, next) => {
    // console.log(req.params.id);
    var id = req.params.id
    User.updateOne({ _id: id }, { blocked: true }, function (err, user) {
        console.log(1);
        if (err) {
            console.log(err)
            res.status(500).json({ errmsg: err })
        }
        else {
            console.log("Blocked user");
            return res.status(201).json(user);
        }
    })

    // res.status(200).json({ msg: "ok" })
})

// admin side unblockuser
router.delete("/unblockuser/:id", verifyToken, (req, res, next) => {
    var id = req.params.id
    // console.log(req.params.id);
    User.updateOne({ _id: id }, { blocked: false }, function (err, user) {
        console.log(1);
        if (err) {
            console.log(err)
            res.status(500).json({ errmsg: err })
        }
        else {
            console.log("unblocked user");
            return res.status(201).json(user);
        }
    })
})
// admin side delete user
router.delete("/deleteuser/:id", verifyToken, (req, res, next) => {
    var id = req.params.id
    console.log(req.params.id);
    User.deleteOne({ _id: id }, (err) => {
        if (err)
            console.log("err in delete by admin");
    })
    res.status(200).json({ msg: "yes deleted user by admin" })
})





// addpizza image

function getTime() {
    var today = new Date().toLocaleDateString()
    today = today.toString().replace('/', '-')
    today = today.replace('/', '-')

    const date = new Date();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();

    today += '-' + h + '-' + m + '-' + s

    return today;
}


// addpizza data
router.post("/addpizza", uploadOptions.single('image'), async (req, res, next) => {

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const basePath2 = `../public/uploads/${fileName}`
    // console.log("path", path.resolve() + "/public/uploads/" + fileName)
    var pizza = new Pizza({
        pizzaname: req.body.pizzaname,
        pizzasize: req.body.pizzasize,
        pizzaprice: req.body.pizzaprice,
        pizzaimage: fileName
    })
    pizza.save();
    res.status(200).send({ msg: "Successfully Uploaded" });
})

//many to many//
router.get('/getallpizza', async (req, res, next) => {
    const pizza = await Pizza.find()
    res.status(200).send({ data: pizza })
    // Pizza.find({}, (err, pizzas) => {
    //     if (err) {
    //         res.status(500).json({ errmsg: err })
    //     }
    //     res.status(200).json({ msg: pizzas })
    // })
})



router.delete("/deletepizza/:id", (req, res, next) => {
    var id = req.params.id
    console.log(req.params.id);
    Pizza.deleteOne({ _id: id }, (err) => {
        if (err) {
            console.log("err  in pizza delete by admin");
        }
    })
    res.status(200).json({ msg: "yes deleted pizza by admin" })
})



// edit pizza with image
router.post("/editpizzawithimage", uploadOptions.single('image'), (req, res, next) => {
    var file = req.file
    Pizza.updateOne({ _id: req.body.id }, {
        pizzaname: req.body.pizzaname,
        pizzasize: req.body.pizzasize,
        pizzaprice: req.body.pizzaprice,
        pizzaimage: file.filename
    }, function (err, pizza) {
        console.log(1);
        if (err) {
            console.log(err)
            res.status(500).json({ errmsg: err })
        }
        else {
            console.log("Edited a pizza with image");
            return res.status(201).json(pizza);
        }
    })

})

// edit pizza without image
router.get("/editpizzawithoutimage", verifyToken, (req, res, next) => {
    Pizza.updateOne({ _id: req.query.id }, {
        pizzaname: req.query.pizzaname,
        pizzasize: req.query.pizzasize,
        pizzaprice: req.query.pizzaprice
    }, function (err, pizza) {

        if (err) {
            console.log(err)
            res.status(500).json({ errmsg: err })
        }
        else {
            console.log("Edited pizza without image");
            return res.status(201).json(pizza);
        }
    })
})

function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send("unauthorized req")
    }
    let token = req.headers.authorization.split(' ')[1]
    // console.log(token);
    if (token == 'null') {
        return res.status(401).send("unauthorized req")
    }
    let payload = jwt.verify(token, 'secretkey')
    if (!payload) {
        return res.status(401).send("unauthorized req")
    }
    req.userId = payload.subject
    next()
}


router.get('/getallfeedbback', verifyToken, (req, res, next) => {
    Feedback.find({}, (err, feedbacks) => {
        if (err) {
            res.status(500).json({ errmsg: err })
        }
        res.status(200).json({ msg: feedbacks })
    })
})



router.delete("/deletefeedback/:id", verifyToken, (req, res, next) => {
    var id = req.params.id
    // console.log(req.params.id);
    Feedback.deleteOne({ _id: id }, (err) => {
        if (err) {
            console.log("err in delete by admin");
            res.json({ msg: err })
        }
    })
    res.status(200).json({ msg: "yes deleted feedback by admin" })
})




router.get('/getallorder', verifyToken, (req, res, next) => {
    Order.find({}, (err, orders) => {
        if (err) {
            res.status(500).json({ errmsg: err })
        }
        res.status(200).json({ msg: orders })
    })
})

router.delete("/deleteorder/:id", verifyToken, (req, res, next) => {
    var id = req.params.id
    Order.deleteOne({ _id: id }, (err) => {
        if (err) {
            console.log("err in orderr delete by admin");
            res.json({ msg: err })
        }
    })
    res.status(200).json({ msg: "yes deleted order by admin" })
})



router.delete("/getonecartitem/:id", verifyToken, (req, res, next) => {
    var id = req.params.id
    Order.find({ _id: id }, (err, order) => {
        if (err) {
            res.status(500).json({ error: err })
        }
        res.send(order)
    })
})

router.delete("/getonecartitemuser/:id", verifyToken, (req, res, next) => {
    var id = req.params.id
    console.log("yes in backend");
    User.findOne({ _id: id }, (err, user) => {
        if (err) {
            res.status(401).json.send({ error: err })

        }
        else {
            res.status(200).json({ user: user })
        }
    })
})


module.exports = router
