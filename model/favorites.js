const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FavSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    favDishes: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish' 
        }
    ]
}, {
    timestamps: true
})

const Favorites = mongoose.model('Favorites', FavSchema);
module.exports = Favorites;