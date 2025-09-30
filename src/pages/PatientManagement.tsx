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
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("camp_id", campId)
        .order("patient_number");

      if (error) throw error;
      setPatients(data || []);
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
      
      // Convert height to meters
      const heightFeet = parseInt(formData.height_feet) || 0;
      const heightInches = parseInt(formData.height_inches) || 0;
      const heightMeters = (heightFeet * 12 + heightInches) * 0.0254;
      
      const weightKg = parseFloat(formData.weight_kg);
      const bmi = calculateBMI(weightKg, heightMeters);
      const age = parseInt(formData.age);
      const sectionAScore = calculateSectionAScore(age, bmi);

      // Calculate Section B score using the new function
      const sectionBScore = calculateSectionBScore(formData);
      const totalScore = sectionAScore + sectionBScore;
      const riskLevel = getRiskLevel(totalScore);

      const { data, error } = await supabase
        .from("patients")
        .insert({
          camp_id: campId,
          patient_number: nextPatientNumber,
          initials: formData.initials,
          age: age,
          gender: formData.gender,
          height_feet: heightFeet,
          height_inches: heightInches,
          height_meters: heightMeters,
          weight_kg: weightKg,
          bmi: bmi,
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

      // Update camp patient count
      await supabase
        .from("camps")
        .update({ total_patients: nextPatientNumber })
        .eq("id", campId);

      toast({
        title: "Patient added successfully",
        description: `Patient #${nextPatientNumber} has been registered.`,
      });

      // Reset form and refresh patients
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

  // Q1
  if (form.q1 === "option2") score += 2;
  if (form.q1 === "option3") score += 3;

  // Q2
  if (form.q2 === "option2") score += 1;
  if (form.q2 === "option3") score += 3;

  // Q3–Q7
  if (form.q3 === "yes") score += 1;
  if (form.q4 === "yes") score += 1;
  if (form.q5 === "yes") score += 1;
  if (form.q6 === "yes") score += 1;
  if (form.q7 === "yes") score += 1;

  // Q8
  if (form.q8 === "option2") score += 0.25;
  if (form.q8 === "option3") score += 0.75;
  if (form.q8 === "option4") score += 1;

  // Q9–Q12
  if (form.q9 === "yes") score += 1;
  if (form.q10 === "yes") score += 1;
  if (form.q11 === "yes") score += 1;
  if (form.q12 === "yes") score += 1;

  return score;
};

const printWithRawBT = (patient: Patient) => {
  const printable = `
--------------------------
 Vitamin D Risk Assessment
--------------------------
Patient: ${patient.initials}
Age: ${patient.age}   Gender: ${patient.gender}
Height: ${patient.height_feet}'${patient.height_inches}" 
Weight: ${patient.weight_kg}kg
BMI: ${patient.bmi?.toFixed(1)}

Section A Score: ${patient.section_a_score}
Section B Score: ${patient.section_b_score}
Total Score: ${patient.total_score}

Risk Level: ${patient.risk_level}
--------------------------
This is a screening result.
Consult your doctor for testing.
`;

  // RawBT integration
  window.location.href = "rawbt:" + encodeURIComponent(printable);
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
              <form onSubmit={handleAddPatient} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Patient Initials *</Label>
                    <Input
                      placeholder="J.D."
                      value={formData.initials}
                      onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Height (Feet)</Label>
                    <Input
                      type="number"
                      min="3"
                      max="8"
                      placeholder="5"
                      value={formData.height_feet}
                      onChange={(e) => setFormData({ ...formData, height_feet: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Height (Inches)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="11"
                      placeholder="8"
                      value={formData.height_inches}
                      onChange={(e) => setFormData({ ...formData, height_inches: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Co-morbidities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="diabetes"
                        checked={formData.diabetes}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, diabetes: checked as boolean })
                        }
                      />
                      <Label htmlFor="diabetes">Diabetes</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hypertension"
                        checked={formData.hypertension}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, hypertension: checked as boolean })
                        }
                      />
                      <Label htmlFor="hypertension">Hypertension</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hypothyroidism"
                        checked={formData.hypothyroidism}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, hypothyroidism: checked as boolean })
                        }
                      />
                      <Label htmlFor="hypothyroidism">Hypothyroidism</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hyperthyroidism"
                        checked={formData.hyperthyroidism}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, hyperthyroidism: checked as boolean })
                        }
                      />
                      <Label htmlFor="hyperthyroidism">Hyperthyroidism</Label>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Label>Other Comorbidity</Label>
                    <Input
                      placeholder="Specify any other condition"
                      value={formData.other_comorbidity}
                      onChange={(e) => setFormData({ ...formData, other_comorbidity: e.target.value })}
                    />
                  </div>
                </div>

                                {/* ====================== Section B ====================== */}
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-4">Section B: Questionnaire</h2>

                  {/* Q1 */}
                  <div className="space-y-2">
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
                  <div className="space-y-2 mt-4">
                    <Label>2. Clothing Style</Label>
                    <Select
                      value={formData.q2}
                      onValueChange={(v) => setFormData({ ...formData, q2: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Shorts / T-shirts / Skirts</SelectItem>
                        <SelectItem value="option2">Partial coverage (saree, half-sleeve shirt, etc.)</SelectItem>
                        <SelectItem value="option3">Full coverage (burqa, full sleeves, etc.)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Q3–Q7 Yes/No */}
                  {[
                    { key: "q3", text: "3. Use of Sunscreen (SPF >15 before going out)?" },
                    { key: "q4", text: "4. Do you live in a highly polluted / foggy area?" },
                    { key: "q5", text: "5. Do you follow a strict vegetarian / vegan diet?" },
                    { key: "q6", text: "6. Do you consume < 2 servings of fortified milk/foods per day?" },
                    { key: "q7", text: "7. Do you consume egg yolks or fatty fish < once a week?" },
                  ].map(({ key, text }) => (
                    <div key={key} className="space-y-2 mt-4">
                      <Label>{text}</Label>
                      <Select
                        value={formData[key as keyof typeof formData]}
                        onValueChange={(v) => setFormData({ ...formData, [key]: v })}
                      >
                        <SelectTrigger><SelectValue placeholder="Yes/No" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}

                  {/* Q8 */}
                  <div className="space-y-2 mt-4">
                    <Label>8. Skin Pigmentation</Label>
                    <Select
                      value={formData.q8}
                      onValueChange={(v) => setFormData({ ...formData, q8: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Very Fair</SelectItem>
                        <SelectItem value="option2">Light</SelectItem>
                        <SelectItem value="option3">Medium</SelectItem>
                        <SelectItem value="option4">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Q9–Q12 Yes/No */}
                  {[
                    { key: "q9", text: "9. Do you have malabsorption conditions (Celiac, Crohn’s, etc.)?" },
                    { key: "q10", text: "10. Are you on long-term medication affecting Vitamin D metabolism?" },
                    { key: "q11", text: "11. Have you been diagnosed with osteoporosis or fractures?" },
                    { key: "q12", text: "12. Do you frequently experience musculoskeletal pain / weakness?" },
                  ].map(({ key, text }) => (
                    <div key={key} className="space-y-2 mt-4">
                      <Label>{text}</Label>
                      <Select
                        value={formData[key as keyof typeof formData]}
                        onValueChange={(v) => setFormData({ ...formData, [key]: v })}
                      >
                        <SelectTrigger><SelectValue placeholder="Yes/No" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>



                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Calculator className="h-4 w-4 mr-2" />
                    Add Patient & Calculate Score
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
      </div>
    </div>
  );
};

export default PatientManagement;