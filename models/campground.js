const mongoose =require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title:String,
    image:String,
    price:Number,
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },

    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete',async function (doc){ 
    //findOneAndDelete 叫做querymiddleware 如果頁面有叫此剛要做這件事 就會順便刪掉review
    if(doc){
        await Review.deleteMany({
            _id:{ // Review裡面 的每一個_id 如果有在此doc(頁面的物件)的reviews 就刪掉
                $in: doc.reviews
            }
        })
    }
})

module.exports=mongoose.model('Campground',CampgroundSchema)