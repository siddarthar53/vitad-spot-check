import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Users, Calculator, FileText, Languages } from "lucide-react";
import { fetchCampPatients, generateSummaryMessage } from "@/utils/campUtils";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { formTranslations, type Language } from "@/utils/formTranslations";



interface Patient {
  id: string;
  patient_number: number;
  initials: string;
  age: number;
  gender: string;
  height_feet: number | null;
  height_inches: number | null;
  height_meters: number | null;
  weight_kg: number | null;
  bmi: number | null;
  diabetes: boolean;
  hypertension: boolean;
  hypothyroidism: boolean;
  hyperthyroidism: boolean;
  other_comorbidity: string | null;
  section_a_score: number;
  section_b_score: number;
  total_score: number;
  risk_level: string | null;
  questionnaire_responses: any;
}

const PatientManagement = () => {
  const { campId } = useParams<{ campId: string }>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [language, setLanguage] = useState<Language>("english");
  const [formData, setFormData] = useState({
  initials: "",
  age: "",
  gender: "",
  height_feet: "",
  height_inches: "",
  weight_kg: "",
  diabetes: false,
  hypertension: false,
  hypothyroidism: false,
  hyperthyroidism: false,
  other_comorbidity: "",
  // Section B answers (18 questions)
  q1: "",
  q2: "",
  q3: "",
  q4: "",
  q5: "",
  q6: "",
  q7: "",
  q8: "",
  q9: "",
  q10: "",
  q11: "",
  q12: "",
  q13: "",
  q14: "",
  q15: "",
  q16: "",
  q17: "",
  q18: "",
});


  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (campId) {
      fetchPatients();
    }
  }, [campId]);

const fetchPatients = async () => {
  try {
    const data = await fetchCampPatients(campId!);
    setPatients(data);
  } catch (error: any) {
    toast({
      title: "Error fetching patients",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  const calculateBMI = (weightKg: number, heightM: number): number => {
    return Math.round((weightKg / (heightM * heightM)) * 100) / 100;
  };

  const calculateSectionAScore = (age: number, bmi: number): number => {
    // This function is no longer used as scoring is now done in Section B
    return 0;
  };


  const getRiskLevel = (totalScore: number): string => {
    if (totalScore < 5) return "Sufficient";
    if (totalScore <= 7.75) return "Insufficient";
    return "Deficient";
  };

const handleAddPatient = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.initials || !formData.age || !formData.gender || !formData.weight_kg) {
    toast({
      title: "Missing required fields",
      description: "Please fill in all required fields.",
      variant: "destructive",
    });
    return;
  }

  try {
    const nextPatientNumber = patients.length + 1;

    // ✅ Convert inputs safely
    const heightFeet = Number(formData.height_feet) || 0;
    const heightInches = Number(formData.height_inches) || 0;
    const totalInches = heightFeet * 12 + heightInches;
    const heightMeters = totalInches > 0 ? totalInches * 0.0254 : 0;

    const weightKg = Number(formData.weight_kg) || 0;
    const age = Number(formData.age) || 0;

    // ✅ Safely calculate BMI (prevent NaN)
    const bmi = heightMeters > 0 ? calculateBMI(weightKg, heightMeters) : 0;

    // ✅ Calculate section scores
    const sectionAScore = 0; // Not used anymore
    const sectionBScore = Number(calculateSectionBScore(formData, age, bmi)) || 0;
    const totalScore = sectionAScore + sectionBScore;
    const riskLevel = getRiskLevel(totalScore);

    // ✅ Ensure numeric fields are inserted as numbers
    const { data, error } = await supabase
      .from("patients")
      .insert({
        camp_id: campId,
        patient_number: nextPatientNumber,
        initials: formData.initials.trim(),
        age: age,
        gender: formData.gender,
        height_feet: heightFeet || null,
        height_inches: heightInches || null,
        height_meters: heightMeters || null,
        weight_kg: weightKg || null,
        bmi: bmi || null,
        diabetes: formData.diabetes,
        hypertension: formData.hypertension,
        hypothyroidism: formData.hypothyroidism,
        hyperthyroidism: formData.hyperthyroidism,
        other_comorbidity: formData.other_comorbidity || null,
        section_a_score: sectionAScore,
        section_b_score: sectionBScore,
        total_score: totalScore,
        risk_level: riskLevel,
      })
      .select()
      .single();

    if (error) throw error;

    // ✅ Update total patients in camp
    await supabase
      .from("camps")
      .update({ total_patients: nextPatientNumber })
      .eq("id", campId);

    toast({
      title: "Patient added successfully",
      description: `Patient #${nextPatientNumber} has been registered.`,
    });

    // ✅ Reset form & refresh
    setFormData({
      initials: "",
      age: "",
      gender: "",
      height_feet: "",
      height_inches: "",
      weight_kg: "",
      diabetes: false,
      hypertension: false,
      hypothyroidism: false,
      hyperthyroidism: false,
      other_comorbidity: "",
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      q5: "",
      q6: "",
      q7: "",
      q8: "",
      q9: "",
      q10: "",
      q11: "",
      q12: "",
      q13: "",
      q14: "",
      q15: "",
      q16: "",
      q17: "",
      q18: "",
    });

    setShowAddForm(false);
    fetchPatients();
  } catch (error: any) {
    toast({
      title: "Error adding patient",
      description: error.message,
      variant: "destructive",
    });
  }
};


  const getRiskBadgeVariant = (riskLevel: string | null) => {
    switch (riskLevel) {
      case "Sufficient":
        return "secondary";
      case "Insufficient":
        return "default";
      case "Deficient":
        return "destructive";
      default:
        return "outline";
    }
  };

const calculateSectionBScore = (form: typeof formData, age: number, bmi: number): number => {
  let score = 0;

  // Q1: Age > 50?
  if (form.q1 === "yes") score += 0.5;

  // Q2: BMI ≥ 30?
  if (form.q2 === "yes") score += 1;

  // Q3: Skin tone
  if (form.q3 === "dark") score += 0;
  else if (form.q3 === "wheatish") score += 0.25;
  else if (form.q3 === "fair") score += 0.75;
  else if (form.q3 === "very_fair") score += 1;

  // Q4: Clothing style
  if (form.q4 === "shorts") score += 0;
  else if (form.q4 === "partial") score += 1;
  else if (form.q4 === "full") score += 3;

  // Q5: Time outdoors
  if (form.q5 === "more_30") score += 0;
  else if (form.q5 === "less_30") score += 2;
  else if (form.q5 === "negligible") score += 3;

  // Q6: Sunscreen (Yes/No)
  if (form.q6 === "yes") score += 1;

  // Q7: Pollution (Yes/No)
  if (form.q7 === "yes") score += 1;

  // Q8: Animal foods
  if (form.q8 === "no_intake") score += 1;
  else if (form.q8 === "occasional") score += 0.5;
  else if (form.q8 === "regular") score += 0;

  // Q9-Q12: Yes/No (each Yes = +1)
  if (form.q9 === "yes") score += 1;
  if (form.q10 === "yes") score += 1;
  if (form.q11 === "yes") score += 1;
  if (form.q12 === "yes") score += 1;

  // Q13-Q17: No/Sometimes/Often (0, 0.25, 0.5)
  const symptomQuestions = ["q13", "q14", "q15", "q16", "q17"];
  symptomQuestions.forEach((q) => {
    const key = q as keyof typeof form;
    if (form[key] === "sometimes") score += 0.25;
    else if (form[key] === "often") score += 0.5;
  });

  // Q18: Vitamin D supplementation (Yes = -5)
  if (form.q18 === "yes") score -= 5;

  return score;
};


// ✅ Updated handleCompleteCamp to generate inline summary
const handleCompleteCamp = async () => {
  try {
    const { error } = await supabase
      .from("camps")
      .update({ status: "completed" })
      .eq("id", campId);

    if (error) throw error;

    const updatedPatients = await fetchCampPatients(campId!);
    setPatients(updatedPatients);
    setShowSummary(true);

    toast({
      title: "Camp Completed",
      description: "Camp marked as completed and summary generated.",
    });
  } catch (err: any) {
    toast({
      title: "Error completing camp",
      description: err.message,
      variant: "destructive",
    });
  }
};

const sendSummaryToDoctor = async () => {
  try {
    // ✅ Fetch the doctor details, including whatsapp_number
    const { data: campData, error: campError } = await supabase
      .from("camps")
      .select(`
        camp_date,
        doctors:doctor_id (
          name,
          phone,
          whatsapp_number,
          clinic_name,
          city
        )
      `)
      .eq("id", campId)
      .single();

    if (campError || !campData?.doctors)
      throw new Error("Doctor details not found.");

    const doctor = campData.doctors;

    // ✅ Use WhatsApp number if available, fallback to regular phone
    const contactNumber = doctor.whatsapp_number || doctor.phone;
    const formattedPhone = contactNumber.startsWith("+")
      ? contactNumber
      : `+91${contactNumber}`;

    // ✅ Calculate patient summary
    const patientsData =
      patients.length > 0 ? patients : await fetchCampPatients(campId!);

    const total = patientsData.length;
    const low = patientsData.filter((p) => p.risk_level === "Low Risk").length;
    const moderate = patientsData.filter(
      (p) => p.risk_level === "Moderate Risk"
    ).length;
    const high = patientsData.filter((p) => p.risk_level === "High Risk").length;

    // ✅ WhatsApp message text (with risk score legend)
    const message = `
Dear Dr. ${doctor.name},

Please find below the summary of the Vitamin D Deficiency Risk Assessment Camp conducted at your clinic (${doctor.clinic_name}, ${doctor.city}) on ${new Date(
      campData.camp_date
    ).toLocaleDateString()}.

Total Patients Screened: ${total}
Low Risk: ${low}
Moderate Risk: ${moderate}
High Risk: ${high}

------------------------------
RISK LEVEL GUIDE:
Score 0–3   → Low Risk
Score 4–6   → Moderate Risk
Score ≥7    → High Risk
------------------------------

We thank you for your kind support and continuous patronage.
For any concerns, please contact 9000000000.

— Vitamin D Awareness Team
    `;

    // ✅ Open WhatsApp
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(waUrl, "_blank");

    toast({
      title: "Summary ready to send",
      description: `Opening WhatsApp to send summary to Dr. ${doctor.name}.`,
    });

    // ✅ Redirect to Camp Details after short delay
    setTimeout(() => navigate(`/camp/${campId}`), 2000);
  } catch (err: any) {
    toast({
      title: "Error sending summary",
      description: err.message,
      variant: "destructive",
    });
  }
};





const printWithRawBT = (patient: Patient) => {
  // 🧩 Build comorbidity text vertically (one per line)
  const comorbidities: string[] = [];

  if (patient.diabetes) comorbidities.push("• Diabetes");
  if (patient.hypertension) comorbidities.push("• Hypertension");
  if (patient.hypothyroidism) comorbidities.push("• Hypothyroidism");
  if (patient.hyperthyroidism) comorbidities.push("• Hyperthyroidism");
  if (patient.other_comorbidity) comorbidities.push(`• ${patient.other_comorbidity}`);

  const comorbidityText = comorbidities.length
    ? comorbidities.join("\n")
    : "• None";

  // ✅ Safe defaults for fields
  const feet = patient.height_feet ?? 0;
  const inches = patient.height_inches ?? 0;
  const weight = patient.weight_kg ?? 0;
  const bmi = patient.bmi ? patient.bmi.toFixed(1) : "N/A";
  const sectionA = patient.section_a_score ?? 0;
  const sectionB = patient.section_b_score ?? 0;
  const total = patient.total_score ?? 0;
  const risk = patient.risk_level ?? "N/A";

  // 🧾 Printable content with risk guide
  const printable = `
--------------------------
 Vitamin D Risk Assessment
--------------------------
Patient: ${patient.initials}
Age: ${patient.age}   Gender: ${patient.gender}
Height: ${feet}'${inches}"
Weight: ${weight}kg
BMI: ${bmi}

Comorbidities:
${comorbidityText}

Section A Score: ${sectionA}
Section B Score: ${sectionB}
Total Score: ${total}

Risk Level: ${risk}
--------------------------
RISK LEVEL GUIDE:
0–3   → Low Risk
4–6   → Moderate Risk
7+    → High Risk
--------------------------
This is a screening result.
Consult your doctor for testing.
`;

  // 📱 Detect device platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  if (isAndroid) {
    window.location.href = "rawbt:" + encodeURIComponent(printable);
  } else if (isIOS) {
    const emLabelURL = "emlabel://print?text=" + encodeURIComponent(printable);
    window.location.href = emLabelURL;
  } else {
    alert("Printing is supported only on Android (RawBT) or iOS (EMLabel).");
  }
};

  


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/camp/${campId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Camp Details
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
              <p className="text-muted-foreground mt-2">
                Total Patients: {patients.length}
              </p>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-primary to-medical-teal hover:from-primary/90 hover:to-medical-teal/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Add New Patient
                  </CardTitle>
                  <CardDescription>
                    Patient #{patients.length + 1}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">हिंदी</SelectItem>
                      <SelectItem value="telugu">తెలుగు</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPatient} className="space-y-6">

  <Accordion type="single" collapsible defaultValue="sectionA">
    {/* Section A */}
    <AccordionItem value="sectionA">
      <AccordionTrigger>{formTranslations[language].sectionA}</AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label>{formTranslations[language].patientInitials} *</Label>
            <Input
              placeholder="J.D."
              value={formData.initials}
              onChange={(e) =>
                setFormData({ ...formData, initials: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{formTranslations[language].age} *</Label>
            <Input
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{formTranslations[language].gender} *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={formTranslations[language].selectGender} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">{formTranslations[language].male}</SelectItem>
                <SelectItem value="Female">{formTranslations[language].female}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label>{formTranslations[language].heightFeet}</Label>
            <Input
              type="number"
              min="3"
              max="8"
              value={formData.height_feet}
              onChange={(e) =>
                setFormData({ ...formData, height_feet: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{formTranslations[language].heightInches}</Label>
            <Input
              type="number"
              min="0"
              max="11"
              value={formData.height_inches}
              onChange={(e) =>
                setFormData({ ...formData, height_inches: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{formTranslations[language].weightKg} *</Label>
            <Input
              type="number"
              min="20"
              max="300"
              step="0.1"
              value={formData.weight_kg}
              onChange={(e) =>
                setFormData({ ...formData, weight_kg: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Co-morbidities */}
        <div className="mt-4">
          <Label className="text-base font-semibold">{formTranslations[language].comorbidities}</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {[
              { key: "diabetes", label: formTranslations[language].diabetes },
              { key: "hypertension", label: formTranslations[language].hypertension },
              { key: "hypothyroidism", label: formTranslations[language].hypothyroidism },
              { key: "hyperthyroidism", label: formTranslations[language].hyperthyroidism },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={formData[key as keyof typeof formData] as boolean}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      [key]: checked as boolean,
                    })
                  }
                />
                <Label htmlFor={key}>{label}</Label>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <Label>{formTranslations[language].otherComorbidity}</Label>
            <Input
              placeholder="Specify any other condition"
              value={formData.other_comorbidity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  other_comorbidity: e.target.value,
                })
              }
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* Section B */}
    <AccordionItem value="sectionB">
      <AccordionTrigger>{formTranslations[language].sectionB}</AccordionTrigger>
      <AccordionContent>
        <div className="mt-4 space-y-4">
          {/* Q1: Age */}
          <div>
            <Label>
              {typeof formTranslations[language].questions.q1 === 'string' 
                ? formTranslations[language].questions.q1 
                : formTranslations[language].questions.q1.text}
            </Label>
            <Select
              value={formData.q1}
              onValueChange={(v) => setFormData({ ...formData, q1: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{formTranslations[language].yes}</SelectItem>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Q2: BMI */}
          <div>
            <Label>
              {typeof formTranslations[language].questions.q2 === 'string' 
                ? formTranslations[language].questions.q2 
                : formTranslations[language].questions.q2.text}
            </Label>
            <Select
              value={formData.q2}
              onValueChange={(v) => setFormData({ ...formData, q2: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{formTranslations[language].yes}</SelectItem>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Q3: Skin Tone */}
          <div>
            <Label>
              {typeof formTranslations[language].questions.q3 === 'string' 
                ? formTranslations[language].questions.q3 
                : formTranslations[language].questions.q3.text}
            </Label>
            <Select
              value={formData.q3}
              onValueChange={(v) => setFormData({ ...formData, q3: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">{formTranslations[language].dark}</SelectItem>
                <SelectItem value="wheatish">{formTranslations[language].wheatish}</SelectItem>
                <SelectItem value="fair">{formTranslations[language].fair}</SelectItem>
                <SelectItem value="very_fair">{formTranslations[language].veryFair}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Q4: Clothing Style */}
          <div>
            <Label>
              {typeof formTranslations[language].questions.q4 === 'string' 
                ? formTranslations[language].questions.q4 
                : formTranslations[language].questions.q4.text}
            </Label>
            <Select
              value={formData.q4}
              onValueChange={(v) => setFormData({ ...formData, q4: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="shorts">{formTranslations[language].shorts}</SelectItem>
                <SelectItem value="partial">{formTranslations[language].partialCoverage}</SelectItem>
                <SelectItem value="full">{formTranslations[language].fullCoverage}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Q5: Time Outdoors */}
          <div>
            <Label>
              {typeof formTranslations[language].questions.q5 === 'string' 
                ? formTranslations[language].questions.q5 
                : formTranslations[language].questions.q5.text}
            </Label>
            <Select
              value={formData.q5}
              onValueChange={(v) => setFormData({ ...formData, q5: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="more_30">{formTranslations[language].more30Min}</SelectItem>
                <SelectItem value="less_30">{formTranslations[language].less30Min}</SelectItem>
                <SelectItem value="negligible">{formTranslations[language].negligible}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Q6: Sunscreen */}
          <div>
            <Label>{formTranslations[language].questions.q6}</Label>
            <Select
              value={formData.q6}
              onValueChange={(v) => setFormData({ ...formData, q6: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{formTranslations[language].yes}</SelectItem>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Q7: Pollution */}
          <div>
            <Label>{formTranslations[language].questions.q7}</Label>
            <Select
              value={formData.q7}
              onValueChange={(v) => setFormData({ ...formData, q7: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{formTranslations[language].yes}</SelectItem>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Q8: Animal Foods */}
          <div>
            <Label>
              {typeof formTranslations[language].questions.q8 === 'string' 
                ? formTranslations[language].questions.q8 
                : formTranslations[language].questions.q8.text}
            </Label>
            <Select
              value={formData.q8}
              onValueChange={(v) => setFormData({ ...formData, q8: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no_intake">{formTranslations[language].noIntake}</SelectItem>
                <SelectItem value="occasional">{formTranslations[language].occasionalIntake}</SelectItem>
                <SelectItem value="regular">{formTranslations[language].regularIntake}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Q9-Q12: Yes/No Questions */}
          <div>
            <Label>{formTranslations[language].questions.q9}</Label>
            <Select
              value={formData.q9}
              onValueChange={(v) => setFormData({ ...formData, q9: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{formTranslations[language].yes}</SelectItem>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{formTranslations[language].questions.q10}</Label>
            <Select
              value={formData.q10}
              onValueChange={(v) => setFormData({ ...formData, q10: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{formTranslations[language].yes}</SelectItem>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{formTranslations[language].questions.q11}</Label>
            <Select
              value={formData.q11}
              onValueChange={(v) => setFormData({ ...formData, q11: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{formTranslations[language].yes}</SelectItem>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{formTranslations[language].questions.q12}</Label>
            <Select
              value={formData.q12}
              onValueChange={(v) => setFormData({ ...formData, q12: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{formTranslations[language].yes}</SelectItem>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Q13-Q17: No/Sometimes/Often Questions */}
          <div>
            <Label>
              {typeof formTranslations[language].questions.q13 === 'string' 
                ? formTranslations[language].questions.q13 
                : formTranslations[language].questions.q13.text}
            </Label>
            <Select
              value={formData.q13}
              onValueChange={(v) => setFormData({ ...formData, q13: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
                <SelectItem value="sometimes">{formTranslations[language].sometimes}</SelectItem>
                <SelectItem value="often">{formTranslations[language].often}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              {typeof formTranslations[language].questions.q14 === 'string' 
                ? formTranslations[language].questions.q14 
                : formTranslations[language].questions.q14.text}
            </Label>
            <Select
              value={formData.q14}
              onValueChange={(v) => setFormData({ ...formData, q14: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
                <SelectItem value="sometimes">{formTranslations[language].sometimes}</SelectItem>
                <SelectItem value="often">{formTranslations[language].often}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              {typeof formTranslations[language].questions.q15 === 'string' 
                ? formTranslations[language].questions.q15 
                : formTranslations[language].questions.q15.text}
            </Label>
            <Select
              value={formData.q15}
              onValueChange={(v) => setFormData({ ...formData, q15: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
                <SelectItem value="sometimes">{formTranslations[language].sometimes}</SelectItem>
                <SelectItem value="often">{formTranslations[language].often}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              {typeof formTranslations[language].questions.q16 === 'string' 
                ? formTranslations[language].questions.q16 
                : formTranslations[language].questions.q16.text}
            </Label>
            <Select
              value={formData.q16}
              onValueChange={(v) => setFormData({ ...formData, q16: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
                <SelectItem value="sometimes">{formTranslations[language].sometimes}</SelectItem>
                <SelectItem value="often">{formTranslations[language].often}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              {typeof formTranslations[language].questions.q17 === 'string' 
                ? formTranslations[language].questions.q17 
                : formTranslations[language].questions.q17.text}
            </Label>
            <Select
              value={formData.q17}
              onValueChange={(v) => setFormData({ ...formData, q17: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
                <SelectItem value="sometimes">{formTranslations[language].sometimes}</SelectItem>
                <SelectItem value="often">{formTranslations[language].often}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Q18: Vitamin D Supplementation */}
          <div>
            <Label>{formTranslations[language].questions.q18}</Label>
            <Select
              value={formData.q18}
              onValueChange={(v) => setFormData({ ...formData, q18: v })}
            >
              <SelectTrigger><SelectValue placeholder={formTranslations[language].select} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{formTranslations[language].yes}</SelectItem>
                <SelectItem value="no">{formTranslations[language].no}</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>

  <div className="flex justify-end space-x-4 mt-6">
    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
      {formTranslations[language].cancel}
    </Button>
    <Button type="submit">
      <Calculator className="h-4 w-4 mr-2" />
      {formTranslations[language].calculate}
    </Button>
  </div>

</form>

            </CardContent>
          </Card>
        )}

        {patients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No patients registered</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first patient to the camp.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Patient
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Patient #{patient.patient_number}</CardTitle>
                      <CardDescription>{patient.initials}</CardDescription>
                    </div>
                    <Badge variant={getRiskBadgeVariant(patient.risk_level)}>
                      {patient.risk_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Age:</span>
                      <span className="ml-2 font-medium">{patient.age}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="ml-2 font-medium">{patient.gender}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">BMI:</span>
                      <span className="ml-2 font-medium">{patient.bmi?.toFixed(1) || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Score:</span>
                      <span className="ml-2 font-bold text-primary">{patient.total_score}</span>
                    </div>
                  </div>
                  
                  {(patient.diabetes || patient.hypertension || patient.hypothyroidism || patient.hyperthyroidism) && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Comorbidities:</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.diabetes && <Badge variant="outline" className="text-xs">Diabetes</Badge>}
                        {patient.hypertension && <Badge variant="outline" className="text-xs">Hypertension</Badge>}
                        {patient.hypothyroidism && <Badge variant="outline" className="text-xs">Hypothyroidism</Badge>}
                        {patient.hyperthyroidism && <Badge variant="outline" className="text-xs">Hyperthyroidism</Badge>}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => printWithRawBT(patient)}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Generate Report
                    </Button>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {patients.length > 0 && patients.length < 20 && (
          <Card className="mt-6 border-medical-warning/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Users className="h-5 w-5 text-medical-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Minimum 20 patients required
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You have {patients.length} patients. Add {20 - patients.length} more to complete the camp.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

                {/* ✅ Show Complete Camp button when minimum 20 patients are reached */}
        {patients.length >0 && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleCompleteCamp}
              disabled={showSummary} // Disable if summary is already shown
              className="bg-gradient-to-r from-green-600 to-green-400 hover:opacity-90"
            >
              Complete Camp
            </Button>
          </div>
        )}

        {/* ✅ Inline Camp Summary after completion */}
{showSummary && (
  <Card className="mt-8 border-primary/40">
    <CardHeader>
      <CardTitle>Camp Summary</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Low Risk</p>
          <p className="text-xl font-bold text-green-600">
            {patients.filter(p => p.risk_level === "Low Risk").length}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Moderate Risk</p>
          <p className="text-xl font-bold text-yellow-600">
            {patients.filter(p => p.risk_level === "Moderate Risk").length}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">High Risk</p>
          <p className="text-xl font-bold text-red-600">
            {patients.filter(p => p.risk_level === "High Risk").length}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          onClick={sendSummaryToDoctor}
          className="bg-gradient-to-r from-primary to-medical-teal hover:opacity-90"
        >
          Send Summary to Doctor
        </Button>
      </div>
    </CardContent>
  </Card>
)}


      </div>
    </div>
  );
};

export default PatientManagement;