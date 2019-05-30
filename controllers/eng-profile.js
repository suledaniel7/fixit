const engSchema = require('./schemas/engSchema');
const reqSchema = require('./schemas/reqSchema');

function profile(req, res){
    if(!req.engsession.user){
        res.redirect('/engineers/signin');
    }
    else {
        let email = req.engsession.user.email;

        engSchema.findOne({email: email}, (err, user)=>{
            if(err){
                res.redirect('/engineers/signup');
            }
            else if(!user){
                res.redirect('/engineers/signup');
            }
            else if(!user.orientation){
                res.redirect('/engineers/orientation');
            }
            else {
                //checking if verified
                if(user.verified){
                    var verStat = "Verified";
                }
                else {
                    var verStat = "Pending Verification";
                }
                user.ver_stat = verStat;
                //checking for previous & pending requests
                reqSchema.find({engineer: email}, (err, requests)=>{
                    if(err){
                        throw err;
                    }
                    else {
                        if(requests.length !== 0){
                            //parse between pending and previous
                            var pending = new Array;
                            var previous = new Array;
                            requests.forEach(project => {
                                if(project.completed === true){
                                    previous.push(project);
                                }
                                else {
                                    pending.push(project);
                                }
                            });

                            //render page
                            user.pending = pending;
                            user.previous = previous;

                            delete user.password;
                            res.render('eng-profile', user);
                        }
                        else {
                            //render profile with set values
                            delete user.password;
                            res.render('eng-profile', user);
                        }
                    }
                })
            }
        })
    }
}

module.exports = profile;