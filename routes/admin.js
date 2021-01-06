var express = require('express');
var router = express.Router();
var adminHelpers=require('../helpers/admin-helpers')
/* GET home page. */
router.get('/', function(req, res,) {
if(req.session.loggedIn){
  res.redirect('/home')
}else{
  res.render('admin/login');
}
});

router.get('/signup', function(req, res,) {
  res.render('admin/signup',{admin:true});
});

router.get('/add-product', function(req, res,) {
  let user=req.session.user
  res.render('admin/add-product',{admin:true,user});
});

router.get('/home', function(req, res,) {
 
  let user=req.session.user
  res.render('admin/home',{admin:true,user});
});


router.post('/signup',(req,res)=>{
  adminHelpers.doSignup(req.body).then((response)=>{
      console.log(response);

    })
})
router.get('/login',(req,res)=>{
  res.render('admin/login',{admin:true})
})
router.post('/login',(req,res)=>{
  adminHelpers.doLogin(req.body).then((response)=>{
   if(response.status){
     req.session.loggedIn=true;
     req.session.user=response.user
     res.redirect('home')

   }
   else{
     res.redirect('/')
   }
    
     
    
  })
})

router.get('/add-product',function(req,res){
  let user=req.session.user
  res.render('admin/add-product',{admin:true,user})
})

router.post('/add-product',(req,res)=>{
  adminHelpers.addDealer(req.body).then((response)=>{
    
   let image=req.files.Image
   image.mv('./public/product-image/'+response+'.jpg',(err,done)=>{
     if(!err){
      res.redirect("details") 
     }
     else{
       console.log(err);
     }
   })  
  })
})

router.get('/details', function(req, res, next) {
  
  adminHelpers.getAllProducts().then((products)=>{
    res.render('admin/dealer-details',{admin:true,details:true,products})
  

  })
  
});
router.get('/delete-product/:id',(req,res)=>{
let prodId=req.params.id

adminHelpers.deleteProduct(prodId).then((response)=>{
  res.redirect('/admin/details')
})
})
router.get('/edit-product/:id',async (req,res)=>{
  let dealer=await adminHelpers.getDealerDetails(req.params.id)
 
  res.render('admin/edit-product',{admin:true,dealer})
})

router.post('/edit-product/:id',(req,res)=>{
  let id=req.params.id
  adminHelpers.updateDealer(req.params.id,req.body).then(()=>{
  res.redirect('/admin/details')
  if(req.files.Image){
    let image=req.files.Image
    image.mv('./public/product-image/'+id+'.jpg')
  }
})
})

router.get('/logout',(req, res,)=>{

 res.render('admin/login');
});

module.exports = router;
