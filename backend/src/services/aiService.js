const Groq = require('groq-sdk');

let groq = null;
const hasApiKey = !!process.env.GROQ_API_KEY;

if (hasApiKey) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
  console.log("✅ Groq AI Client initialized.");
} else {
  console.log("⚠️  GROQ_API_KEY is not defined. Activating Smart AI Simulation Engine.");
}

// Helper: safe JSON parsing for AI outputs
const cleanAndParseJson = (text) => {
  try {
    // Strip markdown JSON codeblock markers if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();
    
    // Find the first '{' or '[' and the last '}' or ']'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse JSON from AI response, returning raw content wrapped", err);
    return null;
  }
};

const queryAI = async (prompt, systemPrompt = "", model = "llama-3.1-8b-instant", retries = 2) => {
  if (!hasApiKey) {
    throw new Error("No API Key configured");
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0.1,
      });
      return response.choices[0].message.content;
    } catch (err) {
      const isRateLimit = err.status === 429;
      const isLastAttempt = attempt === retries;
      if (isRateLimit && !isLastAttempt) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      console.error(`Error querying Groq model ${model}:`, err.message);
      if (isLastAttempt) throw err;
    }
  }
};

// --- Smart Simulations for Offline Mode ---

const simulateNoticeAnalysis = (text) => {
  const content = text.toLowerCase();
  
  if (content.includes('scholarship') || content.includes('matric') || content.includes('student') || content.includes('education')) {
    return {
      schemeName: "National Post Matric Scholarship Scheme 2026",
      eligibility: [
        "Must be an Indian citizen",
        "Belonging to SC, ST, OBC, or EWS category",
        "Annual family income must not exceed ₹2,50,000",
        "Must have passed class 10th or 12th with at least 50% marks",
        "Enrolled in a recognized college or university"
      ],
      documents: [
        "Aadhaar Card",
        "Income Certificate (issued after April 1, 2026)",
        "Caste Certificate",
        "Domicile Certificate",
        "Mark Sheet of last qualifying examination"
      ],
      deadline: "2026-12-15",
      instructions: [
        "Apply online only through the National Scholarship Portal (NSP)",
        "Ensure bank account is seeded with Aadhaar number",
        "Double-check income certificate validity before uploading",
        "Keep scanned copies of original documents ready"
      ],
      benefitAmount: "₹25,000 to ₹75,000 per annum depending on course details",
      contactInformation: "Ministry of Minority Affairs / Social Justice, Toll Free: 1800-112-200, email: helpdesk-nsp@gov.in"
    };
  } else if (content.includes('farmer') || content.includes('kisan') || content.includes('agriculture') || content.includes('land')) {
    return {
      schemeName: "PM Kisan Samman Nidhi Yojana",
      eligibility: [
        "Small and marginal landholder farmer families",
        "Cultivable land ownership up to 2 hectares in their name",
        "Must have valid bank account linked with Aadhaar",
        "Excludes institutional landholders, tax payers, and pension holders above ₹10,000"
      ],
      documents: [
        "Aadhaar Card",
        "Landholding Ownership Papers (Khatauni/Patta)",
        "Bank Passbook copy",
        "Mobile number registered with Aadhaar"
      ],
      deadline: "2026-10-31",
      instructions: [
        "Self-register via PM-Kisan Portal or visit nearest Common Service Centre (CSC)",
        "Ensure e-KYC is completed using Aadhaar OTP",
        "Land records must match Aadhaar spelling exactly"
      ],
      benefitAmount: "₹6,000 per year paid in three equal installments of ₹2,000 directly to bank accounts",
      contactInformation: "PM-Kisan Help Desk: 155261 / 1800-115-526, email: pmkisan-ict@gov.in"
    };
  } else if (content.includes('behna') || content.includes('ladli') || content.includes('woman') || content.includes('female')) {
    return {
      schemeName: "Ladli Behna Welfare Scheme",
      eligibility: [
        "Resident of India (State specific)",
        "Women aged between 21 and 60 years",
        "Family income less than ₹2,50,000 per annum",
        "No family member should be a government employee or income tax payer"
      ],
      documents: [
        "Aadhaar Card",
        "Domicile Certificate",
        "Family ID card (Samagra / Ration Card)",
        "Bank account with active DBT (Direct Benefit Transfer)"
      ],
      deadline: "2026-09-30",
      instructions: [
        "Application forms are available free at Ward offices or Gram Panchayats",
        "Biometric verification or Aadhaar OTP authentication is mandatory during registration",
        "Bank account must have active DBT enabled"
      ],
      benefitAmount: "₹1,250 per month directly deposited to the bank account",
      contactInformation: "Department of Women & Child Development, Helpline: 181"
    };
  }

  // General default fallback notice analysis
  return {
    schemeName: "Central Welfare Scheme Grant 2026",
    eligibility: [
      "Resident of India",
      "Belonging to EWS (Economically Weaker Section) or reserved categories",
      "Family income less than ₹3,00,000 per annum",
      "Age limit: 18 to 60 years"
    ],
    documents: [
      "Aadhaar Card",
      "Income Certificate",
      "Domicile Certificate"
    ],
    deadline: "2026-11-30",
    instructions: [
      "Apply through the official state e-District portal",
      "Submit all documents in PDF format under 500KB",
      "Verify that the name matches Aadhaar card exactly"
    ],
    benefitAmount: "₹15,000 one-time financial assistance",
    contactInformation: "Welfare Help Desk, Email: helpdesk-welfare@gov.in"
  };
};

const simulateEligibilityCheck = (userData, scheme) => {
  const age = Number(userData.age);
  const income = Number(userData.income);
  const state = userData.state;
  const category = userData.category;
  const education = userData.education;

  let score = 100;
  const reasons = [];
  const missingCriteria = [];

  // Check state
  if (scheme.eligibility.state !== "All" && scheme.eligibility.state !== state) {
    score -= 25;
    reasons.push(`✗ State mismatch: Scheme is for residents of ${scheme.eligibility.state}, your profile states ${state}.`);
    missingCriteria.push("State residency");
  } else {
    reasons.push(`✓ State match: Resident of ${state}.`);
  }

  // Check age
  const ageMin = scheme.eligibility.ageRange.min;
  const ageMax = scheme.eligibility.ageRange.max;
  if (age < ageMin || age > ageMax) {
    score -= 25;
    reasons.push(`✗ Age requirement: Expected between ${ageMin} and ${ageMax} years. Your age is ${age}.`);
    missingCriteria.push("Age limit");
  } else {
    reasons.push(`✓ Age match: ${age} falls within ${ageMin}-${ageMax} range.`);
  }

  // Check category
  if (scheme.eligibility.categories && scheme.eligibility.categories.length > 0) {
    const isCategoryAllowed = scheme.eligibility.categories.includes(category) || scheme.eligibility.categories.includes("All");
    if (!isCategoryAllowed) {
      score -= 20;
      reasons.push(`✗ Category restriction: Allowed categories are [${scheme.eligibility.categories.join(", ")}]. Your profile lists "${category}".`);
      missingCriteria.push("Social category");
    } else {
      reasons.push(`✓ Category matches: "${category}" is eligible.`);
    }
  }

  // Check income
  const limit = scheme.eligibility.incomeLimit;
  if (limit && income > limit) {
    score -= 30;
    const excess = income - limit;
    reasons.push(`✗ Income exceeds limit: Maximum allowed is ₹${limit.toLocaleString('en-IN')}, your income is ₹${income.toLocaleString('en-IN')} (exceeds by ₹${excess.toLocaleString('en-IN')}).`);
    missingCriteria.push("Income threshold");
  } else if (limit) {
    reasons.push(`✓ Income match: Family income (₹${income.toLocaleString('en-IN')}) is below the ₹${limit.toLocaleString('en-IN')} cap.`);
  }

  let status = "eligible";
  if (score < 50) status = "not_eligible";
  else if (score < 90) status = "partial";

  return {
    status,
    matchPercentage: Math.max(0, score),
    reasons,
    missingCriteria
  };
};

const simulateDocumentVerification = (docType, text) => {
  const content = text.toLowerCase();
  
  // General flags we look for
  const namePresent = content.includes('name') || content.includes('kumar') || content.includes('singh') || content.includes('sharma') || content.includes('devi') || content.includes('verma') || content.includes('resident') || content.includes('dob');
  const idPresent = content.includes('number') || content.includes('id') || /\d{4}\s\d{4}\s\d{4}/.test(content) || /\d{10,12}/.test(content) || /[a-z]{3}\d{7}/i.test(content);
  const signaturePresent = content.includes('signature') || content.includes('sign') || content.includes('authority') || content.includes('tehsildar') || content.includes('seal') || content.includes('valid');
  
  // Expiry check
  let expires = null;
  let expired = false;
  
  // Simulate standard expiry dates
  if (docType === 'IncomeCertificate') {
    // Income certificates are valid for 1 year usually. Let's look for date keywords.
    if (content.includes('expired') || content.includes('2023') || content.includes('2024') || content.includes('2025')) {
      expired = true;
      expires = '2025-03-31';
    } else {
      expires = '2027-03-31';
    }
  } else if (docType === 'DomicileCertificate') {
    // Domiciles are usually lifetime or 3 years. Let's simulate based on random trigger.
    if (content.includes('expired')) {
      expired = true;
      expires = '2025-01-10';
    } else {
      expires = '2028-12-31';
    }
  } else {
    // Aadhaar doesn't expire
    expires = 'Permanent';
  }

  const issues = [];
  if (!namePresent) issues.push("Applicant name field could not be clearly resolved.");
  if (!idPresent) issues.push("Document unique identification ID number is missing or illegible.");
  if (expired) issues.push(`Document validity period has expired (Validity date: ${expires}).`);

  let status = 'verified';
  if (issues.length > 0) {
    status = expired ? 'expired' : 'partial';
  }

  return {
    type: docType,
    status,
    fields: {
      name: namePresent,
      id: idPresent,
      date: !expired
    },
    validity: {
      valid: !expired,
      expires: expires
    },
    issues,
    action: status === 'verified' 
      ? 'No action required.' 
      : status === 'expired' 
        ? 'Apply for document renewal at your local service center or online portal.' 
        : 'Please upload a clearer copy of the document highlighting name and identity fields.'
  };
};

const simulateExplanation = (text) => {
  return {
    explanation: "This clause states that you are required to submit an income certificate that has been issued by a designated and authorized government officer (such as a Tehsildar, Sub-Divisional Magistrate, or authorized Revenue Officer). Furthermore, this certificate must be current and not past its expiration date at the time of your application.",
    actionRequired: [
      "Locate your current Income Certificate.",
      "Check the 'Date of Issue' and the 'Validity' statement on the certificate.",
      "If you do not have one, or if it is expired, visit your local Tehsil office or apply online on your state's e-District portal.",
      "Ensure the certificate is signed and stamped by an authorized officer."
    ],
    importantNotes: [
      "Income certificates in most Indian states are valid for only 1 financial year or 3 years.",
      "Ensure the income amount listed on the certificate matches the figure you enter in your scholarship application.",
      "The name on the certificate must match your Aadhaar name exactly."
    ]
  };
};

// --- Exported Interface ---

module.exports = {
  // Notice Analysis
  analyzeNotice: async (extractedText) => {
    if (!hasApiKey) {
      console.log("🤖 Simulated notice analysis initiated...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      return simulateNoticeAnalysis(extractedText);
    }

    const prompt = `
      Extract government scheme details from the following notice text. 
      You must respond with a JSON object. Ensure it contains the following keys exactly:
      - schemeName (String)
      - eligibility (Array of Strings summarizing who qualifies)
      - documents (Array of Strings summarizing required certificates)
      - deadline (String in YYYY-MM-DD format, or null if not found)
      - instructions (Array of Strings summarizing application steps)
      - benefitAmount (String describing the financial or other benefit)
      - contactInformation (String describing helpline or website)

      Notice Text:
      """
      ${extractedText}
      """
    `;
    
    try {
      const responseText = await queryAI(prompt, "You are a helpful assistant that parses official Indian government welfare and scholarship notices into clean structured JSON formats.");
      const parsed = cleanAndParseJson(responseText);
      if (parsed) return parsed;
    } catch (err) {
      console.error('Groq API call failed, falling back to simulation:', err.message);
    }
    return simulateNoticeAnalysis(extractedText);
  },

  // Eligibility Checker
  checkUserEligibility: async (userData, scheme) => {
    if (!hasApiKey) {
      // Local simulation
      return simulateEligibilityCheck(userData, scheme);
    }

    const prompt = `
      Analyze whether the user is eligible for the specified scheme.
      User Profile:
      ${JSON.stringify(userData)}

      Scheme Details:
      ${JSON.stringify(scheme)}

      You must return a JSON object with:
      - status (String: 'eligible', 'not_eligible', or 'partial')
      - matchPercentage (Number between 0 and 100)
      - reasons (Array of Strings explaining why they qualify or fail to qualify, with checkbox icons)
      - missingCriteria (Array of Strings listing the eligibility items they did not meet)
    `;

    try {
      const responseText = await queryAI(prompt, "You are a government eligibility auditor. Calculate compatibility accurately based on rules.");
      return cleanAndParseJson(responseText) || simulateEligibilityCheck(userData, scheme);
    } catch (err) {
      return simulateEligibilityCheck(userData, scheme);
    }
  },

  // Document Verification
  verifyDocumentText: async (docType, docText) => {
    if (!hasApiKey) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      return simulateDocumentVerification(docType, docText);
    }

    const prompt = `
      Perform validation checks on the text extracted from an uploaded document of type: "${docType}".
      Extracted Document Text:
      """
      ${docText}
      """

      Analyze:
      1. Are core details present? (e.g. name of person, unique document/ID number, issuing authority)
      2. Does the document seem expired? (look for dates, financial year limitations)
      3. List any issues.

      You must return a JSON object containing:
      - type (String matching the input docType)
      - status (String: 'verified', 'partial', 'expired', or 'missing')
      - fields (Object with boolean values for 'name', 'id', and 'date')
      - validity (Object with 'valid' as boolean, and 'expires' as String date or 'Permanent')
      - issues (Array of Strings listing problems found, or empty)
      - action (String recommending next steps)
    `;

    try {
      const responseText = await queryAI(prompt, "You are a document auditing engine. Cross check names, ID presence, and dates from raw OCR string.");
      return cleanAndParseJson(responseText) || simulateDocumentVerification(docType, docText);
    } catch (err) {
      return simulateDocumentVerification(docType, docText);
    }
  },

  // AI Explanation Engine
  explainText: async (text) => {
    if (!hasApiKey) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return simulateExplanation(text);
    }

    const prompt = `
      Explain the following official government language in simple, friendly, easy-to-understand terms.
      
      Original Government Text:
      """
      ${text}
      """

      You must respond in JSON with:
      - explanation (String: a simple paragraph explanation in English/Hindi style that a layperson can read)
      - actionRequired (Array of Strings listing steps the citizen must do)
      - importantNotes (Array of Strings highlighting traps, dates, or validity details)
    `;

    try {
      const responseText = await queryAI(prompt, "You are a citizen assistant. Translate complex administrative jargon into extremely clear, plain-language instruction.");
      return cleanAndParseJson(responseText) || simulateExplanation(text);
    } catch (err) {
      return simulateExplanation(text);
    }
  }
};
