conn = new Mongo();

db = conn.getDB("bookstore");
db.createCollection("product");
db.createCollection("order");

db.product.insertMany(
    [{
        "name":"KeyboardCombo",
        "price":30,
        "quantity":2,
        "imageUrl":"http://localhost:5000/images/KeyboardCombo.png"
    },
    {
        "name":"Mice",
        "price":6,
        "quantity":3,
        "imageUrl":"http://localhost:5000/images/Mice.png"
    },
    {
        "name":"PC1",
        "price":342,
        "quantity":2,
        "imageUrl":"http://localhost:5000/images/PC1.png"
    },
    {
        "name":"PC2",
        "price":395,
        "quantity":8,
        "imageUrl":"http://localhost:5000/images/PC2.png"
    },
    {
        "name":"PC3",
        "price":352,
        "quantity":5,
        "imageUrl":"http://localhost:5000/images/PC3.png"
    },
    {
        "name":"Tent",
        "price":30,
        "quantity":8,
        "imageUrl":"http://localhost:5000/images/Tent.png"
    },
    {
        "name":"Box1",
        "price":5,
        "quantity":1,
        "imageUrl":"http://localhost:5000/images/Box1.png"
    },
    {
        "name":"Box2",
        "price":5,
        "quantity":3,
        "imageUrl":"http://localhost:5000/images/Box2.png"
    },
    {
        "name":"Clothes1",
        "price":27,
        "quantity":3,
        "imageUrl":"http://localhost:5000/images/Clothes1.png"
    },
    {
        "name":"Clothes2",
        "price":27,
        "quantity":2,
        "imageUrl":"http://localhost:5000/images/Clothes2.png"
    },
    {
        "name":"Jeans",
        "price":30,
        "quantity":5,
        "imageUrl":"http://localhost:5000/images/Jeans.png"
    },
    {
        "name":"Keyboard",
        "price":24,
        "quantity":8,
        "imageUrl":"http://localhost:5000/images/Keyboard.png"
    }]
);