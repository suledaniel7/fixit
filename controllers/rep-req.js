const userSchema = require('./schemas/userSchema');
const devSchema = require('./schemas/deviceSchema');

function repReq(req, res){
    var email = req.session.user.email;
    
    userSchema.findOne({email: email}, (err, user)=>{
        if(err){
            throw err;
        }
        else {
            user.password = null;
            user._id = null;
            devSchema.find((err, devs)=>{
                if(err){
                    throw err;
                }
                else if(devs.length === 0){
                    user.error = "We currently have no Engineers registered. Check back within a few days";
                    res.render('rep-req', user);
                }
                else {
                    //there are devices/engrs
                    var deviceNames = new Array;
                    var models = new Array;
                    let i = 0;
                    devs.forEach(dev => {
                        let devName = dev.name;
                        let devIndex = i;
                        i++;
                        let device = {
                            name: devName,
                            index: devIndex
                        }
                        deviceNames.push(device);
                        let devModels = dev.models;
                        let tmpModelArr = new Array;
                        devModels.forEach(devModel => {
                            tmpModelArr.push(devModel.name);
                        });
                        models.push(tmpModelArr);
                    });

                    let devices = {
                        names: deviceNames,
                        models: models
                    }

                    user.devices = devices;
                    res.render('rep-req', user);
                }
            });
        }
    });
}

module.exports = repReq;