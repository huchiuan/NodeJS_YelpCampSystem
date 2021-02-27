module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash('error','你必須先登入!');
        return res.redirect('/login'); //要有return 否則程式會繼續執行
     }
     next();
}