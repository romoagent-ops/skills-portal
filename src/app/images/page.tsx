import { ImageWorkbench } from "@/components/images/image-workbench";
import { GlassShell } from "@/components/ui/shell";

export const dynamic = "force-dynamic";

export default function ImagesPage() {
  return (
    <GlassShell
      title="Images"
      subtitle="Genera y edita imágenes con un briefing afinado antes de disparar el render."
    >
      <ImageWorkbench />
    </GlassShell>
  );
}
