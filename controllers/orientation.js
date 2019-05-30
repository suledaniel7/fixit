const engSchema = require('./schemas/engSchema');

function orientation(req, res){
    var email = req.engsession.user.email;
    engSchema.findOneAndUpdate({email: email}, {orientation: true}, (err, doc)=>{
        if(err){
            throw err;
        }
        else {
            delete doc.password;
            res.render('orientation', doc);
        }
    });
}

module.exports = orientation;