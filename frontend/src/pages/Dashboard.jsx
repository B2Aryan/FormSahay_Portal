import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Bookmark,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Trophy,
  ExternalLink,
  ChevronRight,
  BellRing,
  Info,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState('');
  
  // Dashboard states
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [verifiedDocs, setVerifiedDocs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Selected Analysis Modal
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      // 0. Try to fetch history from Firestore via API
      let firestoreData = null;
      try {
        const res = await api.get('/users/me/history');
        firestoreData = res.data.history;
      } catch (err) {
        // API failed, fall back to localStorage
      }

      // 1. Load User Profile from localStorage or API
      const savedProfile = localStorage.getItem('userProfile');
      const savedUserId = localStorage.getItem('userId');
      
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        if (savedUserId) {
          setUserId(savedUserId);
        }
        fetchRecommendations(parsed);
      } else {
        const demoProfile = {
          name: authUser?.displayName || "Rahul Sharma",
          email: authUser?.email || "rahul.sharma@domain.in",
          state: "Uttar Pradesh",
          age: 22,
          category: "OBC",
          income: 180000,
          education: "Graduate",
          gender: "Male",
          disability: false
        };
        setProfile(demoProfile);
        fetchRecommendations(demoProfile);
      }

      // 2. Load Recent Analyses — prefer Firestore, then localStorage, then demo
      if (firestoreData?.analyses?.length > 0) {
        setRecentAnalyses(firestoreData.analyses);
      } else {
        const savedAnalyses = localStorage.getItem('recentAnalyses');
        if (savedAnalyses) {
          setRecentAnalyses(JSON.parse(savedAnalyses));
        } else {
          const demoAnalyses = [
            {
              schemeName: "National Post Matric Scholarship Scheme for SC/ST/OBC",
              eligibility: ["SC, ST, OBC students enrolled in College/University", "Family income < ₹2.5L per annum"],
              documents: ["Aadhaar Card", "Caste Certificate", "Income Certificate", "Previous Marksheet"],
              deadline: "2026-12-15",
              instructions: ["Register on National Scholarship Portal", "Ensure bank account is seeded with Aadhaar", "Upload scanned certificates"],
              benefitAmount: "₹25,000 to ₹75,000 per annum",
              contactInformation: "Ministry of Minority Affairs, Toll Free: 1800-112-200",
              savedAt: new Date().toISOString()
            },
            {
              schemeName: "UP Post Matric Scholarship Scheme 2026",
              eligibility: ["Uttar Pradesh resident students", "OBC, SC, ST or EWS categories", "Income < ₹2L"],
              documents: ["Aadhaar", "Income Certificate", "Caste Certificate", "UP Domicile", "Marksheet"],
              deadline: "2026-11-30",
              instructions: ["Apply through UP Scholarship portal", "Submit printed copy to college", "Seed Aadhaar with DBT bank"],
              benefitAmount: "Fee Reimbursement + stipend of ₹500/month",
              contactInformation: "UP Social Welfare Department, Helpline: 1800-180-5131",
              savedAt: new Date().toISOString()
            }
          ];
          setRecentAnalyses(demoAnalyses);
        }
      }

      // 3. Load Verified Documents — prefer Firestore, then localStorage, then demo
      if (firestoreData?.verifications?.length > 0) {
        const allDocs = firestoreData.verifications.flatMap(v => v.documents || []);
        setVerifiedDocs(allDocs);
      } else {
        const savedDocs = localStorage.getItem('verificationReports');
        if (savedDocs) {
          setVerifiedDocs(JSON.parse(savedDocs));
        } else {
          const demoDocs = [
            { type: 'AadhaarCard', status: 'verified', validity: { valid: true, expires: 'Permanent' }, fileName: 'Aadhaar_Rahul.pdf' },
            { type: 'IncomeCertificate', status: 'verified', validity: { valid: true, expires: '2027-03-31' }, fileName: 'Income_Certificate_2026.jpg' },
            { type: 'DomicileCertificate', status: 'partial', validity: { valid: false, expires: '2025-01-10' }, fileName: 'Domicile_Old.pdf', issues: ['Document validity has expired!'] }
          ];
          setVerifiedDocs(demoDocs);
        }
      }
    };

    loadData();
  }, []);

  // Compute deadlines based on recent analyses and document expiries
  useEffect(() => {
    const calculatedDeadlines = [];

    // Add scheme deadlines
    recentAnalyses.forEach(analysis => {
      if (analysis.deadline) {
        const deadlineDate = new Date(analysis.deadline);
        const diffTime = deadlineDate - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let status = "Documents pending";
        if (verifiedDocs.filter(d => d.status === 'verified').length >= 2) {
          status = "Eligible, ready to apply";
        }

        calculatedDeadlines.push({
          id: Math.random().toString(36).substring(7),
          title: analysis.schemeName,
          date: analysis.deadline,
          daysLeft: diffDays,
          status,
          type: 'scheme'
        });
      }
    });

    // Add document expiry deadlines
    verifiedDocs.forEach(doc => {
      if (doc.validity && doc.validity.expires && doc.validity.expires !== 'Permanent') {
        const expiryDate = new Date(doc.validity.expires);
        const diffTime = expiryDate - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 365) {
          calculatedDeadlines.push({
            id: Math.random().toString(36).substring(7),
            title: `Renew: ${doc.type.replace('Certificate', ' Certificate')}`,
            date: doc.validity.expires,
            daysLeft: diffDays,
            status: doc.status === 'expired' || diffDays <= 0 ? "Expired - Renew Required" : "Validity active",
            type: 'document'
          });
        }
      }
    });

    // Sort deadlines: urgent first (daysLeft ascending)
    calculatedDeadlines.sort((a, b) => a.daysLeft - b.daysLeft);
    setDeadlines(calculatedDeadlines);
  }, [recentAnalyses, verifiedDocs]);

  const fetchRecommendations = async (userProfile) => {
    setLoadingRecs(true);
    try {
      const response = await api.post('/recommendations/schemes', userProfile);
      setRecommendations(response.data.schemes);
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleRemindMe = async (deadline) => {
    const notificationPayload = {
      userId: userId || "000000000000000000000000",
      type: "reminder",
      title: `Reminder: ${deadline.title}`,
      message: `Your deadline for "${deadline.title}" is scheduled on ${new Date(deadline.date).toLocaleDateString('en-IN')}. Days left: ${deadline.daysLeft}. Please check your documents.`,
      deadline: deadline.date
    };

    try {
      // 1. Post to backend DB
      await api.post('/notifications/send', notificationPayload);
      
      // 2. Simulate EmailJS Event Trigger
      toast.success(
        <div>
          <strong className="block text-xs">Email Reminder Scheduled!</strong>
          <span className="text-[10px] text-slate-300">An alert will be sent to <strong>{profile?.email}</strong> 3 days before the deadline.</span>
        </div>,
        { duration: 5000 }
      );
    } catch (err) {
      toast.error("Failed to set up reminder.");
    }
  };

  // Color mappings for Urgency Tracker
  const getUrgencyColor = (daysLeft) => {
    if (daysLeft <= 7) return { border: 'border-rose-500/30 bg-rose-500/5', badge: 'bg-rose-500 text-white', label: '🔴 URGENT' };
    if (daysLeft <= 30) return { border: 'border-amber-500/30 bg-amber-500/5', badge: 'bg-amber-500 text-white', label: '🟡 SOON' };
    return { border: 'border-emerald-500/30 bg-emerald-500/5', badge: 'bg-emerald-500 text-white', label: '🟢 LATER' };
  };

  const getMatchPercentageColor = (pct) => {
    if (pct >= 80) return 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (pct >= 60) return 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-8 rounded-3xl shadow-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-indigo-500/10 opacity-30"></div>
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {authUser?.displayName || authUser?.email?.split('@')[0] || profile?.name || "Guest Citizen"}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Here is your personalized government assistance dashboard and scheme checklist.
          </p>
        </div>
        <div className="flex items-center gap-2 relative z-10 bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700">
          <MapPin className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-slate-200">
            {profile?.state} | {profile?.category} Profile
          </span>
          <Link to="/eligibility" className="text-[10px] text-sky-400 hover:underline font-bold ml-2">Edit</Link>
        </div>
      </div>

      {/* Stats Overview Rows (4 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-card border flex items-center gap-4 hover:shadow-soft transition-all">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-black text-xl text-slate-800 dark:text-slate-100">{recentAnalyses.length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Notices Analyzed</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-card border flex items-center gap-4 hover:shadow-soft transition-all">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-black text-xl text-slate-800 dark:text-slate-100">
              {verifiedDocs.filter(d => d.status === 'verified').length}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Docs</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-card border flex items-center gap-4 hover:shadow-soft transition-all">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-black text-xl text-slate-800 dark:text-slate-100">
              {deadlines.filter(d => d.daysLeft <= 30).length}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Urgent Deadlines</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-card border flex items-center gap-4 hover:shadow-soft transition-all">
          <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-500">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-black text-xl text-slate-800 dark:text-slate-100">{recommendations.length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Matching Schemes</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Analyzed Notices vs Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Analyzed Notices (Left - 60%) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 rounded-card border space-y-4">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                📋 Recent Notice Analyses
              </h3>
              <Link to="/analyze" className="text-xs text-primary dark:text-primary-light hover:underline font-bold flex items-center gap-0.5">
                Analyze New Notice <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentAnalyses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <p>No circular documents analyzed yet.</p>
                <Link to="/analyze" className="text-primary underline">Upload a notice circular now</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAnalyses.map((analysis, idx) => (
                  <div 
                    key={idx} 
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
                  >
                    <div className="space-y-1.5 max-w-md">
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-snug">
                        {analysis.schemeName}
                      </h4>
                      <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                        <span>Last Date: {new Date(analysis.deadline).toLocaleDateString('en-IN')}</span>
                        {analysis.benefitAmount && <span className="text-emerald-500">{analysis.benefitAmount}</span>}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedAnalysis(analysis)}
                        className="flex-1 sm:flex-none btn-outline px-3 py-1.5 text-[11px] font-bold whitespace-nowrap"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          toast.success(`Redirecting to portal for ${analysis.schemeName}`);
                        }}
                        className="flex-1 sm:flex-none btn-primary px-3.5 py-1.5 text-[11px] whitespace-nowrap"
                      >
                        Apply <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deadline Tracker (Right - 40%) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-card border space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 border-b dark:border-slate-800 pb-2">
              ⏰ Application Deadline Tracker
            </h3>

            {deadlines.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No deadlines tracked yet. Expiry alerts populate when notices are saved.</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {deadlines.map((dl) => {
                  const ui = getUrgencyColor(dl.daysLeft);
                  return (
                    <div 
                      key={dl.id} 
                      className={`p-4 rounded-2xl border ${ui.border} space-y-3 transition-all`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${ui.badge}`}>
                            {ui.label}
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mt-1.5 leading-snug">
                            {dl.title}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="block font-black text-lg text-slate-800 dark:text-slate-100 leading-none">
                            {dl.daysLeft > 0 ? dl.daysLeft : 0}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400">days left</span>
                        </div>
                      </div>

                      {/* Time Progress Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${Math.max(10, Math.min(100, (1 - dl.daysLeft / 180) * 100))}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                        <span>Status: <strong className="text-slate-700 dark:text-slate-300">{dl.status}</strong></span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRemindMe(dl)}
                            className="flex items-center gap-1 hover:text-primary font-bold text-[10px]"
                            title="Schedule Email reminder via EmailJS"
                          >
                            <BellRing className="w-3.5 h-3.5" /> Remind Me
                          </button>
                          <button
                            onClick={() => {
                              toast.success(`Redirecting to process file application...`);
                            }}
                            className="hover:underline text-primary font-bold"
                          >
                            Proceed
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recommended Schemes (Bottom - Full Width) */}
      <section className="glass-card p-6 rounded-card border space-y-6">
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 border-b dark:border-slate-800 pb-2">
          🎯 Recommended Schemes For You
        </h3>

        {loadingRecs ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs text-slate-400 font-semibold">Running matching models...</span>
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No matching schemes. Verify your metrics in the Eligibility Checker.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 6).map((scheme) => (
              <div 
                key={scheme._id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-soft transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-white shadow-soft">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-extrabold border px-2 py-0.5 rounded-lg ${getMatchPercentageColor(scheme.matchPercentage)}`}>
                      {scheme.matchPercentage}% match
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
                      {scheme.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{scheme.category}</span>
                  </div>

                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong className="block text-slate-700 dark:text-slate-300 text-[11px] mb-0.5">Benefit:</strong>
                    {scheme.benefit}
                  </div>

                  {/* Required Documents Badge List */}
                  <div className="space-y-1">
                    <strong className="block text-slate-700 dark:text-slate-300 text-[10px] uppercase font-extrabold">Required Documents:</strong>
                    <div className="flex flex-wrap gap-1">
                      {scheme.documentsRequired.map((doc, i) => (
                        <span key={i} className="text-[9px] bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-6 border-t border-slate-200 dark:border-slate-800 mt-5 text-xs">
                  <button
                    onClick={() => {
                      toast.success(`Applying to: ${scheme.name}`);
                    }}
                    className="flex-1 btn-primary py-2 text-xs"
                  >
                    Apply Now
                  </button>
                  <button
                    onClick={() => {
                      // Save scheme to Dashboard Analyses
                      const saved = localStorage.getItem('recentAnalyses');
                      const list = saved ? JSON.parse(saved) : [];
                      if (!list.some(item => item.schemeName === scheme.name)) {
                        list.unshift({
                          schemeName: scheme.name,
                          eligibility: scheme.reasons || ["Evaluation pending profile verification"],
                          documents: scheme.documentsRequired,
                          deadline: scheme.deadline,
                          instructions: scheme.instructions || ["Check portal details."],
                          benefitAmount: scheme.benefit,
                          contactInformation: `${scheme.contactInfo?.office || 'Gov Office'} | ${scheme.contactInfo?.phone || 'Helpline'}`,
                          savedAt: new Date().toISOString()
                        });
                        localStorage.setItem('recentAnalyses', JSON.stringify(list));
                        setRecentAnalyses(list);
                      }
                      toast.success("Scheme saved to analyzed list!");
                    }}
                    className="btn-outline px-3 py-2 text-xs"
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Analysis Details Modal */}
      <AnimatePresence>
        {selectedAnalysis && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-medium p-6 space-y-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start gap-4 border-b dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 leading-tight">
                    {selectedAnalysis.schemeName}
                  </h3>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Welfare Specifications</span>
                </div>
                <button 
                  onClick={() => setSelectedAnalysis(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-slate-600 dark:text-slate-400">
                <div className="space-y-1">
                  <span className="block font-bold text-slate-800 dark:text-slate-300">Benefit Amount:</span>
                  <p className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 font-semibold">{selectedAnalysis.benefitAmount}</p>
                </div>
                <div className="space-y-1">
                  <span className="block font-bold text-slate-800 dark:text-slate-300">Last Date to Submit:</span>
                  <p className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 font-bold text-amber-500">
                    {new Date(selectedAnalysis.deadline).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <span className="block font-bold text-slate-800 dark:text-slate-300">Eligibility Criteria:</span>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedAnalysis.eligibility.map((el, i) => <li key={i}>{el}</li>)}
                  </ul>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <span className="block font-bold text-slate-800 dark:text-slate-300">Required Documents:</span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedAnalysis.documents.map((doc, i) => (
                      <span key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-2.5 py-0.5 rounded-lg">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <span className="block font-bold text-slate-800 dark:text-slate-300">Instructions:</span>
                  <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
                    {selectedAnalysis.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                  </ol>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <span className="block font-bold text-slate-800 dark:text-slate-300">Contact / Helplines:</span>
                  <p>{selectedAnalysis.contactInformation}</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t dark:border-slate-800">
                <button
                  onClick={() => setSelectedAnalysis(null)}
                  className="btn-outline px-4 py-2 text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    toast.success("Initiating online form application portals...");
                    setSelectedAnalysis(null);
                  }}
                  className="btn-primary px-4 py-2 text-xs"
                >
                  Proceed to Application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
