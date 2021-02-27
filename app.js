const express = require('express');
const path = require ('path');
const mongoose=require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
// const {campgroundSchema,reviewSchema} = require('./schema.js'); //驗證表單用
const catchAsync = require('./utils/catchAsync');
const flash= require('connect-flash');
const ExpressError=require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/user');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');


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
   secret: 'thisissecret',///secret(必要選項)：用來簽章 sessionID 的cookie, 可以是一secret字串或是多個secret組成的一個陣列。
   //如果是陣列, 只有第一個元素會被 簽到 sessionID cookie裡。而在驗證請求中的簽名時，才會考慮所有元素。
   resave:false, //resave：強制將session存回 session store, 即使它沒有被修改。預設是 true
   saveUninitialized:true, //saveUninitialized：強制將未初始化的session存回 session store，未初始化的意思是它是新的而且未被修改。
   cookie: {
      httpOnly:true,
      expires:Date.now() +1000*60*60*24*7,  
      //expires (日期) cookie的到期日，超過此日期，即失效。
      //httpOnly (布林) 標記此cookie只能從web server　訪問，以避免不正確的進入來取得竄改。
      //maxAge (數字) 設定此cookie的生存時間(毫秒為單位)，比方60000(10分鐘後到期，必須重新訪問)
      maxAge:1000*60*60*24*7
   }
}
app.use(session(sessionConfig));
app.use(flash());  //有時候某些欄位會是透過後端傳送提示訊息過來，但是這些提示訊息通常只會顯示一次，所以這邊就會使用一個套件 connect-flash

app.use(passport.initialize());
app.use(passport.session());//app.use(session(sessionConfig));要比此行早用 文件說的
passport.use(new LocalStrategy(User.authenticate())); //LocalStrategy 這個官方API 會專注我們用User 這個LOACL的帳密
passport.serializeUser(User.serializeUser());//幫我們對USER 序列化 序列化是指我們如何拿DATA 或是存USER 在session
passport.deserializeUser(User.deserializeUser());




app.use((req,res,next)=>{
   res.locals.success=req.flash('success');
   res.locals.error =req.flash('error');  //丟到partials的flash處理
   next();
})


app.get('/fakeUser',async(req,res)=>{
   const user = new User({email:'wewew@gmail',username:'me'});
   const newUser = await User.register (user,'chicken');
   res.send(newUser);
})


//這三行是用來使用routes裡面的
app.use('/',userRoutes);
app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes);//reviews是router名字 這個東西是從routes的reviews expert出來的
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