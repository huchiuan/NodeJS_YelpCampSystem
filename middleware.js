module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl  //可以存下來原本還沒登入前的 使用者想要進去的網頁URL
        req.flash('error','你必須先登入!');
        return res.redirect('/login'); //要有return 否則程式會繼續執行
     }
     next();
}