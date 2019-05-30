const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var device = new Schema({
    name: {type: String, required: true},
    models: {type: Array, required: true}
});

var devModel = mongoose.model('devices', device);

module.exports = devModel;