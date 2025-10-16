import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Phone, MapPin, Upload } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic_name: string;
  clinic_address: string;
  city: string;
  phone: string;
  whatsapp_number: string;
}

const CreateCamp = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [campDate, setCampDate] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");
  const [consentFile, setConsentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ Fetch pre-approved doctors
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("doctors")
          .select("*")
          .eq("is_selected_by_marketing", true)
          .order("name");

        if (error) throw error;
        setDoctors(data || []);
      } catch (err: any) {
        toast({
          title: "Error fetching doctors",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoadingDoctors(false);
      }
    })();
  }, []);

  // ✅ Select a doctor and auto-fill their phone number
  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) setDoctorPhone(doctor.phone);
  };

  // ✅ WhatsApp consent message
  const sendDoctorConsentMessage = (phone: string, doctorName: string, campDate: string) => {
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    const message = `
Dear Dr. ${doctorName},

Thank you for your consent to conduct a Vitamin D Deficiency Risk Assessment Camp at your clinic on ${new Date(campDate).toLocaleDateString()}.

For any concerns or assistance, please contact 9000000000.

We appreciate your continuous patronage.
– Vitamin D Awareness Team
    `;
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };
  
// ✅ Handle camp creation
const handleCreateCamp = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedDoctorId || !campDate) {
    toast({
      title: "Missing information",
      description: "Please select a doctor and camp date.",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    let consentUrl: string | null = null;

    // ✅ Optional: Only try upload if the file is provided
    if (consentFile) {
      try {
        const filePath = `consents/${Date.now()}_${consentFile.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from("consent_forms")
          .upload(filePath, consentFile);

        if (uploadError) {
          console.warn("Consent upload failed:", uploadError.message);
          toast({
            title: "Consent upload skipped",
            description: "Could not upload consent form, continuing without it.",
            variant: "destructive",
          });
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("consent_forms")
            .getPublicUrl(filePath);
          consentUrl = publicUrlData?.publicUrl || null;
        }
      } catch (err: any) {
        console.warn("Bucket not found or upload error:", err.message);
        toast({
          title: "Consent upload skipped",
          description: "Consent form could not be uploaded (bucket missing). Camp will still be created.",
          variant: "destructive",
        });
      }
    }

    // ✅ Insert the camp regardless of consent upload result
    const { data: camp, error: campError } = await supabase
      .from("camps")
      .insert({
        user_id: user.id,
        doctor_id: selectedDoctorId,
        camp_date: campDate,
        status: "active",
        consent_form_url: consentUrl, // nullable
      })
      .select()
      .single();

    if (campError) throw campError;

    // ✅ Send WhatsApp message to the doctor (optional)
    const doctor = doctors.find((d) => d.id === selectedDoctorId);
    if (doctor) {
      const formattedPhone = doctor.whatsapp_number.startsWith("+")
        ? doctor.whatsapp_number
        : `+91${doctor.whatsapp_number}`;
      const message = `
Dear Dr. ${doctor.name},

Thank you for consenting to conduct a Vitamin D Risk Assessment Camp at your clinic on ${new Date(campDate).toLocaleDateString()}.
 
For any concerns, please contact 9000000000.

— Vitamin D Awareness Team
      `;
      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    }

    toast({
      title: "Camp created successfully!",
      description: "You can now start registering patients.",
    });

    navigate(`/camp/${camp.id}`);
  } catch (err: any) {
    toast({
      title: "Error creating camp",
      description: err.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Create New Camp</h1>
          <p className="text-muted-foreground mt-2">
            Set up a new Vitamin D Deficiency Risk Assessment Camp.
          </p>
        </div>

        <form onSubmit={handleCreateCamp} className="space-y-6">
          {/* Doctor Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" /> Doctor Selection
              </CardTitle>
              <CardDescription>Select a doctor from the approved list.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Doctor</Label>
                <Select
                  value={selectedDoctorId}
                  onValueChange={handleDoctorSelect}
                  disabled={loadingDoctors}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={loadingDoctors ? "Loading doctors..." : "Choose a doctor"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{doctor.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {doctor.specialty} • {doctor.clinic_name}, {doctor.city}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDoctor && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Doctor Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <p><strong>Name:</strong> {selectedDoctor.name}</p>
                      <p><strong>Specialty:</strong> {selectedDoctor.specialty}</p>
                      <p><strong>Clinic:</strong> {selectedDoctor.clinic_name}</p>
                      <p><strong>City:</strong> {selectedDoctor.city}</p>
                      <p className="md:col-span-2">
                        <strong>Address:</strong> {selectedDoctor.clinic_address}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Camp Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" /> Camp Details
              </CardTitle>
              <CardDescription>Provide essential camp information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Camp Date</Label>
                  <Input
                    type="date"
                    value={campDate}
                    onChange={(e) => setCampDate(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label>Doctor Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      value={doctorPhone}
                      onChange={(e) => setDoctorPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consent Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-primary" /> Consent Form
              </CardTitle>
              <CardDescription>Upload the scanned consent form (optional).</CardDescription>
            </CardHeader>
            <CardContent>
              <Label>Consent Form Upload</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setConsentFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground">
                Accepted formats: JPG, PNG, PDF (Max 5MB)
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate("/")} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedDoctorId || !campDate}
              className="bg-gradient-to-r from-primary to-medical-teal hover:opacity-90"
            >
              {loading ? "Creating..." : "Create Camp"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCamp;
