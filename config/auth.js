module.exports={
    ensureAuth:function(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg','please login')
        res.redirect('/login')
    }
}