
var cart = {};

var products = {
    'Box1': { product: new Product('Box1', 10, './Images/Products/Box1_$10.png'), quantity: 5 },
    'Box2': { product: new Product('Box2', 5, './Images/Products/Box2_$5.png'), quantity: 5 },
    'Clothes1': { product: new Product('Clothes1', 20, './Images/Products/Clothes1_$20.png'), quantity: 5 },
    'Clothes2': { product: new Product('Clothes2', 30, './Images/Products/Clothes2_$30.png'), quantity: 5 },
    'Jeans': { product: new Product('Jeans', 50, './Images/Products/Jeans_$50.png'), quantity: 5 },
    'KeyboardCombo': { product: new Product('KeyboardCombo', 40, './Images/Products/KeyboardCombo_$40.png'), quantity: 5 },
    'Keyboard': { product: new Product('Keyboard', 20, './Images/Products/Keyboard_$20.png'), quantity: 5 },
    'Mice': { product: new Product('Mice', 20, './Images/Products/Mice_$20.png'), quantity: 5 },
    'PC1': { product: new Product('PC1', 350, './Images/Products/PC1_$350.png'), quantity: 5 },
    'PC2': { product: new Product('PC2', 400, './Images/Products/PC2_$400.png'), quantity: 5 },
    'PC3': { product: new Product('PC3', 300, './Images/Products/PC3_$300.png'), quantity: 5 },
    'Tent': { product: new Product('Tent', 100, './Images/Products/Tent_$100.png'), quantity: 5 }
}

function Product(name, price, imageUrl) {
    this.name = name;
    this.price = price;
    this.imageUrl = imageUrl;
}

Product.prototype.computeNetPrice = function(quantity) {
    return this.price * quantity;
}

var inactiveTime = 0;

var max_inactive_time = 30;

function addToCart(productName) {
    inactiveTime = 0;
    if (products[productName].quantity <= 0) {
        alert("Sorry, " + productName + " is out of stock! :(");
        return;
    }

    cart[productName] = (cart[productName] + 1) || 1;
    products[productName].quantity = products[productName].quantity - 1;
}

function removeFromCart(productName) {
    inactiveTime = 0;
    if (!cart.hasOwnProperty(productName) || cart[productName] <= 0) {
        alert("Oops, " + productName + " does not exist in your cart!");
        return;
    }

    if (cart[productName] == 1) {
        delete cart[productName];
    } else {
        cart[productName] = cart[productName] - 1;
    }

    products[productName].quantity = products[productName].quantity + 1;
}

function showCart() {
    if (Object.keys(cart).length === 0) {
        alert("Your shopping cart is empty!");
        return;
    }

    var items = "";
    for (var item in cart) {
        items = items + item + " : " + cart[item] + "\n";
    }
    alert(items);
}

function incrementTimer() {
    inactiveTime++;
    
    if (inactiveTime == max_inactive_time) {
        alert('Hey there! Are you still planning to buy something?');
        inactiveTime = 0;
    }
}

function setInactiveInterval() {
    setInterval(incrementTimer, 1000);
}