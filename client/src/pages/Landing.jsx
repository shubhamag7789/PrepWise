/**
 * Landing Page — Hero, Features, Stats, CTA, Testimonials, Footer
 */
import { Link } from 'react-router-dom';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import Card from '@components/common/Card';

// ── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: '🤖',
    title: 'AI Mock Interviews',
    description: 'Practice with an AI interviewer that adapts to your skill level and gives real-time feedback on your answers.',
    badge: 'AI Powered',
    badgeVariant: 'primary',
  },
  {
    icon: '💻',
    title: 'Coding Practice',
    description: 'Solve 500+ curated problems from FAANG companies with detailed explanations and optimal solutions.',
    badge: '500+ Problems',
    badgeVariant: 'success',
  },
  {
    icon: '📊',
    title: 'Smart Analytics',
    description: 'Track your progress with detailed analytics. Identify weak areas and get personalized improvement plans.',
    badge: 'Insights',
    badgeVariant: 'info',
  },
  {
    icon: '🎯',
    title: 'Company-specific Prep',
    description: 'Targeted prep for Google, Amazon, Microsoft, and 50+ top companies with their actual interview patterns.',
    badge: '50+ Companies',
    badgeVariant: 'purple',
  },
  {
    icon: '🗣️',
    title: 'Behavioral Interviews',
    description: 'Master the STAR method with AI-scored behavioral questions and tips from ex-FAANG interviewers.',
    badge: 'HR Ready',
    badgeVariant: 'warning',
  },
  {
    icon: '📚',
    title: 'Learning Roadmaps',
    description: 'Structured learning paths for DSA, System Design, and more — tailored to your target companies.',
    badge: 'Structured',
    badgeVariant: 'default',
  },
];

const stats = [
  { value: '50K+', label: 'Students placed', icon: '👨‍💻' },
  { value: '500+', label: 'Interview questions', icon: '📝' },
  { value: '95%', label: 'Success rate', icon: '🎯' },
  { value: '4.9/5', label: 'Average rating', icon: '⭐' },
];

const testimonials = [
  {
    quote: "PrepWise helped me land my dream job at Google. The AI mock interviews were incredibly realistic!",
    name: "Priya Sharma",
    role: "SDE at Google",
    avatar: "PS",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    quote: "The company-specific prep is a game changer. I knew exactly what to expect in my Amazon interviews.",
    name: "Rahul Verma",
    role: "SDE-II at Amazon",
    avatar: "RV",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    quote: "From zero to Microsoft in 3 months. The structured roadmaps and daily practice made all the difference.",
    name: "Ananya Patel",
    role: "SWE at Microsoft",
    avatar: "AP",
    gradient: "from-emerald-500 to-teal-600",
  },
];

// ── Landing Component ─────────────────────────────────────────────────────────

const Landing = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 mesh-gradient" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl animate-float" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            AI-Powered Interview Prep Platform
            <span>✨</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.1] mb-6 animate-slide-up">
            Ace Every
            <span className="block gradient-text">Interview</span>
            with AI
          </h1>

          <p className="text-lg sm:text-xl text-surface-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            PrepWise uses cutting-edge AI to simulate real interviews, identify your weak spots, and give you personalized feedback — so you land your dream job faster.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/register">
              <Button size="xl" variant="primary" className="shadow-brand-lg hover:shadow-brand-lg hover:-translate-y-0.5 transition-all">
                Start for free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <button className="flex items-center gap-3 px-6 py-4 text-base font-semibold text-surface-200 hover:text-white group transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              Watch demo
            </button>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex -space-x-2">
              {['PS', 'RV', 'AP', 'MK', 'JL'].map((init, i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-surface-900 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${
                  ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600'][i]
                }`}>
                  {init}
                </div>
              ))}
            </div>
            <p className="text-sm text-surface-400">
              <span className="text-white font-semibold">50,000+</span> students already preparing
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-surface-950 border-y border-surface-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon }) => (
              <div key={label} className="text-center">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="font-display font-black text-4xl gradient-text mb-1">{value}</div>
                <div className="text-sm text-surface-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <Badge variant="primary" size="lg" className="mb-4">Everything you need</Badge>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-[var(--color-text)] mb-4">
              Supercharge your <span className="gradient-text">interview prep</span>
            </h2>
            <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
              From AI-powered mock interviews to detailed analytics — PrepWise has every tool you need to crack your dream company.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon, title, description, badge, badgeVariant }) => (
              <Card key={title} hover className="group relative overflow-hidden">
                {/* Gradient accent on hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-4xl mb-4">{icon}</div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-display font-bold text-lg text-[var(--color-text)]">{title}</h3>
                  <Badge variant={badgeVariant} size="sm">{badge}</Badge>
                </div>
                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-surface-50 dark:bg-surface-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="success" size="lg" className="mb-4">Simple process</Badge>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-[var(--color-text)] mb-4">
              Get started in <span className="gradient-text-accent">3 easy steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your profile', desc: 'Sign up, set your target companies and skill level. Takes less than 2 minutes.', icon: '✍️' },
              { step: '02', title: 'Practice daily', desc: 'Follow your personalized roadmap. Solve problems, attend mock interviews, track progress.', icon: '📚' },
              { step: '03', title: 'Land your offer', desc: 'Walk into interviews with confidence. Join 50,000+ students who got placed at top companies.', icon: '🎉' },
            ].map(({ step, title, desc, icon }, idx) => (
              <div key={step} className="relative text-center">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-brand-500/50 to-transparent -translate-y-0.5 z-0" />
                )}
                <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-2xl gradient-brand flex items-center justify-center text-3xl shadow-brand">
                  {icon}
                </div>
                <div className="text-xs font-bold text-brand-500 mb-2 tracking-widest uppercase">Step {step}</div>
                <h3 className="font-display font-bold text-xl text-[var(--color-text)] mb-3">{title}</h3>
                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="warning" size="lg" className="mb-4">Success stories</Badge>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-[var(--color-text)] mb-4">
              Loved by <span className="gradient-text">50,000+ students</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role, avatar, gradient }) => (
              <Card key={name} className="relative">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[var(--color-text)] text-sm leading-relaxed mb-6 italic">
                  "{quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br ${gradient}`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text)] text-sm">{name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl gradient-brand p-12 text-center shadow-brand-lg">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">
                Ready to get placed? 🚀
              </h2>
              <p className="text-lg text-indigo-200 mb-8 max-w-xl mx-auto">
                Join 50,000+ students and start your journey to your dream company today. No credit card required.
              </p>
              <Link to="/register">
                <Button
                  variant="secondary"
                  size="xl"
                  className="bg-white text-brand-700 hover:bg-indigo-50 shadow-xl font-bold"
                >
                  Start for free — it's instant
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <p className="mt-4 text-sm text-indigo-300">
                Free forever plan · No credit card needed · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
