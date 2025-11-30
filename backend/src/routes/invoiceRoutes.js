
import express from 'express';
import { db } from '../data/store.js'; 

const router = express.Router();


router.get('/invoices', (req, res) => {
  res.json(db.invoices);
});


router.put('/invoices/:serialNumber', (req, res) => {
  const { serialNumber } = req.params;
  const index = db.invoices.findIndex(inv => inv.serialNumber === serialNumber);

  if (index !== -1) {
    db.invoices[index] = { ...db.invoices[index], ...req.body };
    res.json(db.invoices[index]);
  } else {
    res.status(404).json({ error: 'Invoice not found' });
  }
});

export default router;