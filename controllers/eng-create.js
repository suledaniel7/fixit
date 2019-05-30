const engSchema = require('./schemas/engSchema');
const devSchema = require('./schemas/deviceSchema');
const path = require('path');
const events = require('events');
const hash = require('password-hash');
const dateFn = require('./dateFn-imp');
const parse = require('./parser');
const dupElim = require('./duplicate_elim');

function create(req, res) {
    let { f_name, l_name, email, phone, password, trade, trUnion, contactUnion } = req.body;
    let pic = req.file;
    if (!pic) {
        var avatar = 'png/user-7.png';
    }
    else {
        var dest = req.file.destination;
        var fName = req.file.filename;
        var fPath = path.join(__dirname, '../', dest, fName);
        var thisPath = path.join(__dirname, '../', '/public/');
        fPath = path.relative(thisPath, fPath);
        fPath = fPath.replace(/\\/g, '/');
        var avatar = fPath;
    }

    //parse and collate engr details
    var trades = new Array;
    trade = String(trade);
    let brands = parse(trade, ';');
    let devices = new Array;

    brands.forEach((brand) => {
        let devName = brand.slice(0, brand.indexOf(':'));
        let models = brand.slice(brand.indexOf(':') + 1);
        models = parse(models, ',');

        // let trsp = /^\s+[a-zA-Z0-9\D]*$|^[a-zA-Z0-9\D]*(\s)+$/g;
        // devName = devName.replace(trsp, '');
        // models.forEach((mod)=>{
        //     mod = mod.replace(trsp, '');
        // });
        let device = {
            name: devName,
            models: models
        }
        devices.push(device);
    });


    password = hash.generate(password, { algorithm: 'sha256' });

    var d = new Date();
    var date_created = dateFn(d, false);

    engSchema.findOne({ email: email }, (err, user) => {
        if (err) {
            throw err;
        }
        else if (!user) {
            var newest = new engSchema({
                f_name: f_name,
                l_name: l_name,
                email: email,
                password: password,
                phone: phone,
                avatar: avatar,
                verified: false,
                inp_trade: trade,
                rating: '5.0',
                orientation: false,
                union: trUnion,
                union_info: contactUnion,
                date_created: date_created
            });

            newest.save((err) => {
                if (err) {
                    throw err;
                    res.render('eng-create', { error: 'Please ensure all details are filled appropriately' });
                }
                else {
                    //now, save the trade
                    /* 
                        first off, include schema, check if device exists
                        if it does, check models based on name and if there are models that match yours, simply add eng name to arr of engs
                        otherwise, create new models in arr and update doc
                        else, create entirely new device w/models and eng email
                    */
                    var finish = new events.EventEmitter();
                    devSchema.find((err, devs) => {
                        //retrieved all devices
                        if (err) {
                            throw err;
                        }
                        else {
                            let last = devs.length - 1;
                            if (devs.length === 0) {
                                //no prior devices
                                let last = devices.length - 1;
                                devices.forEach(device => {
                                    let index = devices.indexOf(device);
                                    let deviceName = device.name;
                                    let modelsArr = new Array;
                                    let models = device.models;

                                    models.forEach(model => {
                                        let tmpMod = {};
                                        tmpMod.name = model;
                                        tmpMod.engineers = [email];
                                        modelsArr.push(tmpMod);
                                    });

                                    var newDev = new devSchema({
                                        name: deviceName,
                                        models: modelsArr
                                    });

                                    newDev.save((err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            if (index === last) {
                                                finish.emit('done');
                                            }
                                        }
                                    });
                                });
                            }
                            else {
                                let final = devices.length-1;
                                devices.forEach((device) => {
                                    let newCreated = false;
                                    //here, create flags for both device and model, and have indices
                                    var models = device.models;
                                    var index = devices.indexOf(device);
                                    let deviceName = RegExp('^\\s*' + device.name.toLowerCase() + '\\s*$');
                                    var deviceFlag = {
                                        exists: false,
                                        index: false
                                    }
                                    var modelFlag = {
                                        exists: false,
                                        index: false,
                                        models: []
                                    }
                                    devs.forEach((dev) => {
                                        let devName = dev.name.toLowerCase();

                                        if (deviceName.test(devName)) {
                                            //the device exists, check models
                                            let mods = dev.models;
                                            deviceFlag.exists = true;
                                            deviceFlag.index = devs.indexOf(dev);

                                            mods.forEach(mod => {
                                                let modName = RegExp('^\\s*' + mod.name.toLowerCase() + '\\s*$');
                                                models.forEach(model => {
                                                    // let modelName = RegExp('^\\s*'+model.name.toLowerCase()+'\\s*$');
                                                    let modelName = model.toLowerCase();
                                                    if (modName.test(modelName)) {
                                                        //the model exists, add engineer
                                                        modelFlag.exists = true;
                                                        modelFlag.index = mods.indexOf(mod);
                                                        modelFlag.models.push(mods.indexOf(mod));
                                                        // mod.engineers.push(email);
                                                    }
                                                    // else {
                                                    //     //the model does not exist, compile
                                                    //     let tmpMod = {};
                                                    //     tmpMod.name = model;
                                                    //     tmpMod.engineers = [email];
                                                    //     mods.push(tmpMod);
                                                    // }
                                                });
                                            });
                                        }
                                        // else {
                                        //     //the device does not exist, compile
                                        //     let deviceName = device.name;
                                        //     let modelsArr = new Array;
                                        //     let models = device.models;

                                        //     models.forEach(model => {
                                        //         let tmpMod = {};
                                        //         tmpMod.name = model;
                                        //         tmpMod.engineers = [email];
                                        //         modelsArr.push(tmpMod);
                                        //     });

                                        //     var newDev = new devSchema({
                                        //         name: deviceName,
                                        //         models: modelsArr
                                        //     });
                                        //     newCreated = true;
                                        // }
                                    });

                                    if (deviceFlag.exists) {
                                        //the device exists, only check models
                                        var dev = devs[deviceFlag.index];
                                        let mods = dev.models;
                                        if(modelFlag.exists){
                                            //the model exists, add engineer
                                            // let mod = mods[modelFlag.index];
                                            // mod.engineers.push(email);

                                            //run a foreach on the models, find their indices, then for the indices, push the engineer
                                            let models = modelFlag.models;

                                            models.forEach(index => {
                                                mods[index].engineers.push(email);
                                            });
                                            //now, you have to reconcile w/dev

                                        }
                                        else {
                                            //compile model
                                            let tmpMod = {};
                                            tmpMod.name = model;
                                            tmpMod.engineers = [email];
                                            mods.push(tmpMod);
                                        }
                                    }
                                    else {
                                        let deviceName = device.name;
                                        let modelsArr = new Array;
                                        let models = device.models;

                                        models.forEach(model => {
                                            let tmpMod = {};
                                            tmpMod.name = model;
                                            tmpMod.engineers = [email];
                                            modelsArr.push(tmpMod);
                                        });

                                        var newDev = new devSchema({
                                            name: deviceName,
                                            models: modelsArr
                                        });
                                        newCreated = true;
                                    }
                                    //at last, emit... only at last

                                    if (newCreated) {
                                        newDev.save((err) => {
                                            if (err) {
                                                throw err;
                                            }
                                            if(index === final){
                                                finish.emit('done');
                                            }
                                        });
                                    }
                                    else {
                                        let devName = device.name;
                                        devSchema.findOneAndUpdate({ name: devName }, dev, (err) => {
                                            if (err) {
                                                throw err;
                                            }
                                            if(index === final){
                                                finish.emit('done');
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                    //use eventemitter on last dev
                    finish.on('done', () => {
                        req.engsession.user = newest;
                        res.redirect('/engineers/profile');
                    });
                }
            });
        }
        else {
            res.render('eng-create', { error: 'The email address provided is in use by another engineer.' });
        }
    });
}

module.exports = create;