// ============================================================
// CREATECAMPINLINE.TSX - Production Ready
// ============================================================
import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Phone } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  city: string | null;
  phone: string;
  whatsapp_number: string | null;
}

interface Props {
  onSuccess: (campId: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

const CreateCampInline = memo(({ onSuccess }: Props) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [campDate, setCampDate] = useState("");
  const [consentFile, setConsentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [fileError, setFileError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch pre-approved doctors
  const fetchDoctors = useCallback(async () => {
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
        description: err?.message || "Failed to load doctors",
        variant: "destructive",
      });
    } finally {
      setLoadingDoctors(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Handle doctor selection
  const handleDoctorSelect = useCallback(
    (id: string) => {
      setSelectedDoctorId(id);
      const doc = doctors.find((d) => d.id === id) || null;
      setSelectedDoctor(doc);
    },
    [doctors]
  );

  // Validate file
  const validateFile = useCallback((file: File): boolean => {
    setFileError(null);

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError("Only JPG, PNG, and PDF files are allowed");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size must be less than 5MB");
      return false;
    }

    return true;
  }, []);

  // Handle file selection
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (file && validateFile(file)) {
        setConsentFile(file);
      } else {
        setConsentFile(null);
        e.target.value = ""; // Reset input
      }
    },
    [validateFile]
  );

  // Upload consent form
  const uploadConsentForm = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `consents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("consent_forms")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("consent_forms").getPublicUrl(filePath);

        return publicUrl;
      } catch (err: any) {
        console.error("File upload error:", err);
        throw new Error(err?.message || "Failed to upload consent form");
      }
    },
    []
  );

  // Determine camp status
  const determineCampStatus = useCallback((campDate: string): string => {
    const today = new Date();
    const selectedDate = new Date(campDate);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate > today ? "scheduled" : "active";
  }, []);

  // Send WhatsApp message
  const sendWhatsAppMessage = useCallback(
    (doctor: Doctor, campDate: string) => {
      const phone = doctor.whatsapp_number || doctor.phone;
      if (!phone) return;

      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const message = `
Dear ${doctor.name},

Thank you for your consent to conduct a Vitamin D Risk Assessment Camp at your clinic on ${new Date(
        campDate
      ).toLocaleDateString()}.

For any concerns, please contact 9000000000.

— Vitamin D Awareness Team
      `.trim();

      window.open(
        `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    },
    []
  );

  // Create camp
  const handleCreateCamp = useCallback(
    async (e: React.FormEvent) => {
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Upload consent form if provided
        let consentUrl: string | null = null;
        if (consentFile) {
          consentUrl = await uploadConsentForm(consentFile);
        }

        // Determine initial status
        const initialStatus = determineCampStatus(campDate);

        // Insert camp record
        const { data: camp, error: campError } = await supabase
          .from("camps")
          .insert({
            user_id: user.id,
            doctor_id: selectedDoctorId,
            camp_date: campDate,
            status: initialStatus,
            consent_form_url: consentUrl,
            total_patients: 0,
          })
          .select()
          .single();

        if (campError) throw campError;

        // Send WhatsApp message
        if (selectedDoctor) {
          sendWhatsAppMessage(selectedDoctor, campDate);
        }

        toast({
          title: "Camp created successfully!",
          description:
            initialStatus === "scheduled"
              ? "Camp scheduled successfully."
              : "Camp created and active! Redirecting to patient registration...",
        });

        onSuccess(camp.id);
      } catch (err: any) {
        console.error("Camp creation error:", err);
        toast({
          title: "Error creating camp",
          description: err?.message || "Failed to create camp",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      selectedDoctorId,
      campDate,
      consentFile,
      selectedDoctor,
      determineCampStatus,
      uploadConsentForm,
      sendWhatsAppMessage,
      onSuccess,
      toast,
    ]
  );

  const today = new Date().toISOString().split("T")[0];

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
            <Label htmlFor="doctor-select">
              Select Doctor <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedDoctorId}
              onValueChange={handleDoctorSelect}
              disabled={loadingDoctors}
            >
              <SelectTrigger id="doctor-select">
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

          {/* Auto-filled fields */}
          {selectedDoctor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label>Specialty</Label>
                <Input value={selectedDoctor.specialty || "N/A"} readOnly />
              </div>
              <div>
                <Label>Doctor Mobile</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    value={selectedDoctor.phone || "N/A"}
                    readOnly
                  />
                </div>
              </div>
              <div>
                <Label>Clinic Name</Label>
                <Input value={selectedDoctor.clinic_name || "N/A"} readOnly />
              </div>
              <div>
                <Label>Clinic Address</Label>
                <Input value={selectedDoctor.clinic_address || "N/A"} readOnly />
              </div>
              <div className="md:col-span-2">
                <Label>City</Label>
                <Input value={selectedDoctor.city || "N/A"} readOnly />
              </div>
            </div>
          )}

          {/* Camp Date */}
          <div>
            <Label htmlFor="camp-date">
              Camp Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="camp-date"
              type="date"
              value={campDate}
              onChange={(e) => setCampDate(e.target.value)}
              required
              min={today}
            />
          </div>

          {/* Consent Form */}
          <div>
            <Label htmlFor="consent-file">Upload Consent Form (Optional)</Label>
            <Input
              id="consent-file"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            {fileError && (
              <p className="text-sm text-destructive mt-1">{fileError}</p>
            )}
            {consentFile && !fileError && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {consentFile.name} ({(consentFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
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
});

CreateCampInline.displayName = "CreateCampInline";

export default CreateCampInline;