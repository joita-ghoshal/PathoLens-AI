import { Link } from 'react-router-dom';
import { Microscope, Brain, ShieldCheck, Activity, Zap, ArrowRight } from 'lucide-react';

export default function Landing() {
  const features = [
    { icon: Brain, title: 'AI-Powered Analysis', desc: 'Multi-factor bacterial identification using weighted scoring algorithms with clinical-grade accuracy.' },
    { icon: ShieldCheck, title: 'Clinical Decision Support', desc: 'Evidence-based treatment recommendations and antimicrobial stewardship guidance.' },
    { icon: Activity, title: 'Real-time Diagnostics', desc: 'Instant risk assessment with confidence scores and differential diagnosis.' },
    { icon: Zap, title: 'Rapid Processing', desc: 'Sub-second analysis with comprehensive reporting and actionable insights.' },
  ];

  const stats = [
    { value: '30+', label: 'Bacterial Species' },
    { value: '16+', label: 'Disease Profiles' },
    { value: '50+', label: 'Lab Tests' },
    { value: '100%', label: 'Open Source' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 h-16 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Microscope className="w-7 h-7 text-primary-600" />
          <span className="text-xl font-bold text-slate-900">PathoLens AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary-600">Sign In</Link>
          <Link to="/register" className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-primary text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-primary-200 text-sm font-medium mb-4">AI-Powered Bacterial Intelligence</p>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Seeing Beyond Pathogens<br />with Artificial Intelligence
            </h1>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl">
              PathoLens AI combines advanced machine learning with comprehensive microbiological databases to deliver rapid, accurate bacterial identification and clinical decision support.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors">
                Start Analysis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary-600">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Platform Capabilities</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-lg transition-all">
              <Icon className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Transform Diagnostics?</h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Join researchers and clinicians leveraging AI for faster, more accurate bacterial identification and treatment decisions.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <p>PathoLens AI — Research & Decision Support Platform</p>
          <p>Not a medical device. For research purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
