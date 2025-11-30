import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, Package, Users, AlertCircle, Upload, CheckCircle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import InvoicesTab from './components/InvoicesTab';
import ProductsTab from './components/ProductsTab';
import CustomersTab from './components/CustomersTab';
import { updateInvoice, updateProduct, updateCustomer } from './store/slices/dataSlice';

export default function App() {
  const [activeTab, setActiveTab] = useState('invoices');
  const dispatch = useDispatch();
  
  const { invoices, products, customers, issues, loading } = useSelector((state) => state.data);

  const handleUpdateInvoice = (id, updates) => dispatch(updateInvoice({ id, updates }));
  const handleUpdateProduct = (id, updates) => dispatch(updateProduct({ id, updates }));
  const handleUpdateCustomer = (id, updates) => dispatch(updateCustomer({ id, updates }));

  const tabs = [
    { id: 'invoices', label: 'Invoices', icon: FileText, count: invoices.length },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'customers', label: 'Customers', icon: Users, count: customers.length }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <FileText className="h-10 w-10" /> Invoice Extraction System
              </h1>
              <p className="text-blue-100 text-lg">Automated AI-powered data extraction</p>
            </div>
            {(issues.length > 0) && (
              <div className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                <AlertCircle className="h-5 w-5" /> <span className="font-semibold">{issues.length} Global Issues</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        <FileUpload />

        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-700 text-xl font-medium">Extracting data from your files...</p>
          </div>
        )}

        {(invoices.length > 0 || products.length > 0 || customers.length > 0) && (
          <>
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-6 w-6" />
                  {tab.label}
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${activeTab === tab.id ? 'bg-white/20' : 'bg-blue-100 text-blue-700'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {issues.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded shadow">
                    <h3 className="font-bold text-yellow-800 flex items-center gap-2"><AlertCircle className="h-5 w-5"/> Extraction Warnings</h3>
                    <ul className="mt-2 list-disc list-inside text-yellow-700">
                        {issues.map((issue, idx) => <li key={idx}>{issue}</li>)}
                    </ul>
                </div>
            )}

            <div>
              {activeTab === 'invoices' && <InvoicesTab invoices={invoices} onUpdateInvoice={handleUpdateInvoice} />}
              {activeTab === 'products' && <ProductsTab products={products} onUpdate={handleUpdateProduct} />}
              {activeTab === 'customers' && <CustomersTab customers={customers} onUpdate={handleUpdateCustomer} />}
            </div>
          </>
        )}

        {!loading && invoices.length === 0 && (
           <div className="bg-white rounded-xl shadow-lg p-16 text-center opacity-70">
             <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6"><Upload className="h-12 w-12 text-blue-600" /></div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Extract Data</h2>
             <p className="text-gray-600 text-lg mb-6">Upload PDF, Excel, or image files to see magic happen.</p>
             <div className="flex justify-center gap-6 text-sm text-gray-500">
                <span className="flex gap-1"><CheckCircle className="text-green-500 h-5 w-5"/> AI OCR</span>
                <span className="flex gap-1"><CheckCircle className="text-green-500 h-5 w-5"/> Auto Sync</span>
                <span className="flex gap-1"><CheckCircle className="text-green-500 h-5 w-5"/> Excel Support</span>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}