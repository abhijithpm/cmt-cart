var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { response } = require('express')
var objectId=require('mongodb').ObjectID
 module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
        db.get().collection(collection.DEALER_COLLECTION).insertOne(userData).then((data)=>{
            resolve(data.ops[0])
        })

        })
        
    },

    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.DEALER_COLLECTION).findOne({Email:userData.Email})
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
    addProduct:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            
        db.get().collection(collection.ADD_PRODUCT_COLLECTION).insertOne(userData).then((data)=>{
            resolve(data.ops[0]._id)
        })

        })
        
    },
    getAllProducts:() => {
        return new Promise(async (resolve, reject) => {
           let products = await db.get().collection(collection.ADD_PRODUCT_COLLECTION).find().toArray();
           resolve(products);

        });
     },
     deleteProduct:(prodId)=>{
        
       
        return new Promise((resolve,reject)=>{
            
            db.get().collection(collection.ADD_PRODUCT_COLLECTION).removeOne({_id:objectId(prodId)}).then((responce)=>{
                resolve(response)
               

            })
        })
    },
    getProductDetails:(productId)=>{
        return new Promise((resolve,reject)=>{
           
            db.get().collection(collection.ADD_PRODUCT_COLLECTION).findOne({_id:objectId(productId)}).then((product)=>{
                resolve(product)
            })
        })
    },

    updateProduct:(productId,productDetails)=>{
         return new Promise((resolve,reject)=>{
             
             db.get().collection(collection.ADD_PRODUCT_COLLECTION).updateOne({_id:objectId(productId)},{
                 $set:{
                     Name:productDetails.Name,
                     S_name:productDetails.S_name,
                     C_information:productDetails.C_information,
                     Location:productDetails.Location
                    
                 }
             }).then(response=>{
                 resolve()

             })
         })
     },
     getAllOrders:()=>{
        return new Promise(async (resolve, reject) => {
            let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind:'$products'
                 },{
                     $project:{
                         item:'$products.item',
                         quantity:'$products.quantity',
                         totalAmount:'$totalAmount',
                         deliveryDetails:'$deliveryDetails',
                         paymentMethod:'$paymentMethod',
                         
                         
                     
                     },
                 },
                {
                    $lookup:{
                        from:collection.ADD_PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        paymentMethod:1,deliveryDetails:1,totalAmount:1,product:{$arrayElemAt:['$product',0]},quantity:1
                    }

                }
                
            ]).toArray()
            console.log(orderDetails);
            resolve(orderDetails)
        })
     }
}
