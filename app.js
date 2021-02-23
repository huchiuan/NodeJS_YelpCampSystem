const express = require('express');

const path = require ('path');
const mongoose=require('mongoose');
const ejsMate = require('ejs-mate');

const {campgroundSchema} = require('./schema.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground=require('./models/campground');
const { required } = require('joi');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', ()=>{
    console.log("Db連接了:)")
});



const app=express();

app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views')); //去views資料夾拿ejs

app.use(express.urlencoded({extended:true})); //可以解析req內的東西
app.use(methodOverride('_method'));



const validateCampground=(req,res,next)=>{

   

   const {error} = campgroundSchema.validate(req.body)


   if(error){
      const msg=error.details.map(el=> el.message).join(',')//el = each element 每個元素會回傳el.message 再加上,號
      throw new ExpressError(msg,400);
   }else{
      next();
   }
}




app.get('/',(req,res)=>{
    res.send('home')
})

app.get('/campgrounds',catchAsync(async(req,res)=>{
   const campgrounds = await Campground.find({});  //Model.find() 是mongoose裡面的fun 可以去mongodb拿資料 (此頁的yelp-camp，)
   //而yelp-camp有東西是因為在SEEDS裡面建立完成。
   res.render('campgrounds/index',{campgrounds})
}))


app.get('/campgrounds/new',(req,res)=>{

    res.render('campgrounds/new')
 })

app.post('/campgrounds',validateCampground ,catchAsync(async(req,res,next)=>{ // new頁面的function   next是要讓這個rout可以跳到下面的middleeware
  // 用我寫的catchAsync model 包起來 可以再產生錯誤的時候跳到model 呼叫裡面要做的事情

   //if(!req.body.campground)throw new ExpressError('非法的資料',400);
   //當此行發生 會觸發catchAsync 丟到 這行app.use((err,req,res,next)=>{
   //但用這航太不方便 要驗證module內的所有的變數
   //所以使用joi套件做驗證

    console.log(req.body.campground);//{ title: '333333', location: '33322' }
    const campground = await Campground(req.body.campground);
    await campground.save();//moogose的語法
    res.redirect(`/campgrounds/${campground._id}`)//._id 是在DB裡產生的 為了要拿取所以要加_ 代表拿自己的
 
}))


app.get('/campgrounds/:id',catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show',{campground});
 }))


 app.get('/campgrounds/:id/edit',catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground});
 }))

 app.put('/campgrounds/:id',validateCampground,catchAsync(async(req,res)=>{
    const campground = await Campground.findByIdAndUpdate(req.params.id,{...req.body.campground});
    //const aString = "foo"
    //const chars = [ ...aString ] // [ "f", "o", "o" ]
    console.log(req.body.campground);
    res.redirect(`/campgrounds/${campground._id}`)
 }))

 app.delete('/campgrounds/:id',catchAsync(async(req,res)=>{
    const {id} =req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
 }))

app.all('*',(req,res,next)=>{  //原本此fun就是用在如果打一個錯的路徑 會send 失敗的一個路徑
   next(new ExpressError('網頁不存在',404))//現在會傳入下個middleware
})
app.use((err,req,res,next)=>{
   const{statusCode=500,message='有東西有問題'} =err ;
    //常見的情況時，當從伺服器拿到的資料是帶有一大包內容的物件，
   //而我們只需要用到該物件裡面的其中一些屬性，這時就很適合使用解構賦值。解構賦值（Destructuring assignment）
   ///*範例 一般從物件取出屬性值，並建立新變數的做法 */
   // const name = product.name;
   // const description = product.description;
   //------------------------------------------------------
   /* 物件的解構賦值 */

   // 自動產生名為 name 和 description 的變數
   // 並把 product 物件內的 name 和 description 當作變數的值
   // const { name, description } = product;

   // console.log(name);         // iPhone
   // console.log(description);  // 全面創新的三相機系統，身懷萬千本領，卻簡練易用。...
   if(!err.message) err.message="有東西錯了啦"
   res.status(statusCode).render('error',{err}); 
   //用render 可以把後面那個物件或變數 傳到ejs葉面的<%=%>座使用
   //res.send('有東西壞了');
})
app.listen(3000,()=>{
   console.log('Serving on port 3000')
})