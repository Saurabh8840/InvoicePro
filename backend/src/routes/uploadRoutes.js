import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { AIExtractionService } from '../services/AIExtractionService.js';
import fs from 'fs/promises';
import { db } from '../data/store.js'; 

const router = express.Router();

router.post('/upload', upload.array('files', 10), async (req, res) => {
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  
  
  const combinedResults = {
    invoices: [],
    products: [],
    customers: [],
    issues: []
  };

  try {
    for (const file of req.files) {
      console.log(`Processing: ${file.originalname}`);

      const data = await AIExtractionService.extractData(file.path, file.mimetype);

      if (data.invoices) combinedResults.invoices.push(...data.invoices);
      if (data.products) combinedResults.products.push(...data.products);
      if (data.customers) combinedResults.customers.push(...data.customers);
      
      if (data.issues && data.issues.length > 0) {
        const fileSpecificIssues = data.issues.map(issue => `File '${file.originalname}': ${issue}`);
        combinedResults.issues.push(...fileSpecificIssues);
      }

      await fs.unlink(file.path).catch(err => console.error("File delete failed:", err));
    }

    
    combinedResults.invoices.forEach(newInv => {
        const existingIndex = db.invoices.findIndex(inv => inv.id === newInv.id || inv.serialNumber === newInv.serialNumber);
        if (existingIndex !== -1) {
            db.invoices[existingIndex] = newInv; 
        } else {
            db.invoices.push(newInv); 
        }
    });

    
    combinedResults.products.forEach(newProd => {
        const existingIndex = db.products.findIndex(p => p.name === newProd.name);
        if (existingIndex !== -1) {
            
            db.products[existingIndex] = newProd; 
        } else {
            db.products.push(newProd);
        }
    });

    
    combinedResults.customers.forEach(newCust => {
        const existingIndex = db.customers.findIndex(c => c.name === newCust.name);
        if (existingIndex !== -1) {
            db.customers[existingIndex] = newCust;
        } else {
            db.customers.push(newCust);
        }
    });

    
    db.issues.push(...combinedResults.issues);

    
    res.json(combinedResults);

  } catch (error) {
    console.error("Upload Route Error:", error);
    res.status(500).json({ 
      error: 'Processing Failed', 
      issues: [error.message || "Internal Server Error"] 
    });
  }
});

export default router;