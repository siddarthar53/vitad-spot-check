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
    select: "Select",
    yes: "Yes",
    no: "No",
    sometimes: "Sometimes",
    often: "Often/Severe",
    dark: "Dark",
    wheatish: "Wheatish",
    fair: "Fair",
    veryFair: "Very Fair",
    shorts: "Shorts, t-shirts, skirts",
    partialCoverage: "Partial coverage (e.g. Saree, half-sleeve)",
    fullCoverage: "Full coverage (e.g. Burqa, full-sleeve)",
    more30Min: "More than 30 minutes",
    less30Min: "Less than 30 minutes",
    negligible: "Negligible",
    noIntake: "No intake (strict vegetarian/vegan)",
    occasionalIntake: "Occasional intake",
    regularIntake: "Regular intake (fish ≥1/week)",
    
    questions: {
      q1: {
        text: "Age: Are you above 50 years of age?",
        options: ["Yes", "No"]
      },
      q2: {
        text: "Body Type: Is your Body Mass Index (BMI) ≥ 30 kg/m² (Overweight/Obese)?",
        options: ["Yes", "No"]
      },
      q3: {
        text: "Skin Pigmentation: What is your skin tone?",
        options: ["Dark", "Wheatish", "Fair", "Very Fair"]
      },
      q4: {
        text: "Clothing Style: What is your typical style of clothing when outdoors?",
        options: ["Shorts, t-shirts, skirts", "Partial coverage (e.g. Saree, half-sleeve salwar)", "Full coverage (e.g. Burqa, full-sleeve clothes)"]
      },
      q5: {
        text: "Time Outdoors: On a typical day, how much time do you spend in the sun (between 11 AM - 3 PM) with your face, arms, and legs fully exposed?",
        options: ["More than 30 minutes", "Less than 30 minutes", "Negligible"]
      },
      q6: "Use of Sunscreen: Do you regularly apply sunscreen (SPF >15) on exposed skin before going out?",
      q7: "Location & Pollution: Do you live in a highly polluted urban area or a region with dense fog/smog for a large part of the year?",
      q8: {
        text: "How often do you consume animal-based foods rich in Vitamin D (e.g., fish, eggs)?",
        options: ["No intake (strict vegetarian/vegan; no eggs, no fish)", "Occasional intake (eggetarian, eggs only few times/week, little or no fish)", "Regular intake (fish ≥1/week or eggs frequently)"]
      },
      q9: "Milk/Fortified Food intake: Do you consume less than 2 cups (servings) of dairy/dairy products per day?",
      q10: "Malabsorption Conditions: Do you have a diagnosed condition like Liver disease, IBD, Celiac disease, or Cystic Fibrosis that affects fat absorption?",
      q11: "Medications: Are you on long-term medication like Phenytoin, steroids, antifungals or antiretroviral that affects Vitamin D metabolism?",
      q12: "Osteoporosis Diagnosis: Have you been diagnosed with osteoporosis, osteopenia or experienced a low-trauma fracture?",
      q13: {
        text: "Bone or Lower Back Pain: Do you often experience bone or lower back pain, muscle weakness, or fatigue affecting daily activity?",
        options: ["No", "Sometimes", "Often/Severe"]
      },
      q14: {
        text: "Muscle Weakness: Do you experience muscle weakness, like trouble climbing stairs or getting up from a chair?",
        options: ["No", "Sometimes", "Often/Severe"]
      },
      q15: {
        text: "Fatigue: Do you feel tired or low in energy even after rest?",
        options: ["No", "Sometimes", "Often/Severe"]
      },
      q16: {
        text: "Frequency of Illness: Do you fall sick more often than others (colds, flu and infections)?",
        options: ["No", "Sometimes", "Often/Severe"]
      },
      q17: {
        text: "Mood and Concentration: Do you notice low mood, irritability, or difficulty concentrating?",
        options: ["No", "Sometimes", "Often/Severe"]
      },
      q18: "Vitamin D / Calcium Supplementation: Have you taken Vitamin D / Calcium supplementation (Current or past 3 months)?"
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
    select: "चुनें",
    yes: "हाँ",
    no: "नहीं",
    sometimes: "कभी-कभी",
    often: "अक्सर/गंभीर",
    dark: "गहरा",
    wheatish: "गेहुंआ",
    fair: "गोरा",
    veryFair: "बहुत गोरा",
    shorts: "शॉर्ट्स, टी-शर्ट, स्कर्ट",
    partialCoverage: "आंशिक कवरेज (जैसे साड़ी, आधी बाजू)",
    fullCoverage: "पूर्ण कवरेज (जैसे बुर्का, पूरी बाजू)",
    more30Min: "30 मिनट से अधिक",
    less30Min: "30 मिनट से कम",
    negligible: "नगण्य",
    noIntake: "कोई सेवन नहीं (शुद्ध शाकाहारी)",
    occasionalIntake: "कभी-कभी सेवन",
    regularIntake: "नियमित सेवन (मछली ≥1/सप्ताह)",
    
    questions: {
      q1: {
        text: "आयु: क्या आप 50 वर्ष से अधिक उम्र के हैं?",
        options: ["हाँ", "नहीं"]
      },
      q2: {
        text: "शारीरिक प्रकार: क्या आपका बॉडी मास इंडेक्स (BMI) ≥ 30 kg/m² (अधिक वजन/मोटापा) है?",
        options: ["हाँ", "नहीं"]
      },
      q3: {
        text: "त्वचा का रंग: आपकी त्वचा का रंग क्या है?",
        options: ["गहरा", "गेहुंआ", "गोरा", "बहुत गोरा"]
      },
      q4: {
        text: "कपड़ों की शैली: बाहर जाते समय आपके कपड़ों की सामान्य शैली क्या है?",
        options: ["शॉर्ट्स, टी-शर्ट, स्कर्ट", "आंशिक कवरेज (जैसे साड़ी, आधी बाजू)", "पूर्ण कवरेज (जैसे बुर्का, पूरी बाजू के कपड़े)"]
      },
      q5: {
        text: "बाहर समय: एक सामान्य दिन में, आप धूप में कितना समय बिताते हैं (सुबह 11 बजे से दोपहर 3 बजे के बीच)?",
        options: ["30 मिनट से अधिक", "30 मिनट से कम", "नगण्य"]
      },
      q6: "सनस्क्रीन का उपयोग: क्या आप बाहर जाने से पहले नियमित रूप से सनस्क्रीन (SPF >15) लगाते हैं?",
      q7: "स्थान और प्रदूषण: क्या आप वर्ष के बड़े हिस्से में अत्यधिक प्रदूषित शहरी क्षेत्र या घने कोहरे वाले क्षेत्र में रहते हैं?",
      q8: {
        text: "आप कितनी बार विटामिन D से भरपूर पशु-आधारित खाद्य पदार्थ (जैसे मछली, अंडे) का सेवन करते हैं?",
        options: ["कोई सेवन नहीं (शुद्ध शाकाहारी; कोई अंडा नहीं, कोई मछली नहीं)", "कभी-कभी सेवन (अंडा कुछ बार/सप्ताह, मछली बहुत कम)", "नियमित सेवन (मछली ≥1/सप्ताह या अंडे अक्सर)"]
      },
      q9: "दूध/फोर्टिफाइड भोजन: क्या आप प्रतिदिन 2 कप से कम डेयरी/डेयरी उत्पाद लेते हैं?",
      q10: "अवशोषण की स्थिति: क्या आपको यकृत रोग, IBD, सीलिएक रोग, या सिस्टिक फाइब्रोसिस जैसी स्थिति है जो वसा अवशोषण को प्रभावित करती है?",
      q11: "दवाएं: क्या आप दीर्घकालिक दवाएं (फ़िनाइटोइन, स्टेरॉयड, एंटिफंगल या एंटीरेट्रोवायरल) ले रहे हैं जो विटामिन D चयापचय को प्रभावित करती हैं?",
      q12: "ऑस्टियोपोरोसिस निदान: क्या आपको ऑस्टियोपोरोसिस, ऑस्टियोपीनिया का निदान हुआ है या कम आघात वाला फ्रैक्चर हुआ है?",
      q13: {
        text: "हड्डी या पीठ के निचले हिस्से में दर्द: क्या आप अक्सर हड्डी या पीठ के निचले हिस्से में दर्द, मांसपेशियों की कमजोरी, या थकान महसूस करते हैं?",
        options: ["नहीं", "कभी-कभी", "अक्सर/गंभीर"]
      },
      q14: {
        text: "मांसपेशियों की कमजोरी: क्या आप मांसपेशियों की कमजोरी अनुभव करते हैं, जैसे सीढ़ियाँ चढ़ने या कुर्सी से उठने में परेशानी?",
        options: ["नहीं", "कभी-कभी", "अक्सर/गंभीर"]
      },
      q15: {
        text: "थकान: क्या आप आराम के बाद भी थकान या ऊर्जा की कमी महसूस करते हैं?",
        options: ["नहीं", "कभी-कभी", "अक्सर/गंभीर"]
      },
      q16: {
        text: "बीमारी की आवृत्ति: क्या आप दूसरों की तुलना में अधिक बार बीमार पड़ते हैं (सर्दी, फ्लू और संक्रमण)?",
        options: ["नहीं", "कभी-कभी", "अक्सर/गंभीर"]
      },
      q17: {
        text: "मूड और एकाग्रता: क्या आप मूड में कमी, चिड़चिड़ापन, या ध्यान केंद्रित करने में कठिनाई महसूस करते हैं?",
        options: ["नहीं", "कभी-कभी", "अक्सर/गंभीर"]
      },
      q18: "विटामिन D / कैल्शियम पूरक: क्या आपने विटामिन D / कैल्शियम पूरक लिया है (वर्तमान या पिछले 3 महीने)?"
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
    select: "ఎంచుకోండి",
    yes: "అవును",
    no: "కాదు",
    sometimes: "కొన్నిసార్లు",
    often: "తరచుగా/తీవ్రమైన",
    dark: "ముదురు",
    wheatish: "గోధుమ",
    fair: "లేత",
    veryFair: "చాలా లేత",
    shorts: "షార్ట్స్, టీ-షర్టులు, స్కర్టులు",
    partialCoverage: "పాక్షిక కవరేజ్ (ఉదా. చీర, సగం చేతులు)",
    fullCoverage: "పూర్తి కవరేజ్ (ఉదా. బుర్ఖా, పూర్తి చేతులు)",
    more30Min: "30 నిమిషాల కంటే ఎక్కువ",
    less30Min: "30 నిమిషాల కంటే తక్కువ",
    negligible: "చాలా తక్కువ",
    noIntake: "తీసుకోవడం లేదు (పూర్తి శాకాహారం)",
    occasionalIntake: "అప్పుడప్పుడు తీసుకోవడం",
    regularIntake: "క్రమం తప్పకుండా తీసుకోవడం (చేప ≥1/వారం)",
    
    questions: {
      q1: {
        text: "వయస్సు: మీరు 50 సంవత్సరాల కంటే ఎక్కువ వయస్సు ఉన్నారా?",
        options: ["అవును", "కాదు"]
      },
      q2: {
        text: "శరీర రకం: మీ బాడీ మాస్ ఇండెక్స్ (BMI) ≥ 30 kg/m² (అధిక బరువు/ఊబకాయం) ఉందా?",
        options: ["అవును", "కాదు"]
      },
      q3: {
        text: "చర్మ వర్ణం: మీ చర్మ టోన్ ఏమిటి?",
        options: ["ముదురు", "గోధుమ", "లేత", "చాలా లేత"]
      },
      q4: {
        text: "దుస్తుల శైలి: బయటికి వెళ్ళేటప్పుడు మీ సాధారణ దుస్తుల శైలి ఏమిటి?",
        options: ["షార్ట్స్, టీ-షర్టులు, స్కర్టులు", "పాక్షిక కవరేజ్ (ఉదా. చీర, సగం చేతులు)", "పూర్తి కవరేజ్ (ఉదా. బుర్ఖా, పూర్తి చేతుల దుస్తులు)"]
      },
      q5: {
        text: "బయట సమయం: సాధారణ రోజులో, మీరు ఎంత సమయం ఎండలో గడుపుతారు (ఉదయం 11 నుండి మధ్యాహ్నం 3 మధ్య)?",
        options: ["30 నిమిషాల కంటే ఎక్కువ", "30 నిమిషాల కంటే తక్కువ", "చాలా తక్కువ"]
      },
      q6: "సన్‌స్క్రీన్ వాడకం: మీరు బయటికి వెళ్లేముందు క్రమం తప్పకుండా సన్‌స్క్రీన్ (SPF >15) రాసుకుంటారా?",
      q7: "స్థానం & కాలుష్యం: మీరు సంవత్సరంలో ఎక్కువ భాగం చాలా కాలుష్యం ఉన్న పట్టణ ప్రాంతంలో లేదా దట్టమైన పొగమంచు ఉన్న ప్రాంతంలో నివసిస్తున్నారా?",
      q8: {
        text: "మీరు విటమిన్ D సమృద్ధిగా ఉన్న జంతు ఆహారాలు (ఉదా. చేపలు, గుడ్లు) ఎంత తరచుగా తీసుకుంటారు?",
        options: ["తీసుకోవడం లేదు (పూర్తి శాకాహారం; గుడ్డు లేదు, చేప లేదు)", "అప్పుడప్పుడు తీసుకోవడం (గుడ్డు కొన్నిసార్లు/వారం, చేప చాలా తక్కువ)", "క్రమం తప్పకుండా తీసుకోవడం (చేప ≥1/వారం లేదా గుడ్లు తరచుగా)"]
      },
      q9: "పాలు/ఫోర్టిఫైడ్ ఆహారం: మీరు రోజుకు 2 కప్పుల కంటే తక్కువ డెయిరీ/డెయిరీ ఉత్పత్తులు తీసుకుంటారా?",
      q10: "శోషణ పరిస్థితులు: మీకు కాలేయ వ్యాధి, IBD, సెలియాక్ వ్యాధి, లేదా సిస్టిక్ ఫైబ్రోసిస్ వంటి కొవ్వు శోషణను ప్రభావితం చేసే పరిస్థితి ఉందా?",
      q11: "మందులు: మీరు విటమిన్ D జీవక్రియను ప్రభావితం చేసే దీర్ఘకాలిక మందులు (ఫెనిటోయిన్, స్టెరాయిడ్లు, యాంటిఫంగల్స్ లేదా యాంటిరెట్రోవైరల్) తీసుకుంటున్నారా?",
      q12: "ఆస్టియోపోరోసిస్ నిర్ధారణ: మీకు ఆస్టియోపోరోసిస్, ఆస్టియోపీనియా నిర్ధారణ జరిగిందా లేదా తక్కువ గాయం ఫ్రాక్చర్ అనుభవించారా?",
      q13: {
        text: "ఎముక లేదా వెన్ను నొప్పి: మీరు తరచుగా ఎముక లేదా వెన్ను నొప్పి, కండరాల బలహీనత, లేదా రోజువారీ కార్యకలాపాలను ప్రభావితం చేసే అలసట అనుభవిస్తున్నారా?",
        options: ["కాదు", "కొన్నిసార్లు", "తరచుగా/తీవ్రమైన"]
      },
      q14: {
        text: "కండరాల బలహీనత: మీరు కండరాల బలహీనత అనుభవిస్తున్నారా, అంటే మెట్లు ఎక్కడం లేదా కుర్చీ నుండి లేవడంలో ఇబ్బంది?",
        options: ["కాదు", "కొన్నిసార్లు", "తరచుగా/తీవ్రమైన"]
      },
      q15: {
        text: "అలసట: మీరు విశ్రాంతి తర్వాత కూడా అలసిపోయినట్లు లేదా శక్తి తక్కువగా ఉన్నట్లు అనిపిస్తుందా?",
        options: ["కాదు", "కొన్నిసార్లు", "తరచుగా/తీవ్రమైన"]
      },
      q16: {
        text: "అనారోగ్య పౌనఃపున్యం: మీరు ఇతరుల కంటే తరచుగా అనారోగ్యంతో (జలుబు, ఫ్లూ మరియు ఇన్ఫెక్షన్లు) బాధపడుతున్నారా?",
        options: ["కాదు", "కొన్నిసార్లు", "తరచుగా/తీవ్రమైన"]
      },
      q17: {
        text: "మానసిక స్థితి మరియు ఏకాగ్రత: మీరు తక్కువ మానసిక స్థితి, చిరాకు, లేదా ఏకాగ్రతలో ఇబ్బంది గమనిస్తున్నారా?",
        options: ["కాదు", "కొన్నిసార్లు", "తరచుగా/తీవ్రమైన"]
      },
      q18: "విటమిన్ D / కాల్షియం సప్లిమెంటేషన్: మీరు విటమిన్ D / కాల్షియం సప్లిమెంట్ తీసుకున్నారా (ప్రస్తుతం లేదా గత 3 నెలలు)?"
    }
  }
};
