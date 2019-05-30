const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var engSchema = new Schema({
    f_name: {type: String, required: true},
    l_name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phone: String,
    avatar: String,
    verified: Boolean,
    inp_trade: String,
    trade: Array,
    last_proj: Date,
    orientation: Boolean,
    rating: String,
    union: String,
    union_info: String,
    date_created: String,
    created_on: Date
});

engSchema.pre('save', function(next){
    var d = new Date();
    this.created_on = d;
    next();
});

var eng = mongoose.model('engineers', engSchema);

module.exports = eng;