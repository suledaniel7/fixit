const reqSchema = require('./schemas/reqSchema');
const engSchema = require('./schemas/engSchema');

function admin(req, res){
    var obj = {
        engrs: [],
        reqs: []
    }
    engSchema.find({verified: false}, (err, engrs)=>{
        if(err){
            throw err;
        }
        else {
            obj.engrs = engrs;
            reqSchema.find((err, reqsts)=>{
                if(err){
                    throw err;
                }
                else {
                    var reqs = [];
                    reqsts.forEach(reqst => {
                        if(reqst.status.stat === false){
                            reqs.push(reqst);
                        }
                    });
                    obj.reqs = reqs;
    
                    res.render('admin', obj);
                }
            });
        }
    });
}

module.exports = admin;