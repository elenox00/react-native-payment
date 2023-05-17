const PORT = 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

const app =express()

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        "AYEkl8FvomQsEbINpJvEjAjhXI5IhgbpcXVc2WdJPOcaQGnEPw16SHXGBIum7wl05hHf9ukkKmYuNDnQ",
    client_secret:
        "EBH2fzWh9OPIdhR7qdFsHUg0NV_N0_u66I1U9W5VCUfUfiE7NgcGWrnCRJZDehTOlUV7QO9wQmiEEpWK"
});

app.get('/', async(req, res) => { 
 
res.render('index')
})

app.get("/paypal", (req, res) => {
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: "http://localhost:8000/success",
            cancel_url: "http://localhost:8000/cancel"
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: "item",
                            sku: "item",
                            price: "100",
                            currency: "USD",
                            quantity: 1
                        }
                    ]
                },
                amount: {
                    currency: "USD",
                    total: "100"
                },
                description: "This is the payment description."
            }
        ]
    };
    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href);
        }
    });
});

app.get("/success", (req, res) => {
  
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: "100"
                }
            }
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.render("success");
        }
    });     
});


app.get("cancel", (req, res) => {
    res.render("cancel");
});


app.listen(PORT,()=>console.log('server is running on port 8000'))