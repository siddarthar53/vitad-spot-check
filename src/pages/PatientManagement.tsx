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
import { ArrowLeft, Plus, Users, Calculator, FileText } from "lucide-react";
import { fetchCampPatients, generateSummaryMessage } from "@/utils/campUtils";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";



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
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
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
  // Section B answers
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
    let score = 0;
    if (age > 50) score += 1;
    if (bmi >= 25) score += 1;
    return score;
  };


  const getRiskLevel = (totalScore: number): string => {
    if (totalScore <= 3) return "Low Risk";
    if (totalScore <= 6) return "Moderate Risk";
    return "High Risk";
  };

const handleSavePatient = async () => {
  if (!formData.initials || !formData.age || !formData.gender || !formData.weight_kg) {
    toast({
      title: "Missing required fields",
      description: "Please fill in all required fields.",
      variant: "destructive",
    });
    return;
  }

  try {
    const heightFeet = Number(formData.height_feet) || 0;
    const heightInches = Number(formData.height_inches) || 0;
    const totalInches = heightFeet * 12 + heightInches;
    const heightMeters = totalInches > 0 ? totalInches * 0.0254 : 0;
    const weightKg = Number(formData.weight_kg) || 0;
    const age = Number(formData.age) || 0;
    const bmi = heightMeters > 0 ? calculateBMI(weightKg, heightMeters) : 0;

    if (currentPatientId) {
      // Update existing patient (without recalculating scores)
      const { error } = await supabase
        .from("patients")
        .update({
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
        })
        .eq("id", currentPatientId);

      if (error) throw error;

      toast({
        title: "Patient data saved",
        description: "Patient information has been updated.",
      });
    } else {
      // Insert new patient without scores
      const nextPatientNumber = patients.length + 1;
      
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
          section_a_score: null,
          section_b_score: null,
          total_score: null,
          risk_level: null,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from("camps")
        .update({ total_patients: nextPatientNumber })
        .eq("id", campId);

      setCurrentPatientId(data.id);

      toast({
        title: "Patient data saved",
        description: `Patient #${nextPatientNumber} saved. You can now calculate the score.`,
      });
    }

    fetchPatients();
  } catch (error: any) {
    toast({
      title: "Error saving patient",
      description: error.message,
      variant: "destructive",
    });
  }
};

const handleCalculateScore = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!currentPatientId) {
    // If no patient saved yet, save first then calculate
    await handleSavePatient();
    // Wait for the patient to be created and ID set
    setTimeout(() => {
      handleCalculateScore(e);
    }, 500);
    return;
  }

  try {
    const heightFeet = Number(formData.height_feet) || 0;
    const heightInches = Number(formData.height_inches) || 0;
    const totalInches = heightFeet * 12 + heightInches;
    const heightMeters = totalInches > 0 ? totalInches * 0.0254 : 0;
    const weightKg = Number(formData.weight_kg) || 0;
    const age = Number(formData.age) || 0;
    const bmi = heightMeters > 0 ? calculateBMI(weightKg, heightMeters) : 0;

    const sectionAScore = Number(calculateSectionAScore(age, bmi)) || 0;
    const sectionBScore = Number(calculateSectionBScore(formData)) || 0;
    const totalScore = sectionAScore + sectionBScore;
    const riskLevel = getRiskLevel(totalScore);

    const { error } = await supabase
      .from("patients")
      .update({
        section_a_score: sectionAScore,
        section_b_score: sectionBScore,
        total_score: totalScore,
        risk_level: riskLevel,
      })
      .eq("id", currentPatientId);

    if (error) throw error;

    toast({
      title: "Score calculated successfully",
      description: `Total Score: ${totalScore} - Risk Level: ${riskLevel}`,
    });

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
    });
    setCurrentPatientId(null);
    setShowAddForm(false);
    fetchPatients();
  } catch (error: any) {
    toast({
      title: "Error calculating score",
      description: error.message,
      variant: "destructive",
    });
  }
};


  const getRiskBadgeVariant = (riskLevel: string | null) => {
    switch (riskLevel) {
      case "Low Risk":
        return "secondary";
      case "Moderate Risk":
        return "default";
      case "High Risk":
        return "destructive";
      default:
        return "outline";
    }
  };

const calculateSectionBScore = (form: typeof formData): number => {
  let score = 0;

  // Q1 & Q2 (special scoring)
  if (form.q1 === "option2") score += 2;
  if (form.q1 === "option3") score += 3;

  if (form.q2 === "option2") score += 1;
  if (form.q2 === "option3") score += 3;

  // ✅ Q3–Q12 (all Yes = +1)
  for (let i = 3; i <= 12; i++) {
    const key = `q${i}` as keyof typeof form;
    if (form[key] === "yes") score += 1;
  }

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
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Add New Patient
              </CardTitle>
              <CardDescription>
                Patient #{patients.length + 1} - Section A: Basic Information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculateScore} className="space-y-6">

  <Accordion type="single" collapsible defaultValue="sectionA">
    {/* Section A */}
    <AccordionItem value="sectionA">
      <AccordionTrigger>Section A: Basic Information</AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label>Patient Initials *</Label>
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
            <Label>Age *</Label>
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
            <Label>Gender *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label>Height (Feet)</Label>
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
            <Label>Height (Inches)</Label>
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
            <Label>Weight (kg) *</Label>
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
          <Label className="text-base font-semibold">Co-morbidities</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {[
              "diabetes",
              "hypertension",
              "hypothyroidism",
              "hyperthyroidism",
            ].map((disease) => (
              <div key={disease} className="flex items-center space-x-2">
                <Checkbox
                  id={disease}
                  checked={formData[disease as keyof typeof formData] as boolean}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      [disease]: checked as boolean,
                    })
                  }
                />
                <Label htmlFor={disease}>
                  {disease.charAt(0).toUpperCase() + disease.slice(1)}
                </Label>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <Label>Other Comorbidity</Label>
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
      <AccordionTrigger>Section B: Questionnaire</AccordionTrigger>
      <AccordionContent>
        <div className="mt-4 space-y-4">
          {/* Q1 */}
          <div>
            <Label>1. Time Outdoors</Label>
            <Select
              value={formData.q1}
              onValueChange={(v) => setFormData({ ...formData, q1: v })}
            >
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">More than 30 minutes</SelectItem>
                <SelectItem value="option2">Less than 30 minutes</SelectItem>
                <SelectItem value="option3">Negligible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Q2 */}
          <div>
            <Label>2. Clothing Style</Label>
            <Select
              value={formData.q2}
              onValueChange={(v) => setFormData({ ...formData, q2: v })}
            >
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Shorts / T-shirts / Skirts</SelectItem>
                <SelectItem value="option2">Partial coverage</SelectItem>
                <SelectItem value="option3">Full coverage</SelectItem>
              </SelectContent>
            </Select>
          </div>

        {/* Q3–Q12 Yes/No (Descriptive Vitamin D Questions) */}
{[
  { key: "q3", text: "3. Use of Sunscreen (SPF >15 before going out)?" },
  { key: "q4", text: "4. Do you live in a highly polluted or foggy area?" },
  { key: "q5", text: "5. Do you follow a strict vegetarian or vegan diet?" },
  { key: "q6", text: "6. Do you consume less than 2 servings of fortified milk or Vitamin D–rich foods per day?" },
  { key: "q7", text: "7. Do you consume egg yolks or fatty fish less than once per week?" },
  { key: "q8", text: "8. Do you have darker skin tone (which reduces sunlight penetration)?" },
  { key: "q9", text: "9. Do you suffer from malabsorption conditions (like Celiac or Crohn’s disease)?" },
  { key: "q10", text: "10. Are you on long-term medication that affects Vitamin D metabolism (e.g., steroids, anticonvulsants)?" },
  { key: "q11", text: "11. Have you ever been diagnosed with osteoporosis or had frequent fractures?" },
  { key: "q12", text: "12. Do you frequently experience muscle or joint pain, weakness, or fatigue?" },
].map(({ key, text }) => (
  <div key={key} className="space-y-2 mt-4">
    <Label>{text}</Label>
    <Select
      value={formData[key as keyof typeof formData] as string}
      onValueChange={(v) => setFormData({ ...formData, [key]: v })}
    >
      <SelectTrigger>
        <SelectValue placeholder="Yes/No" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="yes">Yes</SelectItem>
        <SelectItem value="no">No</SelectItem>
      </SelectContent>
    </Select>
  </div>
))}

        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>

  <div className="flex justify-end space-x-4 mt-6">
    <Button type="button" variant="outline" onClick={() => {
      setShowAddForm(false);
      setCurrentPatientId(null);
    }}>
      Cancel
    </Button>
    <Button type="button" variant="secondary" onClick={handleSavePatient}>
      Save
    </Button>
    <Button type="submit">
      <Calculator className="h-4 w-4 mr-2" />
      Calculate Score
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