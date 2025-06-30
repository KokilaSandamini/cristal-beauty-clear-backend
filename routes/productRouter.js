import express from 'express';
import { createProduct, deleteProduct, getProductById, getProducts, searchProduct, updateProduct } from '../controllers/productController.js';

const productRouter =express.Router();

productRouter.post("/",createProduct)
productRouter.get("/",getProducts)
productRouter.get("/search/:id",searchProduct)
productRouter.get("/:id",getProductById)
productRouter.delete("/:productID",deleteProduct)
productRouter.put("/:productID",updateProduct)


export default productRouter;