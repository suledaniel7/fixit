const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var reqSchema = new Schema({
    creator: {type: String, required: true},
    creatorName: {type: String, required: true},
    devModel: {type: String, required: true},
    details: {type: String, required: true},
    duration: {type: String, required: true},
    photos: Array,
    stat: {type: String, required: true},
    status: {type: Object, required: true},
    pickup: {type: String, required: true},
    delivery: {type: String, required: true},
    comms: {type: Object, required: true},
    commsExp: {type: String, required: true},
    idMeans: {type: String, required: true},
    nameID: {type: String, required: true},
    engineer: String,
    completed: String,
    analysis: String,
    due_date: String,
    date_created: String,
    time_created: String,
    created_on: Date
});

reqSchema.pre('save', function(next){
    var today = new Date();
    this.created_on = today;
    next();
});

var reqs = mongoose.model('requests', reqSchema);

module.exports = reqs;