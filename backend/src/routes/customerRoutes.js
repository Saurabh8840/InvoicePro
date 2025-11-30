
import express from 'express';
import { db } from '../data/store.js';

const router = express.Router();

router.get('/customers', (req, res) => {
  res.json(db.customers);
});

router.put('/customers/:name', (req, res) => {
  const { name } = req.params;
  const index = db.customers.findIndex(c => c.name === name);
  
  if (index !== -1) {
    const oldName = db.customers[index].name;
    
 
    db.customers[index] = { ...db.customers[index], ...req.body };

    
    if (req.body.name && req.body.name !== oldName) {
        db.invoices.forEach(inv => {
            if (inv.customerName === oldName) inv.customerName = req.body.name;
        });
    }
   

    res.json(db.customers[index]);
  } else {
    res.status(404).json({ error: 'Customer not found' });
  }
});

export default router;