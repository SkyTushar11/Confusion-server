const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
const Schema = mongoose.Schema;

const Currency = mongoose.Types.Currency;
const promoSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ' '
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

var Promotions = mongoose.model("Promotion", promoSchema); //Creates a Promotion db model

module.exports = Promotions;