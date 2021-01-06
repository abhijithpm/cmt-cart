var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { response } = require('express')
var objectId=require('mongodb').ObjectID
const { Logger, ObjectID } = require('mongodb')
const Razorpay=require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_B2TENmocLoyWwe',
    key_secret: 'cqeBXfGx0i45DvDzx4Zp8Qsc',
  });
 module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
        db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
            resolve(data.ops[0])
        })

        })
        
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log('login success');
                        response.user=user
                        response.status=true
                        resolve(response)

                    }else{
                        console.log('login fail');
                        resolve({status:false})
                    }
                })

            }else{
                console.log('no such user');
                resolve({status:false})

            }
        })
    },
    addToCart:(proId,userId)=>{
        let proObj={
            item:objectId(proId),
            quantity:1
        }
        console.log(proObj);
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
           
            if(userCart){
                console.log(userCart);
                let proExist=userCart.product.findIndex(product=>product.item==proId)
                console.log(proExist);
             
            if(proExist!=-1){
                console.log('proid:'+proId);
                
               db.get().collection(collection.CART_COLLECTION)
               .updateOne({user:objectId(userId), 'product.item':objectId(proId)},
               {
                   $inc:{'product.$.quantity':1}
               })
                .then(()=>{
                    resolve()
                    
                })
            }else{
            
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                {
                    $push:{product:proObj}
                }).then((response)=>{
                    resolve()
                })
            }

            }else{
                let cartObj={
                    user:objectId(userId),
                    product:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    getCartProducts:(userId)=>{
        console.log(userId);
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([{
                $match:{user:objectId(userId)
                } 
                },
                {
                   $unwind:'$product'
                },{
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity',
                        
                    
                    },
                },{
                    $lookup:{
                        from:collection.ADD_PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }

                }
                
            ]).toArray()
            console.log(cartItems);
            resolve(cartItems)
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
           
            if(cart){
                count=cart.product.length
            }
            console.log(count);
            resolve(count)
        })
    },
     changeProductQuantity:(details)=>{
         
        details.count=parseInt(details.count)
         details.quantity=parseInt(details.quantity)
         
         
         return new Promise((resolve,reject)=>{
             if(details.count==-1 && details.quantity==1){
                 db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
                 {
                     $pull:{product:{item:objectId(details.product)}}
                 }
                 ).then((response)=>{
                     resolve({removeProduct:true})
                 })
             }else{


             db.get().collection(collection.CART_COLLECTION)
             .updateOne({_id:objectId(details.cart),'product.item':objectId(details.product)},
             {
                 $inc:{'product.$.quantity':details.count}
             })
              .then((response)=>{
                  resolve({status:true})
                 
              }) 
            } 
         })
     },
     getTotalAmount:(userId)=>{
        
         
        return new Promise(async(resolve,reject)=>{
            
            let total=await db.get().collection(collection.CART_COLLECTION).aggregate([{
                $match:{user:objectId(userId)
                } 
                },
                {
                   $unwind:'$product'
                },{
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    
                    },
                },{
                    $lookup:{
                        from:collection.ADD_PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }

                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:[{ $convert: { input: '$quantity', to: "int" } },{ $convert: { input: '$product.Price', to: "int" } }]}}
                    }
                }
                
            ]).toArray()
            
            resolve(total[0].total)
        })
     },

     placeOrder:(order,products,total)=>{
        return new Promise ((resolve,reject)=>{
        console.log(order,products,total);
        let status=order['payment-method']==='cod'?'placed':'pending'
        let orderObj={
            deliveryDetails:{
                moblie:order.mobile,
                address:order.address,
                pincode:order.pincode
            },
            userId:objectId(order.userId),
            paymentMethod:order['payment-method'],
            products:products,
            totalAmount:total,
            status:status,
            date:new Date()
        }
        db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((responce)=>{
            db.get().collection(collection.CART_COLLECTION).removeOne({user:objectId(order.userId)})
            resolve()
        })
        })

     },
     getCartProductList:(userId)=>{
         return new Promise(async(resolve,reject)=>{
             let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
             console.log(cart.product);
             resolve(cart.product)

         })
     },
     generateRazorpay:(orderId,total)=>{
         return new Promise((resolve,reject)=>{
            var options = {
                amount: total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "orderId"
              };
              instance.orders.create(options, function(err, order) {
                  if(err){
                      console.log(err);
                  }else{
                console.log("new:",order);
                resolve(order)
                }
              });
         })
     },
     verifyPayment:(details)=>{
         return new Promise((resolve,reject)=>{
            const crypto = require('crypto');
            let hmac=crypto.createHmac('sha256','cqeBXfGx0i45DvDzx4Zp8Qsc')
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hmac=hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
         })
     },
     changePaymentStatus:(orderId)=>{
         return new Promise((resolve,reject)=>{
             db.get().collection(collection.ORDER_COLLECTION)
             .updateOne({_id:objectId(orderId)},
             {
                 $set:{
                     status:'placed'
                 }
             }).then(()=>{
                 resolve()
             })
         })
     }
    
}