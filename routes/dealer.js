var express = require('express');
var router = express.Router();
var dealerHelpers=require('../helpers/dealer-helpers')
 
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
      next()
  }else{
    res.redirect('/dealer')
  }
}

router.get('/',(req, res,)=> {
    res.render('dealer/login',{dealer:true});
  });
  router.get('/signup',(req, res,)=> {
    res.render('dealer/signup',{dealer:true});
  });

  router.post('/signup',(req,res)=>{
    dealerHelpers.doSignup(req.body).then((response)=>{
        console.log(response);
  
      })
  })

  router.post('/login',(req,res)=>{
    dealerHelpers.doLogin(req.body).then((response)=>{
       
     if(response.status){
       req.session.loggedIn=true;
       req.session.user=response.user
       console.log(req.session.user);
       res.render('dealer/home',{dealer:true})
  
     }
     else{
       res.redirect('dealer')
     }
      
       
      
    })
  })
  
  router.get('/add-product',verifyLogin,(req, res,)=> {
    console.log(verifyLogin);
    res.render('dealer/add-product',{dealer:true});
  });
  router.post('/add-product',(req,res)=>{
    dealerHelpers.addProduct(req.body).then((response)=>{
      
     let image=req.files.Image
     image.mv('./public/product-image/'+response+'.jpg',(err,done)=>{
       if(!err){
        res.render("dealer/home",{dealer:true}) 
       }
       else{
         console.log(err);
       }
     })  
    })
  })
  router.get('/view-product',(req, res,)=> {
    res.render('dealer/view-product',{dealer:true});
  });

  router.get('/home', function(req, res, next) {
  
    dealerHelpers.getAllProducts().then((products)=>{
      res.render('dealer/view-products',{dealer:true,products})
    
  
    })
  })
  router.get('/delete-product/:id',(req,res)=>{
    let prodId=req.params.id
  
    dealerHelpers.deleteProduct(prodId).then((response)=>{
      res.redirect('/dealer/home')
    })
    })

    router.get('/edit-product/:id',async (req,res)=>{
      let dealer=await dealerHelpers.getProductDetails(req.params.id)
     
      res.render('dealer/edit-product',{dealer:true,dealer})
    })
  
    router.post('/edit-product/:id',(req,res)=>{
      let id=req.params.id
      dealerHelpers.updateProduct(req.params.id,req.body).then(()=>{
        
        res.redirect('/dealer/home')
      if(req.files.Image){
        let image=req.files.Image
        image.mv('./public/product-image/'+id+'.jpg')
      }
    })
    })

    router.get('/orders', function(req, res, next) {
  
      dealerHelpers.getAllOrders().then((orderDetails)=>{
        res.render('dealer/orders',{dealer:true,orderDetails})
      
    
      })
    })
    

   
    

  module.exports = router;