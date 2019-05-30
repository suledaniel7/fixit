const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    f_name: {type: String, required: true},
    l_name: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    phone: String,
    address: String,
    password: {type: String, required: true},
    avatar: String
});

const user = mongoose.model('users', userSchema);

module.exports = user;