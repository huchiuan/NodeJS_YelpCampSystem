const express =require('express');
const router = express.Router({mergeParams:true});//mergeParams:true可以結合所有程式 讓route 傳送的像是:id 這種變數一樣

const Campground=require('../models/campground');
const Review=require('../models/review');


const {reviewSchema} = require('../schema.js'); //驗證表單用

const ExpressError=require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');



const validateReview=(req,res,next)=>{
const {error} = reviewSchema.validate(req.body)//joi的FUN
    if(error){
        const msg=error.details.map(el=> el.message).join(',')//el = each element 每個元素會回傳el.message 再加上,號
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

router.post('/',validateReview,catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);//因為在views的show EJS葉面  form submit 裡面的data 都叫做review[xxx]，所以要這樣拿
    campground.reviews.push(review); //campground 是MODEL裡面的campground  review 是campground裡面ref 的review
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
 }))
 
 router.delete('/:reviewId',catchAsync(async(req,res)=>{  //處理留言區的部分
    // console.log(req);
    // res.send('test');
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    //$pull可以把Campground 裡面的 那個東西刪了
    await Review.findByIdAndDelete(reviewId);
    //Review 跟Campground 有在campground裡面一個 跟自己一個共兩個 所以要刪兩次
    res.redirect(`/campgrounds/${id}`);
 }))
//参数在url中时
// /path/:id,参数在req.params.id中
// /path?id=xx,参数在req.query.id中
 module.exports = router;