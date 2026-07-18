import { useState } from 'react';
import { analysisAPI } from '../api';
import { FlaskConical, Plus, X, AlertTriangle, ChevronDown, ChevronUp, Stethoscope } from 'lucide-react';

const SYMPTOM_OPTIONS = [
  'fever','chills','cough','sore_throat','shortness_of_breath','headache','nausea','vomiting',
  'diarrhea','abdominal_pain','abdominal_cramps','skin_rash','wound_infection','confusion',
  'neck_stiffness','urinary_pain','frequent_urination','bloody_stool','high_fever','bloody_diarrhea',
  'chest_pain','rapid_heart_rate','low_blood_pressure','seizures','jaundice','difficulty_swallowing',
  'swollen_lymph_nodes','muscle_pain','joint_pain','fatigue',
];

const SEVERITY_OPTIONS = ['low','moderate','high','severe'];

export default function Analysis() {
  const [symptoms, setSymptoms] = useState<{name: string; severity: string}[]>([]);
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('moderate');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState('unspecified');
  const [travelHistory, setTravelHistory] = useState('');
  const [foodHistory, setFoodHistory] = useState('');
  const [temperature, setTemperature] = useState(37.5);
  const [heartRate, setHeartRate] = useState(80);
  const [wbc, setWbc] = useState(8000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);

  const addSymptom = () => {
    if (selectedSymptom && !symptoms.find(s => s.name === selectedSymptom)) {
      setSymptoms([...symptoms, { name: selectedSymptom, severity: selectedSeverity }]);
      setSelectedSymptom('');
    }
  };
  const removeSymptom = (i: number) => setSymptoms(symptoms.filter((_, idx) => idx !== i));

  const runAnalysis = async () => {
    if (symptoms.length === 0) return;
    setLoading(true);
    try {
      const res = await analysisAPI.analyze({
        symptoms,
        demographics: { age, gender },
        vital_signs: { temperature, heart_rate: heartRate, wbc },
        travel_history: travelHistory,
        food_history: foodHistory,
      });
      setResult(res.data.results);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bacterial Analysis</h1>
        <p className="text-slate-500 text-sm mt-1">Enter patient data for AI-powered pathogen identification</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Symptoms */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" /> Symptoms
            </h3>
            <div className="flex gap-2 mb-3">
              <select value={selectedSymptom} onChange={(e) => setSelectedSymptom(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="">Select symptom...</option>
                {SYMPTOM_OPTIONS.filter(s => !symptoms.find(x => x.name === s)).map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <select value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={addSymptom} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((s, i) => (
                <span key={i} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  s.severity === 'severe' ? 'bg-red-100 text-red-700' :
                  s.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                  s.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {s.name.replace(/_/g, ' ')}
                  <button onClick={() => removeSymptom(i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {symptoms.length === 0 && <p className="text-xs text-slate-400">No symptoms added yet</p>}
            </div>
          </div>

          {/* Demographics & Vitals */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Patient Demographics & Vitals</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Age</label>
                <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="unspecified">Unspecified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Temperature (°C)</label>
                <input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Heart Rate (bpm)</label>
                <input type="number" value={heartRate} onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">WBC (/μL)</label>
                <input type="number" value={wbc} onChange={(e) => setWbc(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Travel & Exposure History</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Travel History</label>
                <input type="text" value={travelHistory} onChange={(e) => setTravelHistory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g., Southeast Asia, Africa..." />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Food/Exposure History</label>
                <input type="text" value={foodHistory} onChange={(e) => setFoodHistory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g., raw seafood, street food..." />
              </div>
            </div>
          </div>

          <button onClick={runAnalysis} disabled={loading || symptoms.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {loading ? (
              <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Analyzing...</>
            ) : (
              <><FlaskConical className="w-4 h-4" /> Run Analysis</>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {!result ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Add symptoms and run analysis to see results</p>
            </div>
          ) : (
            <>
              {/* Risk Assessment */}
              <div className={`rounded-xl border p-5 ${
                result.risk_assessment.overall_risk === 'critical' ? 'bg-red-50 border-red-200' :
                result.risk_assessment.overall_risk === 'high' ? 'bg-orange-50 border-orange-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-semibold">Risk Assessment</h3>
                </div>
                <p className="text-2xl font-bold capitalize">{result.risk_assessment.overall_risk}</p>
                <p className="text-sm mt-1">Severity: {result.risk_assessment.severity_score}/10</p>
                <p className="text-sm capitalize">Urgency: {result.risk_assessment.urgency?.replace(/_/g, ' ')}</p>
              </div>

              {/* Top Candidates */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Top Candidates</h3>
                <div className="space-y-2">
                  {result.candidates.map((c: any) => (
                    <div key={c.species_id} className="border border-slate-100 rounded-lg overflow-hidden">
                      <button onClick={() => setShowDetails(showDetails === c.rank ? null : c.rank)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50">
                        <span className="text-xs font-mono text-slate-400 w-5">#{c.rank}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate italic">{c.scientific_name}</p>
                          <p className="text-xs text-slate-500">{c.common_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary-600">{c.confidence_score}%</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            c.risk_level === 'critical' ? 'bg-red-100 text-red-700' :
                            c.risk_level === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>{c.risk_level}</span>
                        </div>
                        {showDetails === c.rank ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                      {showDetails === c.rank && (
                        <div className="px-3 pb-3 text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-2">
                          <p><span className="font-medium">Symptoms:</span> {c.matching_symptoms?.join(', ') || 'None matched'}</p>
                          <p><span className="font-medium">Labs:</span> {c.matching_lab_findings?.join(', ') || 'N/A'}</p>
                          <p><span className="font-medium">Evidence:</span> {c.supporting_evidence || 'N/A'}</p>
                          <p className="text-slate-500 italic">{c.reasoning}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Tests */}
              {result.recommended_tests?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Recommended Tests</h3>
                  <div className="space-y-2">
                    {result.recommended_tests.map((t: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                        <div className={`w-2 h-2 rounded-full ${t.priority === 'immediate' ? 'bg-red-500' : t.priority === 'urgent' ? 'bg-orange-500' : 'bg-green-500'}`} />
                        <div className="flex-1">
                          <p className="text-xs font-medium">{t.test}</p>
                          <p className="text-[10px] text-slate-500">{t.specimen} | {t.turnaround}</p>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          t.priority === 'immediate' ? 'bg-red-100 text-red-700' : t.priority === 'urgent' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>{t.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800">
                <AlertTriangle className="w-4 h-4 mb-1" />
                {result.medical_disclaimer}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
