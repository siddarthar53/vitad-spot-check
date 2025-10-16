import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CreateCampInline from "./CreateCampInline";
import {
  Plus,
  Calendar,
  Users,
  TrendingUp,
  LogOut,
  Stethoscope,
} from "lucide-react";

/* ----------------- RISK DISTRIBUTION COMPONENT ----------------- */
const RiskDistribution = ({
  low,
  moderate,
  high,
}: {
  low: number;
  moderate: number;
  high: number;
}) => {
  const total = low + moderate + high || 1;
  const lowPct = (low / total) * 100;
  const modPct = (moderate / total) * 100;
  const highPct = (high / total) * 100;

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-foreground mb-1">
        Risk Distribution
      </p>
      <div className="w-full h-2 rounded-full overflow-hidden bg-muted/50 flex">
        <div className="bg-green-500 h-full" style={{ width: `${lowPct}%` }}></div>
        <div className="bg-yellow-400 h-full" style={{ width: `${modPct}%` }}></div>
        <div className="bg-red-500 h-full" style={{ width: `${highPct}%` }}></div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        🟢 Low: {low} &nbsp; | &nbsp; 🟡 Moderate: {moderate} &nbsp; | &nbsp; 🔴
        High: {high}
      </p>
    </div>
  );
};

/* --------------------------------------------------------------- */

interface Camp {
  id: string;
  camp_date: string;
  status: string;
  total_patients: number;
  doctor: {
    name: string;
    clinic_name: string;
    city: string;
  };
  risk_summary?: {
    low: number;
    moderate: number;
    high: number;
  };
}

interface DashboardStats {
  totalCamps: number;
  activeCamps: number;
  completedCamps: number;
  totalPatients: number;
}

const Dashboard = () => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCamps: 0,
    activeCamps: 0,
    completedCamps: 0,
    totalPatients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateCampModal, setShowCreateCampModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data, error } = await supabase
        .from("camps")
        .select(`
          id,
          camp_date,
          status,
          total_patients,
          doctors!inner(name, clinic_name, city)
        `)
        .order("camp_date", { ascending: false });

      if (error) throw error;

      const formattedCamps =
        data?.map((camp: any) => ({
          ...camp,
          doctor: camp.doctors,
        })) || [];

      // Compute stats
      const totalCamps = formattedCamps.length;
      const activeCamps = formattedCamps.filter((c) => c.status === "active").length;
      const completedCamps = formattedCamps.filter(
        (c) => c.status === "completed"
      ).length;
      const totalPatients = formattedCamps.reduce(
        (sum, c) => sum + (c.total_patients || 0),
        0
      );

      // Fetch risk distribution for completed camps
      for (const camp of formattedCamps) {
        if (camp.status === "completed") {
          const { data: patients } = await supabase
            .from("patients")
            .select("risk_level")
            .eq("camp_id", camp.id);

          const low = patients?.filter((p) => p.risk_level === "Low Risk").length || 0;
          const moderate =
            patients?.filter((p) => p.risk_level === "Moderate Risk").length || 0;
          const high = patients?.filter((p) => p.risk_level === "High Risk").length || 0;

          camp.risk_summary = { low, moderate, high };
        }
      }

      setCamps(formattedCamps);
      setStats({ totalCamps, activeCamps, completedCamps, totalPatients });
    } catch (err: any) {
      toast({
        title: "Error fetching dashboard data",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
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
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Stethoscope className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                Vitamin D Camp Dashboard
              </h1>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Calendar className="h-8 w-8 text-medical-blue" />} label="Total Camps" value={stats.totalCamps} />
          <StatCard icon={<TrendingUp className="h-8 w-8 text-medical-teal" />} label="Active Camps" value={stats.activeCamps} />
          <StatCard icon={<Users className="h-8 w-8 text-medical-success" />} label="Total Patients" value={stats.totalPatients} />
          <StatCard icon={<Calendar className="h-8 w-8 text-medical-warning" />} label="Completed" value={stats.completedCamps} />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Recent Camps</h2>
          <Button onClick={() => setShowCreateCampModal(true)} className="bg-gradient-to-r from-primary to-medical-teal hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" /> Create New Camp
          </Button>

          {showCreateCampModal && (
            <Dialog open={showCreateCampModal} onOpenChange={setShowCreateCampModal}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Camp</DialogTitle>
                </DialogHeader>
                <CreateCampInline
                  onSuccess={(campId) => {
                    setShowCreateCampModal(false);
                    navigate(`/camp/${campId}/patients`);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Camps List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {camps.length === 0 ? (
            <EmptyState onCreate={() => setShowCreateCampModal(true)} />
          ) : (
            camps.map((camp) => (
              <Card key={camp.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{camp.doctor.name}</CardTitle>
                      <CardDescription>
                        {camp.doctor.clinic_name}, {camp.doctor.city}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(camp.status)}>
                      {camp.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Camp Date:</span>
      <span className="font-medium">
        {new Date(camp.camp_date).toLocaleDateString()}
      </span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Patients:</span>
      <span className="font-medium">{camp.total_patients || 0}</span>
    </div>

    {/* ✅ Risk Distribution */}
    {camp.status === "completed" && camp.risk_summary && (
      <RiskDistribution
        low={camp.risk_summary.low}
        moderate={camp.risk_summary.moderate}
        high={camp.risk_summary.high}
      />
    )}
  </div>

  {/* ✅ Actions at the bottom */}
  <div className="mt-4 flex space-x-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(`/camp/${camp.id}`)}
      className="flex-1"
    >
      View Details
    </Button>

    {camp.status === "active" && (
      <Button
        size="sm"
        className="flex-1 bg-gradient-to-r from-primary to-medical-teal hover:opacity-90"
        onClick={() => navigate(`/camp/${camp.id}/patients`)}
      >
        Manage Patients
      </Button>
    )}
  </div>
</CardContent>

              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <Card className="bg-gradient-to-br from-card to-background border-primary/20">
    <CardContent className="p-6 flex items-center">
      <div className="flex-shrink-0">{icon}</div>
      <div className="ml-4">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </div>
    </CardContent>
  </Card>
);

const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <Card className="col-span-full text-center p-10 bg-muted/30">
    <Stethoscope className="h-12 w-12 text-primary mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-foreground mb-2">
      Start Your First Vitamin D Camp
    </h3>
    <p className="text-muted-foreground mb-4">
      No active camps yet. Create one now to begin patient screening!
    </p>
    <Button onClick={onCreate} className="bg-gradient-to-r from-primary to-medical-teal hover:opacity-90">
      <Plus className="h-4 w-4 mr-2" /> Create Camp
    </Button>
  </Card>
);

export default Dashboard;
