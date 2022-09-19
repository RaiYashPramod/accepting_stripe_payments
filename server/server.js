require('dotenv').config();

const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const cors = require('cors')
app.use(cors({
    origin: "http://localhost:5500"
}))
app.use(express.json())

const storeItems = new Map ([
    [1, {priceInPaise: 100000, name: 'Learn React today Course'}],
    [2, {priceInPaise: 40000, name: 'Learn Socket io'}],
])

app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id)
                return {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInPaise
                    },
                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.SERVER_URL}/success.html`,
            cancel_url: `${process.env.SERVER_URL}/`
        })
        res.json({ url: session.url })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

app.listen('3000', () => {
    console.log('Server is up and running');
})