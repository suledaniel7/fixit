const reqSchema = require('./schemas/reqSchema');
const engSchema = require('./schemas/engSchema');

function assignEng(req, res){
    var {device, category, analysis, dueDate} = req.body;
    var id = req.params.id;
    
    engSchema.find({/* verified: true, */ inp_trade: category}, (err, engr)=>{
        //select based on rating
        //for now, just assign
        //will probably use `device` later
        if(err){
            throw err;
        }
        else {
            var theEng = engr[0];
            
            reqSchema.findById(id, (err, doc)=>{
                if(err){
                    throw err;
                }
                else {
                    if(!doc){
                        res.redirect('/admin/main');
                    }
                    else {
                        doc.engineer = theEng.email;
                        doc.status.statText = "Undergoing Repair";
                        doc.status.stat = true;
                        doc.analysis = analysis;
                        doc.due_date = dueDate;
                        doc.completed = false;
                        reqSchema.findByIdAndUpdate(id, doc, (err, upDoc)=>{
                            if(err){
                                throw err;
                            }
                            else {
                                //update engschema
                                var last_proj = new Date();
                                engSchema.findOneAndUpdate({email: theEng.email}, {last_proj: last_proj}, (err)=>{
                                    if(err){
                                        throw err;
                                    }
                                    else {
                                        //everything's done... for now
                                        console.log('Updated!');
                                        res.redirect('/admin/main');
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });
}

module.exports = assignEng;