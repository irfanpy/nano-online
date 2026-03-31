import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ServiceCard from "../components/ServiceCard.jsx";
import { SERVICES } from "../data/servicesData.js";

const SERVICE_BUNDLES = [
  {
    name: "Starter Home Package",
    details: "Part-time maid + babysitter support designed for smaller households.",
  },
  {
    name: "Family Full-Care Package",
    details: "Nanny + cook combination with weekly service coordination support.",
  },
  {
    name: "Premium Household Package",
    details: "Live-in maid + driver support tailored for larger family schedules.",
  },
];

const FAQS = [
  {
    question: "Can I request bilingual helpers?",
    answer: "Yes, language preferences can be included during shortlisting.",
  },
  {
    question: "Do you support urgent placements?",
    answer: "Yes, urgent requests are prioritized based on helper availability.",
  },
  {
    question: "Can services be customized?",
    answer: "Yes, plans can be adjusted by hours, duties, and role combinations.",
  },
  {
    question: "Do you provide trial periods?",
    answer: "Trial options can be discussed based on the selected service model.",
  },
];

export default function ServicesPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.hash) return;
    const raw = location.hash.replace("#", "").toLowerCase();
    const categoryMap = {
      babysitter: "Babysitter",
      nanny: "Nanny",
      cook: "Cooking",
      driver: "Driver",
      "maid-service": "Cleaning"
    };
    const category = categoryMap[raw];
    if (category) {
      navigate(`/helpers?category=${encodeURIComponent(category)}`, { replace: true });
    }
  }, [location.hash, navigate]);

  return (
    <div>
      <section className="public-section">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Services</p>
            <h1>Home Helper Services for Dubai Families</h1>
            <p>
              Explore our service categories and choose the support package that fits your
              household needs.
            </p>
          </div>

          <div className="service-grid service-grid-large">
            {SERVICES.map((service) => (
              <div key={service.slug} id={service.slug}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Service Bundles</p>
            <h2>Combine services for smoother household operations</h2>
          </div>
          <div className="stack-grid">
            {SERVICE_BUNDLES.map((bundle) => (
              <article key={bundle.name} className="stack-card">
                <h3>{bundle.name}</h3>
                <p>{bundle.details}</p>
                <a href="#" className="service-card-link">View Details</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Placement Journey</p>
            <h2>Service onboarding in four clear phases</h2>
          </div>
          <div className="timeline">
            <article className="timeline-item">
              <h3>01. Requirement Brief</h3>
              <p>We collect household details, schedule needs, and role expectations.</p>
            </article>
            <article className="timeline-item">
              <h3>02. Smart Shortlisting</h3>
              <p>Profiles are shortlisted based on skill fit, language, and availability.</p>
            </article>
            <article className="timeline-item">
              <h3>03. Interview Coordination</h3>
              <p>Interviews are arranged with shortlist candidates for final selection.</p>
            </article>
            <article className="timeline-item">
              <h3>04. Start & Follow-Up</h3>
              <p>Placement begins with onboarding guidance and early check-ins.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">FAQs</p>
            <h2>Common service questions</h2>
          </div>
          <div className="faq-grid">
            {FAQS.map((faq) => (
              <article key={faq.question} className="faq-card">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
