
export const db = {
  invoices: [],
  products: [],
  customers: [],
  issues: []
};


export const clearDb = () => {
  db.invoices = [];
  db.products = [];
  db.customers = [];
  db.issues = [];
};