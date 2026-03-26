const BRANCHES = [
  { name: "Al Quoz Office", detail: "Mon-Sat, 9:00 AM - 7:00 PM" },
  { name: "Jumeirah Support Desk", detail: "Mon-Fri, 10:00 AM - 6:00 PM" },
  { name: "Remote Assistance Team", detail: "Daily, 8:00 AM - 10:00 PM" },
];

export default function ContactPage() {
  return (
    <div>
      <section className="public-section">
        <div className="public-container public-copy-block">
          <p className="home-kicker">Contact</p>
          <h1>Let us help you get started</h1>
          <p>Reach out for service guidance, helper recommendations, and onboarding support.</p>

          <div className="contact-card">
            <p><strong>Phone:</strong> +971 50 000 0000</p>
            <p><strong>Email:</strong> hello@nanoonline.ae</p>
            <p><strong>Office:</strong> Al Quoz, Dubai, UAE</p>
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container">
          <div className="public-section-heading">
            <p className="home-kicker">Service Points</p>
            <h2>Contact channels across Dubai</h2>
          </div>
          <div className="stack-grid">
            {BRANCHES.map((branch) => (
              <article key={branch.name} className="stack-card">
                <h3>{branch.name}</h3>
                <p>{branch.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container public-copy-block">
          <p className="home-kicker">Quick Enquiry</p>
          <h2>Tell us what support you need</h2>
          <p>Placeholder enquiry form layout for future backend integration.</p>
          <div className="contact-form-grid">
            <label>
              Full Name
              <input type="text" placeholder="Enter your name" />
            </label>
            <label>
              Phone Number
              <input type="text" placeholder="Enter your phone number" />
            </label>
            <label>
              Service Needed
              <select>
                <option>Maid Service</option>
                <option>Babysitter</option>
                <option>Nanny</option>
                <option>Cook</option>
                <option>Driver</option>
                <option>Elderly Care</option>
              </select>
            </label>
            <label className="full-width">
              Message
              <textarea placeholder="Share your requirement" rows={4} />
            </label>
            <div className="full-width">
              <button type="button">Submit Enquiry</button>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container public-copy-block">
          <p className="home-kicker">Support Notes</p>
          <h2>Response expectations</h2>
          <p>
            New enquiries are usually acknowledged within one business day. Urgent requests can be
            flagged for priority handling based on current placement queue volume.
          </p>
          <p>
            Placeholder section for live chat widget, map embed, and escalation contact channels.
          </p>
        </div>
      </section>
    </div>
  );
}
