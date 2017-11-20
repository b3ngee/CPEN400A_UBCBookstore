var express = require('express')
var app = express()

var PORT = 5000;
var DB_NAME = "bookstore";

var appHost = 'localhost:' + PORT + '/'; //hard-coded host url (should really be defined in a separate config)

app.set('port', (process.env.PORT || PORT))
app.use(express.static(__dirname + '/public'))

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

    if (request.query.pricegte != undefined && isNaN(request.query.pricegte) || request.query.pricelte != undefined && isNaN(request.query.pricelte)) {
        response.status(400).send("Please specify query parameters as integers");
        return;
    }

    MongoClient.connect(url, function(err, db) {
        if (err) {
            response.status(500).send("An error occurred, please try again");
            return;
        }

        db.collection("product").find({}).toArray(function(err, products) {
            if (err) {
                response.status(500).send("An error occurred, please try again");
                return;
            }

            if (request.query.pricegte || request.query.pricelte) {
                var minPrice = request.query.pricegte || 0;
                var maxPrice = request.query.pricelte || Number.MAX_SAFE_INTEGER;
                products = filterByPrice(products, minPrice, maxPrice);
            }

            var results = {};
            for (var i = 0; i < products.length; i++) {
                var product = products[i];
                results[product.name] = product;
            }

            response.json(results);
            db.close();
        });
    });
});

function filterByPrice(products, minimum, maximum) {
    var filteredProducts = [];
    products.forEach(function(product) {
        if (product.price >= minimum && product.price <= maximum) {
            filteredProducts.push(product);
        }
    });
    return filteredProducts;
}

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
})
