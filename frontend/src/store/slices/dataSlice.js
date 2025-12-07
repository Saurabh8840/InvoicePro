import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  invoices: [],
  products: [],
  customers: [],
  issues: [],
  loading: false,
  uploadProgress: 0,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setParsedData: (state, action) => {
      const { invoices, products, customers, issues } = action.payload;
      state.invoices = [...state.invoices, ...invoices];
      state.products = [...state.products, ...products];
      state.customers = [...state.customers, ...customers];
      state.issues = [...state.issues, ...issues];
    },
    
  
    updateProduct: (state, action) => {
      const { id, updates } = action.payload;
      

      const productIndex = state.products.findIndex(p => p.id === id);
      if (productIndex !== -1) {
        const p = state.products[productIndex];
        const oldName=p.name;
        
        //write here 
        const newName=updates.name!==undefined?updates.name:p.name;

        
        const newQty = updates.quantity !== undefined ? Number(updates.quantity) : p.quantity;
        const newUnitPrice = updates.unitPrice !== undefined ? Number(updates.unitPrice) : p.unitPrice;
        const newTax = updates.tax !== undefined ? Number(updates.tax) : p.tax;
        const newDiscount = updates.discount !== undefined ? Number(updates.discount) : (p.discount || 0);
        
        const priceWithTax = newUnitPrice * (1 + newTax / 100) * (1 - newDiscount / 100);

        
        state.products[productIndex] = { 
          ...p, 
          ...updates,
          name:newName, 
          quantity: newQty, 
          unitPrice: newUnitPrice,
          tax: newTax,
          discount: newDiscount,
          priceWithTax 
        };

       
        state.invoices.forEach(inv => {
          let invoiceUpdated = false;
          inv.items.forEach(item => {
            if (item.name === p.name || item.productId === id) {
              item.qty = newQty; 
              item.name=newName;
              item.unitPrice = newUnitPrice;
              item.tax = newTax;
              item.total = item.qty * priceWithTax; 
              invoiceUpdated = true;
            }
          });

          if (invoiceUpdated) {
            inv.totalAmount = inv.items.reduce((sum, item) => sum + item.total, 0);
          }
        });

        
        state.customers.forEach(cust => {
            // Find all invoices for this customer
            const customerInvoices = state.invoices.filter(inv => 
                inv.customerName === cust.name || inv.customerId === cust.id
            );
            
            // Sum unka naya total
            if (customerInvoices.length > 0) {
                const newTotalPurchase = customerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
                cust.totalPurchaseAmount = newTotalPurchase;
            }
        });
      }
    },

    updateCustomer: (state, action) => {
      const { id, updates } = action.payload;
      const custIndex = state.customers.findIndex(c => c.id === id);
      
      if (custIndex !== -1) {
        const oldName = state.customers[custIndex].name;
        state.customers[custIndex] = { ...state.customers[custIndex], ...updates };

        if (updates.name) {
          state.invoices.forEach(inv => {
            if (inv.customerName === oldName || inv.customerId === id) {
              inv.customerName = updates.name;
            }
          });
        }
      }
    },

    updateInvoice: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.invoices.findIndex(inv => inv.id === id);
      if (index !== -1) {
        state.invoices[index] = { ...state.invoices[index], ...updates };
        
        // Agar Invoice ka amount direct update kiya, toh Customer ko bhi sync karo
        if (updates.totalAmount !== undefined) {
             const custName = state.invoices[index].customerName;
             const customer = state.customers.find(c => c.name === custName);
             if (customer) {
                 const customerInvoices = state.invoices.filter(inv => inv.customerName === custName);
                 customer.totalPurchaseAmount = customerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
             }
        }
      }
    }
  },
});

export const { setParsedData, setLoading, setUploadProgress, updateProduct, updateCustomer, updateInvoice } = dataSlice.actions;
export default dataSlice.reducer;