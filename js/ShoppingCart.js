
var cart = {};

var products = {
    Box1: 5,
    Box2: 5,
    Clothes1: 5,
    Clothes2: 5,
    Jeans: 5,
    KeyboardCombo: 5,
    Keyboard: 5,
    Mice: 5,
    PC1: 5,
    PC2: 5,
    PC3: 5,
    Tent: 5
}

var inactiveTime = 0;

function addToCart(productName) {
    inactiveTime = 0;
    if (products[productName] <= 0) {
        alert("Sorry, " + productName + " is out of stock! :(");
        return;
    }

    cart[productName] = (cart[productName] + 1) || 1;
    products[productName] = products[productName] - 1;
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

    products[productName] = products[productName] + 1;
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
    
    if (inactiveTime == 30) {
        alert('Hey there! Are you still planning to buy something?');
        inactiveTime = 0;
    }
}





