import { supabase } from "@/integrations/supabase/client";

export const fetchCampWithDoctor = async (campId: string) => {
  const { data, error } = await supabase
    .from("camps")
    .select(`
      *,
      doctors!inner(*)
    `)
    .eq("id", campId)
    .single();
  if (error) throw error;
  return { ...data, doctor: data.doctors };
};

export const fetchCampPatients = async (campId: string) => {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("camp_id", campId)
    .order("patient_number");
  if (error) throw error;
  return data;
};

export const generateSummaryMessage = (doctorName: string, clinic: string, city: string, date: string, patients: any[]) => {
  const total = patients.length;
  const low = patients.filter(p => p.risk_level === "Low Risk").length;
  const moderate = patients.filter(p => p.risk_level === "Moderate Risk").length;
  const high = patients.filter(p => p.risk_level === "High Risk").length;

  return `Dear Dr. ${doctorName},

Please find the Vitamin D Deficiency Risk Assessment Camp Summary conducted at ${clinic}, ${city}.

📅 Camp Date: ${new Date(date).toLocaleDateString()}
👥 Total Patients Screened: ${total}

🏷️ Risk Distribution:
• Low Risk: ${low}
• Moderate Risk: ${moderate}
• High Risk: ${high}

We sincerely thank you for your kind support and participation.
For any concerns, contact 9000000000.

Warm regards,
Vitamin D Awareness Team`;
};
