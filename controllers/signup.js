const userSchema = require('./schemas/userSchema');
const path = require('path');
const hash = require('password-hash');

function create(req, res){
    let {f_name, l_name, email, phone, address, password, gender} = req.body;
    
    if(!req.file){
        if(gender === 'M'){
            var fPath = 'png/avatar.png';
        }
        else {
            var fPath = 'png/avatar-1.png';
        }
    }
    else {
        var dest = req.file.destination;
        var fName = req.file.filename;
        var fPath = path.join(__dirname, '../', dest , fName);
        var thisPath = path.join(__dirname, '../', '/public/');
        fPath = path.relative(thisPath, fPath);
        fPath = fPath.replace(/\\/g, '/');
    }

    password = hash.generate(password, {algorithm: 'sha256'});

    userSchema.findOne({email: email}, (err, response)=>{
        if(err){
            throw err;
            res.redirect('/signup');
        }
        else if(response !== null){
            res.render('signup', {error: 'The email address provided is in use by another user. Please choose another'});
        }
        else {
            var newest = new userSchema({
                f_name: f_name,
                l_name: l_name,
                email: email,
                phone: phone,
                address: address,
                password: password,
                avatar: fPath
            });
        
            newest.save((err)=>{
                if(err){
                    throw err;
                    res.render('signup', {error: 'Please ensure all details are filled appropriately'});
                }
                else {
                    //account created, create session, redirect to profile
                    req.session.user = newest;
                    res.redirect('/profile');
                }
            });
        }
    })
}

module.exports = create;