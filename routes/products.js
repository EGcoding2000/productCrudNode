const express = require('express');
const router = express.Router();
const Product = require('../models/product.js');



// Products schema

router.get("/", (req, res) => {
    Product.find().sort({ name: 1 }).then(products => {
        //Sorting with case sensative consodiration
        products.sort((a, b) => {
            let aTemp = a.name.toLowerCase();
            let bTemp = b.name.toLowerCase(); 
            return (aTemp > bTemp) ? 1 : ((bTemp > aTemp) ? -1 : 0); 
          });
        res.json(products);
    }, err => {
        console.log(err);
    });
});


router.get("/:id", (req, res) => {
    let productId = (req.params.id);
    Product.findById(productId).then(Product => {
        res.json(Product);
    }, err => {
        console.log(err);
    });
});

router.post("/", (req, res) => {
    if (!checkIfProductValid(req.body)) {
        return res.sendStatus(400);
    }
    
    let product = new Product(req.body);
    product.save().then(newProduct => {
        console.log("Product saved successfully");
        res.json(newProduct);
    }, err => {
        res.send(err);
    });
});

router.put("/",(req,res) => {
    if (!checkIfProductValid(req.body)) {
        return res.sendStatus(400);
    }
    let product = (req.body);
    Product.findByIdAndUpdate(product._id,product,
        // an option that asks mongoose to return the updated version 
        // of the document instead of the pre-updated one.
        {new: true},
        (err, product) => {
        // Handle any possible database errors
            if (err) return res.status(500).send(err);
            return res.send(product);
        }
    )
});

router.delete("/:id", (req, res) => {

    let productId = (req.params.id);
    Product.findByIdAndRemove(productId, (err, productObj) => {  
        //handle any potential errors:
        if (err) return res.status(500).send(err);
        //create a simple object to send back with a message and the id of the document that was removed
        const response = {
            message: "Product successfully deleted",
            objDeleted: productObj 
        };
        return res.status(200).send(response);
    });
});

// Search autocomplete

router.get("/search/:term", (req, res) => {
    var regex = new RegExp(req.params["term"], 'i');
    Product.find({ $or: [{_id: regex}, {name: regex}, {description: regex}, {price: regex}] }, {}).then(products => {
        res.json(products);
        console.log(regex);
    }, err => {
        console.log(err);
    });
});

function checkIfProductValid(obj) {
    if ((!obj) || (!obj.name) || (!obj.description) || (!obj.price || (obj.price < 0)) ) {
        return false;
    }
    return true;
}

module.exports = router;
