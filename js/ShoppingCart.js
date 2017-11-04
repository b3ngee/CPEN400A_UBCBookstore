
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

var inactiveTime = 0;
var max_inactive_time = 300;
var max_ajax_resend_count = 10;
var ajax_timeout = 1000;

window.addEventListener("load", function() {
    setInactiveInterval();

    // Register hide modal event listeners
    document.getElementsByClassName("closeModalButton")[0].addEventListener("click", hideModal);
    document.addEventListener('keyup', function(e) {
        if (e.keyCode == 27) { // ESC Key
            hideModal();
        }
    });

    ajaxGet("https://cpen400a-bookstore.herokuapp.com/products",
	    function(response){
            // TODO: Initialize products variable
            console.log(response);
        },
        function(error){
            // TODO: Handle error
            console.log(error);
        }
    );
});

function Product(name, price, imageUrl) {
    this.name = name;
    this.price = price;
    this.imageUrl = imageUrl;
}

Product.prototype.computeNetPrice = function(quantity) {
    return this.price * quantity;
}

function addToCart(productName) {
    updateInactiveTime(0);

    if (products[productName].quantity <= 0) {
        alert("Sorry, " + productName + " is out of stock! :(");
        return;
    }

    cart[productName] = (cart[productName] + 1) || 1;
    products[productName].quantity = products[productName].quantity - 1;

    if (products[productName].quantity == 0) {
        hideAddButton(productName);
        showOutOfStockMessage(productName);
    }

    if (cart[productName] == 1) {
        showRemoveButton(productName);
    }

    updateSubtotal();
}

function hideAddButton(productName) {
    document.getElementById(productName).getElementsByClassName("addButton")[0].style.visibility = "hidden";
}

function showRemoveButton(productName) {
    document.getElementById(productName).getElementsByClassName("removeButton")[0].style.visibility = "visible";
}

function showOutOfStockMessage(productName) {
    var product = document.getElementById(productName);
    var productInfo = product.getElementsByClassName("productInfo")[0];
    var productPrice = product.getElementsByClassName("productPrice")[0];

    var outOfStockMessage = document.createElement("span");
    outOfStockMessage.classList.add("outOfStockMessage");
    outOfStockMessage.appendChild(document.createTextNode("OUT OF STOCK"));

    productInfo.insertBefore(outOfStockMessage, productPrice);
}

function removeFromCart(productName) {
    updateInactiveTime(0);

    if (!cart.hasOwnProperty(productName) || cart[productName] <= 0) {
        alert("Oops, " + productName + " does not exist in your cart!");
        return;
    }

    if (cart[productName] == 1) {
        delete cart[productName];
        hideRemoveButton(productName);
    } else {
        cart[productName] = cart[productName] - 1;
    }

    products[productName].quantity = products[productName].quantity + 1;

    if (products[productName].quantity == 1) {
        showAddButton(productName);
        hideOutOfStockMessage(productName);
    }

    updateSubtotal();
}

function showAddButton(productName) {
    document.getElementById(productName).getElementsByClassName("addButton")[0].style.visibility = "visible";
}

function hideRemoveButton(productName) {
    document.getElementById(productName).getElementsByClassName("removeButton")[0].style.visibility = "hidden";
}

function hideOutOfStockMessage(productName) {
    document.getElementById(productName).getElementsByClassName("outOfStockMessage")[0].remove();
}

function updateSubtotal() {
    var cartSubtotal = 0;

    for (var product in cart) {
        var quantity = cart[product];
        var price = products[product].product.computeNetPrice(quantity);
        cartSubtotal+=price;
    }

    document.getElementById("showCartButton").textContent = "Cart ($" + cartSubtotal + ")";
}

function showCart() {
    updateInactiveTime(0);
    clearCartItemsFromDom();
    createCartItems();
    showModal();
}

function createCartItems() {
    if (Object.keys(cart).length === 0) {
        addEmptyCartMessageToDom();
        return;
    }

    for (var item in cart) {
        addCartItemToDom(item, cart[item]);
    }
}

function addEmptyCartMessageToDom() {
    var cartItem = document.createElement("div");
    cartItem.classList.add("item");
    cartItem.appendChild(document.createTextNode("Your shopping cart is empty!"));
    document.getElementById("cart-items").appendChild(cartItem);
}

function addCartItemToDom(productName, quantity) {
    var cartItem = document.createElement("div");
    cartItem.classList.add("item");
    cartItem.id = "cart-" + productName;

    var productNameElem = document.createElement("span");
    productNameElem.classList.add("productName");
    productNameElem.appendChild(document.createTextNode(productName))
    cartItem.appendChild(productNameElem);

    var quantityElem = document.createElement("span");
    quantityElem.classList.add("quantity");
    quantityElem.appendChild(document.createTextNode(quantity));
    cartItem.appendChild(quantityElem);

    var buttonContainer = document.createElement("span");
    buttonContainer.classList.add("cartButtons");

    var addButton = document.createElement("button");
    if (products[productName].quantity <= 0) {
        addButton.style.visibility = "hidden";
    }
    addButton.classList.add("addButton");
    addButton.addEventListener("click", addToCartFromCart.bind(null, productName));
    addButton.appendChild(document.createTextNode("+"));
    buttonContainer.appendChild(addButton);

    var removeButton = document.createElement("button");
    removeButton.classList.add("removeButton");
    removeButton.addEventListener("click", removeFromCartFromCart.bind(null, productName));
    removeButton.appendChild(document.createTextNode("-"));
    buttonContainer.appendChild(removeButton);

    cartItem.appendChild(buttonContainer);

    document.getElementById("cart-items").appendChild(cartItem);
}

function addToCartFromCart(productName) {
    addToCart(productName);

    var cartItem = document.getElementById("cart-" + productName);
    cartItem.getElementsByClassName("quantity")[0].textContent = cart[productName] || 0;

    if (products[productName].quantity <= 0) {
        document.getElementById("cart-" + productName).getElementsByClassName("addButton")[0].style.visibility = "hidden";
    }
}

function removeFromCartFromCart(productName) {
    removeFromCart(productName);

    var cartItem = document.getElementById("cart-" + productName);
    cartItem.getElementsByClassName("quantity")[0].textContent = cart[productName] || 0;

    if (products[productName].quantity > 0) {
        cartItem.getElementsByClassName("addButton")[0].style.visibility = "visible";
    }

    if (!cart[productName]) {
        cartItem.remove();
    }
}

function clearCartItemsFromDom() {
    document.getElementById("cart-items").innerHTML = "";
}

function showModal() {
    document.getElementById("modal").style.display = "block";
}

function hideModal() {
    document.getElementById("modal").style.display = "none";
}

function incrementTimer() {
    updateInactiveTime();

    if (inactiveTime == max_inactive_time) {
        alert('Hey there! Are you still planning to buy something?');
        updateInactiveTime(0);
    }
}

function setInactiveInterval() {
    setInterval(incrementTimer, 1000);
}

function updateInactiveTime(time) {
    if (time == undefined) {
        inactiveTime++;
    } else {
        inactiveTime = time;
    }
    document.getElementById("inactiveTimer").textContent = inactiveTime;
}

function ajaxGet(url, successCallback, errorCallback) {
    var resendCount = 0;

    var sendAjaxGet = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.timeout = ajax_timeout;

        function resendAjax() {
            if (resendCount++ < max_ajax_resend_count) {
                sendAjaxGet(url, successCallback, errorCallback);
            }
        }

        xhr.onload = function() {
            if (xhr.status == 200) {
                successCallback(JSON.parse(xhr.responseText));
            } else if (xhr.status == 500) {
                resendAjax();
            } else {
                errorCallback(xhr.statusText);
            }
        };
        xhr.onerror = resendAjax;
        xhr.ontimeout = resendAjax;

        xhr.send();
    }

    sendAjaxGet();
}
