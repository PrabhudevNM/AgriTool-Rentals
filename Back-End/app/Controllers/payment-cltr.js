import Payment from "../Models/payment-model.js";
import pick from 'lodash'
import stripe from 'stripe' 
process.env.STRIPE_SECRET_KEY
const paymentsCltr={}

paymentsCltr.pay=async(req,res)=>{
    const body=pick(req.body,['productId','productName','amount'])
    try {
        
        //create customer
        const customer=await stripe.customer.create({

            name:'testing',
            address:{
                line1:'India',
                postal_code:'560004',
                city:'Bengaluru',
                state:'KA',
                country:'US'
            }

        })

        //create a session object
        const session =await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            line_items:[{
                price_data:{
                    currency:'inr',
                    product_data:{
                        name:body.productName
                    },
                    unit_amount:body.amount*100   
                },
                quantity:1
            }],
            mode:'payment',
            success_url:"http://localhost:3000/success",
            cancel_url:"http://localhost:3000/cancel",
            customer:customer.id
        })

        //create a payment
        const payment=new Payment(body)
        payment.productId=body.productId
        payment.transactionId=session.id
        payment.productName=body.productName
        payment.amount=body.amount
        payment.paymentType='card'
        await payment.save()
            res.json({id:session.id,url:session.url})
    } catch (error) {
        console.log(error)
        res.status(500).json({error:'Internal server error'})
    }
}

// paymentsCltr.successUpdate=async(req,res)


export default paymentsCltr