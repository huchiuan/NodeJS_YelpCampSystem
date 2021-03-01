const express =require('express');
const router = express.Router({mergeParams:true});//mergeParams:true可以結合所有程式 讓route 傳送的像是:id 這種變數一樣
const{validateReview,isLoggedIn,isReviewAuthor} =require('../middleware');
const Campground=require('../models/campground');
const Review=require('../models/review');



const ExpressError=require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');





router.post('/',isLoggedIn,validateReview,catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);//因為在views的show EJS葉面  form submit 裡面的data 都叫做review[xxx]，所以要這樣拿
    review.author = req.user._id;
    campground.reviews.push(review); //campground 是MODEL裡面的campground  review 是campground裡面ref 的review
    await review.save();
    await campground.save();
    req.flash('success','成功新增一個評論');
    res.redirect(`/campgrounds/${campground._id}`);
 }))
 
 router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async(req,res)=>{  //處理留言區的部分
    // console.log(req);
    // res.send('test');
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    //$pull可以把Campground 裡面的 那個東西刪了
    await Review.findByIdAndDelete(reviewId);
    //Review 跟Campground 有在campground裡面一個 跟自己一個共兩個 所以要刪兩次
    req.flash('success','成功刪除一個評論');
    res.redirect(`/campgrounds/${id}`);
 }))
//参数在url中时
// /path/:id,参数在req.params.id中
// /path?id=xx,参数在req.query.id中
 module.exports = router;