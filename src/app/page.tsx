import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const code = params.code as string | undefined;

  // Handle email verification redirect
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect('/dashboard');
    }
  }

  // Check if user is already logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-container flex-between">
          <div className="landing-brand">
            <span className="text-2xl mr-2">💍</span>
            <span className="font-bold text-xl tracking-tight">Roora</span>
          </div>
          <nav className="landing-nav flex gap-6 items-center">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-secondary hover:text-primary font-medium transition-colors">
                  Log In
                </Link>
                <Link href="/auth/signup" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="landing-hero">
          <div className="landing-container text-center">
            <h1 className="hero-title">
              The Operating System for <br />
              <span className="text-gradient">Modern Cultural Weddings</span>
            </h1>
            <p className="hero-subtitle">
              Manage lobola, traditional ceremonies, and white weddings in one unified workspace.
              Track budgets, suppliers, and tasks with cultural intelligence built-in.
            </p>
            <div className="hero-cta flex justify-center gap-4 mt-8">
              <Link href="/auth/signup" className="btn btn-primary btn-lg">
                Start Planning Free
              </Link>
              <Link href="#features" className="btn btn-secondary btn-lg">
                See How It Works
              </Link>
            </div>

            {/* Hero Image / Dashboard Preview */}
            <div className="hero-image-container mt-16">
              <div className="hero-image-mockup">
                <div className="mockup-header">
                  <div className="mockup-dot red"></div>
                  <div className="mockup-dot yellow"></div>
                  <div className="mockup-dot green"></div>
                </div>
                <div className="mockup-content">
                  <div className="mockup-sidebar"></div>
                  <div className="mockup-main">
                    <div className="mockup-card"></div>
                    <div className="mockup-grid">
                      <div className="mockup-stat"></div>
                      <div className="mockup-stat"></div>
                      <div className="mockup-stat"></div>
                    </div>
                  </div>
                </div>
                {/* Overlay gradient for depth */}
                <div className="hero-image-overlay"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="landing-features section-padding">
          <div className="landing-container">
            <div className="text-center mb-16">
              <h2 className="section-title">Everything you need to plan</h2>
              <p className="section-subtitle">From negotiations to the aisle, we have you covered.</p>
            </div>

            <div className="features-grid">
              <FeatureCard
                icon="💰"
                title="Unified Budgeting"
                desc="Track expenses across multiple ceremonies (Lobola, Kitchen Party, Wedding) in one view."
              />
              <FeatureCard
                icon="🤝"
                title="Supplier Management"
                desc="Manage quotes, deposits, and contracts. Compare vendors and track payment schedules."
              />
              <FeatureCard
                icon="📅"
                title="Multi-Event Timeline"
                desc="Coordinate dates for all your cultural events. Never miss a deadline or traditional requirement."
              />
              <FeatureCard
                icon="👩‍👩‍👧‍👦"
                title="Guest & Family Access"
                desc="Invite your partner, family representatives, and planners with specific roles and permissions."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer section-padding border-t border-light">
        <div className="landing-container text-center">
          <div className="mb-6">
            <span className="text-2xl">💍</span>
          </div>
          <p className="text-secondary text-sm mb-6">
            © {new Date().getFullYear()} Roora. Built for love and heritage.
          </p>
          <div className="flex justify-center gap-6 text-secondary text-sm">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  );
}
