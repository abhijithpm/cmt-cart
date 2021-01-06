var express = require('express');
var router = express.Router();
var userHelpers=require('../helpers/user-helpers')
var dealerHelpers=require('../helpers/dealer-helpers');
const { response } = require('express');


/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('users/login',{users:true});
});


const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
      next()
  }else{
    res.redirect('/login')
  }
}

router.get('/', function(req, res,) {
  if(req.session.loggedIn){
    res.redirect('/home')
  }else{
    res.redirect('/login');
  }
  }); 

router.get('/home', function(req, res, next) {
  res.render('users/home',{users:true});
});

router.get('/', function(req, res, next) {
  res.render('users/home',{users:true});
});
router.get('/product',verifyLogin,async(req, res, next) =>{
  let user=req.session.user
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)

  }
  dealerHelpers.getAllProducts().then((products)=>{
  res.render('users/product',{users:true,products,user,cartCount});
})
});
router.get('/login', function(req, res, next) {
  let user=req.session.user
  res.render('users/login',{users:true,login});
});
router.get('/signup', function(req, res, next) {
  res.render('users/signup',{users:true});
});

router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
      console.log(response); 

    })
})

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
     
   if(response.status){
     req.session.loggedIn=true;
     req.session.user=response.user
     console.log(req.session.user);
     let user=req.session.user;
     res.render('users/home',{users:true,user})

   }
   else{
     res.redirect('login')
   }
  
  })
})

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
  res.redirect('/product')
})
})

router.get('/cart',verifyLogin,async(req, res) =>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  
  let totalValue=0;

  if(products.length>0){
    totalValue=await userHelpers.getTotalAmount(req.session.user._id)

  }
  console.log(products);
  res.render('users/cart',{users:true,products,'user':req.session.user._id,totalValue});
});

router.post('/change-product-quantity',(req,res,next)=>{
 
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
 
    res.json(response)
    
  })
})

router.get('/place-order',verifyLogin,async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('users/place-order',{total,user:req.session.user})
})

router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  console.log(totalPrice);
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
  if(req.body['payment-method']==='cod'){
    res.json({codsuccess:true})
  }else{
    userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
    res.json(response)
    })
  }
   
  })
  console.log(req.body);
})

router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  

  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['receipt']).then(()=>{
    
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false,errMssg:''})
  })
})

router.get('/order-success',verifyLogin,function(req, res, next) {
  let user=req.session.user
  res.render('users/order-success',{users:true,user});
});

  
module.exports = router;
