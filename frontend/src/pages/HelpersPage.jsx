const HELPER_TYPES = [
  {
    role: "House Maids",
    summary: "Cleaning, laundry, and daily household upkeep for apartments and villas.",
  },
  {
    role: "Babysitters",
    summary: "Short-shift childcare support for evenings, events, and weekend schedules.",
  },
  {
    role: "Nannies",
    summary: "Long-term childcare with learning routines and day-to-day family assistance.",
  },
  {
    role: "Cooks",
    summary: "Meal preparation based on cuisine preference, diet plans, and family routines.",
  },
  {
    role: "Drivers",
    summary: "Dependable city transport support for school runs, office trips, and errands.",
  },
  {
    role: "Elderly Caregivers",
    summary: "Daily companionship and care assistance for senior family members.",
  },
];

const STANDARDS = [
  "Identity and profile checks",
  "Skill and role suitability screening",
  "Availability and schedule matching",
  "Family preference alignment",
  "Structured onboarding assistance",
];

export default function HelpersPage() {
  return (
    <div>
      <section className="public-section">
        <div className="public-container public-copy-block">
          <p className="home-kicker">Helpers</p>
          <h1>Browse helper categories</h1>
          <p>
            Discover available helper profiles across childcare, housekeeping, cooking, driving,
            and elderly care roles.
          </p>
          <p>
            This page currently uses placeholder content and is prepared for future profile search,
            role filtering, and interview scheduling modules.
          </p>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Role Categories</p>
            <h2>Helpers across core household functions</h2>
          </div>
          <div className="stack-grid">
            {HELPER_TYPES.map((helperType) => (
              <article key={helperType.role} className="stack-card">
                <h3>{helperType.role}</h3>
                <p>{helperType.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Selection Standards</p>
            <h2>How helper quality is maintained</h2>
          </div>
          <div className="public-copy-block">
            <ul className="feature-list">
              {STANDARDS.map((standard) => (
                <li key={standard}>{standard}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container public-copy-block">
          <p className="home-kicker">Placement Support</p>
          <h2>From shortlisting to first working week</h2>
          <p>
            Families receive support during interview setup, role finalization, and early placement
            follow-up to ensure a smooth transition for both household and helper.
          </p>
          <p>
            Placeholder section for future workflow cards, ratings, and profile review summaries.
          </p>
        </div>
      </section>
    </div>
  );
}
