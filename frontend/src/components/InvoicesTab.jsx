import React, { useState } from 'react';
import { FileText, AlertCircle, Edit2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';

const InvoicesTab = ({ invoices, onUpdateInvoice }) => {
  const [expanded, setExpanded] = useState({});
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const startEdit = (invoice) => {
    setEditing(invoice.id);
    setEditData({ ...invoice });
  };

  const saveEdit = () => {
    onUpdateInvoice(editing, editData);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      {invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
           No invoices found. Upload a file to start.
        </div>
      ) : (
        invoices.map((inv) => (
          <div key={inv.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div onClick={() => toggleExpand(inv.id)} className="p-5 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {expanded[inv.id] ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                  <FileText className="h-6 w-6 text-blue-500" />
                  
                  {/* Summary Row */}
                  <div className="flex-1 grid grid-cols-5 gap-4">
                    <div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Invoice #</div>
                        <div className="font-semibold text-gray-900">{inv.serialNumber}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Customer</div>
                        <div className="font-medium text-gray-700 truncate">{inv.customerName}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Date</div>
                        <div className="text-gray-700">{inv.date || 'N/A'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Items</div>
                        <div className="text-gray-700">{inv.items?.length || 0}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total</div>
                        <div className="font-bold text-blue-600 text-lg">₹{Number(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                </div>

               
                {inv.issues && inv.issues.length > 0 && (
                     <div className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 mr-4">
                         <AlertCircle className="w-3 h-3" /> {inv.issues.length} Warning
                     </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                    {editing === inv.id ? (
                        <div className="flex gap-2">
                           <button onClick={(e) => { e.stopPropagation(); saveEdit(); }} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save className="h-4 w-4"/></button>
                           <button onClick={(e) => { e.stopPropagation(); setEditing(null); }} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"><X className="h-4 w-4"/></button>
                        </div>
                    ) : (
                        <button onClick={(e) => { e.stopPropagation(); startEdit(inv); }} className="p-2 hover:bg-blue-50 text-blue-600 rounded"><Edit2 className="h-4 w-4"/></button>
                    )}
                </div>
              </div>
            </div>

            {/* Expanded Items Table */}
            {expanded[inv.id] && (
              <div className="border-t bg-gray-50 p-5">
                 <div className="bg-white rounded border overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="text-left p-3 font-bold">Type</th>
                                <th className="text-left p-3 font-bold">Description</th>
                                <th className="text-right p-3 font-bold">Qty</th>
                                <th className="text-right p-3 font-bold">Unit Price</th>
                                <th className="text-right p-3 font-bold">Tax</th>
                                <th className="text-right p-3 font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inv.items.map((item, idx) => (
                                <tr key={idx} className="border-b last:border-0 hover:bg-blue-50/30">
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.type === 'service' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                            {item.type === 'service' ? 'Service' : 'Product'}
                                        </span>
                                    </td>
                                    <td className="p-3 font-medium text-gray-700">{item.name}</td>
                                    <td className="text-right p-3">{item.qty}</td>
                                    <td className="text-right p-3">₹{Number(item.unitPrice).toFixed(2)}</td>
                                    <td className="text-right p-3">{Number(item.tax).toFixed(1)}%</td>
                                    <td className="text-right p-3 font-bold text-gray-800">₹{Number(item.total).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-bold text-gray-900 border-t">
                             <tr>
                                 <td colSpan="5" className="text-right p-3">Invoice Total:</td>
                                 <td className="text-right p-3 text-blue-600">₹{Number(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                             </tr>
                        </tfoot>
                    </table>
                 </div>
                 {inv.issues.length > 0 && (
                     <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                         <strong>Validation Notes:</strong> {inv.issues.join(', ')}
                     </div>
                 )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
export default InvoicesTab;