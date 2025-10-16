import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Upload, Phone } from "lucide-react";

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

interface Props {
  onSuccess: (campId: string) => void;
}

const CreateCampInline = ({ onSuccess }: Props) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [campDate, setCampDate] = useState("");
  const [doctorWhatsApp, setDoctorWhatsApp] = useState("");
  const [consentFile, setConsentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
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
  }, [toast]);

  // ✅ Auto-fill WhatsApp when doctor is selected
  const handleDoctorSelect = (id: string) => {
    setSelectedDoctorId(id);
    const doc = doctors.find((d) => d.id === id);
    setDoctorWhatsApp(doc?.whatsapp_number || doc?.phone || "");
  };

  // ✅ Create camp
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

      // ✅ Upload consent form (optional)
      if (consentFile) {
        const filePath = `consents/${Date.now()}_${consentFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("consent_forms")
          .upload(filePath, consentFile);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("consent_forms")
            .getPublicUrl(filePath);
          consentUrl = publicUrlData?.publicUrl || null;
        }
      }

      // ✅ Insert camp
      const { data: camp, error: campError } = await supabase
        .from("camps")
        .insert({
          user_id: user.id,
          doctor_id: selectedDoctorId,
          camp_date: campDate,
          status: "active",
          consent_form_url: consentUrl,
        })
        .select()
        .single();

      if (campError) throw campError;

      // ✅ Send WhatsApp thank-you message
      const doctor = doctors.find((d) => d.id === selectedDoctorId);
      if (doctorWhatsApp) {
        const formattedPhone = doctorWhatsApp.startsWith("+")
          ? doctorWhatsApp
          : `+91${doctorWhatsApp}`;
        const message = `
Dear Dr. ${doctor?.name || ""},

Thank you for your consent to conduct a Vitamin D Risk Assessment Camp at your clinic on ${new Date(campDate).toLocaleDateString()}.

For any concerns, please contact 9000000000.

— Vitamin D Awareness Team
        `;
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, "_blank");
      }

      toast({
        title: "Camp created successfully!",
        description: "Redirecting to patient registration...",
      });

      onSuccess(camp.id);
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

  return (
    <form onSubmit={handleCreateCamp} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" /> Camp Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Doctor Selection */}
          <div>
            <Label>Select Doctor</Label>
            <Select
              value={selectedDoctorId}
              onValueChange={handleDoctorSelect}
              disabled={loadingDoctors}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingDoctors ? "Loading doctors..." : "Choose a doctor"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} • {doctor.clinic_name}, {doctor.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* WhatsApp Number */}
          <div>
            <Label>Doctor WhatsApp Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="9876543210"
                value={doctorWhatsApp}
                onChange={(e) => setDoctorWhatsApp(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Camp Date */}
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

          {/* Consent Form Upload */}
          <div>
            <Label>Upload Consent (Optional)</Label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setConsentFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || !selectedDoctorId || !campDate}
              className="bg-gradient-to-r from-primary to-medical-teal hover:opacity-90"
            >
              {loading ? "Creating..." : "Create Camp"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default CreateCampInline;
