import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setParsedData, setLoading, setUploadProgress } from '../store/slices/dataSlice';

const FileUpload = () => {
  const dispatch = useDispatch();
  const { loading, uploadProgress } = useSelector(state => state.data);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const validateFiles = (fileList) => {
    const validExts = ['.pdf', '.jpg', '.jpeg', '.png', '.xlsx', '.xls'];
    const valid = [];
    const invalid = [];
    
    fileList.forEach(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      if (validExts.includes(ext)) valid.push(f);
      else invalid.push(f.name);
    });
    
    if (invalid.length > 0) {
      setError(`Unsupported files: ${invalid.join(', ')}`);
      setTimeout(() => setError(''), 5000);
    }
    return valid;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const valid = validateFiles(droppedFiles);
    setFiles(prev => [...prev, ...valid]);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const valid = validateFiles(selectedFiles);
    setFiles(prev => [...prev, ...valid]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    dispatch(setLoading(true));
    dispatch(setUploadProgress(10));

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      //BACKEND API CALL
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          dispatch(setUploadProgress(percentCompleted < 90 ? percentCompleted : 90)); // Save 10% for processing
        }
      });

      dispatch(setUploadProgress(100));
      setTimeout(() => {
        dispatch(setParsedData(response.data));
        dispatch(setLoading(false));
        dispatch(setUploadProgress(0));
        setFiles([]); // Clear files
      }, 500);

    } catch (err) {
      console.error(err);
      alert("Upload Failed: " + (err.response?.data?.message || err.message));
      dispatch(setLoading(false));
      dispatch(setUploadProgress(0));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Upload Documents</h2>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50 scale-102' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Upload className={`mx-auto h-16 w-16 mb-4 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-lg text-gray-700 mb-2 font-medium">Drag and drop files here</p>
        <p className="text-gray-500 mb-4">or</p>
        
        <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls" onChange={handleFileSelect} className="hidden" id="file-input" disabled={loading} />
        <label htmlFor="file-input" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer font-medium transition disabled:opacity-50">
          Browse Files
        </label>
        <p className="text-sm text-gray-500 mt-4">Supported: PDF, JPG, PNG, Excel</p>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
            <h3 className="font-semibold mb-3 text-gray-700">Selected Files ({files.length})</h3>
            <div className="space-y-2 mb-4">
            {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div><div className="font-medium text-gray-800">{f.name}</div><div className="text-xs text-gray-500">{(f.size / 1024).toFixed(1)} KB</div></div>
                </div>
                <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700" disabled={loading}><X className="h-5 w-5" /></button>
                </div>
            ))}
            </div>
            
            {uploadProgress > 0 && (
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2"><span>Processing...</span><span>{uploadProgress}%</span></div>
                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden"><div className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} /></div>
                </div>
            )}

            <button onClick={handleUpload} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-all shadow-md">
                {loading ? 'Processing with AI...' : `Upload & Extract (${files.length} files)`}
            </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;