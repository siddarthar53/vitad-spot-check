import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, MapPin, Phone, Users, Plus, FileText } from "lucide-react";

interface CampData {
  id: string;
  camp_date: string;
  status: string;
  total_patients: number;
  consent_form_url: string | null;
  doctor: {
    name: string;
    specialty: string;
    clinic_name: string;
    clinic_address: string;
    city: string;
    phone: string;
    whatsapp_number: string;
  };
}

const CampDetails = () => {
  const { campId } = useParams<{ campId: string }>();
  const [camp, setCamp] = useState<CampData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (campId) {
      fetchCampDetails();
    }
  }, [campId]);

  const fetchCampDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("camps")
        .select(`
          *,
          doctors!inner(*)
        `)
        .eq("id", campId)
        .single();

      if (error) throw error;

      setCamp({
        ...data,
        doctor: data.doctors
      });
    } catch (error: any) {
      toast({
        title: "Error fetching camp details",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCamp = async () => {
    if (!camp) return;

    try {
      const { error } = await supabase
        .from("camps")
        .update({ status: "completed" })
        .eq("id", camp.id);

      if (error) throw error;

      toast({
        title: "Camp completed successfully",
        description: "The camp has been marked as completed.",
      });

      setCamp({ ...camp, status: "completed" });
    } catch (error: any) {
      toast({
        title: "Error completing camp",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading camp details...</p>
        </div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Camp not found</h2>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Camp Details</h1>
              <p className="text-muted-foreground mt-2">
                {camp.doctor.name} • {new Date(camp.camp_date).toLocaleDateString()}
              </p>
            </div>
            <Badge variant={getStatusBadgeVariant(camp.status)} className="text-sm">
              {camp.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-muted-foreground">Camp Date</div>
                  <div className="text-xl font-bold text-foreground">
                    {new Date(camp.camp_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-medical-teal" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Patients</div>
                  <div className="text-xl font-bold text-foreground">{camp.total_patients || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-medical-success" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="text-xl font-bold text-foreground capitalize">{camp.status}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="text-lg font-semibold">{camp.doctor.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Specialty</Label>
                <p className="text-base">{camp.doctor.specialty}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Clinic</Label>
                <p className="text-base">{camp.doctor.clinic_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="text-base">{camp.doctor.clinic_address}, {camp.doctor.city}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                <p className="text-base font-mono">{camp.doctor.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">WhatsApp</Label>
                <p className="text-base font-mono">{camp.doctor.whatsapp_number || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          {camp.status === "active" && (
            <>
              <Button
                onClick={() => navigate(`/camp/${camp.id}/patients`)}
                className="bg-gradient-to-r from-primary to-medical-teal hover:from-primary/90 hover:to-medical-teal/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Manage Patients
              </Button>
              {camp.total_patients >= 20 && (
                <Button
                  variant="outline"
                  onClick={handleCompleteCamp}
                >
                  Complete Camp
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for labels
const Label = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={className}>{children}</span>
);

export default CampDetails;