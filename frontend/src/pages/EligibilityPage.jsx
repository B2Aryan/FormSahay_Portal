import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Users, 
  Coins, 
  FileCheck2,
  Sparkles,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const INDIAN_STATES = [
  "All", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi"
];

const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS", "PwD"];
const EDUCATION_LEVELS = [
  "Below 10th", "10th Pass", "12th Pass", "Graduate", "Post Graduate", "Doctorate"
];
const GENDERS = ["Male", "Female", "Other"];

const EligibilityPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    state: 'Uttar Pradesh',
    age: '',
    category: 'General',
    income: '',
    education: '12th Pass',
    gender: 'Male',
    disability: false
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Load existing profile from localStorage if present
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setFormData(prev => ({
          ...prev,
          ...JSON.parse(savedProfile)
        }));
      } catch (err) {
        console.error("Failed to parse saved user profile", err);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in your Name and Email for notification updates.");
      return;
    }
    if (Number(formData.age) < 1 || Number(formData.age) > 120) {
      toast.error("Age must be between 1 and 120.");
      return;
    }
    if (Number(formData.income) < 0) {
      toast.error("Annual Income cannot be negative.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/eligibility/check', formData);
      
      setResult(response.data);
      
      // Save profile and userId to state and localStorage
      localStorage.setItem('userProfile', JSON.stringify(formData));
      if (response.data.userId) {
        localStorage.setItem('userId', response.data.userId);
      }
      
      toast.success("Eligibility evaluation completed!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to check eligibility.");
    } finally {
      setLoading(false);
    }
  };

  // Status Badge rendering
  const renderStatusCard = () => {
    if (!result) return null;

    const { status, matchPercentage, reasons } = result;

    if (status === 'eligible') {
      return (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0 animate-bounce" />
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-md">
                Eligible
              </span>
              <h3 className="text-lg font-black mt-1">You qualify for matching welfare schemes!</h3>
            </div>
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            Based on your profile, you met all core eligibility filters. We recommend proceeding to save these configurations and upload your verification documents.
          </p>
        </div>
      );
    } else if (status === 'partial') {
      return (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-md">
                Partially Eligible
              </span>
              <h3 className="text-lg font-black mt-1">You qualify for some schemes with reservations</h3>
            </div>
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            You matched some filters, but fell outside specific boundaries (e.g. income limit caps or state domicile residency). View alternative programs below.
          </p>
        </div>
      );
    } else {
      return (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 space-y-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-rose-500 flex-shrink-0" />
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-md">
                Not Eligible
              </span>
              <h3 className="text-lg font-black mt-1">Welfare parameters check failed</h3>
            </div>
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            Unfortunately, your current profile fields did not satisfy the minimum requirements for the selected schemes. Review the specific reasons below to double-check.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Check Your Eligibility for Government Schemes
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your profile details to dynamically match against Central and State scholarship programs, agricultural funds, and local welfare grants.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Section (60% equivalent) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 glass-card p-8 rounded-card border space-y-6">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-primary" /> Enter Your Profile Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="e.g. rahul@example.com"
                  required
                />
              </div>
            </div>

            {/* State */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                State of Residence
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <MapPin className="w-4 h-4" />
                </span>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input-field pl-10"
                >
                  {INDIAN_STATES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                Age
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="e.g. 22"
                  min="1"
                  max="120"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                Social Category
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Users className="w-4 h-4" />
                </span>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field pl-10"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Income */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                Annual Family Income (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="e.g. 250000"
                  required
                />
              </div>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                Highest Education Completed
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="input-field pl-10"
                >
                  {EDUCATION_LEVELS.map(ed => (
                    <option key={ed} value={ed}>{ed}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                Gender
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Users className="w-4 h-4" />
                </span>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input-field pl-10"
                >
                  {GENDERS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Disability Switch */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <input
              type="checkbox"
              id="disability"
              name="disability"
              checked={formData.disability}
              onChange={handleChange}
              className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary-light"
            />
            <div className="flex flex-col">
              <label htmlFor="disability" className="text-xs font-extrabold text-slate-700 dark:text-slate-300 cursor-pointer">
                Person with Disability (PwD)
              </label>
              <span className="text-[10px] text-slate-400">
                Check this if you have a government certified physical or mental disability.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Verifying matching matrices...
                </>
              ) : (
                <>
                  <FileCheck2 className="w-5 h-5" /> Check Eligibility
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results Section (40% equivalent) */}
        <div className="lg:col-span-5 space-y-6">
          {!result && !loading && (
            <div className="glass-card p-10 rounded-card border text-center space-y-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-slate-400">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300">
                Awaiting Profile Inputs
              </h3>
              <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
                Fill out the profile specifications form and click submit to trigger AI audits against our active database.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-card p-10 rounded-card border text-center space-y-6">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto"></div>
              <h3 className="font-extrabold text-slate-700 dark:text-slate-300">
                Running Cross-checks
              </h3>
              <ul className="text-xs text-slate-400 space-y-2 text-left pl-5 list-disc max-w-xs mx-auto">
                <li>Evaluating state domicile constraints...</li>
                <li>Auditing income ceiling eligibility caps...</li>
                <li>Matching minimum educational criteria...</li>
              </ul>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              
              {/* Overall Status Box */}
              {renderStatusCard()}

              {/* Match Score Gauge */}
              <div className="glass-card p-6 rounded-card border flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Compatibility Rating
                  </span>
                  <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                    Highest Profile Match
                  </h4>
                </div>
                <div className="relative flex items-center justify-center">
                  {/* Circle SVG */}
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle 
                      cx="40" cy="40" r="34" 
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="6" stroke="currentColor" fill="transparent" 
                    />
                    <circle 
                      cx="40" cy="40" r="34" 
                      className="text-primary-light"
                      strokeWidth="6" strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - result.matchPercentage / 100)}
                      strokeLinecap="round" stroke="currentColor" fill="transparent" 
                    />
                  </svg>
                  <span className="absolute font-black text-slate-800 dark:text-slate-100 text-sm">
                    {result.matchPercentage}%
                  </span>
                </div>
              </div>

              {/* Reasons Audit Trail */}
              <div className="glass-card p-6 rounded-card border space-y-4">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-primary" /> Profile Audit Breakdown
                </h4>
                <ul className="space-y-3 text-xs">
                  {result.reasons.map((reason, idx) => {
                    const isOk = reason.startsWith('✓');
                    return (
                      <li key={idx} className={`flex items-start gap-2.5 p-2 rounded-xl border ${
                        isOk 
                          ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-400' 
                          : 'bg-rose-500/5 border-rose-500/10 text-rose-800 dark:text-rose-400'
                      }`}>
                        <span className="mt-0.5">{isOk ? '✓' : '✗'}</span>
                        <span className="leading-relaxed">{reason.substring(2)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Recommended Schemes Link */}
              <div className="pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
                >
                  View Recommended Schemes <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EligibilityPage;
