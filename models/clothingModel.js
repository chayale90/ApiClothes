const Joi = require("joi");
const mongoose = require("mongoose");
let clothingSchema = new mongoose.Schema({
    name: String,
    info: String,
    sizes: String,
    price: Number,
    img: String,
    user_id: String,
    category: {
        type: String, default: "1"
    } ,
       date_created: {
        type: Date, default: Date.now()
    }
})

exports.ClothingModel = mongoose.model("clothes", clothingSchema)

exports.valiateClothing = (_reqBody) => {
   let schemaJoi = Joi.object({
       name: Joi.string().min(2).max(99).required(),
       info: Joi.string().min(2).max(999).required(),
       sizes: Joi.string().min(0).max(99).required(),
        price: Joi.number().min(1).max(9999).required(),
        img: Joi.string().min(2).max(500).allow(null, ""),
        category: Joi.string().min(2).max(99).allow(null, "")
    })
    return schemaJoi.validate(_reqBody);
}