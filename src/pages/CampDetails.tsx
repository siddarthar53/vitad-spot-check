import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, MapPin, Phone, Users, FileText } from "lucide-react";
import { fetchCampWithDoctor, fetchCampPatients, generateSummaryMessage } from "@/utils/campUtils";

/* ----------------- RISK DISTRIBUTION COMPONENT ----------------- */
const RiskDistribution = ({ low, moderate, high }: { low: number; moderate: number; high: number }) => {
  const total = low + moderate + high || 1;
  const lowPct = (low / total) * 100;
  const modPct = (moderate / total) * 100;
  const highPct = (high / total) * 100;

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-foreground mb-1">Risk Distribution</p>
      <div className="w-full h-2 rounded-full overflow-hidden bg-muted/50 flex">
        <div className="bg-green-500 h-full" style={{ width: `${lowPct}%` }}></div>
        <div className="bg-yellow-400 h-full" style={{ width: `${modPct}%` }}></div>
        <div className="bg-red-500 h-full" style={{ width: `${highPct}%` }}></div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        🟢 Low: {low} &nbsp; | &nbsp; 🟡 Moderate: {moderate} &nbsp; | &nbsp; 🔴 High: {high}
      </p>
    </div>
  );
};
/* --------------------------------------------------------------- */

const CampDetails = () => {
  const { campId } = useParams<{ campId: string }>();
  const [camp, setCamp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (campId) fetchCampDetails();
  }, [campId]);

  const fetchCampDetails = async () => {
    try {
      const data = await fetchCampWithDoctor(campId!);
      const patients = await fetchCampPatients(campId!);

      const low = patients.filter(p => p.risk_level === "Low Risk").length;
      const moderate = patients.filter(p => p.risk_level === "Moderate Risk").length;
      const high = patients.filter(p => p.risk_level === "High Risk").length;

      setCamp({ ...data, risk_summary: { low, moderate, high } });
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

  const sendSummaryToDoctor = async () => {
    try {
      const patients = await fetchCampPatients(camp.id);
      const message = generateSummaryMessage(
        camp.doctor.name,
        camp.doctor.clinic_name,
        camp.doctor.city,
        camp.camp_date,
        patients
      );

      const phone = camp.doctor.whatsapp_number.startsWith("+")
        ? camp.doctor.whatsapp_number
        : `+91${camp.doctor.whatsapp_number}`;
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      toast({
        title: "Summary ready",
        description: "Opening WhatsApp to send summary...",
      });
    } catch (err: any) {
      toast({
        title: "Error sending summary",
        description: err.message,
        variant: "destructive",
      });
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
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Camp Details</h1>
            <p className="text-muted-foreground mt-2">
              {camp.doctor.name} • {new Date(camp.camp_date).toLocaleDateString()}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm capitalize">
            {camp.status}
          </Badge>
        </div>

        {/* Top Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <div className="text-sm text-muted-foreground">Camp Date</div>
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
                  <div className="text-sm text-muted-foreground">Total Patients</div>
                  <div className="text-xl font-bold text-foreground">
                    {camp.total_patients || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="text-xl font-bold text-foreground capitalize">
                    {camp.status}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ Risk Distribution */}
        {camp.status === "completed" && camp.risk_summary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskDistribution
                low={camp.risk_summary.low}
                moderate={camp.risk_summary.moderate}
                high={camp.risk_summary.high}
              />
            </CardContent>
          </Card>
        )}

        {/* Doctor and Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" /> Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p><strong>Name:</strong> {camp.doctor.name}</p>
              <p><strong>Specialty:</strong> {camp.doctor.specialty}</p>
              <p><strong>Clinic:</strong> {camp.doctor.clinic_name}</p>
              <p><strong>Address:</strong> {camp.doctor.clinic_address}, {camp.doctor.city}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p><strong>Phone Number:</strong> {camp.doctor.phone}</p>
              <p><strong>WhatsApp:</strong> {camp.doctor.whatsapp_number || "Not Provided"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Send Summary Button */}
        {camp.status === "completed" && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={sendSummaryToDoctor}
              className="bg-gradient-to-r from-green-600 to-green-400 hover:opacity-90"
            >
              Send Summary to Doctor
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampDetails;
