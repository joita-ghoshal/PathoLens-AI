import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { speciesAPI } from '../api';
import { ArrowLeft } from 'lucide-react';

export default function SpeciesDetail() {
  const { id } = useParams();
  const [species, setSpecies] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    speciesAPI.detail(Number(id)).then((r) => { setSpecies(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!species) return <div className="text-center py-12 text-slate-500">Species not found</div>;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>
      {children}
    </div>
  );

  const KV = ({ k, v }: { k: string; v: any }) => (
    <div className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{k}</span>
      <span className="text-xs font-medium text-slate-900">{v || 'N/A'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <Link to="/app/species" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Species</Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold italic text-slate-900">{species.scientific_name}</h1>
            <p className="text-slate-500 mt-1">{species.common_name}</p>
          </div>
          <div className="flex gap-2">
            {species.is_pathogenic && <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Pathogenic</span>}
            {species.is_beneficial && <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Beneficial</span>}
            {species.is_opportunistic && <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Opportunistic</span>}
          </div>
        </div>
        {species.description && <p className="text-sm text-slate-600 mt-4">{species.description}</p>}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Classification */}
        <Section title="Classification">
          <KV k="Kingdom" v={species.kingdom} />
          <KV k="Phylum" v={species.phylum} />
          <KV k="Class" v={species.class_name} />
          <KV k="Order" v={species.order_name} />
          <KV k="Family" v={species.family} />
          <KV k="Genus" v={species.genus} />
          <KV k="Species" v={species.species} />
        </Section>

        {/* Morphology */}
        <Section title="Morphology & Characteristics">
          <KV k="Gram Stain" v={species.gram_stain} />
          <KV k="Shape" v={species.shape} />
          <KV k="Size" v={`${species.size_micrometers} μm`} />
          <KV k="Arrangement" v={species.arrangement} />
          <KV k="Motility" v={species.motility} />
          <KV k="Spore Formation" v={species.spore_formation ? 'Yes' : 'No'} />
          <KV k="Oxygen Requirement" v={species.oxygen_requirement} />
          <KV k="Biosafety Level" v={`BSL-${species.biosafety_level}`} />
          <KV k="Risk Level" v={<span className={`capitalize font-medium ${
            species.risk_level === 'critical' ? 'text-red-600' : species.risk_level === 'high' ? 'text-orange-600' : ''
          }`}>{species.risk_level}</span>} />
        </Section>

        {/* Habitat */}
        <Section title="Habitat & Growth">
          <KV k="Habitat" v={species.habitat} />
          <KV k="Optimal Temp" v={`${species.growth_temperature_optimal}°C`} />
          <KV k="Culture Media" v={species.culture_media} />
        </Section>

        {/* Diseases */}
        {species.diseases?.length > 0 && (
          <Section title="Associated Diseases">
            <div className="space-y-2">
              {species.diseases.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-sm font-medium">{d.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    d.severity === 'severe' ? 'bg-red-100 text-red-700' : d.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>{d.severity}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Virulence Factors */}
        {species.virulence_factors?.length > 0 && (
          <Section title="Virulence Factors">
            <div className="space-y-2">
              {species.virulence_factors.map((vf: any, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-red-50">
                  <p className="text-sm font-medium text-red-800">{vf.name}</p>
                  <p className="text-xs text-red-600">{vf.mechanism}</p>
                  {vf.gene_name && <p className="text-[10px] text-red-500 mt-0.5">Gene: {vf.gene_name}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Antibiotic Resistance */}
        {species.antibiotic_resistance?.length > 0 && (
          <Section title="Antibiotic Resistance">
            <div className="space-y-2">
              {species.antibiotic_resistance.map((ar: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <div>
                    <p className="text-sm font-medium">{ar.antibiotic_name}</p>
                    <p className="text-xs text-slate-500">{ar.resistance_mechanism}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    ar.susceptibility === 'resistant' ? 'bg-red-100 text-red-700' :
                    ar.susceptibility === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{ar.susceptibility}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Proteins */}
        {species.protein_profiles?.length > 0 && (
          <Section title="Protein Profiles">
            <div className="space-y-2">
              {species.protein_profiles.map((p: any, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-blue-50">
                  <p className="text-sm font-medium text-blue-800">{p.protein_name}</p>
                  {p.uniprot_id && <p className="text-[10px] text-blue-600">UniProt: {p.uniprot_id}</p>}
                  <p className="text-xs text-blue-600">{p.function_description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Toxins */}
        {species.toxins?.length > 0 && (
          <Section title="Toxins">
            <div className="space-y-2">
              {species.toxins.map((t: any, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-orange-50">
                  <p className="text-sm font-medium text-orange-800">{t.toxin_name} ({t.toxin_type})</p>
                  <p className="text-xs text-orange-600">{t.mechanism_of_action}</p>
                  <p className="text-[10px] text-orange-500">Target: {t.target_cells}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Enzymes */}
        {species.enzymes?.length > 0 && (
          <Section title="Enzymes">
            <div className="space-y-2">
              {species.enzymes.map((e: any, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-purple-50">
                  <p className="text-sm font-medium text-purple-800">{e.enzyme_name} (EC: {e.ec_number})</p>
                  <p className="text-xs text-purple-600">{e.function_description}</p>
                  {e.industrial_use && <p className="text-[10px] text-purple-500">Industrial: {e.industrial_use}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Lab Tests */}
        {species.lab_tests?.length > 0 && (
          <Section title="Diagnostic Lab Tests">
            <div className="space-y-2">
              {species.lab_tests.map((lt: any, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-slate-50">
                  <p className="text-sm font-medium">{lt.test_name}</p>
                  <p className="text-xs text-slate-500">{lt.test_type} | Specimen: {lt.specimen_type}</p>
                  <p className="text-[10px] text-slate-400">Sensitivity: {(lt.sensitivity * 100).toFixed(0)}% | Specificity: {(lt.specificity * 100).toFixed(0)}% | TAT: {lt.turnaround_time}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Beneficial Properties */}
        {species.beneficial_properties?.length > 0 && (
          <Section title="Beneficial Properties">
            <div className="space-y-2">
              {species.beneficial_properties.map((bp: any, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-green-50">
                  <p className="text-sm font-medium text-green-800">{bp.property_type}</p>
                  <p className="text-xs text-green-600">{bp.description}</p>
                  {bp.health_benefit && <p className="text-[10px] text-green-500">Health: {bp.health_benefit}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Immune Responses */}
        {species.immune_responses?.length > 0 && (
          <Section title="Immune Responses">
            <div className="space-y-2">
              {species.immune_responses.map((ir: any, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-indigo-50">
                  <p className="text-sm font-medium text-indigo-800">{ir.immune_pathway} ({ir.response_type})</p>
                  {ir.cytokine_profile && <p className="text-xs text-indigo-600">Cytokines: {ir.cytokine_profile}</p>}
                  {ir.immune_evasion_mechanism && <p className="text-[10px] text-indigo-500">Evasion: {ir.immune_evasion_mechanism}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
