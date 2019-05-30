const userSchema = require('./schemas/userSchema');
const reqSchema = require('./schemas/reqSchema');
const devSchema = require('./schemas/deviceSchema');
const engSchema = require('./schemas/engSchema');
const path = require('path');

const dateFn = require('./dateFn');
const timeFn = require('./timeFn');

function createReq(req, res) {
    var photos = req.files;
    let wsp = /^\s*$/;
    var { deviceName, models, details, duration, pickup, delivery, comms, email, phone, idMeans, idOther, nameID } = req.body;
    var creator = req.session.user.email;

    //data validation
    if (wsp.test(details) || wsp.test(duration) || wsp.test(pickup) || wsp.test(delivery) || wsp.test(email) || wsp.test(phone) || wsp.test(comms) || wsp.test(idMeans) || wsp.test(nameID)) {
        res.redirect('/repair-request');
    }
    else {
        //parsing photos to get path
        var photosArr = [];
        if (photos.length !== 0) {
            photos.forEach(photo => {
                var dest = photo.destination;
                var fName = photo.filename;
                var fPath = path.join(__dirname, '../', dest, fName);
                var thisPath = path.join(__dirname, '../', '/public/');
                fPath = path.relative(thisPath, fPath);
                fPath = fPath.replace(/\\/g, '/');
                photosArr.push(fPath);
            });
        }
        else {
            photosArr = null;
        }

        //now, get user details to appropriate comms
        userSchema.findOne({ email: creator }, (err, user) => {
            if (err) {
                throw err;
                res.redirect('/signin');
            }
            else {
                var name = user.f_name + ' ' + user.l_name;
                if (comms == 'ph') {
                    var commMeans = {
                        type: 'Call',
                        number: phone
                    }
                    var commsExp = commMeans.type + " " + commMeans.number;
                }
                else if (comms == 'tm') {
                    var commMeans = {
                        type: 'Text',
                        number: phone
                    }
                    var commsExp = commMeans.type + " " + commMeans.number;
                }
                else {
                    var commMeans = {
                        address: email
                    }
                    var commsExp = "Email " + commMeans.address;
                }
                //checking ID means
                if (idMeans == 'natID') {
                    var id = 'National ID Card';
                }
                else if (idMeans == 'itP') {
                    var id = 'International Passport';
                }
                else if (idMeans == 'vtC') {
                    var id = "Voter's Card";
                }
                else if (idMeans == 'schId') {
                    var id = "School ID Card";
                }
                else {
                    var id = idOther;
                }

                //checking duration
                if (duration == 'lt1') {
                    var dur = "Less Than 1 Week";
                }
                else if (duration == 'lt4') {
                    var dur = "1 to 4 Weeks";
                }
                else if (duration == 'mt5') {
                    var dur = "1 to 5 Months";
                }
                else {
                    var dur = "More than 5 Months";
                }

                //create the date section
                var today = new Date();
                var day = today.getDay();
                var date = today.getDate();
                var month = today.getMonth();
                var year = today.getFullYear();
                var hour = today.getHours();
                var minute = today.getMinutes();

                var theDate = dateFn(day, date, month, year, true);
                var theTime = timeFn(hour, minute);
                //all other parameters gotten, now extract model and assign engineer

                devSchema.find((err, devs) => {
                    if (err) {
                        throw err;
                    }
                    else if (devs.length === 0) {
                        res.redirect('/profile');
                    }
                    else {
                        var deviceNames = new Array;
                        devs.forEach((dev) => {
                            deviceNames.push(dev.name);
                        });
                        let index = deviceNames.indexOf(deviceName);

                        var model = models[index];
                        if (!model) {
                            res.redirect('/repair-request');
                        }
                        else {
                            //assign engineer
                            let pattern = RegExp('^\\s*' + deviceName + '\\s*$');
                            devSchema.find({ name: pattern }, (err, devices) => {
                                if (err) {
                                    throw err;
                                }
                                else if (devices.length === 0) {
                                    res.redirect('/profile');
                                }
                                else {
                                    //assign engineer based on rating and last assigned date
                                    //first, filter devices above based on models
                                    let vEngrs = new Array;
                                    let modPattern = RegExp('^\\s*' + model + '\\s*$');
                                    devices.forEach(device => {
                                        let models = device.models;
                                        models.forEach(mod => {
                                            if (modPattern.test(mod.name)) {
                                                let modEngrs = mod.engineers;
                                                modEngrs.forEach(modEngr => {
                                                    vEngrs.push(modEngr);
                                                });
                                            }
                                        });
                                    });

                                    //we've populated engineers array, now, obtain best engr available
                                    //compile array of objects for query
                                    let queryArr = [];

                                    vEngrs.forEach(vEng => {
                                        let tmpObj = {
                                            email: vEng
                                        }
                                        queryArr.push(tmpObj);
                                    });

                                    engSchema.find({ $or: queryArr }, (err, engrs) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            //gotten engineers, now, find optimal engr
                                            let highestRating = 0;
                                            let unique = true;
                                            let optimalEngrs = [];

                                            engrs.forEach(engr => {
                                                let rating = parseFloat(engr.rating);
                                                if (rating > highestRating) {
                                                    optimalEngrs.unshift(engr);
                                                    highestRating = rating;
                                                    unique = true;
                                                }
                                                else if (rating == highestRating) {
                                                    optimalEngrs.unshift(engr);
                                                    unique = false;
                                                }
                                            });

                                            //populated optimals array
                                            //now, check for duplicate ratings via unique
                                            if (unique) {
                                                var engineer = optimalEngrs[0];
                                            }
                                            else {
                                                //check last assigned date, next, oldest on platform
                                                //first, get them out.
                                                let tmpArr = [];
                                                optimalEngrs.forEach((optEngr) => {
                                                    if (optEngr.rating == highestRating) {
                                                        tmpArr.push(optEngr);
                                                    }
                                                });
                                                
                                                //all ratings are equal, next is last assigned date
                                                let assTempArr = [];
                                                let otherTmpArr = [];
                                                let lastDate = new Date();
                                                var lastTmpDate = new Date();
                                                tmpArr.forEach((tmp) => {
                                                    if (tmp.last_proj) {
                                                        //he was assigned a project
                                                        if (tmp.last_proj < lastDate) {
                                                            assTempArr[0] = tmp;
                                                            lastDate = tmp.last_proj;
                                                        }
                                                    }
                                                    else {
                                                        //he hasn't been assigned, check oldest on platform
                                                        if (tmp.created_on < lastTmpDate) {
                                                            otherTmpArr[0] = tmp;
                                                            lastTmpDate = tmp.created_on;
                                                        }
                                                    }
                                                });
                                                
                                                if (otherTmpArr.length !== 0) {
                                                    var engineer = otherTmpArr[0];
                                                }
                                                else {
                                                    var engineer = assTempArr[0];
                                                }
                                            }
                                            //gotten engineer, save reqSchema, then change last proj

                                            var newRequest = new reqSchema({
                                                creator: creator,
                                                creatorName: name,
                                                devModel: deviceName + ' ' + model,
                                                details: details,
                                                duration: dur,
                                                photos: photosArr,
                                                stat: 'pending',
                                                status: {
                                                    stat: false,
                                                    statText: 'Pending Pickup'
                                                },
                                                pickup: pickup,
                                                delivery: delivery,
                                                comms: commMeans,
                                                commsExp: commsExp,
                                                idMeans: id,
                                                engineer: engineer.email,
                                                nameID: nameID,
                                                date_created: theDate,
                                                time_created: theTime
                                            });

                                            newRequest.save((err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    let today = new Date();
                                                    engSchema.findOneAndUpdate({email: engineer.email}, {last_proj: today}, (err)=>{
                                                        if(err){
                                                            throw err;
                                                        }
                                                        else {
                                                            res.redirect('/profile');
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });//on assignment, change last_proj
                //now, creating object


            }
        });
    }
}

module.exports = createReq;