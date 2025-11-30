import React, { useState } from 'react';
import { Users, Edit2, Save, X } from 'lucide-react';

const CustomersTab = ({ customers, onUpdate }) => {
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});

  const startEdit = (customer) => {
    setEditing(customer.id);
    setEditData({ ...customer });
  };

  const saveEdit = () => {
    onUpdate(editing, editData);
    setEditing(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {customers.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No customers found</div>
      ) : (
        <table className="w-full">
          <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b-2">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700">Customer Name</th>
              <th className="text-left p-4 font-semibold text-gray-700">Phone Number</th>
              <th className="text-right p-4 font-semibold text-gray-700">Total Purchase Amount</th>
              <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, idx) => (
              <tr key={idx} className={`border-b hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                {editing === customer.id ? (
                  <>
                    <td className="p-4"><input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="border rounded p-1 w-full" /></td>
                    <td className="p-4"><input value={editData.phoneNumber} onChange={e => setEditData({...editData, phoneNumber: e.target.value})} className="border rounded p-1 w-full" /></td>
                    <td className="p-4 text-right font-bold text-blue-600">
                        
                        ₹{Number(customer.totalPurchaseAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={saveEdit}><Save className="h-5 w-5 text-green-600" /></button>
                      <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-red-600" /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 font-medium text-gray-800">{customer.name}</td>
                    <td className="p-4 text-gray-600">{customer.phoneNumber || 'N/A'}</td>
                    
                    <td className="text-right p-4 font-bold text-blue-600">
                        ₹{Number(customer.totalPurchaseAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => startEdit(customer)}><Edit2 className="h-5 w-5 text-blue-600" /></button>
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

export default CustomersTab;