



import { getGeminiModel } from '../config/gemini.js';
import fs from 'fs/promises';
import xlsx from 'xlsx';

export class AIExtractionService {
  
  static async convertExcelToString(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Safety Lock
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    const limitedData = jsonData.slice(0, 75); 
    return JSON.stringify(limitedData);
  }

  static async fileToGenerativePart(path, mimeType) {
    const data = await fs.readFile(path);
    return {
      inlineData: {
        data: data.toString("base64"),
        mimeType
      },
    };
  }

  static normalizeData(rawData) {
    const invoiceMap = {};
    const globalProductsMap = new Map();
    const globalCustomersMap = new Map();

    const invoices = rawData.invoices || [];

    invoices.forEach((item, index) => {
        // 1. STRICT SERIAL NUMBER LOGIC (Grouping Key)
        let serial = item.serialNumber;
        
        // Agar AI ne Serial Number nahi diya, toh 'INV_DATE' mat banao (Merge ho jayega).
        // Iski jagah ek Unique ID banao taaki alag-alag rows alag-alag dikhein.
        if (!serial || String(serial).toLowerCase() === 'null' || String(serial).trim() === '') {
            // Unique Fallback per row to prevent false merging
             
            serial = `MISSING-INV-${index}-${Math.floor(Math.random() * 1000)}`;
        } else {
            serial = String(serial).trim();
        }

        // 2. Initialize Invoice (or Get Existing for Merging)
        if (!invoiceMap[serial]) {
            invoiceMap[serial] = {
                id: `inv_${serial.replace(/[^a-zA-Z0-9]/g, '')}`,
                serialNumber: serial.startsWith('MISSING') ? 'Unknown Invoice' : serial,
                customerName: item.customerName || "Walk-in Customer",
                customerPhone: item.customerPhone || "", 
                date: item.date || new Date().toISOString().split('T')[0],
                totalAmount: 0,
                items: [],
                issues: []
            };
            if (serial.startsWith('MISSING')) {
                invoiceMap[serial].issues.push("Warning: Serial Number missing in file, treated as separate invoice.");
            }
        }

        // Update Invoice Level Details if better data found later
        if (item.invoiceGrandTotal && item.invoiceGrandTotal > invoiceMap[serial].totalAmount) {
             invoiceMap[serial].totalAmount = Number(item.invoiceGrandTotal);
        }
        if (item.customerPhone && !invoiceMap[serial].customerPhone) {
             invoiceMap[serial].customerPhone = item.customerPhone;
        }

        // 3. Process Numbers
        const qty = Number(item.qty) || 1;
        const unitPrice = Number(item.unitPrice) || 0;
        const taxAmount = Number(item.taxAmount) || 0;
        
        // Recalculate Line Total if missing
        let lineTotal = Number(item.totalAmount) || 0;
        if (lineTotal === 0 && unitPrice > 0) {
             lineTotal = unitPrice * qty + taxAmount;
        }
        
        let taxRate = Number(item.taxRate) || 0;
        if (taxRate === 0 && unitPrice > 0 && taxAmount > 0) {
            taxRate = (taxAmount / (unitPrice * qty)) * 100;
        }

        // 4. Line Item Object
        const lineItem = {
            productId: `item_${Math.random().toString(36).substr(2, 6)}`,
            name: item.productName || "Item",
            qty: qty,
            unitPrice: unitPrice,
            tax: taxRate,
            total: lineTotal,
            type: item.type ? item.type.toLowerCase() : 'product'
        };

        invoiceMap[serial].items.push(lineItem);

        // 5. Products Tab Logic
        if (lineItem.type === 'product') {
            const prodName = String(lineItem.name).trim();
            const isService = prodName.toLowerCase().includes('charge') || 
                              prodName.toLowerCase().includes('shipping') || 
                              prodName.toLowerCase().includes('tax');
            
            if (!isService) {
                if (!globalProductsMap.has(prodName)) {
                    globalProductsMap.set(prodName, {
                        id: lineItem.productId,
                        name: prodName,
                        quantity: qty,
                        unitPrice: unitPrice,
                        tax: taxRate,
                        priceWithTax: unitPrice * (1 + taxRate / 100)
                    });
                } else {
                    const existing = globalProductsMap.get(prodName);
                    existing.quantity += qty;
                }
            }
        }
    });

    const finalInvoices = Object.values(invoiceMap);
    finalInvoices.forEach(inv => {
        // If Grand Total missing 0, calculate from items
        if (!inv.totalAmount || inv.totalAmount === 0) {
            inv.totalAmount = inv.items.reduce((sum, i) => sum + i.total, 0);
        }
        
        // Mismatch Validation
        const sumItems = inv.items.reduce((sum, i) => sum + i.total, 0);
        if (inv.totalAmount > 0 && Math.abs(inv.totalAmount - sumItems) > 5.0) {
             if (inv.serialNumber !== 'Unknown Invoice') {
                inv.issues.push(`Mismatch: Calculated items total (${sumItems.toFixed(2)}) doesn't match Invoice Total (${inv.totalAmount})`);
             }
        }

        const custName = inv.customerName.trim();
        if (custName && custName.toLowerCase() !== "unknown customer") {
            if (!globalCustomersMap.has(custName)) {
                globalCustomersMap.set(custName, {
                    id: `cust_${Math.random().toString(36).substr(2, 5)}`,
                    name: custName,
                    phoneNumber: inv.customerPhone || "", 
                    totalPurchaseAmount: 0
                });
            } else {
                const existing = globalCustomersMap.get(custName);
                if (!existing.phoneNumber && inv.customerPhone) {
                    existing.phoneNumber = inv.customerPhone;
                }
            }
            const customer = globalCustomersMap.get(custName);
            customer.totalPurchaseAmount += inv.totalAmount;
        }
    });

    return {
        invoices: finalInvoices,
        products: Array.from(globalProductsMap.values()),
        customers: Array.from(globalCustomersMap.values()),
        issues: rawData.issues || []
    };
  }

  static async extractData(filePath, mimeType) {
    const model = getGeminiModel();
    
    // PROMPT: Focus on TABLE + CHARGES + MAPPING
    const prompt = `
      You are an expert Data Extractor.
      
      ### OBJECTIVE
      Extract all line items, including products from the main table AND additional charges from the footer.

      ### MAPPING RULES (CRITICAL):
      - Map "Serial Number", "Invoice No", "Inv No" -> 'serialNumber'
      - Map "Party Name", "Customer Name", "Billed To" -> 'customerName'
      - Map "Phone", "Mobile", "Contact" -> 'customerPhone'
      - Map "Total Amount", "Net Amount", "Grand Total" -> 'invoiceGrandTotal'

      ### EXTRACTION RULES
      1. **Main Table**: Extract products normally.
      2. **Footer/Hidden Charges**: Look below the table for "Making Charges", "Shipping", "Packing", "Tax".
         - Treat these as line items.
         - **Qty**: Default to 1.
         - **Unit Price**: Extract the amount shown next to the charge label.
         - **Type**: Mark these as 'service'.
      3. **Missing Data**: If Excel summary, use "General Invoice Item". NO invented names.
      4. **Categorization**: 'product' (goods) vs 'service' (fees).

      OUTPUT JSON:
      {
        "invoices": [
          {
            "serialNumber": "String",
            "customerName": "String",
            "customerPhone": "String",
            "date": "YYYY-MM-DD",
            "invoiceGrandTotal": Number,
            "productName": "String",
            "type": "String ('product' or 'service')",
            "qty": Number,
            "unitPrice": Number,
            "taxAmount": Number,
            "taxRate": Number,
            "totalAmount": Number (unitPrice * qty + tax)
          }
        ],
        "customers": [],
        "issues": []
      }
      
      Output ONLY JSON.
    `;

    try {
      let result;
      if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
        const excelData = await this.convertExcelToString(filePath);
        const finalPrompt = `${prompt}\n\nDATA SOURCE:\n${excelData}`;
        result = await model.generateContent(finalPrompt);
      } else {
        const filePart = await this.fileToGenerativePart(filePath, mimeType);
        result = await model.generateContent([prompt, filePart]);
      }

      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      if (!text.endsWith('}')) text += ']}';
      
      const rawData = JSON.parse(text);
      return this.normalizeData(rawData);

    } catch (error) {
      console.error("AI Error:", error.message);
      return {
        invoices: [], products: [], customers: [],
        issues: ["Processing Error: " + error.message]
      };
    }
  }
}