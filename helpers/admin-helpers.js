var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { response } = require('express')
var objectId=require('mongodb').ObjectID
module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
        db.get().collection(collection.ADMIN_COLLECTION).insertOne(userData).then((data)=>{
            resolve(data.ops[0])
        })

        })
        
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:userData.Email})
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
    addDealer:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            
        db.get().collection(collection.ADD_DEALER_COLLECTION).insertOne(userData).then((data)=>{
            resolve(data.ops[0]._id)
        })

        })
        
    },
    getAllProducts:() => {
        return new Promise(async (resolve, reject) => {
           let products = await db.get().collection(collection.ADD_DEALER_COLLECTION).find().toArray();
           resolve(products);

        });
     },
     deleteProduct:(prodId)=>{
         console.log(prodId)
         console.log(objectId(prodId));
         return new Promise((resolve,reject)=>{
             
             db.get().collection(collection.ADD_DEALER_COLLECTION).removeOne({_id:objectId(prodId)}).then((responce)=>{
                 resolve(response)
                 console.log(response);

             })
         })
     },
     getDealerDetails:(dealerId)=>{
         return new Promise((resolve,reject)=>{
             console.log(dealerId);
             db.get().collection(collection.ADD_DEALER_COLLECTION).findOne({_id:objectId(dealerId)}).then((product)=>{
                 resolve(product)
             })
         })
     },
     updateDealer:(dealerId,dealerDetails)=>{
         return new Promise((resolve,reject)=>{
             console.log(dealerId);
             db.get().collection(collection.ADD_DEALER_COLLECTION).updateOne({_id:objectId(dealerId)},{
                 $set:{
                     Name:dealerDetails.Name,
                     S_name:dealerDetails.S_name,
                     C_information:dealerDetails.C_information,
                     Location:dealerDetails.Location
                    
                 }
             }).then(response=>{
                 resolve()

             })
         })
     }
     

}