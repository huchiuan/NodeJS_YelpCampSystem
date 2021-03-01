const User = require('../models/user');


module.exports.renderRegister=(req,res)=>{
    res.render('users/register') //導向EJS
}

module.exports.register=async(req,res,next)=>{
    //res.send(req.body);//{"username":"ss","email":"tusna08124@gmail.com","password":"ww"}
    try{
        const{ email,username,password}=req.body;
        const user =new User ({email,username});
        const registerdUser = await User.register(user,password);  //.register是passport的fun 可以把不用salt的放前面 要加salt的放後面
        //也會用passport 判斷MONGODB 裡面的資料的狀況
        console.log(registerdUser);

        req.login(registerdUser,err =>{ //passport 的login fun 在註冊完可以直接登入用 不用再自己登入一次
            if (err) return next(err);
            req.flash('success','註冊成功');
            res.redirect('/campgrounds');
        })
       
    } catch(e){
        req.flash('error',e.message);
        res.redirect('register');
    }
      
}

module.exports.renderLogin=(req,res)=>{
    res.render('users/login');
 }

 module.exports.login=(req,res)=>{ //passport.authenticate是passport提供的middleware 可以身分驗證
    req.flash('success','歡迎回來');
    const redirectUrl = req.session.returnTo ||'/campgrounds';
    res.redirect(redirectUrl);
 }
 

 module.exports.logout =(req,res)=>{
    req.logout();
    req.flash('success','登出成功!');
    res.redirect('/campgrounds');
}