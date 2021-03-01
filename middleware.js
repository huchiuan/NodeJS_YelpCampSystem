const {campgroundSchema,reviewSchema} = require('./schema.js'); //驗證表單用

const ExpressError=require('./utils/ExpressError');
const Campground=require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl  //可以存下來原本還沒登入前的 使用者想要進去的網頁URL
        req.flash('error','你必須先登入!');
        return res.redirect('/login'); //要有return 否則程式會繼續執行
     }
     next();
}

module.exports.validateCampground=(req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body)//joi的FUN
    if(error){
       const msg=error.details.map(el=> el.message).join(',')//el = each element 每個元素會回傳el.message 再加上,號
       throw new ExpressError(msg,400);
    }else{
       next();
    }
 }
 
 module.exports.isAuthor = async(req,res,next)=>{
      const {id} =req.params;
     const campground = await Campground.findById(id);

     if(!campground.author.equals(req.user._id)){
        req.flash('error',"你沒有相關權限進入該頁面");
        return res.redirect(`/campgrounds/${id}`);
     }
     next();
 }
 module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId} =req.params;   //因為路徑會長這樣   campgrounds/id/reviews/reviewId 所以要拿這兩者要這樣寫
   const review = await Review.findById(reviewId);

   if(!review.author.equals(req.user._id)){
      req.flash('error',"你沒有相關權限進入該頁面");
      return res.redirect(`/campgrounds/${id}`);
   }
   next();
}
 module.exports.validateReview=(req,res,next)=>{
    const {error} = reviewSchema.validate(req.body)//joi的FUN
        if(error){
            const msg=error.details.map(el=> el.message).join(',')//el = each element 每個元素會回傳el.message 再加上,號
            throw new ExpressError(msg,400);
        }else{
            next();
        }
    }
    