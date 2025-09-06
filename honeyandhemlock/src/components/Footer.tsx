
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const TikTokIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.05z"/>
  </svg>
);

const IMDBIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <rect x="1" y="6" width="22" height="12" rx="2" ry="2" fill="currentColor"/>
    <path d="M4 9h1v6H4zm2 0h1v6H6zm2 0h2l.5 3L11 9h2v6h-1v-4l-.5 3h-1L10 11v4H8zm4 0h3c1 0 1.5.5 1.5 1.5v3c0 1-.5 1.5-1.5 1.5h-3zm1 1v4h2c.3 0 .5-.2.5-.5v-3c0-.3-.2-.5-.5-.5h-2z" fill="black"/>
  </svg>
);

const Footer = () => {
  const scrollToFounders = () => {
    const foundersSection = document.getElementById('founders');
    if (foundersSection) {
      foundersSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-portfolio-black text-portfolio-white py-16">
      <div className="container mx-auto px-6">
        {/* Logo - Clickable */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center mb-2">
            <img 
              src="/lovable-uploads/64475ea2-91fd-4af8-b8e0-4131e1f8ec82.png" 
              alt="Honey & Hemlock Productions"
              className="h-60 w-auto"
            />
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center space-x-8 mb-8">
          <Link to="/" className="font-special-elite text-sm text-portfolio-white/80 hover:text-portfolio-white transition-colors">
            Home
          </Link>
          <button onClick={scrollToFounders} className="font-special-elite text-sm text-portfolio-white/80 hover:text-portfolio-white transition-colors">
            About
          </button>
          <Link to="/sponsorship" className="font-special-elite text-sm text-portfolio-white/80 hover:text-portfolio-white transition-colors">
            Sponsorship
          </Link>
          <Link to="/films" className="font-special-elite text-sm text-portfolio-white/80 hover:text-portfolio-white transition-colors">
            Films
          </Link>
          <Link to="/script-portal" className="font-special-elite text-sm text-portfolio-white/80 hover:text-portfolio-white transition-colors">
            Honey Writes
          </Link>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center space-x-6 mb-8">
          <Link to="/privacy-policy" className="font-special-elite text-xs text-portfolio-white/60 hover:text-portfolio-white/80 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms-and-conditions" className="font-special-elite text-xs text-portfolio-white/60 hover:text-portfolio-white/80 transition-colors">
            Terms & Conditions
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center space-x-6">
          <a 
            href="https://www.facebook.com/profile.php?id=100085916835325" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Facebook className="w-5 h-5 text-portfolio-white hover:text-portfolio-gold transition-colors cursor-pointer" />
          </a>
          <a 
            href="https://www.tiktok.com/@honeyandhemlock.prod" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <TikTokIcon />
          </a>
          <a 
            href="https://www.instagram.com/honeyandhemlock_productions/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Instagram className="w-5 h-5 text-portfolio-white hover:text-portfolio-gold transition-colors cursor-pointer" />
          </a>
          <a 
            href="https://www.linkedin.com/company/honey-hemlock-productions/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Linkedin className="w-5 h-5 text-portfolio-white hover:text-portfolio-gold transition-colors cursor-pointer" />
          </a>
          <a 
            href="https://pro.imdb.com/company/co0912607?r=cons_ats_co_pro&ref=cons_ats_co_pro" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <div className="w-5 h-5 text-portfolio-white hover:text-portfolio-gold transition-colors cursor-pointer">
              <IMDBIcon />
            </div>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-8 border-t border-portfolio-white/20">
          <p className="font-special-elite text-xs text-portfolio-white/60">
            © {new Date().getFullYear()} Honey & Hemlock Productions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
