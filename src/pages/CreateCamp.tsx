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

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("is_selected_by_marketing", true)
        .order("name");

      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching doctors",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setDoctorPhone(doctor.phone);
    }
  };

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

      // Create the camp
      const { data: camp, error: campError } = await supabase
        .from("camps")
        .insert({
          user_id: user.id,
          doctor_id: selectedDoctorId,
          camp_date: campDate,
          status: "active",
        })
        .select()
        .single();

      if (campError) throw campError;

      toast({
        title: "Camp created successfully!",
        description: "You can now start registering patients.",
      });

      navigate(`/camp/${camp.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating camp",
        description: error.message,
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
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Create New Camp</h1>
          <p className="text-muted-foreground mt-2">
            Set up a new Vitamin D deficiency risk assessment camp
          </p>
        </div>

        <form onSubmit={handleCreateCamp} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Doctor Selection
              </CardTitle>
              <CardDescription>
                Select a doctor from the pre-approved list for this camp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor">Select Doctor</Label>
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
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <span className="ml-2 font-medium">{selectedDoctor.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Specialty:</span>
                        <span className="ml-2 font-medium">{selectedDoctor.specialty}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Clinic:</span>
                        <span className="ml-2 font-medium">{selectedDoctor.clinic_name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">City:</span>
                        <span className="ml-2 font-medium">{selectedDoctor.city}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="ml-2 font-medium">{selectedDoctor.clinic_address}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Camp Details
              </CardTitle>
              <CardDescription>
                Provide the essential information for the camp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campDate">Camp Date</Label>
                  <Input
                    id="campDate"
                    type="date"
                    value={campDate}
                    onChange={(e) => setCampDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="doctorPhone">Doctor Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="doctorPhone"
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-primary" />
                Consent Form
              </CardTitle>
              <CardDescription>
                Upload the scanned doctor consent form (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="consentFile">Consent Form Upload</Label>
                <Input
                  id="consentFile"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setConsentFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-muted-foreground">
                  Accepted formats: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedDoctorId || !campDate}
              className="bg-gradient-to-r from-primary to-medical-teal hover:from-primary/90 hover:to-medical-teal/90"
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