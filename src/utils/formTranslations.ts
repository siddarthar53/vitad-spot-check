export type Language = "english" | "hindi" | "telugu";

export const formTranslations = {
  english: {
    title: "VITAMIN D DEFICIENCY RISK ASSESSMENT QUESTIONNAIRE",
    name: "Name",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    height: "Height",
    feet: "ft",
    inches: "Inch",
    weight: "Weight",
    comorbidities: "Co-morbidities",
    diabetes: "Diabetes",
    hypertension: "Hypertension",
    hypothyroidism: "Hypothyroidism",
    hyperthyroidism: "Hyperthyroidism",
    other: "Any other",
    patientInitials: "Patient Initials",
    heightFeet: "Height (Feet)",
    heightInches: "Height (Inches)",
    weightKg: "Weight (kg)",
    otherComorbidity: "Other Comorbidity",
    sectionA: "Section A: Basic Information",
    sectionB: "Section B: Questionnaire",
    cancel: "Cancel",
    calculate: "Calculate Score",
    selectGender: "Select gender",
    selectLanguage: "Select Language",
    
    questions: {
      q1: {
        text: "Time Outdoors: On a typical day, how much time do you spend in the sun (between 11 AM - 3 PM) with your face, arms, and legs fully exposed?",
        options: ["More than 30 minutes", "Less than 30 minutes", "Negligible"]
      },
      q2: {
        text: "Clothing Style: What is your typical style of clothing when outdoors?",
        options: ["Shorts, t-shirts, skirts", "Partial coverage (e.g. Saree, half-sleeve salwar)", "Full coverage (e.g. Burqa, full-sleeve clothes)"]
      },
      q3: "Use of Sunscreen: Do you regularly apply sunscreen (SPF >15) on exposed skin before going out?",
      q4: "Location & Pollution: Do you live in a highly polluted urban area or a region with dense fog/smog?",
      q5: "Animal-based foods: No intake (strict vegetarian/vegan; no eggs, no fish)?",
      q6: "Milk/Fortified Food: Do you consume less than 2 cups of dairy/dairy products per day?",
      q7: "Do you consume egg yolks or fatty fish less than once per week?",
      q8: "Skin Pigmentation: Do you have darker skin tone?",
      q9: "Malabsorption Conditions: Do you have liver disease, IBD, Celiac disease, or Cystic Fibrosis?",
      q10: "Medications: Are you on long-term medication (Phenytoin, steroids, antifungals, antiretroviral)?",
      q11: "Osteoporosis: Have you been diagnosed with osteoporosis or experienced a low-trauma fracture?",
      q12: "Symptoms: Do you often experience bone/lower back pain, muscle weakness, or fatigue?"
    }
  },
  
  hindi: {
    title: "विटामिन D की कमी जोखिम मूल्यांकन प्रश्नावली",
    name: "नाम",
    age: "आयु",
    gender: "लिंग",
    male: "पुरुष",
    female: "महिला",
    height: "ऊंचाई",
    feet: "फीट",
    inches: "इंच",
    weight: "वजन",
    comorbidities: "सह-रुग्णता",
    diabetes: "मधुमेह",
    hypertension: "उच्च रक्तचाप",
    hypothyroidism: "हाइपोथायरायडिज्म",
    hyperthyroidism: "हाइपरथायरायडिज्म",
    other: "कोई अन्य",
    patientInitials: "रोगी के आद्याक्षर",
    heightFeet: "ऊंचाई (फीट)",
    heightInches: "ऊंचाई (इंच)",
    weightKg: "वजन (किलो)",
    otherComorbidity: "अन्य रुग्णता",
    sectionA: "खंड A: बुनियादी जानकारी",
    sectionB: "खंड B: प्रश्नावली",
    cancel: "रद्द करें",
    calculate: "स्कोर की गणना करें",
    selectGender: "लिंग चुनें",
    selectLanguage: "भाषा चुनें",
    
    questions: {
      q1: {
        text: "बाहर समय: एक सामान्य दिन में, आप धूप में कितना समय बिताते हैं (सुबह 11 बजे से दोपहर 3 बजे के बीच)?",
        options: ["30 मिनट से अधिक", "30 मिनट से कम", "नगण्य"]
      },
      q2: {
        text: "कपड़ों की शैली: बाहर जाते समय आपकी कपड़ों की सामान्य शैली क्या है?",
        options: ["शॉर्ट्स, टी-शर्ट, स्कर्ट", "आंशिक कवरेज (जैसे साड़ी, आधी बाजू)", "पूर्ण कवरेज (जैसे बुर्का, पूरी बाजू के कपड़े)"]
      },
      q3: "सनस्क्रीन का उपयोग: क्या आप बाहर जाने से पहले नियमित रूप से सनस्क्रीन (SPF >15) लगाते हैं?",
      q4: "स्थान और प्रदूषण: क्या आप अत्यधिक प्रदूषित शहरी क्षेत्र में रहते हैं?",
      q5: "पशु-आधारित खाद्य पदार्थ: क्या आप शुद्ध शाकाहारी हैं (कोई अंडा नहीं, कोई मछली नहीं)?",
      q6: "दूध/फोर्टिफाइड भोजन: क्या आप प्रतिदिन 2 कप से कम डेयरी उत्पाद लेते हैं?",
      q7: "क्या आप सप्ताह में एक बार से कम अंडे या मछली खाते हैं?",
      q8: "त्वचा का रंग: क्या आपकी त्वचा का रंग गहरा है?",
      q9: "अवशोषण की स्थिति: क्या आपको यकृत रोग, IBD, सीलिएक रोग है?",
      q10: "दवाएं: क्या आप दीर्घकालिक दवाएं (फ़िनाइटोइन, स्टेरॉयड) ले रहे हैं?",
      q11: "ऑस्टियोपोरोसिस: क्या आपको ऑस्टियोपोरोसिस का निदान हुआ है?",
      q12: "लक्षण: क्या आप अक्सर हड्डी/पीठ के निचले हिस्से में दर्द, मांसपेशियों की कमजोरी महसूस करते हैं?"
    }
  },
  
  telugu: {
    title: "విటమిన్ D లోపం ప్రమాద అంచనా ప్రశ్నావళి",
    name: "పేరు",
    age: "వయస్సు",
    gender: "లింగం",
    male: "పురుషుడు",
    female: "మహిళ",
    height: "ఎత్తు",
    feet: "అడుగులు",
    inches: "అంగుళాలు",
    weight: "బరువు",
    comorbidities: "అనుబంధ వ్యాధులు",
    diabetes: "మధుమేహం",
    hypertension: "రక్తపోటు",
    hypothyroidism: "హైపోథైరాయిడిజం",
    hyperthyroidism: "హైపర్‌థైరాయిడిజం",
    other: "ఇతర వ్యాధులు",
    patientInitials: "రోగి పేరు మొదటి అక్షరాలు",
    heightFeet: "ఎత్తు (అడుగులు)",
    heightInches: "ఎత్తు (అంగుళాలు)",
    weightKg: "బరువు (కిలోలు)",
    otherComorbidity: "ఇతర వ్యాధి",
    sectionA: "విభాగం A: ప్రాథమిక సమాచారం",
    sectionB: "విభాగం B: ప్రశ్నావళి",
    cancel: "రద్దు చేయి",
    calculate: "స్కోర్ లెక్కించండి",
    selectGender: "లింగం ఎంచుకోండి",
    selectLanguage: "భాష ఎంచుకోండి",
    
    questions: {
      q1: {
        text: "బయట సమయం: సాధారణ రోజులో, మీరు ఎంత సమయం ఎండలో గడుపుతారు (ఉదయం 11 నుండి మధ్యాహ్నం 3 మధ్య)?",
        options: ["30 నిమిషాల కంటే ఎక్కువ", "30 నిమిషాల కంటే తక్కువ", "చాలా తక్కువ"]
      },
      q2: {
        text: "దుస్తుల శైలి: బయటికి వెళ్ళేటప్పుడు మీరు ఎలాంటి దుస్తులు ధరిస్తారు?",
        options: ["షార్ట్స్, టీ-షర్టులు, స్కర్టులు", "పాక్షిక కవరేజ్ (ఉదా. చీర, సగం చేతులు)", "పూర్తి కవరేజ్ (ఉదా. బుర్ఖా, పూర్తి చేతుల దుస్తులు)"]
      },
      q3: "సన్‌స్క్రీన్ వాడకం: మీరు బయటికి వెళ్లేముందు క్రమం తప్పకుండా సన్‌స్క్రీన్ (SPF >15) రాసుకుంటారా?",
      q4: "స్థానం & కాలుష్యం: మీరు చాలా కాలుష్యం ఉన్న ప్రాంతంలో నివసిస్తున్నారా?",
      q5: "జంతు ఆహారం: మీరు పూర్తిగా శాకాహారం అనుసరిస్తున్నారా (గుడ్డు లేదు, చేప లేదు)?",
      q6: "పాలు/ఫోర్టిఫైడ్ ఫుడ్: మీరు రోజుకు 2 కప్పుల కంటే తక్కువ డెయిరీ ఉత్పత్తులు తీసుకుంటారా?",
      q7: "మీరు వారానికి ఒకసారి కంటే తక్కువ గుడ్లు లేదా చేపలు తింటారా?",
      q8: "చర్మ వర్ణం: మీకు ముదురు రంగు చర్మం ఉందా?",
      q9: "శోషణ పరిస్థితులు: మీకు కాలేయ వ్యాధి, IBD, సెలియాక్ వ్యాధి ఉందా?",
      q10: "మందులు: మీరు దీర్ఘకాలిక మందులు (ఫెనిటోయిన్, స్టెరాయిడ్లు) తీసుకుంటున్నారా?",
      q11: "ఆస్టియోపోరోసిస్: మీకు ఆస్టియోపోరోసిస్ నిర్ధారణ జరిగిందా?",
      q12: "లక్షణాలు: మీరు తరచుగా ఎముక/వెన్ను నొప్పి, కండరాల బలహీనత అనుభవిస్తున్నారా?"
    }
  }
};
