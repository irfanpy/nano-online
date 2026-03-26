import { Link } from "react-router-dom";
import SectionCarousel from "../components/SectionCarousel.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import Icon from "../components/Icon.jsx";
import bannerDubai1 from "../assets/banner-dubai-1.svg";
import bannerDubai2 from "../assets/banner-dubai-2.svg";
import bannerDubai3 from "../assets/banner-dubai-3.svg";
import { SERVICES } from "../data/servicesData.js";

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getDemandIcon(role) {
  const normalized = role.toLowerCase();
  if (normalized.includes("driver")) return "assignments";
  if (normalized.includes("care")) return "secure";
  if (normalized.includes("cook")) return "skills";
  if (normalized.includes("nanny") || normalized.includes("babysitter")) return "helpers";
  if (normalized.includes("maid") || normalized.includes("housemaid")) return "helpers-active";
  return "helpers";
}

function getTestimonialIcon(role) {
  const normalized = role.toLowerCase();
  if (normalized.includes("driver")) return "assignments";
  if (normalized.includes("care")) return "secure";
  if (normalized.includes("cook")) return "skills";
  if (normalized.includes("nanny") || normalized.includes("babysitter")) return "helpers";
  if (normalized.includes("maid") || normalized.includes("housemaid")) return "helpers-active";
  return "helpers";
}

const FEATURED_SERVICES = SERVICES.slice(0, 3);
const TRUST_METRICS = [
  { label: "Families Served", value: "2,500+" },
  { label: "Verified Helpers", value: "1,200+" },
  { label: "Average Match Time", value: "48 Hours" },
  { label: "Client Satisfaction", value: "4.8 / 5" },
];

const PROCESS_STEPS = [
  {
    title: "Tell us your needs",
    description: "Share role, schedule, language preference, and household priorities.",
  },
  {
    title: "Review shortlisted profiles",
    description: "Receive curated helper profiles with skill highlights and availability.",
  },
  {
    title: "Interview and confirm",
    description: "Speak with shortlisted helpers and confirm the best fit for your family.",
  },
  {
    title: "Onboard with support",
    description: "Get placement coordination and practical guidance during onboarding.",
  },
];

const TESTIMONIALS = [
  {
    quote: "The process felt organized from day one. We found a nanny who fit perfectly with our routine and our child connected with her immediately.",
    name: "Amina K.",
    area: "Jumeirah",
    role: "Live-out nanny",
    outcome: "Matched in 3 days",
  },
  {
    quote: "Helpful team, quick options, and very clear communication throughout placement. We always knew the next step and timeline.",
    name: "Rashid M.",
    area: "Downtown Dubai",
    role: "Part-time maid",
    outcome: "Trial started in 48 hours",
  },
  {
    quote: "We were matched with a reliable driver and cook in less than a week. Both profiles were well-screened and ready to start.",
    name: "Noura A.",
    area: "Al Barsha",
    role: "Driver + family cook",
    outcome: "Two successful placements",
  },
  {
    quote: "The maid we were placed with has been with our family for two years now. Excellent matching process and strong post-placement follow-up.",
    name: "Sara T.",
    area: "Dubai Marina",
    role: "Full-time housemaid",
    outcome: "Long-term retention",
  },
  {
    quote: "Very responsive support team and they really understood our household requirements, including language and weekday schedule preferences.",
    name: "Khalid F.",
    area: "Business Bay",
    role: "Part-time babysitter",
    outcome: "Shortlist approved in 24 hours",
  },
  {
    quote: "We found our live-in nanny through Nano Online and couldn't be happier with the result. The onboarding guidance made the transition smooth.",
    name: "Fatima R.",
    area: "Arabian Ranches",
    role: "Live-in nanny",
    outcome: "Onboarded in 5 days",
  },
  {
    quote: "The elderly care assistant has been a wonderful addition to our household. Highly recommend for families needing compassionate daily support.",
    name: "Ahmed W.",
    area: "Mirdif",
    role: "Senior care assistant",
    outcome: "Care plan stabilized within first week",
  },
  {
    quote: "Fast shortlisting, transparent process, and a genuine understanding of family needs. The final recommendation was spot on.",
    name: "Layla J.",
    area: "JVC",
    role: "Housemaid + childcare support",
    outcome: "Interviewed 3 profiles, hired 1",
  },
  {
    quote: "Friendly team, smooth process. Our cook was shortlisted within 24 hours of our request and started trial the same week.",
    name: "Omar S.",
    area: "Deira",
    role: "Diet-focused family cook",
    outcome: "Menu planning support included",
  },
];

const COVERAGE_AREAS = [
  "Downtown Dubai",
  "Dubai Marina",
  "Jumeirah",
  "Business Bay",
  "Al Barsha",
  "Mirdif",
  "Arabian Ranches",
  "Silicon Oasis",
  "JVC",
  "Deira",
  "Bur Dubai",
  "Al Nahda",
];

const LIVE_REQUESTS = [
  {
    id: "demand-1",
    role: "Part-time maid",
    location: "Dubai Marina",
    schedule: "Morning shift, 5 days/week",
    budget: "AED 2,600 - AED 3,100",
    note: "Family prefers prior apartment-cleaning experience.",
  },
  {
    id: "demand-2",
    role: "Live-in nanny",
    location: "Jumeirah",
    schedule: "6 days/week, two children",
    budget: "AED 3,500 - AED 4,200",
    note: "English and basic tutoring support preferred.",
  },
  {
    id: "demand-3",
    role: "Family cook",
    location: "Downtown Dubai",
    schedule: "Lunch and dinner, 6 days/week",
    budget: "AED 3,000 - AED 3,800",
    note: "Needs healthy and child-friendly weekly meal plan.",
  },
  {
    id: "demand-4",
    role: "Private driver",
    location: "Business Bay",
    schedule: "School commute + evening errands",
    budget: "AED 3,200 - AED 3,900",
    note: "Valid UAE license and clean driving history required.",
  },
  {
    id: "demand-5",
    role: "Elderly caregiver",
    location: "Mirdif",
    schedule: "Day support, 8am to 6pm",
    budget: "AED 3,400 - AED 4,000",
    note: "Medication reminders and mobility assistance needed.",
  },
  {
    id: "demand-6",
    role: "Weekend babysitter",
    location: "Al Barsha",
    schedule: "Friday and Saturday evenings",
    budget: "AED 1,800 - AED 2,400",
    note: "Experience with toddlers is a must.",
  },
  {
    id: "demand-7",
    role: "Housemaid + cook",
    location: "JVC",
    schedule: "Split shift, 6 days/week",
    budget: "AED 3,200 - AED 4,100",
    note: "Small villa household with two school-age kids.",
  },
  {
    id: "demand-8",
    role: "Nanny (early education background)",
    location: "Arabian Ranches",
    schedule: "Full-time, live-out",
    budget: "AED 3,600 - AED 4,400",
    note: "Family prefers Montessori exposure.",
  },
  {
    id: "demand-9",
    role: "Part-time cook",
    location: "Deira",
    schedule: "Diet meal prep, 4 days/week",
    budget: "AED 2,000 - AED 2,700",
    note: "Low-sodium and diabetic-friendly menu experience needed.",
  },
  {
    id: "demand-10",
    role: "Driver + household errands",
    location: "Silicon Oasis",
    schedule: "Morning school route + weekend support",
    budget: "AED 3,000 - AED 3,700",
    note: "Candidate should be comfortable with citywide travel.",
  },
  {
    id: "demand-11",
    role: "Live-out maid",
    location: "Bur Dubai",
    schedule: "Daily cleaning and laundry",
    budget: "AED 2,700 - AED 3,300",
    note: "Prior hotel housekeeping background is preferred.",
  },
  {
    id: "demand-12",
    role: "Senior care assistant",
    location: "Al Nahda",
    schedule: "Companionship and daytime supervision",
    budget: "AED 3,200 - AED 4,100",
    note: "Family seeks calm and patient caregiver profile.",
  },
];

const QUICK_FAQS = [
  {
    q: "How fast can I receive profiles?",
    a: "Most families receive first shortlisted profiles within 24-48 hours.",
  },
  {
    q: "Can I combine helper roles?",
    a: "Yes, combined role requests are supported based on availability and suitability.",
  },
  {
    q: "Do you support short-term requirements?",
    a: "Yes, both temporary and long-term placements can be arranged.",
  },
  {
    q: "Can I request interview scheduling support?",
    a: "Yes, we coordinate interview windows and follow-up communication.",
  },
  {
    q: "What locations do you cover in Dubai?",
    a: "Coverage spans central, coastal, and suburban communities across Dubai.",
  },
];

const BANNER_SLIDES = [
  {
    image: bannerDubai1,
    title: "Trusted Helpers for Every Home",
    subtitle: "Match quickly with verified talent for childcare, housekeeping, and daily support.",
  },
  {
    image: bannerDubai2,
    title: "Dubai-Focused Placement Support",
    subtitle: "From shortlisting to onboarding, our workflow keeps family needs at the center.",
  },
  {
    image: bannerDubai3,
    title: "Flexible Services for Modern Families",
    subtitle: "Choose full-time, part-time, and combined role options designed for real schedules.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="public-section home-banner-top">
        <div className="public-container">
          <SectionCarousel
            items={BANNER_SLIDES}
            ariaLabel="Homepage banner carousel"
            getKey={(item) => item.title}
            renderItem={(item) => (
              <article className="banner-slide-card">
                <img src={item.image} alt={item.title} className="banner-slide-image" />
                <div className="banner-slide-overlay">
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
              </article>
            )}
          />
        </div>
      </section>

      <section className="home-hero">
        <div className="public-container home-hero-inner">
          <div className="home-hero-copy">
            <p className="home-kicker">Dubai Home Support Platform</p>
            <h1>Trusted Home Helpers in Dubai</h1>
            <p>
              From maids and nannies to drivers and cooks, find dependable support tailored to your
              family lifestyle.
            </p>
            <div className="home-hero-actions">
              <Link to="/services" className="public-btn">Browse Services</Link>
              <Link to="/contact" className="public-btn public-btn-secondary">Talk to our team</Link>
            </div>
          </div>
          <div className="home-hero-panel">
            <h3>Why families choose us</h3>
            <ul>
              <li>Screened helper profiles</li>
              <li>Fast shortlisting support</li>
              <li>Flexible part-time and full-time options</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Featured Services</p>
            <h2>Popular Home Helper Services</h2>
          </div>

          <div className="service-grid">
            {FEATURED_SERVICES.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Trust Snapshot</p>
            <h2>Built for confidence and consistency</h2>
          </div>
          <div className="metric-grid">
            {TRUST_METRICS.map((metric) => (
              <article key={metric.label} className="metric-card">
                <p className="metric-value">{metric.value}</p>
                <p className="metric-label">{metric.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">How It Works</p>
            <h2>A simple path from request to placement</h2>
          </div>
          <div className="process-grid">
            {PROCESS_STEPS.map((step, index) => (
              <article key={step.title} className="process-card">
                <p className="process-index">Step {index + 1}</p>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Client Stories</p>
            <h2>What Dubai families say</h2>
          </div>
          <SectionCarousel
            items={TESTIMONIALS}
            ariaLabel="Client stories carousel"
            visibleCount={1}
            getKey={(item) => item.name}
            renderItem={(item) => (
              <blockquote className="quote-card quote-card-carousel">
                <div className="quote-card-top">
                  <span className="quote-avatar" aria-hidden="true">{getInitials(item.name)}</span>
                  <span className="quote-badge" aria-hidden="true">
                    <Icon name={getTestimonialIcon(item.role)} size={22} />
                  </span>
                </div>
                <p>"{item.quote}"</p>
                <footer>
                  <cite>{item.name}</cite>
                  {item.area && <span className="quote-area">{item.area}</span>}
                  {item.role && <span className="quote-role">{item.role}</span>}
                  {item.outcome && <span className="quote-outcome">{item.outcome}</span>}
                </footer>
              </blockquote>
            )}
          />
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Live Demand Board</p>
            <h2>Current request snapshots</h2>
          </div>
          <SectionCarousel
            items={LIVE_REQUESTS}
            ariaLabel="Live demand board carousel"
            visibleCount={1}
            getKey={(item) => item.id}
            renderItem={(item) => (
              <article className="request-item">
                <div className="request-head">
                  <span className="request-icon" aria-hidden="true">
                    <Icon name={getDemandIcon(item.role)} size={22} />
                  </span>
                  <h3>{item.role}</h3>
                </div>
                <p className="request-meta">{item.location} | {item.schedule}</p>
                <p>{item.note}</p>
                <p className="request-budget">Budget: {item.budget}</p>
              </article>
            )}
          />
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Dubai Coverage</p>
            <h2>Neighborhoods currently supported</h2>
          </div>
          <div className="chip-grid">
            {COVERAGE_AREAS.map((area) => (
              <span key={area} className="coverage-chip">{area}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Quick FAQs</p>
            <h2>Useful answers before you start</h2>
          </div>
          <div className="faq-grid">
            {QUICK_FAQS.map((item) => (
              <article key={item.q} className="faq-card">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
