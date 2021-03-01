const express =require('express');
const router = express.Router({mergeParams:true});//mergeParams:true可以結合所有程式 讓route 傳送的像是:id 這種變數一樣
const{validateReview,isLoggedIn,isReviewAuthor} =require('../middleware');
const Campground=require('../models/campground');
const Review=require('../models/review');

const reviews = require('../controllers/reviews');

const ExpressError=require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');





router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview));
 
 router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview));
//参数在url中时
// /path/:id,参数在req.params.id中
// /path?id=xx,参数在req.query.id中
 module.exports = router;