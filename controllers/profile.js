const userSchema = require('./schemas/userSchema');
const reqSchema = require('./schemas/reqSchema');

function profile(req, res) {
    if (!req.session.user) {
        res.redirect('/signin');
    }
    else {
        let email = req.session.user.email;
        //verify password and actually delete
        userSchema.findOne({ email: email }, (err, user) => {
            if (err) {
                res.redirect('/signup');
            }
            else if (!user) {
                res.redirect('/signup');
            }
            else {
                //now to find previous requests
                reqSchema.find({creator: email}).sort({created_on: -1}).exec((err, requests)=>{
                    if(err){
                        throw err;
                    }
                    else if(requests.length === 0){
                        res.render('profile', user);
                    }
                    else {
                        var pending = [];
                        var previous = [];

                        requests.forEach(request => {
                            if(request.stat == 'pending'){
                                pending.push(request);
                            }
                            else if(request.stat == 'resolved'){
                                previous.push(request);
                            }
                        });
                        delete user.password;
                        user.pending = pending;
                        user.previous = previous;
                        res.render('profile', user);
                    }
                })
            }
        });
    }

}

module.exports = profile;