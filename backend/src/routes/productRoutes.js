
import express from 'express';
import { db } from '../data/store.js';

const router = express.Router();

router.get('/products', (req, res) => {
  res.json(db.products);
});

router.put('/products/:name', (req, res) => {
  
  const { name } = req.params; 
  const index = db.products.findIndex(p => p.name === name);
  
  if (index !== -1) {
    const oldName = db.products[index].name;
    const updatedProduct = { ...db.products[index], ...req.body };
    
    
    db.products[index] = updatedProduct;

    
    
    if (req.body.unitPrice || req.body.tax) {
       db.invoices.forEach(inv => {
          if (inv.productName === oldName) {
             const price = parseFloat(updatedProduct.unitPrice) || 0;
             const tax = parseFloat(updatedProduct.tax) || 0;
             const totalItemPrice = price + tax;
             inv.totalAmount = totalItemPrice * inv.qty;
          }
       });
    }

    if (req.body.name && req.body.name !== oldName) {
       db.invoices.forEach(inv => {
          if (inv.productName === oldName) inv.productName = req.body.name;
       });
    }
    

    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

export default router;