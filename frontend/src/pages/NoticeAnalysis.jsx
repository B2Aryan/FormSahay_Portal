import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Calendar, 
  HelpCircle, 
  Coins, 
  PhoneCall,
  Loader2,
  Sparkles,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NoticeAnalysis = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  
  // Results
  const [analysisResult, setAnalysisResult] = useState(null);
  const [customText, setCustomText] = useState('');
  const [explanationResult, setExplanationResult] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [showExplanationBox, setShowExplanationBox] = useState(false);

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type. Please upload a PDF or an Image (PNG/JPEG).");
      return;
    }
    setFile(selectedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please select or drop a file first.");
      return;
    }

    setLoading(true);
    setProgress(15);
    setProgressStatus("Uploading file to server...");

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress bar increments
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          if (prev > 60) {
            setProgressStatus("Analyzing parsed parameters with AI Distiller...");
            return prev + 5;
          }
          setProgressStatus("Running OCR Character Recognition on document scans...");
          return prev + 10;
        });
      }, 800);

      const response = await api.post('/analysis/notice', formData);

      clearInterval(interval);
      setProgress(100);
      setProgressStatus("Analysis complete!");
      
      setTimeout(() => {
        setAnalysisResult(response.data.analysis);
        setCustomText(response.data.analysis.instructions.join('\n'));
        toast.success("Document analyzed successfully!");
        setLoading(false);
      }, 500);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error analyzing notice. Check file format.");
      setLoading(false);
    }
  };

  const handleExplainText = async () => {
    const textToExplain = customText || analysisResult?.instructions?.join('\n');
    if (!textToExplain) {
      toast.error("No text available to explain.");
      return;
    }

    setExplaining(true);
    try {
      const response = await api.post('/analysis/explanation', { text: textToExplain });

      setExplanationResult(response.data.result);
      toast.success("Explanation generated!");
      setShowExplanationBox(true);
    } catch (err) {
      toast.error("Failed to generate AI explanation.");
    } finally {
      setExplaining(false);
    }
  };

  const handleSaveToDashboard = () => {
    if (!analysisResult) return;

    try {
      const saved = localStorage.getItem('recentAnalyses');
      const list = saved ? JSON.parse(saved) : [];
      
      // Prevent duplicates
      const exists = list.some(item => item.schemeName === analysisResult.schemeName);
      if (!exists) {
        list.unshift({
          ...analysisResult,
          savedAt: new Date().toISOString()
        });
        localStorage.setItem('recentAnalyses', JSON.stringify(list));
      }
      
      toast.success("Scheme notice analysis saved to your Dashboard!");
    } catch (err) {
      toast.error("Error saving to Dashboard.");
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Upload Government Notice for AI Analysis
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload official PDF notifications, circular files, or screenshots of announcements. Our OCR Agent and AI will extract key terms immediately.
        </p>
      </div>

      {/* Upload Drag & Drop Area */}
      {!analysisResult && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragOver 
                ? 'border-primary bg-primary/5 shadow-glow' 
                : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <UploadCloud className="w-10 h-10 text-primary-light" />
              </div>
              <div>
                <span className="font-bold text-base text-slate-800 dark:text-slate-200">
                  Drag and drop your document here, or <span className="text-primary hover:underline">browse</span>
                </span>
                <p className="text-xs text-slate-400 mt-1.5">
                  Supports PDF, PNG, JPG, or JPEG up to 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Selected File Card */}
          {file && (
            <div className="glass-card p-4 rounded-2xl border flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary-dark dark:text-primary-light">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-md">
                    {file.name}
                  </h4>
                  <span className="text-xs text-slate-400 font-semibold">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1"
              >
                Clear
              </button>
            </div>
          )}

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className={`w-full sm:w-auto btn-primary px-8 py-3.5 ${(!file || loading) ? 'opacity-55 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Analyze Notice with AI
                </>
              )}
            </button>
          </div>

          {/* Loading States */}
          {loading && (
            <div className="glass-card p-6 rounded-card border space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{progressStatus}</span>
                <span className="font-bold text-primary dark:text-primary-light">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-primary-light to-primary h-2.5 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <ul className="text-xs text-slate-400 space-y-2 pl-4 list-disc">
                <li>Converting document layouts (PDF or image pages)</li>
                <li>Executing English & Hindi character segment matching</li>
                <li>Extracting date values and required certifications</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {analysisResult && (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  Notice Analysis Results
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI has successfully parsed and structured the document specifications.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={handleSaveToDashboard}
                className="flex-1 sm:flex-none btn-primary px-4 py-2 text-xs"
              >
                Save to Dashboard
              </button>
              <button 
                onClick={() => navigate('/eligibility')}
                className="flex-1 sm:flex-none btn-secondary px-4 py-2 text-xs"
              >
                Check Eligibility <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setAnalysisResult(null); setFile(null); }}
                className="btn-outline px-4 py-2 text-xs"
              >
                Upload New
              </button>
            </div>
          </div>

          {/* Cards Grid Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Scheme Name Card */}
            <div className="glass-card p-6 rounded-card border hover:shadow-soft transition-all space-y-3 lg:col-span-2">
              <div className="flex items-center gap-2 text-primary dark:text-primary-light font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" /> Scheme Name
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                {analysisResult.schemeName}
              </h3>
              {analysisResult.benefitAmount && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <Coins className="w-4 h-4" /> {analysisResult.benefitAmount}
                </div>
              )}
            </div>

            {/* 2. Deadline Card */}
            <div className="glass-card p-6 rounded-card border hover:shadow-soft transition-all space-y-3">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4" /> Last Date to Apply
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {analysisResult.deadline ? new Date(analysisResult.deadline).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                }) : "Not Specified"}
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Make sure documents are verified and details are complete before this date.
              </p>
            </div>

            {/* 3. Eligibility Criteria */}
            <div className="glass-card p-6 rounded-card border hover:shadow-soft transition-all space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 border-b dark:border-slate-800 pb-2">
                👤 Eligibility Criteria
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pl-1">
                {analysisResult.eligibility.map((el, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Required Documents */}
            <div className="glass-card p-6 rounded-card border hover:shadow-soft transition-all space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 border-b dark:border-slate-800 pb-2">
                📄 Required Documents
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pl-1">
                {analysisResult.documents.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Contact Information */}
            <div className="glass-card p-6 rounded-card border hover:shadow-soft transition-all space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 border-b dark:border-slate-800 pb-2">
                🏢 Contact Information
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {analysisResult.contactInformation || "No contact info parsed."}
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => handleCopyToClipboard(analysisResult.contactInformation)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Details
                </button>
              </div>
            </div>

            {/* 6. Instructions Card (Full Width) */}
            <div className="glass-card p-6 rounded-card border hover:shadow-soft transition-all space-y-4 md:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  ⚠️ Important Instructions
                </h4>
                <button
                  onClick={handleExplainText}
                  disabled={explaining}
                  className="btn-secondary px-3.5 py-1.5 text-xs font-bold"
                >
                  {explaining ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Simplifying...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Explain in Simple Language
                    </>
                  )}
                </button>
              </div>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400 list-decimal pl-5">
                {analysisResult.instructions.map((inst, idx) => (
                  <li key={idx} className="leading-relaxed border-l-2 border-primary/20 pl-2">
                    {inst}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* AI Explanation Engine Output (Two Column Layout) */}
          <AnimatePresence>
            {showExplanationBox && explanationResult && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-8 rounded-3xl border-2 border-violet-500/30 space-y-8"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-extrabold text-base">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    🤖 AI EXPLANATION ENGINE
                  </div>
                  <button
                    onClick={() => setShowExplanationBox(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Hide Explanation
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Column 1: Original Language */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                      Original Notice Content
                    </h4>
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="input-field h-60 text-xs font-mono leading-relaxed"
                      placeholder="Paste complex clause instructions here to explain..."
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={handleExplainText} 
                        disabled={explaining}
                        className="btn-outline px-4 py-2 text-xs"
                      >
                        {explaining ? 'Re-analyzing...' : 'Refresh Translation'}
                      </button>
                    </div>
                  </div>

                  {/* Column 2: Simplified AI Translation */}
                  <div className="space-y-6 bg-violet-500/5 dark:bg-violet-950/20 p-6 rounded-2xl border border-violet-500/10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-xs text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">
                          Simple Explanation
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {explanationResult.explanation}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-violet-500/10">
                        {/* What You Need To Do */}
                        <div className="space-y-2">
                          <h5 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1">
                            <ClipboardCheck className="w-3.5 h-3.5 text-primary" /> What You Need To Do
                          </h5>
                          <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 list-decimal pl-4">
                            {explanationResult.actionRequired.map((act, idx) => (
                              <li key={idx}>{act}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Important Notes */}
                        <div className="space-y-2">
                          <h5 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Important Notes
                          </h5>
                          <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 list-disc pl-4">
                            {explanationResult.importantNotes.map((note, idx) => (
                              <li key={idx}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => handleCopyToClipboard(explanationResult.explanation)}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Simple Explanation
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default NoticeAnalysis;
