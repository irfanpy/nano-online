const VALUES = [
  {
    title: "Trust First",
    detail: "We prioritize profile transparency and reliable placement communication.",
  },
  {
    title: "Family-Centric",
    detail: "Each shortlist is adapted to household lifestyle, schedule, and priorities.",
  },
  {
    title: "Operational Clarity",
    detail: "Structured hiring steps reduce delays and improve placement confidence.",
  },
  {
    title: "Continuous Support",
    detail: "Our team supports families before, during, and after helper onboarding.",
  },
];

const MILESTONES = [
  "Started as a local placement support initiative in Dubai",
  "Expanded into multi-role helper shortlisting and onboarding",
  "Introduced process tracking for better placement visibility",
  "Preparing for digital profile discovery and interview scheduling",
];

export default function AboutPage() {
  return (
    <div>
      <section className="public-section">
        <div className="public-container public-copy-block">
          <p className="home-kicker">About Us</p>
          <h1>Built for modern households in Dubai</h1>
          <p>
            Nano Online helps families connect with qualified home helpers through a structured and
            supportive process. Our platform is designed to make hiring simpler, safer, and faster.
          </p>
          <p>
            This is placeholder content and can be replaced with your official company story,
            milestones, and trust credentials.
          </p>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Our Values</p>
            <h2>Principles that shape every placement</h2>
          </div>
          <div className="stack-grid">
            {VALUES.map((value) => (
              <article key={value.title} className="stack-card">
                <h3>{value.title}</h3>
                <p>{value.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Journey</p>
            <h2>Platform growth milestones</h2>
          </div>
          <div className="timeline">
            {MILESTONES.map((milestone, index) => (
              <article key={milestone} className="timeline-item">
                <h3>Phase {index + 1}</h3>
                <p>{milestone}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container public-copy-block">
          <p className="home-kicker">Future Direction</p>
          <h2>Building a smarter helper discovery experience</h2>
          <p>
            Upcoming enhancements may include profile verification badges, interview scheduling,
            family preference scoring, and transparent placement status tracking.
          </p>
          <p>
            Placeholder section for team photos, partner badges, and regulatory details.
          </p>
        </div>
      </section>
    </div>
  );
}
