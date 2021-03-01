const Campground=require('../models/campground');


module.exports.index =async(req,res)=>{
    const campgrounds = await Campground.find({});  //Model.find() 是mongoose裡面的fun 可以去mongodb拿資料 (此頁的yelp-camp，)
    //而yelp-camp有東西是因為在SEEDS裡面建立完成。
    res.render('campgrounds/index',{campgrounds})
 }

module.exports.renderNewForm=(req,res)=>{
     
    res.render('campgrounds/new');
 }

 module.exports.createCampground =async(req,res,next)=>{ // new頁面的function   next是要讓這個rout可以跳到下面的middleeware
    // 用我寫的catchAsync model 包起來 可以再產生錯誤的時候跳到model 呼叫裡面要做的事情
  
     //if(!req.body.campground)throw new ExpressError('非法的資料',400);
     //當此行發生 會觸發catchAsync 丟到 這行router.use((err,req,res,next)=>{
     //但用這航太不方便 要驗證module內的所有的變數
     //所以使用joi套件做驗證
  
     
      console.log(req.body.campground);//{ title: '333333', location: '33322' }
      const campground = new Campground(req.body.campground);
      campground.author=req.user._id;//將建立者的ID存到author
      await campground.save();//moogose的語法
      req.flash('success','成功新增一個campground');
      res.redirect(`/campgrounds/${campground._id}`)//._id 是在DB裡產生的 為了要拿取所以要加_ 代表拿自己的
   
  }

  module.exports.showCampground=async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate(
       {path:'reviews',
       populate:{
          path:'author'
       }
  }).populate('author'); 
    //pupulate 可以透過req.params.id把資料繫結再一起 可以用console ground看漲怎樣 細節完的資料再丟到ejs處理事情 
    console.log(campground);
    res.render('campgrounds/show',{campground});
 }

 module.exports.renderEditForm=async(req,res)=>{
    const {id} =req.params;
   const campground = await Campground.findById(id);

  
   if(!campground){
      req.flash('error','無法找到此campground');
      return res.redict('/campgrounds')
   }
 

   res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground =async(req,res)=>{
    const {id} =req.params;
    const campground = await Campground.findById(id);

    
    const camp = await Campground.findByIdAndUpdate(req.params.id,{...req.body.campground});
    //const aString = "foo"
    //const chars = [ ...aString ] // [ "f", "o", "o" ]
    console.log(req.body.campground);
    req.flash('success','成功更新物件');
    res.redirect(`/campgrounds/${campground._id}`)
 }

module.exports.deleteCampground =async(req,res)=>{
     
    const {id} =req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','成功刪除一個campground');
    res.redirect('/campgrounds');
 }