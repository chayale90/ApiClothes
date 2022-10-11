const express = require("express");
const { ClothingModel, valiateClothing } = require("../models/clothingModel");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.get("/", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;

    try {
        let data = await ClothingModel.find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })

        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

//     /clothes/search?s=
router.get("/search", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let queryS = req.query.s;
        let searchReg = new RegExp(queryS, "i")
        let data = await ClothingModel.find({ $or: [{ name: searchReg }, { info: searchReg }] })
            .limit(perPage)
            .skip((page - 1) * perPage)
        res.json(data);

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})


//search by category of clothes
//     /clothes/category/:catname
router.get("/category/:catname", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let paramsS = req.params.catname;
        let searchReg = new RegExp(paramsS, "i")
        let data = await ClothingModel.find({ category: searchReg })
            .limit(perPage)
            .skip((page - 1) * perPage)
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})




// /clothes/prices?min=
router.get("/prices", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "price";

    try {
        let minS = req.query.min;
        let maxS = req.query.max;

        if (minS && maxS) {
            let data = await ClothingModel.find({ $and: [{ price: { $gte: minS } }, { price: { $lte: maxS } }] })
                .limit(perPage)
                .skip((page - 1) * perPage)
                .sort(sort)
            res.json(data);
        }

        else if (minS) {
            let data = await ClothingModel.find({ price: { $gte: minS } })
                .limit(perPage)
                .skip((page - 1) * perPage)
                .sort(sort)
            res.json(data);
        }

        else if (maxS) {
            let data = await ClothingModel.find({ price: { $lte: maxS } })
                .limit(perPage)
                .skip((page - 1) * perPage)
                .sort(sort)
            res.json(data);
        }
        else {
            let data = await ClothingModel.find({})
                .limit(perPage)
                .skip((page - 1) * perPage)
                .sort(sort)
            res.json(data);
        }
    }

    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})



router.post("/", auth, async (req, res) => {
    let validateBody = valiateClothing(req.body)
    if (validateBody.error) {
        return res.status(400).json(validateBody.error.details);
    }
    try {
        let clothing = new ClothingModel(req.body)
        clothing.user_id = req.tokenData._id;
        await clothing.save();
        res.status(201).json(clothing);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})


router.put("/:idEdit", auth, async (req, res) => {
    let validateBody = valiateClothing(req.body)
    if (validateBody.error) {
        return res.status(400).json(validateBody.error.details);
    }
    try {
        let idEdit = req.params.idEdit;
        let data;
        if (req.tokenData.role == "admin") {
            data = await ClothingModel.updateOne({ _id: idEdit }, req.body)
            res.status(201).json(data);
        } else {
            data = await ClothingModel.updateOne({ _id: idEdit, user_id: req.tokenData._id }, req.body)
            res.status(201).json(data);
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

router.delete("/:idDel", auth, async (req, res) => {
    try {
        let idDel = req.params.idDel;
        let data;
        //admin can delete every item of every user
        if (req.tokenData.role == "admin") {
            data = await ClothingModel.deleteOne({ _id: idDel })
        } else {
            //user can delete only his item
            data = await ClothingModel.deleteOne({ _id: idDel, user_id: req.tokenData._id })
        }
        res.status(201).json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

module.exports = router;