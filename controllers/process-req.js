const reqSchema = require('./schemas/reqSchema');

function process(req, res){
    var id = req.params.id;

    reqSchema.findById(id, (err, doc)=>{
        if(err){
            throw err;
        }
        else {
            if(!doc){
                res.redirect('/admin/main');
            }
            else {
                res.render('process-req', doc);
            }
        }
    });
}

module.exports = process;