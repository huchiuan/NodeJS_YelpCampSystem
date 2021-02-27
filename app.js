const express = require('express');
const path = require ('path');
const mongoose=require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
// const {campgroundSchema,reviewSchema} = require('./schema.js'); //驗證表單用
const catchAsync = require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
const methodOverride = require('method-override');


const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');


mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
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


const sessionConfig={
   secret: 'thisissecret',
   resave:false,
   saveUninitialized:true,
   cookie: {
      httpOnly:true,
      expires:Date.now() +1000*60*60*24*7,
      maxAge:1000*60*60*24*7
   }
}
app.use(session(sessionConfig))


//這兩行是用來使用routes裡面的
app.use('/campgrounds',campgrounds)
app.use('/campgrounds/:id/reviews',reviews)//reviews是router名字 這個東西是從routes的reviews expert出來的
//  前面的/campgrounds/:id/reviews' 打上去 可以讓module裡面的rout路徑簡短

app.use(express.static(path.join(__dirname,'public')))
//加入此行可以讓整隻程式運用public資料夾裡面的資料

app.get('/',(req,res)=>{
    res.send('home')
})


app.all('*',(req,res,next)=>{  //原本此fun就是用在如果打一個錯的路徑 會send 失敗的一個路徑
   next(new ExpressError('網頁不存在',404))//現在會傳入下個middleware
})
app.use((err,req,res,next)=>{
   
   const{statusCode=500} =err ;  // 如果我把這行拿掉 會噴error statusCode沒定義 有時候的statuscode不會出現 所以要給他預設值500

   // console.log(statusCode);//顯示400
   //因為下面要用到statusCode 跟message 這兩個變數
   //所以要先宣告預設值

   //解構賦值筆記
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
   // console.log(statusCode);//顯示400
   // console.log(res.status(statusCode));//顯示很長一串
   // console.log(err.message);//顯示在最上面fun產生出的

   res.status(statusCode).render('error',{err}); 
   //用render 可以把後面那個物件或變數 傳到ejs葉面的<%=%>座使用
   //res.send('有東西壞了');
})
app.listen(3000,()=>{
   console.log('Serving on port 3000')
})