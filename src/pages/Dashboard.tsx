import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Calendar, Users, TrendingUp, LogOut, Stethoscope } from "lucide-react";

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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // ✅ Fetch all camps with doctor info in one query
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

      // ✅ Compute stats locally
      const totalCamps = formattedCamps.length;
      const activeCamps = formattedCamps.filter((c) => c.status === "active").length;
      const completedCamps = formattedCamps.filter((c) => c.status === "completed").length;
      const totalPatients = formattedCamps.reduce(
        (sum, c) => sum + (c.total_patients || 0),
        0
      );

      // ✅ Keep only recent 5 camps for UI
      const recentCamps = formattedCamps.slice(0, 5);

      setCamps(recentCamps);
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
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Stethoscope className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Vitamin D Camp Dashboard</h1>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Calendar className="h-8 w-8 text-medical-blue" />}
            label="Total Camps"
            value={stats.totalCamps}
          />
          <StatCard
            icon={<TrendingUp className="h-8 w-8 text-medical-teal" />}
            label="Active Camps"
            value={stats.activeCamps}
          />
          <StatCard
            icon={<Users className="h-8 w-8 text-medical-success" />}
            label="Total Patients"
            value={stats.totalPatients}
          />
          <StatCard
            icon={<Calendar className="h-8 w-8 text-medical-warning" />}
            label="Completed"
            value={stats.completedCamps}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Recent Camps</h2>
          <Button
            onClick={() => navigate("/create-camp")}
            className="bg-gradient-to-r from-primary to-medical-teal hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Camp
          </Button>
        </div>

        {/* Camps List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {camps.length === 0 ? (
            <EmptyState onCreate={() => navigate("/create-camp")} />
          ) : (
            camps.map((camp) => (
              <Card
                key={camp.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
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
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/camp/${camp.id}`)}
                    >
                      View Details
                    </Button>
                    {camp.status === "active" && (
                      <Button
                        size="sm"
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

/* --- Subcomponents --- */

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
  <Card className="col-span-full text-center p-8">
    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-foreground mb-2">
      No camps found
    </h3>
    <p className="text-muted-foreground mb-4">
      Start by creating your first Vitamin D Risk Assessment Camp.
    </p>
    <Button onClick={onCreate}>
      <Plus className="h-4 w-4 mr-2" />
      Create Your First Camp
    </Button>
  </Card>
);

export default Dashboard;
