import Product from "../models/product.js";

export function createProduct(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "You need to login first"
        })
        return;
    }
    if (req.user.role != "admin") {
        res.status(403).json({
            message: "You are not authorized to create a product"
        })
        return;
    }
    const product = new Product(req.body);

    product.save().then(
        () => {
            res.json({
                message: "Product saved successful"
            })
        }
    ).catch(
        (err) => {
            res.status(500).json({
                message: "Product not saved"
            })
        }
    )
}

export function getProducts(req, res) {
    Product.find().then(
        (products) => {
            res.json(products)
        }
    ).catch(
        (err) => {
            res.status(500).json({
                message: "Product not found"
            })
        }
    )
}
export async function getProductById(req,res){
    const productID = req.params.id
    const product = await Product.findOne({productID : productID})
    if(product == null){
        res.status(404).json({
            message : "Product not found"
        })
        return
    }
    res.json({
        product : product
    })
}

export function deleteProduct(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "You need to login first"
        })
        return;
    }
    if (req.user.role != "admin") {
        res.status(403).json({
            message: "You are not authorized to delete a product"
        })
        return;

    }

    Product.findOneAndDelete({
        productID: req.params.productID
    }).then(
        () => {
            res.json({
                message: "Product deleted successfully"
            })
        }
    ).catch(
        (err) => {
            res.status(500).json({
                message: "Product not deleted"
            })
        }
    )
}

export function updateProduct(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "You need to login first"
        })
        return;
    }
    if (req.user.role != "admin") {
        res.status(403).json({
            message: "You are not authorized to update a product"

        })
        return;
    }

    Product.findOneAndUpdate({
        productID: req.params.productID
    }, req.body).then(
        () => {
            res.json({
                message: "Product updated successfully"
            })
        }
    ).catch(
        (err) => {
            res.status(500).json({
                message: "Product not Updated"
            })
        }
    )

}
export async function searchProduct(req, res){
    const search = req.params.id;
    try {
        const products = await Product.find({
            $or: [
                { name: { $regex: search,$options: "i" }},
                { altNames: { $elemMatch: { $regex: search, $options: "i" }}},
            ],
        });
        res.json({
            products: products,
        });
    } catch (err) {
        res.status(500).json({
            message: "Error in searching product",
        });
        return;
    }
}