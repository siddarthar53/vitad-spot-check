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
  totalPatients: number;
  completedCamps: number;
}

const Dashboard = () => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCamps: 0,
    activeCamps: 0,
    totalPatients: 0,
    completedCamps: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: campsData, error: campsError } = await supabase
        .from("camps")
        .select(`
          id,
          camp_date,
          status,
          total_patients,
          doctors!inner(name, clinic_name, city)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (campsError) throw campsError;

      const formattedCamps = campsData?.map(camp => ({
        ...camp,
        doctor: camp.doctors
      })) || [];

      setCamps(formattedCamps);

      // Calculate stats
      const { data: allCamps, error: statsError } = await supabase
        .from("camps")
        .select("status, total_patients");

      if (statsError) throw statsError;

      const totalCamps = allCamps?.length || 0;
      const activeCamps = allCamps?.filter(camp => camp.status === "active").length || 0;
      const completedCamps = allCamps?.filter(camp => camp.status === "completed").length || 0;
      const totalPatients = allCamps?.reduce((sum, camp) => sum + (camp.total_patients || 0), 0) || 0;

      setStats({
        totalCamps,
        activeCamps,
        completedCamps,
        totalPatients,
      });
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
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
              <h1 className="text-xl font-bold text-foreground">VitaD Risk Assessment</h1>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-card to-background border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-medical-blue" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Camps</div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalCamps}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-background border-medical-teal/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-medical-teal" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-muted-foreground">Active Camps</div>
                  <div className="text-2xl font-bold text-foreground">{stats.activeCamps}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-background border-medical-success/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-medical-success" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Patients</div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalPatients}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-background border-medical-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-medical-warning" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-muted-foreground">Completed</div>
                  <div className="text-2xl font-bold text-foreground">{stats.completedCamps}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Recent Camps</h2>
          <Button 
            onClick={() => navigate("/create-camp")}
            className="bg-gradient-to-r from-primary to-medical-teal hover:from-primary/90 hover:to-medical-teal/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Camp
          </Button>
        </div>

        {/* Recent Camps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {camps.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No camps yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first Vitamin D risk assessment camp.
                </p>
                <Button onClick={() => navigate("/create-camp")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Camp
                </Button>
              </CardContent>
            </Card>
          ) : (
            camps.map((camp) => (
              <Card key={camp.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{camp.doctor.name}</CardTitle>
                      <CardDescription>{camp.doctor.clinic_name}, {camp.doctor.city}</CardDescription>
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

export default Dashboard;