"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Brain, CheckCircle2, ChevronRight, FileText, HelpCircle, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { analyzeInsuranceQuestion, getInsurancePolicies, type CoverageStatus } from "@/lib/insurance-expert";

function badgeClass(status: CoverageStatus) {
  if (status === "covered") return "border-emerald-300/20 bg-emerald-400/12 text-emerald-50";
  if (status === "excluded") return "border-rose-300/20 bg-rose-400/12 text-rose-50";
  return "border-amber-300/20 bg-amber-400/12 text-amber-50";
}

function badgeLabel(status: CoverageStatus) {
  if (status === "covered") return "cobertura clara";
  if (status === "excluded") return "fuera";
  return "requiere matiz";
}

function StatusIcon({ status }: { status: CoverageStatus }) {
  if (status === "covered") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "excluded") return <ShieldAlert className="h-4 w-4" />;
  return <AlertTriangle className="h-4 w-4" />;
}

export function HomeInsuranceAssistant() {
  const policies = useMemo(() => getInsurancePolicies(), []);
  const [selectedPolicyId] = useState(policies[0]?.id ?? "");
  const [question, setQuestion] = useState("");
  const [clarifications, setClarifications] = useState<Record<string, string>>({});

  const provisionalAnswer = useMemo(() => analyzeInsuranceQuestion(question, selectedPolicyId), [question, selectedPolicyId]);
  const combinedQuestion = useMemo(() => {
    const extra = Object.entries(clarifications)
      .filter(([, value]) => value.trim())
      .map(([prompt, value]) => `${prompt}: ${value.trim()}`)
      .join(". ");

    return [question.trim(), extra].filter(Boolean).join(". ");
  }, [clarifications, question]);

  const answer = useMemo(() => analyzeInsuranceQuestion(combinedQuestion, selectedPolicyId), [combinedQuestion, selectedPolicyId]);
  const policy = policies[0];

  useEffect(() => {
    const prompts = provisionalAnswer?.followUpQuestions ?? [];
    setClarifications((current) => {
      const next: Record<string, string> = {};
      for (const prompt of prompts) next[prompt] = current[prompt] ?? "";
      return next;
    });
  }, [provisionalAnswer?.followUpQuestions]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[34px] border border-emerald-300/12 bg-[linear-gradient(135deg,rgba(14,33,28,0.96),rgba(11,19,29,0.94)_42%,rgba(8,12,22,0.96))] shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-emerald-200/72">
            <span>Seguro experto</span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 tracking-[0.24em] text-zinc-300">base multi-póliza</span>
          </div>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Interpretación + entrevista</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300/88">
                Esto ya no debería limitarse a keywords. Debe interpretar el caso, detectar huecos y preguntarte lo que falte antes de darte un criterio útil.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-300/18 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50">
              {policy?.title}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {policy?.facts.map((fact) => (
              <div key={fact.label} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-400">{fact.label}</div>
                <div className="mt-2 text-sm font-medium text-white">{fact.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[24px] border border-amber-300/14 bg-amber-400/[0.06] p-4 text-sm leading-6 text-zinc-100">
            <div className="text-[11px] uppercase tracking-[0.24em] text-amber-200/78">Dato conflictivo detectado</div>
            <div className="mt-2">
              En la póliza figura <span className="font-medium">uso: vivienda secundaria</span>. Si esta vivienda es realmente tu vivienda habitual, conviene revisar esta discrepancia con Santander antes de confiar en que todo está bien declarado.
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
        <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Consulta libre</div>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">Cuéntamelo como te salga</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300/80">
          Ejemplos: “el grifo de la cocina pierde agua y ha hinchado el mueble”, “he mojado al vecino de abajo”, “tengo humedad desde hace meses”, “me han reventado el trastero”.
        </p>

        <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-3">
          <label className="flex items-start gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <Search className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Qué ha pasado, desde cuándo, qué se ha dañado y si afecta a terceros..."
              className="min-h-[110px] w-full resize-y bg-transparent text-sm leading-6 text-white outline-none placeholder:text-zinc-500"
            />
          </label>
        </div>

        {question.trim() && answer ? (
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em] ${badgeClass(answer.status)}`}>
                  <StatusIcon status={answer.status} />
                  {badgeLabel(answer.status)}
                </div>
              </div>

              <h4 className="mt-4 text-2xl font-semibold tracking-tight text-white">{answer.title}</h4>
              <p className="mt-3 text-sm leading-7 text-zinc-300/85">{answer.summary}</p>

              <div className="mt-4 rounded-[20px] border border-fuchsia-300/12 bg-fuchsia-400/[0.05] p-4 text-sm leading-7 text-zinc-100">
                <div className="text-[11px] uppercase tracking-[0.24em] text-fuchsia-200/72">Veredicto ejecutivo</div>
                <div className="mt-2 font-medium">{answer.executiveVerdict}</div>
              </div>

              {Object.values(clarifications).some((value) => value.trim()) ? (
                <div className="mt-4 rounded-[18px] border border-emerald-300/12 bg-emerald-400/[0.05] p-4 text-sm leading-6 text-zinc-200/86">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-200/72">Dictamen rehecho con tus aclaraciones</div>
                  <div className="mt-2">La lectura de abajo ya incorpora lo que has respondido en la entrevista.</div>
                </div>
              ) : null}

              <div className="mt-5 rounded-[20px] border border-cyan-300/12 bg-cyan-400/[0.05] p-4 text-sm leading-7 text-cyan-50/92">
                <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/72">Interpretación</div>
                <ul className="mt-2 space-y-2">
                  {answer.rationale.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[20px] border border-emerald-300/12 bg-emerald-400/[0.05] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-50"><ShieldCheck className="h-4 w-4" /> Lo que sí puede entrar</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-200/86">
                    {answer.coveredItems.length ? answer.coveredItems.map((item) => <li key={item}>• {item}</li>) : <li>• Con lo que has contado, no veo un bloque cubierto claro.</li>}
                  </ul>
                </div>
                <div className="rounded-[20px] border border-rose-300/12 bg-rose-400/[0.05] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-rose-50"><ShieldAlert className="h-4 w-4" /> Lo que pinta fuera / riesgo</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-200/86">
                    {answer.excludedItems.length ? answer.excludedItems.map((item) => <li key={item}>• {item}</li>) : <li>• Sin exclusiones claras detectadas todavía.</li>}
                  </ul>
                </div>
              </div>
            </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-white"><HelpCircle className="h-4 w-4 text-amber-200" /> Para afinarlo bien necesito esto</div>
                <div className="mt-4 space-y-4">
                  {answer.followUpQuestions.map((item) => (
                    <label key={item} className="block rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="text-sm leading-6 text-zinc-200/90">{item}</div>
                      <textarea
                        value={clarifications[item] ?? ""}
                        onChange={(event) => setClarifications((current) => ({ ...current, [item]: event.target.value }))}
                        placeholder="Respóndeme aquí para recalcular el criterio..."
                        className="mt-3 min-h-[74px] w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-white"><Brain className="h-4 w-4 text-cyan-200" /> Cómo lo enfocaría</div>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-200/86">
                    {answer.claimAdvice.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-white"><ShieldAlert className="h-4 w-4 text-rose-200" /> Qué no mezclaría</div>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-200/86">
                    {answer.doNotSay.length ? answer.doNotSay.map((item) => <li key={item}>• {item}</li>) : <li>• No veo un bloqueo especial adicional más allá de contar bien los hechos.</li>}
                  </ul>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-white"><FileText className="h-4 w-4 text-emerald-200" /> Texto sugerido para abrir parte</div>
                  <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-100">
                    {answer.suggestedClaimText}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-white"><FileText className="h-4 w-4 text-amber-200" /> Base de póliza</div>
                <div className="mt-4 space-y-3">
                  {answer.evidence.length ? answer.evidence.map((item, index) => (
                    <div key={`${item.page}-${index}`} className="rounded-[18px] border border-white/8 bg-white/[0.03] p-3 text-sm leading-6 text-zinc-200/82">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Página {item.page}</div>
                      <div className="mt-1">{item.excerpt}</div>
                    </div>
                  )) : <div className="text-sm text-zinc-400">Todavía sin cita concreta localizada.</div>}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
          <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Operativa</div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">Contactos y notas de póliza</h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-200/84">
            {policy?.contacts.map((item) => <div key={item.label}><span className="text-zinc-400">{item.label}:</span> {item.value}</div>)}
          </div>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-200/84">
            {policy?.notes.map((item) => (
              <li key={item} className="flex gap-3"><ChevronRight className="mt-1 h-4 w-4 shrink-0 text-cyan-200" /> <span>{item}</span></li>
            ))}
          </ul>
          <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-300/84">
            Esta base ya está pensada para meter más pólizas después. Ahora solo hay una, pero el modelo ya no depende de una pantalla única ni de un caso hardcodeado.
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
          <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Qué debería hacer la skill</div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">Comportamiento esperado</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-200/84">
            <li className="flex gap-3"><ChevronRight className="mt-1 h-4 w-4 shrink-0 text-cyan-200" /><span>Entender el caso aunque lo cuentes con lenguaje normal.</span></li>
            <li className="flex gap-3"><ChevronRight className="mt-1 h-4 w-4 shrink-0 text-cyan-200" /><span>Preguntar solo lo necesario para distinguir cobertura, exclusión y riesgos.</span></li>
            <li className="flex gap-3"><ChevronRight className="mt-1 h-4 w-4 shrink-0 text-cyan-200" /><span>Separar claramente qué parte del problema entra y cuál no.</span></li>
            <li className="flex gap-3"><ChevronRight className="mt-1 h-4 w-4 shrink-0 text-cyan-200" /><span>Decirte cómo enfocarlo antes de abrir parte, no enseñarte tripas internas.</span></li>
          </ul>
          <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-300/84">
            El siguiente salto bueno es convertir esto en una entrevista guiada de verdad, no en una respuesta única con adornos. Esa parte sí merece hacerse bien.
          </div>
        </div>
      </section>
    </div>
  );
}
