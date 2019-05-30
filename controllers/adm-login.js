function login(req, res){
    let {username, password} = req.body;
    
    if(username !== 'fixit' || password !== 'fixit'){
        res.render('admin-lgn', {error: 'Invalid login details'});
    }
    else {
        req.admsession.user = {
            username: true,
            password: true
        }
        res.redirect('/admin/main');
    }
}

module.exports = login;