const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;


//https://res.cloudinary.com/nccu/image/upload/w_300/v1614608841/YelpCamp/iaelztovekuvqilwwyxo.jpg

const ImageSchema= new Schema({
    url: String,
    filename: String

})

ImageSchema.virtual('thumbnail').get(function(){  //只要有呼叫 <%=img.thumbnail%> 就做這件事
    return this.url.replace('/upload','/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: { //moogose的location文件
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
},opts);


CampgroundSchema.virtual('properties.popUpMarkUp').get(function(){  //當呼叫properties.popUpMarkUp傳給地圖使用
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0,20)}...</p>`
});



CampgroundSchema.post('findOneAndDelete', async function (doc) {
    //findOneAndDelete 叫做querymiddleware 如果頁面有叫此剛要做這件事 就會順便刪掉review
    if (doc) {
        await Review.deleteMany({
            _id: { // Review裡面 的每一個_id 如果有在此doc(頁面的物件)的reviews 就刪掉
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)