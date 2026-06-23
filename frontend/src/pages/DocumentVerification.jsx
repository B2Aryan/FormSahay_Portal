import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Loader2, 
  Sparkles,
  ArrowRight,
  ClipboardList,
  ShieldAlert,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DOC_TYPES = [
  { id: 'AadhaarCard', label: 'Aadhaar Card' },
  { id: 'IncomeCertificate', label: 'Income Certificate' },
  { id: 'DomicileCertificate', label: 'Domicile Certificate' },
  { id: 'CasteCertificate', label: 'Caste Certificate' }
];

const DocumentVerification = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [userId, setUserId] = useState('');
  const [profileName, setProfileName] = useState('');

  // Selected files queue
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Verification report
  const [report, setReport] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const profile = localStorage.getItem('userProfile');
    if (id) {
      setUserId(id);
    }
    if (profile) {
      try {
        setProfileName(JSON.parse(profile).name);
      } catch (err) {}
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      addFilesToQueue(Array.from(e.target.files));
    }
  };

  const addFilesToQueue = (files) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const added = [];

    files.forEach(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`"${file.name}" is an unsupported format (PDF/PNG/JPEG only).`);
        return;
      }
      
      // Prevent duplicate file additions
      const exists = uploadQueue.some(item => item.file.name === file.name && item.file.size === file.size);
      if (!exists) {
        // Guess doc type by filename keyword
        let guessedType = 'AadhaarCard';
        const nameLower = file.name.toLowerCase();
        if (nameLower.includes('income')) guessedType = 'IncomeCertificate';
        else if (nameLower.includes('domicile')) guessedType = 'DomicileCertificate';
        else if (nameLower.includes('caste')) guessedType = 'CasteCertificate';

        added.push({
          id: Math.random().toString(36).substring(7),
          file,
          docType: guessedType
        });
      }
    });

    if (added.length > 0) {
      setUploadQueue(prev => [...prev, ...added]);
      toast.success(`Added ${added.length} files to queue.`);
    }
  };

  const handleTypeChange = (queueId, newType) => {
    setUploadQueue(prev => prev.map(item => 
      item.id === queueId ? { ...item, docType: newType } : item
    ));
  };

  const handleRemoveFromQueue = (queueId) => {
    setUploadQueue(prev => prev.filter(item => item.id !== queueId));
  };

  const handleVerify = async () => {
    if (uploadQueue.length === 0) {
      toast.error("Please add at least one document to verify.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    const docTypesArray = uploadQueue.map(item => item.docType);
    
    uploadQueue.forEach(item => {
      formData.append('files', item.file);
    });
    
    formData.append('documentTypes', JSON.stringify(docTypesArray));
    if (userId) {
      formData.append('userId', userId);
    }

    try {
      const response = await api.post('/verification/check', formData);

      setReport(response.data.documents);
      toast.success("Document verification completed!");
      
      // Save reports to localStorage for dashboard
      localStorage.setItem('verificationReports', JSON.stringify(response.data.documents));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error verifying documents.");
    } finally {
      setLoading(false);
    }
  };

  // Status Badge UI
  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="text-[10px] font-extrabold uppercase bg-emerald-500 text-white px-2 py-0.5 rounded">Verified</span>;
      case 'partial':
        return <span className="text-[10px] font-extrabold uppercase bg-amber-500 text-white px-2 py-0.5 rounded">Action Required</span>;
      case 'expired':
        return <span className="text-[10px] font-extrabold uppercase bg-rose-500 text-white px-2 py-0.5 rounded">Expired</span>;
      default:
        return <span className="text-[10px] font-extrabold uppercase bg-slate-500 text-white px-2 py-0.5 rounded">Missing</span>;
    }
  };

  // Status Icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'partial':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Verify Your Uploaded Documents
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload your verification certificates to cross-reference key details like spelling matches, signature markers, and expiration dates.
        </p>
      </div>

      {/* No citizen Profile Banner Alert */}
      {!userId && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <span className="text-xs font-semibold leading-normal">
              No citizen profile linked yet. Documents verified now will run in <strong>Guest Mode</strong> and will not be saved to your Dashboard.
            </span>
          </div>
          <Link to="/eligibility" className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 whitespace-nowrap">
            <UserCheck className="w-4 h-4" /> Create Profile
          </Link>
        </div>
      )}

      {userId && profileName && (
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold text-slate-400">
            Evaluating documents for citizen: <strong className="text-slate-700 dark:text-slate-300">{profileName}</strong>
          </span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        
        {/* Upload Column (Left - 50%) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-6 rounded-card border space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 border-b dark:border-slate-800 pb-2">
              📄 Upload Verification Documents
            </h3>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
              />
              <UploadCloud className="w-8 h-8 text-primary-light mx-auto mb-3" />
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                Drag files here, or <span className="text-primary hover:underline">browse</span>
              </span>
              <p className="text-[10px] text-slate-400 mt-1">
                Aadhaar, Domicile, Income, Caste Certificates (PDF or Image)
              </p>
            </div>
          </div>

          {/* Upload Queue Queue list */}
          {uploadQueue.length > 0 && (
            <div className="glass-card p-6 rounded-card border space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
                <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                  Files Selected ({uploadQueue.length})
                </h4>
                <button 
                  onClick={() => setUploadQueue([])}
                  className="text-[10px] font-bold text-rose-500 hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {uploadQueue.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 max-w-xs">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.file.name}</p>
                        <span className="text-[10px] text-slate-400">{(item.file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Document Type Selector */}
                      <select
                        value={item.docType}
                        onChange={(e) => handleTypeChange(item.id, e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold focus:outline-none"
                      >
                        {DOC_TYPES.map(type => (
                          <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleRemoveFromQueue(item.id)}
                        className="text-xs font-bold text-slate-400 hover:text-rose-500 p-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full btn-primary py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Performing OCR Verification Checks...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run Document Verification
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Verification Report Column (Right - 50%) */}
        <div className="lg:col-span-6 space-y-6">
          {!report && !loading && (
            <div className="glass-card p-10 rounded-card border text-center space-y-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-slate-400">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300">
                Awaiting Verification Scan
              </h3>
              <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
                Add documents, classify their file type dropdowns, and run the audit engine to obtain a validity audit report.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-card p-10 rounded-card border text-center space-y-6">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto"></div>
              <h3 className="font-extrabold text-slate-700 dark:text-slate-300">
                Auditing Document Authenticity
              </h3>
              <ul className="text-xs text-slate-400 space-y-2 text-left pl-5 list-disc max-w-xs mx-auto">
                <li>Running multilingual OCR (Hindi & English)...</li>
                <li>Cross-checking name configurations...</li>
                <li>Resolving signature and seal indicators...</li>
              </ul>
            </div>
          )}

          {/* Verification Report Output */}
          {report && !loading && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b dark:border-slate-800 pb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Document Verification Report
              </h3>

              <div className="space-y-4">
                {report.map((doc, idx) => (
                  <div 
                    key={idx}
                    className="glass-card p-6 rounded-card border border-slate-200 dark:border-slate-800 hover:shadow-soft transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            {DOC_TYPES.find(d => d.id === doc.type)?.label || doc.type}
                          </h4>
                          <span className="text-[10px] text-slate-400 block max-w-xs truncate">
                            File: {doc.fileName}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>

                    {/* Verification Parameters Checkboxes */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className={doc.fields?.name ? "text-emerald-500" : "text-rose-500"}>
                          {doc.fields?.name ? '✓' : '✗'}
                        </span>
                        <span>Name Matches</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className={doc.fields?.id ? "text-emerald-500" : "text-rose-500"}>
                          {doc.fields?.id ? '✓' : '✗'}
                        </span>
                        <span>ID Detected</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className={doc.validity?.valid ? "text-emerald-500" : "text-rose-500"}>
                          {doc.validity?.valid ? '✓' : '✗'}
                        </span>
                        <span>Valid/Not Expired</span>
                      </div>
                    </div>

                    {/* Expiry Details */}
                    {doc.validity?.expires && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                        <span>Validity Period:</span>
                        <strong className="text-slate-700 dark:text-slate-300">
                          {doc.validity.expires === 'Permanent' 
                            ? 'Permanent' 
                            : new Date(doc.validity.expires).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                        </strong>
                      </div>
                    )}

                    {/* Issues List */}
                    {doc.issues && doc.issues.length > 0 && (
                      <div className="space-y-1 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                        <span className="text-[10px] uppercase font-bold text-rose-500">Flagged Issues:</span>
                        <ul className="text-[11px] text-rose-700 dark:text-rose-400 space-y-1 list-disc pl-4">
                          {doc.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Recommended */}
                    {doc.action && (
                      <div className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">Recommended Action:</strong>
                        {doc.action}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary Dashboard Block */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-medium">
                <h4 className="font-extrabold text-xs text-sky-400 uppercase tracking-wider">
                  Verification Summary Report
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs border-b border-slate-800 pb-3">
                  <div>
                    <span className="block font-black text-lg text-emerald-400">
                      {report.filter(d => d.status === 'verified').length}
                    </span>
                    <span className="text-[10px] text-slate-400">Verified</span>
                  </div>
                  <div>
                    <span className="block font-black text-lg text-amber-400">
                      {report.filter(d => d.status === 'partial').length}
                    </span>
                    <span className="text-[10px] text-slate-400">Issues</span>
                  </div>
                  <div>
                    <span className="block font-black text-lg text-rose-400">
                      {report.filter(d => d.status === 'expired').length}
                    </span>
                    <span className="text-[10px] text-slate-400">Expired</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => { setReport(null); setUploadQueue([]); }}
                    className="flex-1 btn-outline border-slate-800 hover:bg-slate-800 text-white text-xs py-2.5"
                  >
                    Upload Missing Documents
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 btn-primary text-xs py-2.5"
                  >
                    Proceed to Application <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DocumentVerification;
