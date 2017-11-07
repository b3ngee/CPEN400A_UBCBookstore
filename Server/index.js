var express = require('express')
var app = express()

var appHost = 'https://cpen400a-bookstore.herokuapp.com/'; //hard-coded host url (should really be defined in a separate config)

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var products = {
  'KeyboardCombo' : {
	name: 'KeyboardCombo',
    price : getRandomInt(25,35),
    quantity : getRandomInt(0,10),
    imageUrl: appHost+'images/KeyboardCombo.png'
  },
  'Mice' : {
	name: 'Mice',
    price : getRandomInt(5,7),
    quantity : getRandomInt(0,10),
    imageUrl: appHost+'images/Mice.png'
  },
  'PC1' : {
	name: 'PC1',
    price : getRandomInt(300,350),
    quantity : getRandomInt(0,10),
    imageUrl: appHost+'images/PC1.png'
  },
  'PC2' : {
	name: 'PC2',
    price : getRandomInt(350,400),
    quantity : getRandomInt(0,10),
    imageUrl: appHost+'images/PC2.png'
  },
  'PC3' : {
	name: 'PC3',
    price : getRandomInt(330,380),
    quantity : getRandomInt(0,10),
    imageUrl: appHost+'images/PC3.png'
  },
  'Tent' : {
	name: 'Tent',
    price : getRandomInt(30,40),
    quantity : getRandomInt(0,10),
    imageUrl: appHost+'images/Tent.png'
  },
  'Box1' : {
	name: 'Box1',
    price : getRandomInt(5,7),
    quantity : getRandomInt(0,10),
    imageUrl: appHost+'images/Box1.png'
  },
  'Box2' : {
	name: 'Box2',
    price : getRandomInt(5,7),
    quantity : getRandomInt(0,10),
    imageUrl: appHost+'images/Box2.png'
  },
  'Clothes1' : {
	name: 'Clothes1',
    price : getRandomInt(20,30),
    quantity : getRandomInt(0,10),
    imageUrl: appHost+'images/Clothes1.png'
  },
  'Clothes2' : {
	name: 'Clothes2',
    price : getRandomInt(20,30),
    quantity : getRandomInt(0,10),
    imageUrl: appHost+'images/Clothes2.png'
  },
  'Jeans' : {
	name: 'Jeans',
    price : getRandomInt(30,40),
    quantity : getRandomInt(0,10),
    imageUrl: appHost+'images/Jeans.png'
  },
  'Keyboard' : {
	name: 'Keyboard',
    price : getRandomInt(15,25),
    quantity : getRandomInt(0,10),
    imageUrl: appHost+'images/Keyboard.png'
  }
};

app.get('/products', function(request, response) {

  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  var option = getRandomInt(0,5);
  if (option < 4) {
    response.json(products);
  } else if (option == 4) {
    response.status(500).send("An error occurred, please try again");
  }
})

app.get('/products/:productKey', function(request, response) {

  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  var option = getRandomInt(0,5);
  if (option < 4) {
	  if (request.params.productKey in products){
		  response.json(products[request.params.productKey]);	  
	  }
	  else {
		  response.status(404).send("Product does not exist");
	  }
  } else if (option == 4) {
    response.status(500).send("An error occurred, please try again");
  }
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
