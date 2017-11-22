var express = require('express')
var parser = require('body-parser')
var app = express()

var PORT = 5000;
var DB_NAME = "bookstore";

var appHost = 'localhost:' + PORT + '/'; //hard-coded host url (should really be defined in a separate config)

app.set('port', (process.env.PORT || PORT));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/../Client'));
app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/' + DB_NAME;

/*
    GET /products handler
    Retrieves the entire array of products
    Specify request parameters to filter products by price (eg. /products?pricegte=30&pricelte=100)
*/
app.get('/products', function(request, response) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var query = {};

    if (Object.keys(request.query).length != 0) {
        var validParams = ["priceGte", "priceLte"];
        if (!hasValidQueryParams(validParams, request.query)) {
            response.status(400).send("Invalid query parameters!");
            return;
        }

        var priceGte = request.query.priceGte;
        var priceLte = request.query.priceLte;

        query.$and = [];

        if (priceGte != undefined) {
            if (!isNaN(priceGte)) {
                query.$and.push({price: {$gte: parseInt(priceGte)}});
            } else {
                response.status(400).send("Please specify query parameter priceGte as a number (eg. priceGte=100)");
                return;
            }
        }

        if (priceLte != undefined) {
            if (!isNaN(priceLte)) {
                query.$and.push({price: {$lte: parseInt(priceLte)}});
            } else {
                response.status(400).send("Please specify query parameter priceLte as a number (eg. priceLte=100)");
                return;
            }
        }
    }

    MongoClient.connect(url, function(err, db) {
        if (err) {
            response.status(500).send("An error occurred, please try again");
            return;
        }

        db.collection("product").find(query).toArray(function(err, res) {
            if (err) {
                response.status(500).send("An error occurred, please try again");
                return;
            }

            var products = {};

            res.forEach((product) => {
                products[product.name] = product;
            });

            response.json(products);
            db.close();
        });
    });
});

function hasValidQueryParams(validParams, params) {
    var hasValidParams = true;

    Object.keys(params).forEach(function(param) {
        if (validParams.indexOf(param) == -1) {
            hasValidParams = false;
        }
    });

    return hasValidParams;
}

app.post('/checkout', function(request, response) {
    var cart;
    var priceTotal;

    if (request.is("application/json")) {
        cart = request.body.cart;
        priceTotal = request.body.priceTotal;
    } else {
        response.status(500).send("An error occurred, please try again");
    }

    createOrder(cart, priceTotal, response);
    for (var item in cart) {
        var cartQuantity = cart[item];
        updateProductItem(item, cartQuantity, response);
    }

    response.status(200).send("Success!");
});

function createOrder(cart, priceTotal, response) {
    MongoClient.connect(url, function(err, db) {
        if (err) {
            response.status(500).send("An error occurred, please try again");
            return;
        }

        db.collection("order").insertOne({cart: JSON.stringify(cart), total: priceTotal}, function(err) {
            if (err) {
                response.status(500).send("An error occurred, please try again");
            }

            db.close();
        });
    })
}

function updateProductItem(item, cartQuantity, response) {
    MongoClient.connect(url, function(err, db) {
        if (err) {
            response.status(500).send("An error occurred, please try again");
            return;
        }
        var collection = db.collection("product");

        collection.find({name: {$eq: item}}).toArray(function(err, items) {
            if (err) {
                response.status(500).send("An error occurred, please try again");
            } else {
                var oldQuantity = items[0].quantity;
                var newQuantity = oldQuantity - cartQuantity;

                if (newQuantity < 0) {
                    response.status(500).send("An error occurred, please try again");
                } else {
                    collection.updateOne({name: {$eq: item}}, {$set: {quantity: newQuantity}}, function(err) {
                        if (err) {
                            response.status(500).send("An error occurred, please try again");
                        }
                    })
                }
            }
            db.close();
        });
    });
}

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
})
