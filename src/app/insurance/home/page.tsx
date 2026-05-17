import { HomeInsuranceAssistant } from "@/components/insurance/home-insurance-assistant";
import { GlassShell } from "@/components/ui/shell";

export const dynamic = "force-dynamic";

export default function HomeInsurancePage() {
  return (
    <GlassShell
      title="Seguro Hogar"
      subtitle="Consulta coberturas, exclusiones y cómo enfocar un parte sin improvisar."
    >
      <HomeInsuranceAssistant />
    </GlassShell>
  );
}
