import { Link, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function PublicLayout() {
  return (
    <div className="public-site">
      <Navbar />

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="public-container public-footer-grid">
          <div>
            <h3>Nano Online Dubai</h3>
            <p>
              Helping families in Dubai connect with trusted home helpers through a streamlined and
              transparent process.
            </p>
            <p>Service Hours: Monday to Saturday, 8:00 AM to 8:00 PM</p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul className="public-footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/helpers">Helpers</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/admin">Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4>Popular Services</h4>
            <ul className="public-footer-links">
              <li><Link to="/services#maid-service">Maid Service</Link></li>
              <li><Link to="/services#babysitter">Babysitter</Link></li>
              <li><Link to="/services#nanny">Nanny</Link></li>
              <li><Link to="/services#cook">Cook</Link></li>
              <li><Link to="/services#driver">Driver</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <p>Al Quoz, Dubai, UAE</p>
            <p>+971 50 000 0000</p>
            <p>+971 4 000 0000</p>
            <p>hello@nanoonline.ae</p>
            <p>support@nanoonline.ae</p>
          </div>
        </div>

        <div className="public-footer-bottom">
          <div className="public-container">
            <p>Copyright {new Date().getFullYear()} Nano Online. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
