const engSchema = require('./schemas/engSchema');
const hash = require('password-hash');

function login(req, res){
    let {email, password} = req.body;
    
    engSchema.findOne({email: email}, (err, engr)=>{
        if(err){
            throw err;
        }
        else if(!engr){
            res.render('eng-login', {error: 'Please ensure that your login details are accurate'});
        }
        else {
            if(!hash.verify(password, engr.password)){
                res.render('eng-login', {error: 'Please ensure that your login details are accurate'});
            }
            else {
                req.engsession.user = engr;
                res.redirect('/engineers/profile');
            }
        }
    });
}

module.exports = login;