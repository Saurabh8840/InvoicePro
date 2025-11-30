



import React, { useState } from 'react';
import { Package, Edit2, Save, X } from 'lucide-react';

const ProductsTab = ({ products, onUpdate }) => {
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});

  const startEdit = (product) => {
    setEditing(product.id);
    setEditData({ ...product });
  };

  const saveEdit = () => {
    onUpdate(editing, editData);
    setEditing(null);
  };

  // Added Quantity to calculation
  // Formula: Qty * Price * (1 + Tax%) * (1 - Discount%)
  const calculateTotalValue = (q, p, t, d) => {
      const qty = Number(q) || 0;
      const price = Number(p) || 0;
      const tax = Number(t) || 0;
      const discount = Number(d) || 0;
      
      const unitPriceWithTax = price * (1 + tax / 100);
      const total = qty * unitPriceWithTax * (1 - discount / 100);
      return total;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {products.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No products found</div>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-4">Product Name</th>
              <th className="text-right p-4">Qty</th>
              <th className="text-right p-4">Unit Price</th>
              <th className="text-right p-4">Tax %</th>
              
              <th className="text-right p-4">Total Value</th> 
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                {editing === product.id ? (
                  <>
                    <td className="p-4"><input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="border rounded p-1 w-full" /></td>
                    <td className="p-4"><input type="number" value={editData.quantity} onChange={e => setEditData({...editData, quantity: e.target.value})} className="border rounded p-1 w-16 text-right" /></td>
                    <td className="p-4"><input type="number" value={editData.unitPrice} onChange={e => setEditData({...editData, unitPrice: e.target.value})} className="border rounded p-1 w-24 text-right" /></td>
                    <td className="p-4"><input type="number" value={editData.tax} onChange={e => setEditData({...editData, tax: e.target.value})} className="border rounded p-1 w-16 text-right" /></td>
                    
                    
                    <td className="p-4 text-right font-bold text-blue-600">
                        ₹{calculateTotalValue(editData.quantity, editData.unitPrice, editData.tax, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={saveEdit}><Save className="h-5 w-5 text-green-600" /></button>
                      <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-red-600" /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="text-right p-4">{product.quantity}</td>
                    <td className="text-right p-4">₹{Number(product.unitPrice).toFixed(2)}</td>
                    <td className="text-right p-4">{Number(product.tax).toFixed(2)}%</td>
                    
                    
                    <td className="text-right p-4 font-bold text-blue-600">
                        ₹{calculateTotalValue(product.quantity, product.unitPrice, product.tax, product.discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    
                    <td className="p-4 text-center">
                      <button onClick={() => startEdit(product)}><Edit2 className="h-5 w-5 text-blue-600" /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default ProductsTab;