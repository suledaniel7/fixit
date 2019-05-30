const engSchema = require('./schemas/engSchema');

function process(req, res){
    var id = req.params.id;

    engSchema.findById(id, (err, doc)=>{
        if(err){
            throw err;
        }
        else {
            if(!doc){
                res.redirect('/admin/main');
            }
            else {
                res.render('process-eng', doc);
            }
        }
    });
}

module.exports = process;