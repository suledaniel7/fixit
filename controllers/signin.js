const userSchema = require('./schemas/userSchema');
const hash = require('password-hash');

function login(req, res){
    let{email, password} = req.body;
    userSchema.findOne({email: email}, function(err, user){
        if(!user){
            //user doesn't exist
            res.render('signin', {error: 'Please ensure that your details are valid'});
        }
        else {
            if(!hash.verify(password, user.password)){
                res.render('signin', {error: 'Please ensure that your details are valid'});
            }
            else {
                //redirect to profile after setting session
                req.session.user = user;
                res.redirect('/profile');
            }
        }
    });
}

module.exports = login;