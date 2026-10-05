// Data store for Ali Internet & Xerox (আলি ইন্টারনেট এন্ড জেরক্স)
// Bilingual content (English & Bengali)

const SHOP_DATA = {
  phone: "9734573323",
  phoneFormatted: "+91 97345 73323",
  email: "allinternetpuncha@gmail.com",
  proprietor: {
    en: "Sekh Faruk Ali",
    bn: "সেখ ফারুক আলি"
  },
  shopName: {
    en: "Ali Internet & Xerox",
    bn: "আলি ইন্টারনেট এন্ড জেরক্স"
  },
  tagline: {
    en: "Puncha's Trusted All-In-One Digital Service, Printing & Insurance Center",
    bn: "পুঞ্চার নির্ভরযোগ্য অনলাইন সেবা, প্রিন্টিং ও ইন্স্যুরেন্স সেন্টার"
  },
  address: {
    en: "Opposite Krishi Farm, Puncha, Purulia, West Bengal - 723151",
    bn: "কৃষি ফার্মের বিপরীতে, পুঞ্চা, পুরুলিয়া, পশ্চিমবঙ্গ — ৭২৩১৫১"
  },
  googleMapsUrl: "https://www.google.com/maps/dir/?api=1&destination=23.165622,86.655718",
  coordinates: {
    lat: 23.165622,
    lng: 86.655718
  },
  openingHours: {
    openHour: 8, // 8:00 AM
    closeHour: 21, // 9:00 PM
    display: {
      en: "Monday – Sunday: 8:00 AM – 9:00 PM",
      bn: "সোম – রবি: সকাল ৮:০০ টা – রাত ৯:০০ টা"
    }
  },

  // Document checklist database for citizen services
  documentGuides: [
    {
      id: "ration",
      category: "citizen",
      icon: "🌾",
      title: {
        en: "Digital Ration Card (Apply / Correction / Shift)",
        bn: "ডিজিটাল রেশন কার্ড (নতুন আবেদন / সংশোধন / পরিবার যোগ)"
      },
      shortDesc: {
        en: "New family member addition, category change (AAY/SPHH/PHH/RKSY), and Aadhaar linking.",
        bn: "নতুন সদস্যের নাম তোলা, ক্যাটাগরি পরিবর্তন ও আধার লিংক।"
      },
      documents: {
        en: [
          "Aadhaar card of all family members (original or clear copy)",
          "Existing Head of Family's Ration Card",
          "Active mobile number (for OTP verification)",
          "Birth certificate (for children below 5 years without Aadhaar)",
          "Address proof if shifting residence"
        ],
        bn: [
          "পরিবারের সকল সদস্যের আধার কার্ড (আসল বা স্পষ্ট কপি)",
          "পরিবার প্রধানের বর্তমান ডিজিটাল রেশন কার্ড",
          "চালু মোবাইল ফোন (ওটিপি ভেরিফিকেশনের জন্য সাথে আনতে হবে)",
          "৫ বছরের নিচের শিশুদের জন্য জন্ম শংসাপত্র (যদি আধার না থাকে)",
          "ঠিকানা বদলের ক্ষেত্রে সংশ্লিষ্ট পঞ্চায়েত / পৌরসভা প্রমাণপত্র"
        ]
      },
      turnaround: { en: "15 - 30 Days (Govt Approval)", bn: "১৫ - ৩০ কার্যদিবস (সরকারি অনুমোদন সাপেক্ষ)" },
      feeHint: { en: "Govt Portal Filing Fee + Min. Service Charge", bn: "সরকারি পোর্টাল আবেদন ফি + ন্যূনতম সার্ভিস চার্জ" }
    },
    {
      id: "driving-license",
      category: "transport",
      icon: "🚗",
      title: {
        en: "Driving License & Learner License (Sarathi)",
        bn: "ড্রাইভিং লাইসেন্স ও লার্নার লাইসেন্স (সারথী পোর্টাল)"
      },
      shortDesc: {
        en: "Motorcycle (MCWG) and Light Motor Vehicle (LMV/Car) license slot booking & online test preparation.",
        bn: "বাইক ও চারচাকা গাড়ির নতুন লার্নার আবেদন, টেস্ট স্লট বুকিং ও ফাইনাল ডিএল।"
      },
      documents: {
        en: [
          "Aadhaar Card with updated mobile number for e-KYC OTP",
          "Age Proof: Madhyamik Admit Card / Birth Certificate / School Leaving",
          "Blood Group lab test report",
          "2 recent passport-size color photographs",
          "Medical Fitness Form 1A (if required for commercial/senior citizens)"
        ],
        bn: [
          "আধার কার্ড (মোবাইল নম্বর যুক্ত থাকতে হবে e-KYC এর জন্য)",
          "বয়সের প্রমাণ: মাধ্যমিক অ্যাডমিট / জন্ম শংসাপত্র / স্কুল লিভিং",
          "ব্লাড গ্রুপ রিপোর্ট (ল্যাব টেস্ট সার্টিফিকেট)",
          "২ কপি সাম্প্রতিক পাসপোর্ট সাইজ রঙিন ছবি",
          "মেডিক্যাল সার্টিফিকেট Form 1A (প্রয়োজনীয় ক্ষেত্রে)"
        ]
      },
      turnaround: { en: "Learner: Same Day slot | DL: After 30 days test", bn: "লার্নার: তাৎক্ষণিক স্লট | ফাইনাল ডিএল: টেস্টের পর" },
      feeHint: { en: "As per Parivahan official fee schedule", bn: "পরিবহণ দপ্তরের নির্দিষ্ট সরকারি ফি অনুযায়ী" }
    },
    {
      id: "pan",
      category: "citizen",
      icon: "💳",
      title: {
        en: "Instant PAN Card (New / Correction / Reprint)",
        bn: "নতুন প্যান কার্ড ও সংশোধন (Instant PAN / NSDL)"
      },
      shortDesc: {
        en: "Instant e-PAN within 2 hours, Physical PVC card delivered to home in 7–10 days.",
        bn: "জরুরি ক্ষেত্রে মাত্র ২ ঘণ্টায় ই-প্যান এবং ৭-১০ দিনে বাড়িতে প্লাস্টিক প্যান কার্ড।"
      },
      documents: {
        en: [
          "Aadhaar Card (Name, DOB & Gender must match records)",
          "Aadhaar-linked Mobile number (for paperless instant e-Sign OTP)",
          "2 recent passport-size photos with white background (if applying without OTP)",
          "Old PAN copy (only if applying for name/DOB correction or duplicate)"
        ],
        bn: [
          "আধার কার্ড (নাম, জন্মতারিখ ও পিতা/স্বামীর নাম নির্ভুল থাকা বাঞ্ছনীয়)",
          "আধারে লিংক করা মোবাইল নম্বর (OTP এর মাধ্যমে ইনস্ট্যান্ট আবেদনের জন্য)",
          "২ কপি পাসপোর্ট সাইজ ছবি (অফলাইন ফিজিক্যাল স্বাক্ষরের ক্ষেত্রে)",
          "পুরোনো প্যান কার্ডের জেরক্স (শুধুমাত্র নাম/তথ্য সংশোধনের জন্য)"
        ]
      },
      turnaround: { en: "e-PAN: 2 Hours | Physical Card: 7-10 Days", bn: "ই-প্যান: ২ ঘণ্টা | প্লাস্টিক কার্ড: ৭-১০ দিন" },
      feeHint: { en: "Standard NSDL fee + Service charge", bn: "সরকারি NSDL ফি + সাধারণ সার্ভিস চার্জ" }
    },
    {
      id: "jamir-porcha",
      category: "land",
      icon: "📜",
      title: {
        en: "Land Records / Jamir Porcha & Map (Banglarbhumi)",
        bn: "জমির খতিয়ান, পর্চা ও প্লট ম্যাপ (বাংলারভূমি)"
      },
      shortDesc: {
        en: "ROR (Record of Rights), digitally signed RoR Porcha copy, and Mouza plot information.",
        bn: "ডিজিটাল স্বাক্ষরিত জমির সরকারি পর্চা, দাগের তথ্য ও মৌজা নকশা অনুসন্ধান।"
      },
      documents: {
        en: [
          "District: Purulia | Block: Puncha (or relevant block)",
          "Mouza Name and JL Number",
          "Khatian Number OR Plot (Dag) Number",
          "Registered applicant mobile number for OTP"
        ],
        bn: [
          "জেলা: পুরুলিয়া | ব্লক: পুঞ্চা (অথবা সংশ্লিষ্ট ব্লকের নাম)",
          "মৌজার নাম এবং জে.এল. (JL) নম্বর",
          "খতিয়ান নম্বর অথবা দাগ নম্বর",
          "আবেদনকারীর চালু মোবাইল নম্বর (বাংলারভূমি OTP এর জন্য)"
        ]
      },
      turnaround: { en: "Instant View | Certified Copy: 3-7 Days", bn: "তাৎক্ষণিক তথ্য দর্শন | সার্টিফাইড পর্চা: ৩-৭ দিন" },
      feeHint: { en: "₹20 Govt fee per page + Download & Print", bn: "সরকারি ফি ২০ টাকা + ডাউনলোড ও প্রিন্ট চার্জ" }
    },
    {
      id: "vehicle-insurance",
      category: "transport",
      icon: "🛡️",
      title: {
        en: "Vehicle Insurance (Bike, Car, Tractor, Commercial)",
        bn: "গাড়ির ইন্স্যুরেন্স (বাইক, কার, ট্র্যাক্টর ও বাণিজ্যিক গাড়ি)"
      },
      shortDesc: {
        en: "Instant policy issuance from top insurers (ICICI, Digit, Reliance, Oriental). Zero inspection.",
        bn: "আলি ইন্স্যুরেন্স পয়েন্ট থেকে মুহূর্তের মধ্যে বাইক ও চারচাকার পলিসি রিনিউয়াল।"
      },
      documents: {
        en: [
          "Vehicle Registration Certificate (RC Book / Smart Card)",
          "Previous year's Insurance policy paper (if available)",
          "Pollution Certificate (PUC)",
          "Owner's Aadhaar / PAN card for KYC"
        ],
        bn: [
          "গাড়ির আরসি বুক (RC Smart Card বা গাড়ির ব্লু বুক)",
          "গত বছরের পুরোনো ইন্স্যুরেন্স পলিসির কপি (যদি থাকে)",
          "পলিউশন সার্টিফিকেট (PUC)",
          "গাড়ির মালিকের আধার কার্ড অথবা প্যান কার্ড"
        ]
      },
      turnaround: { en: "Instant (5 to 10 Minutes)", bn: "তাৎক্ষণিক (৫ থেকে ১০ মিনিটেই পলিসি প্রিন্ট)" },
      feeHint: { en: "Best market premium rates + Instant Printout", bn: "সরকারি রেট ও সর্বোচ্চ ছাড় সহ প্রিমিয়াম" }
    },
    {
      id: "voter-id",
      category: "citizen",
      icon: "🗳️",
      title: {
        en: "Voter Card (New Registration, Shifting & Correction)",
        bn: "ভোটার কার্ড (নতুন নাম তোলা Form 6, সংশোধন Form 8)"
      },
      shortDesc: {
        en: "ECI National Voter Services Portal (NVSP) Form 6, 7, 8, Aadhaar-Voter linking (Form 6B).",
        bn: "১৮ বছর বয়সীদের নতুন ভোটার কার্ড, ঠিকানা বদল ও মোবাইল নম্বর লিংক।"
      },
      documents: {
        en: [
          "Aadhaar Card of the applicant",
          "Age Proof: Birth Certificate, 10th Admit, or Passport",
          "Address Proof: Family Electricity Bill, Water Bill, or Land Deed",
          "Voter ID of any family member (Father / Mother / Spouse) for Part/Serial number",
          "1 passport size photo with white background"
        ],
        bn: [
          "আবেদনকারীর আধার কার্ড",
          "বয়সের প্রমাণ: জন্ম শংসাপত্র / মাধ্যমিক অ্যাডমিট / প্যান",
          "ঠিকানার প্রমাণ: পরিবারের বিদ্যুৎ বিল / জমির দলিল / ব্যাংক পাসবুক",
          "পরিবারের যেকোনো সদস্যের ভোটার কার্ড (বাবা/মা/স্বামীর পার্ট ও ক্রমিক নম্বর)",
          "১ কপি পাসপোর্ট সাইজ রঙিন ছবি"
        ]
      },
      turnaround: { en: "BLO Verification: 15-45 Days", bn: "বিএলও (BLO) ভেরিফিকেশন সাপেক্ষে ১৫-৪৫ দিন" },
      feeHint: { en: "Govt portal is free | Nominal shop filing charge", bn: "সরকারি পোর্টাল ফ্রি | সামান্য ফর্ম ফিলাপ চার্জ" }
    },
    {
      id: "trade-food-license",
      category: "land",
      icon: "🏪",
      title: {
        en: "Trade License & Food Safety License (FSSAI)",
        bn: "ট্রেড লাইসেন্স ও খাদ্য সুরক্ষা লাইসেন্স (FSSAI)"
      },
      shortDesc: {
        en: "Panchayat Trade License (Silpasathi) and FSSAI registration for grocery, tea stall, hotel, and shops.",
        bn: "গ্রাম পঞ্চায়েতের সিল্কসাথী ট্রেড লাইসেন্স এবং মুদি, মিষ্টি, হোটেলের FSSAI লাইসেন্স।"
      },
      documents: {
        en: [
          "Shop Owner Aadhaar and PAN card",
          "Shop rent agreement OR Tax receipt / Land deed of shop premises",
          "Shop photo with signboard banner visible",
          "Passport photo of proprietor",
          "Active mobile number and email"
        ],
        bn: [
          "দোকান মালিকের আধার কার্ড ও প্যান কার্ড",
          "দোকানের খাজনা রসিদ / দলিলের জেরক্স / ভাড়ার চুক্তিপত্র",
          "দোকানের সামনের সাইনবোর্ড সহ পরিষ্কার ছবি",
          "মালিকের ১ কপি পাসপোর্ট সাইজ ছবি",
          "চালু মোবাইল নম্বর ও ইমেল আইডি"
        ]
      },
      turnaround: { en: "Trade: 2-3 Days | FSSAI: 5-7 Days", bn: "ট্রেড লাইসেন্স: ২-৩ দিন | খাদ্য লাইসেন্স: ৫-৭ দিন" },
      feeHint: { en: "Govt fee based on turnover + Service fee", bn: "সরকারি ফি + অনলাইন প্রসেসিং ফি" }
    },
    {
      id: "udyam-msme",
      category: "land",
      icon: "🏭",
      title: {
        en: "Udyam / MSME & Professional Tax (P-Tax)",
        bn: "উদ্যম রেজিস্ট্রেশন (MSME) এবং প্রফেশনাল ট্যাক্স (P-Tax)"
      },
      shortDesc: {
        en: "Official Government of India MSME Certificate for bank business loans & subsidies.",
        bn: "ব্যাংক লোন ও সরকারি সুযোগ-সুবিধার জন্য কেন্দ্রীয় সরকারের উদ্যম সার্টিফিকেট।"
      },
      documents: {
        en: [
          "Proprietor Aadhaar Card (OTP linked)",
          "Proprietor / Firm PAN Card",
          "Bank Account Number & IFSC code",
          "Business Name, Start Date, and Nature of work",
          "Number of employees (if any)"
        ],
        bn: [
          "মালিকের আধার কার্ড (ওটিপি আবশ্যক)",
          "মালিকের প্যান কার্ড",
          "ব্যাংক অ্যাকাউন্ট নম্বর ও IFSC কোড",
          "ব্যবসার সঠিক নাম, শুরুর তারিখ ও কাজের বিবরণ",
          "কর্মচারী সংখ্যা (যদি থাকে)"
        ]
      },
      turnaround: { en: "Instant Certificate Generation (10 Minutes)", bn: "১০ মিনিটেই ডিজিটাল সার্টিফিকেট জেনারেট" },
      feeHint: { en: "Zero Govt Fee | Online filing charge only", bn: "সরকারি ফি নেই | শুধু ফর্ম ফিলাপ চার্জ" }
    },
    {
      id: "job-form-fillup",
      category: "student",
      icon: "🎓",
      title: {
        en: "Job & University Exam Form Fill-up",
        bn: "সরকারি চাকরি ও কলেজ/বিশ্ববিদ্যালয় ফর্ম ফিলাপ"
      },
      shortDesc: {
        en: "WBP, WBPSC, SSC, Railway, TET, College Admissions with accurate photo/signature resizing.",
        bn: "পুলিশ, এসএসসি, রেল, টেট ও কলেজের নিখুঁত ছবি ও সাইন সাইজিং সহ ফর্ম জমা।"
      },
      documents: {
        en: [
          "Madhyamik, Higher Secondary, and Graduation Marksheets & Certificates",
          "Caste Certificate (SC / ST / OBC-A / OBC-B / EWS) if applicable",
          "1 passport photo (recently taken)",
          "Signature on white paper with black/blue pen",
          "Valid Email ID and Mobile number for OTPs"
        ],
        bn: [
          "মাধ্যমিক, উচ্চমাধ্যমিক ও কলেজের মার্কশিট এবং সার্টিফিকেট",
          "জাতিগত শংসাপত্র (SC / ST / OBC / EWS) যদি প্রযোজ্য হয়",
          "সাম্প্রতিক পাসপোর্ট সাইজ ছবি",
          "সাদা কাগজে কালো/নীল কালিতে পরিষ্কার সই",
          "চালু ইমেল আইডি ও মোবাইল নম্বর"
        ]
      },
      turnaround: { en: "Instant Acknowledgment Printout", bn: "তাৎক্ষণিক আবেদনের প্রমাণপত্র ও রসিদ প্রিন্ট" },
      feeHint: { en: "Exam application fee + Nominal cyber cafe charge", bn: "পরীক্ষার সরকারি ফি + সাইবার ক্যাফে চার্জ" }
    },
    {
      id: "rubber-stamp",
      category: "land",
      icon: "🔏",
      title: {
        en: "Custom Rubber Stamp & Seal Making",
        bn: "রবার স্ট্যাম্প ও অফিস সিল তৈরি"
      },
      shortDesc: {
        en: "Official, doctor, advocate, business, school, and signature rubber stamps made with high-durability polymer.",
        bn: "অফিস, ডাক্তার, উকিল, ব্যবসা, স্কুল ও স্বাক্ষর স্ট্যাম্প — উন্নত মানের দীর্ঘস্থায়ী পলিমার।"
      },
      documents: {
        en: [
          "Stamp Matter / Text (Design, Name, Designation, Address)",
          "Organization Letterhead or Trade License (for official/business stamps)",
          "Doctor Registration / Advocate Bar Certificate (for professional seals)",
          "Choice of format: Standard Wooden Handle, Self-Inking Dater, or Pocket Stamp"
        ],
        bn: [
          "স্ট্যাম্পের বিষয়বস্তু / লেখা (নাম, পদবী, প্রতিষ্ঠানের নাম ও ঠিকানা)",
          "প্রতিষ্ঠানের লেটারহেড অথবা ট্রেড লাইসেন্স (অফিস বা ব্যবসার সিলের জন্য)",
          "ডাক্তার বা উকিলের রেজিস্ট্রেশন প্রমাণপত্র (পেশাগত সিলের ক্ষেত্রে)",
          "স্ট্যাম্পের ধরন পছন্দ: সাধারণ কাঠের হাতল, সেল্ফ-ইঙ্কিং বা পকেট স্ট্যাম্প"
        ]
      },
      turnaround: { en: "Same Day or 24 Hours", bn: "একই দিনে বা ২৪ ঘণ্টার মধ্যে ডেলিভারি" },
      feeHint: { en: "Starting from ₹120 (based on size & type)", bn: "মাত্র ₹১২০ থেকে শুরু (সাইজ ও মডেল অনুযায়ী)" }
    }
  ],

  // Full Catalog of 18+ services organized in 4 pillars
  serviceCategories: [
    {
      id: "citizen",
      title: { en: "Citizen & Govt Services", bn: "সরকারি ও নাগরিক সেবা" },
      icon: "🏛️",
      items: [
        { name: { en: "Digital Ration Card", bn: "ডিজিটাল রেশন কার্ড" }, badge: "High Demand" },
        { name: { en: "PAN Card (New / Correction)", bn: "প্যান কার্ড (নতুন ও সংশোধন)" }, badge: "Instant e-PAN" },
        { name: { en: "Voter Card (NVSP Form 6 & 8)", bn: "ভোটার কার্ড ও সংশোধন" }, badge: "" },
        { name: { en: "Jamir Porcha (Banglarbhumi)", bn: "জমির খতিয়ান ও পর্চা" }, badge: "Official Copy" },
        { name: { en: "Trade License (Panchayat)", bn: "ট্রেড লাইসেন্স" }, badge: "" },
        { name: { en: "Food License (FSSAI)", bn: "ফুড সেফটি লাইসেন্স" }, badge: "" },
        { name: { en: "MSME / Udyam Registration", bn: "উদ্যম রেজিস্ট্রেশন" }, badge: "Govt Certified" },
        { name: { en: "Professional Tax (P-Tax)", bn: "প্রফেশনাল ট্যাক্স" }, badge: "" }
      ]
    },
    {
      id: "transport",
      title: { en: "Transport & Ali Insurance Point", bn: "গাড়ির কাজ ও আলি ইন্স্যুরেন্স পয়েন্ট" },
      icon: "🛡️",
      items: [
        { name: { en: "Bike / Two-Wheeler Insurance", bn: "বাইকের ইন্স্যুরেন্স" }, badge: "Best Rates" },
        { name: { en: "Car & Auto Insurance", bn: "গাড়ি ও অটোর ইন্স্যুরেন্স" }, badge: "Instant Print" },
        { name: { en: "Tractor & Commercial Vehicle Insurance", bn: "ট্র্যাক্টর ও বাণিজ্যিক গাড়ি" }, badge: "" },
        { name: { en: "Driving License & Slot Booking", bn: "ড্রাইভিং লাইসেন্স ও স্লট" }, badge: "Sarathi" },
        { name: { en: "Commercial Vehicle Tax & Fitness", bn: "গাড়ির ট্যাক্স ও ফিটনেস ফি" }, badge: "Parivahan" }
      ]
    },
    {
      id: "print",
      title: { en: "Printing & Xerox Desk", bn: "জেরক্স, প্রিন্ট ও বাইন্ডিং" },
      icon: "🖨️",
      items: [
        { name: { en: "High-Speed B&W Xerox", bn: "সাদাকালো দ্রুত জেরক্স" }, badge: "₹2/page" },
        { name: { en: "High-Gloss Color Print", bn: "উজ্জ্বল কালার প্রিন্ট" }, badge: "Best Quality" },
        { name: { en: "Instant Digital Passport Photo", bn: "ডিজিটাল পাসপোর্ট ছবি" }, badge: "5 Mins" },
        { name: { en: "Document Lamination (A4 / Legal)", bn: "লেমিনেশন (সুরক্ষিত রাখুন)" }, badge: "" },
        { name: { en: "Spiral Binding (Project / Notes)", bn: "স্পাইরাল বাইন্ডিং" }, badge: "Neat Finish" },
        { name: { en: "Custom Rubber Stamp Making", bn: "রবার স্ট্যাম্প তৈরি" }, badge: "Custom Order" }
      ]
    },
    {
      id: "retail",
      title: { en: "Students & Accessories", bn: "স্টুডেন্ট ও মোবাইল সামগ্রী" },
      icon: "🎒",
      items: [
        { name: { en: "Job & College Form Fill-up", bn: "চাকরি ও পরীক্ষার ফর্ম ফিলাপ" }, badge: "Expert Help" },
        { name: { en: "Mobile Accessories (Chargers, Cables)", bn: "মোবাইল চার্জার, ডাটা কেবল" }, badge: "" },
        { name: { en: "Earphones & OTG Connectors", bn: "ইয়ারফোন ও ওটিজি" }, badge: "" },
        { name: { en: "Pens, Notebooks & Exam Stationery", bn: "পরীক্ষার খাতা ও কলম" }, badge: "" },
        { name: { en: "Chilled Mineral Water", bn: "বিশুদ্ধ পানীয় জল" }, badge: "" }
      ]
    }
  ],

  // Quick Print price estimator options
  printPricing: {
    bwXerox: { label: { en: "B&W Xerox / Print (সাদাকালো)", bn: "সাদাকালো জেরক্স / প্রিন্ট" }, rate: 2, unit: "page" },
    colorPrint: { label: { en: "Color Printout (কালার প্রিন্ট)", bn: "কালার প্রিন্ট" }, rate: 10, unit: "page" },
    photoPassport: { label: { en: "Passport Photos (8 Copies Sheet)", bn: "পাসপোর্ট ছবি (৮ কপি শিট)" }, rate: 40, unit: "sheet" },
    lamination: { label: { en: "A4 Lamination (লেমিনেশন)", bn: "A4 লেমিনেশন" }, rate: 20, unit: "doc" },
    spiralBinding: { label: { en: "Spiral Binding (স্পাইরাল বাইন্ডিং)", bn: "স্পাইরাল বাইন্ডিং" }, rate: 35, unit: "book" },
    rubberStamp: { label: { en: "Custom Rubber Stamp (রবার স্ট্যাম্প)", bn: "রবার স্ট্যাম্প তৈরি" }, rate: 120, unit: "stamp" }
  },

  // Frequently Asked Questions
  faqs: [
    {
      q: {
        en: "Can I get official rubber stamps made for my school, office, or business?",
        bn: "আপনার দোকানে কি স্কুল, অফিস বা ব্যবসার রবার স্ট্যাম্প তৈরি করা হয়?"
      },
      a: {
        en: "Yes! We make high-quality custom polymer rubber stamps and self-inking seals for schools, gram panchayats, doctors, advocates, shops, and businesses. You can send the stamp text via WhatsApp or bring it directly to the counter.",
        bn: "হ্যাঁ! আমাদের দোকানে স্কুল, গ্রাম পঞ্চায়েত, ডাক্তার, উকিল, দোকান ও ব্যবসার জন্য উন্নত মানের রবার স্ট্যাম্প এবং সেল্ফ-ইঙ্কিং সিল তৈরি করা হয়। আপনি হোয়াটসঅ্যাপে লেখা পাঠাতে পারেন অথবা সরাসরি দোকানে এসে অর্ডার দিতে পারেন।"
      }
    },
    {
      q: {
        en: "Can I send my documents on WhatsApp and collect the printout later?",
        bn: "আমি কি হোয়াটসঅ্যাপে ডকুমেন্ট পাঠিয়ে পরে প্রিন্ট তুলে নিতে পারি?"
      },
      a: {
        en: "Yes! Use the WhatsApp Print button on this website or message Faruk directly at 9734573323 with your file and requirements. We'll have it printed and ready for you.",
        bn: "হ্যাঁ, নিশ্চয়ই! এই ওয়েবসাইটের হোয়াটসঅ্যাপ বোতাম টিপে অথবা সরাসরি ৯৭৩৪৫৭৩৩২৩ নম্বরে ফারুক কে ফাইল পাঠিয়ে দিন। দোকানে এসে সরাসরি রেডি প্রিন্ট পেয়ে যাবেন, লাইনে দাঁড়াতে হবে না।"
      }
    },
    {
      q: {
        en: "Where is the shop located in Puncha?",
        bn: "পুঞ্চায় দোকানটি ঠিক কোন জায়গায় অবস্থিত?"
      },
      a: {
        en: "The shop is located right opposite the Krishi Farm (Agriculture Farm) on the main road in Puncha, Purulia (PIN 723151). You can click 'Get Directions' to open exact Google Maps navigation.",
        bn: "দোকানটি পুঞ্চা মেইন রোডে কৃষি ফার্মের ঠিক উল্টোদিকে (Opposite Krishi Farm) অবস্থিত। ওয়েবসাইটে 'দোকানের রাস্তা / ম্যাপ' বোতামে ক্লিক করলেই গুগল ম্যাপে সঠিক পথ দেখতে পাবেন।"
      }
    },
    {
      q: {
        en: "Can I get my bike or car insurance renewed here?",
        bn: "এখানে কি বাইক ও চারচাকা গাড়ির ইন্স্যুরেন্স করানো হয়?"
      },
      a: {
        en: "Yes! At 'Ali Insurance Point', we provide instant insurance renewal for all bikes, cars, tractors, and commercial vehicles with immediate policy printouts.",
        bn: "হ্যাঁ! 'আলি ইন্স্যুরেন্স পয়েন্ট' থেকে সমস্ত কোম্পানির বাইক, কার, অটো, ট্র্যাক্টর ও গাড়ির ইন্স্যুরেন্স পলিসি মাত্র ১০ মিনিটে প্রিন্ট সহ করিয়ে দেওয়া হয়।"
      }
    },
    {
      q: {
        en: "What should I bring if I want to apply for a new Ration or Voter Card?",
        bn: "নতুন রেশন বা ভোটার কার্ড করতে কী কী সাথে আনা প্রয়োজন?"
      },
      a: {
        en: "Check our 'Document Guide' section above. Mainly, you need your Aadhaar card linked with an active mobile phone (for OTP), proof of address, and passport photos.",
        bn: "উপরের 'ডকুমেন্ট চেকলিস্ট' বিভাগে সম্পূর্ণ তালিকা দেওয়া আছে। মূলত আধার কার্ড (ওটিপি পাওয়ার জন্য চালু মোবাইল সহ), ঠিকানার প্রমাণপত্র ও ছবি নিয়ে আসবেন।"
      }
    }
  ]
};
