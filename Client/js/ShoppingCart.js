
var cart = {};

var products = {};

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

    document.getElementById("checkoutButton").addEventListener("click", getUpdatedProducts);

    initializeProducts();
});

function Product(name, price, quantity, imageUrl) {
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.imageUrl = imageUrl;
}

Product.prototype.computeNetPrice = function(quantity) {
    return this.price * quantity;
}

function initializeProducts() {
    ajaxGet("http://localhost:5000/products", ajaxOnSuccess, ajaxOnFailure);
}

function ajaxOnSuccess(response) {
    response = JSON.parse(response);
    for (var key in response) {
        var value = response[key];
        products[key] = new Product(value.name, value.price, value.quantity, value.imageUrl);
    }
    initializeDomProductList();
}

function ajaxOnFailure(error) {
    alert("Oops, something went wrong! Please refresh the page.");
}

function initializeDomProductList() {
    var fragment = document.createDocumentFragment();

    for (var p in products) {
        var product = products[p];
        fragment.appendChild(createProduct(product));
    }

    document.getElementById("productList").appendChild(fragment);
}

function createProduct(product) {
    var productDiv = document.createElement("div");
    productDiv.id = product.name;
    productDiv.classList.add("product");

    var productInfo = createProductInfo(product);
    productDiv.appendChild(productInfo);

    var productNameSpan = document.createElement("span");
    productNameSpan.classList.add("productName");
    productNameSpan.appendChild(document.createTextNode(product.name));
    productDiv.appendChild(productNameSpan);

    return productDiv;
}

function createProductInfo(product) {
    var productInfoDiv = document.createElement("div");
    productInfoDiv.classList.add("productInfo");

    var productImg = document.createElement("img");
    productImg.classList.add("productImage");
    productImg.src = product.imageUrl;
    productInfoDiv.appendChild(productImg);

    var cartOverlay = document.createElement("img");
    cartOverlay.classList.add("cartOverlay");
    cartOverlay.src = "./Images/cart.png";
    productInfoDiv.appendChild(cartOverlay);

    var cartButtons = createCartButtons(product);
    productInfoDiv.appendChild(cartButtons);

    var outOfStockMessage = document.createElement("span");
    outOfStockMessage.classList.add("outOfStockMessage");
    if (product.quantity != 0) {
        outOfStockMessage.style.visibility = "hidden";
    }
    outOfStockMessage.appendChild(document.createTextNode("OUT OF STOCK"));
    productInfoDiv.appendChild(outOfStockMessage);

    var productPrice = document.createElement("span");
    productPrice.classList.add("productPrice");
    productPrice.appendChild(document.createTextNode("$" + product.price));
    productInfoDiv.appendChild(productPrice);

    return productInfoDiv;
}

function createCartButtons(product) {
    var cartButtons = document.createElement("span");
    cartButtons.classList.add("cartButtons");

    var addButton = document.createElement("button");
    addButton.classList.add("addButton");
    addButton.addEventListener("click", function() {
        addToCart(product.name);
    });
    addButton.appendChild(document.createTextNode("Add"));
    if (product.quantity == 0) {
        addButton.style.visibility = "hidden";
    }
    cartButtons.appendChild(addButton);

    var removeButton = document.createElement("button");
    removeButton.classList.add("removeButton");
    removeButton.addEventListener("click", function() {
        removeFromCart(product.name);
    });
    removeButton.appendChild(document.createTextNode("Remove"));
    cartButtons.appendChild(removeButton);

    return cartButtons;
}

function updateItemInfo(item) {
    updateItemQuantity(item, products[item].quantity, cart[item]);
    updateItemPrice(item, products[item].price);
}

function updateItemQuantity(item, productQuantity, cartQuantity) {
    if (productQuantity == 0) {
        hideRemoveButton(item);
        hideAddButton(item);
        showOutOfStockMessage(item);
    } else {
        showAddButton(item);
        hideOutOfStockMessage(item);
    }

    if (cartQuantity > 0) {
        showRemoveButton(item);
    } else {
        hideRemoveButton(item);
    }
}

function updateItemPrice(item, newPrice) {
    document.getElementById(item).getElementsByClassName("productPrice")[0].textContent = "$" + newPrice;
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
    document.getElementById(productName).getElementsByClassName("outOfStockMessage")[0].style.visibility = "visible";
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

    if (Object.keys(cart).length == 0) {
        addEmptyCartMessageToDom();
    }
}

function showAddButton(productName) {
    document.getElementById(productName).getElementsByClassName("addButton")[0].style.visibility = "visible";
}

function hideRemoveButton(productName) {
    document.getElementById(productName).getElementsByClassName("removeButton")[0].style.visibility = "hidden";
}

function hideOutOfStockMessage(productName) {
    document.getElementById(productName).getElementsByClassName("outOfStockMessage")[0].style.visibility = "hidden";
}

function updateSubtotal() {
    var cartSubtotal = 0;

    for (var product in cart) {
        var quantity = cart[product];
        var price = products[product].computeNetPrice(quantity);
        cartSubtotal+=price;
    }

    document.getElementById("showCartButton").textContent = "Cart ($" + cartSubtotal + ")";

    return cartSubtotal;
}

function showCart() {
    updateInactiveTime(0);
    document.getElementById("cart-items").innerHTML = "";
    createCartItems();
    document.getElementById("modal").style.display = "block";
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

function getUpdatedProducts() {
    if (Object.keys(cart).length == 0) {
        alert("Nothing to checkout!");
        return;
    }

    ajaxGet("http://localhost:5000/products", compareAndUpdateProducts, onGetProductsFailure);

    function onGetProductsFailure() {
        alert("Oops, something went wrong! Please try checking out again.");
    }

    function compareAndUpdateProducts(updatedProducts) {
        updatedProducts = JSON.parse(updatedProducts);

        function removeItemFromCart(item) {
            document.getElementById("cart-" + item).remove();
        }

        var priceChanged = {};
        var quantityChanged = {};

        for (var item in products) {
            var oldPrice = products[item].price;
            var newPrice = updatedProducts[item].price;

            var productQuantity = products[item].quantity;
            var cartQuantity = cart[item];
            var oldQuantity = productQuantity + cartQuantity;
            var newQuantity = updatedProducts[item].quantity;

            if (item in cart) {
                if (oldPrice !== newPrice) {
                    products[item].price = newPrice;
                    priceChanged[item] = { old: oldPrice, new: newPrice };
                }

                if (newQuantity == 0) {
                    products[item].quantity = 0;
                    delete cart[item];
                    quantityChanged[item] = { old: oldQuantity, new: newQuantity };
                    removeItemFromCart(item);
                } else if (oldQuantity !== newQuantity) {
                    if (cartQuantity == newQuantity) {
                        products[item].quantity = 0;
                        hideCartAddButton(item);
                    } else if (cartQuantity > newQuantity) {
                        cart[item] = newQuantity;
                        products[item].quantity = 0;
                        hideCartAddButton(item);
                        quantityChanged[item] = { old: cartQuantity, new: newQuantity };
                        document.getElementById("cart-" + item).getElementsByClassName("quantity")[0].firstChild.nodeValue = newQuantity;
                    } else if (cartQuantity < newQuantity) {
                        products[item].quantity = newQuantity - cart[item];
                        showCartAddButton(item);
                    }
                }
            } else {
                products[item].price = newPrice;
                products[item].quantity = newQuantity;
            }

            updateItemInfo(item);
        }

        if (Object.keys(cart).length == 0) {
            addEmptyCartMessageToDom();
        }

        var subtotal = updateSubtotal();

        ajaxPost("http://localhost:5000/checkout", subtotal);
    }
}

function addEmptyCartMessageToDom() {
    if (document.getElementById("emptyCartMessage")) {
        return;
    }

    var cartItem = document.createElement("div");
    cartItem.id = "emptyCartMessage";
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

function hideCartAddButton(item) {
    var cartItem = document.getElementById("cart-" + item);
    if (cartItem != null) {
        var addButtons = cartItem.getElementsByClassName("addButton");
        if (addButtons.length > 0) {
            addButtons[0].style.visibility = "hidden";
        }
    }
}

function showCartAddButton(item) {
    var cartItem = document.getElementById("cart-" + item);
    if (cartItem != null) {
        var addButtons = cartItem.getElementsByClassName("addButton");
        if (addButtons.length > 0) {
            addButtons[0].style.visibility = "visible";
        }
    }
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
                successCallback(xhr.responseText);
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

function ajaxPost(url, total) {
    var sendAjaxPost = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.timeout = ajax_timeout;

        function alertError() {
            alert("Oops, something went wrong! Please checkout again.")
        }

        xhr.onload = function() {
            if (xhr.status == 200) {
                alert("Thank you for your purchase.");
                hideModal();
            } else if (xhr.status == 500) {
                alert("Oops, something went wrong! Please refresh the page.");
            } else {
                alertErrror();
            }
        }

        xhr.onerror = alertError;
        xhr.ontimeout = alertError;

        var order = { cart: cart, priceTotal: total };
        xhr.send(JSON.stringify(order));
    }

    sendAjaxPost();
}
