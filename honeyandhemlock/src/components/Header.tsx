
import { Facebook, Instagram, Linkedin, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import ContactForm from "./ContactForm";

const TikTokIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.05z"/>
  </svg>
);

const IMDBIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <rect x="1" y="6" width="22" height="12" rx="2" ry="2" fill="currentColor"/>
    <path d="M4 9h1v6H4zm2 0h1v6H6zm2 0h2l.5 3L11 9h2v6h-1v-4l-.5 3h-1L10 11v4H8zm4 0h3c1 0 1.5.5 1.5 1.5v3c0 1-.5 1.5-1.5 1.5h-3zm1 1v4h2c.3 0 .5-.2.5-.5v-3c0-.3-.2-.5-.5-.5h-2z" fill="black"/>
  </svg>
);

const Header = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToFounders = () => {
    // If we're not on the homepage, navigate there first
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToFounders: true } });
    } else {
      // If we're already on homepage, scroll directly
      const foundersSection = document.getElementById('founders');
      if (foundersSection) {
        foundersSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-portfolio-black text-portfolio-white relative z-50">
        {/* Top Bar - Hidden on mobile */}
        <div className="hidden md:block">
          <div className="container mx-auto px-4 sm:px-6 py-1">
            <div className="flex justify-end items-center">
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/profile.php?id=100085916835325" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Facebook className="w-4 h-4 text-portfolio-white hover:text-portfolio-gold transition-colors cursor-pointer" />
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
                  <Instagram className="w-4 h-4 text-portfolio-white hover:text-portfolio-gold transition-colors cursor-pointer" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/honey-hemlock-productions/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 text-portfolio-white hover:text-portfolio-gold transition-colors cursor-pointer" />
                </a>
                <a 
                  href="https://pro.imdb.com/company/co0912607?r=cons_ats_co_pro&ref=cons_ats_co_pro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <div className="w-4 h-4 text-portfolio-white hover:text-portfolio-gold transition-colors cursor-pointer">
                    <IMDBIcon />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="container mx-auto px-4 sm:px-6 py-1 lg:py-2">
          <nav className="flex items-center justify-between">
            {/* Desktop Left Navigation */}
            <div className="hidden lg:flex space-x-6 xl:space-x-8">
              <Link to="/" className="font-special-elite text-sm uppercase tracking-wider hover:text-portfolio-gold transition-colors relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-portfolio-gold transition-all group-hover:w-full"></span>
              </Link>
              <Link to="/films" className="font-special-elite text-sm uppercase tracking-wider hover:text-portfolio-gold transition-colors relative group">
                Films
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-portfolio-gold transition-all group-hover:w-full"></span>
              </Link>
              <Link to="/script-portal" className="font-special-elite text-sm uppercase tracking-wider hover:text-portfolio-gold transition-colors relative group">
                Honey Writes
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-portfolio-gold transition-all group-hover:w-full"></span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden z-50 relative p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-portfolio-white" />
              ) : (
                <Menu className="w-6 h-6 text-portfolio-white" />
              )}
            </button>

            {/* Logo - Responsive sizing */}
            <div className="flex-1 lg:flex-none text-center">
              <Link to="/" className="flex items-center justify-center">
                <img
                  src={location.pathname === '/script-portal' || location.pathname === '/pricing' || location.pathname === '/script-upload' ? "/Honey Writes-36.png" : "/lovable-uploads/64475ea2-91fd-4af8-b8e0-4131e1f8ec82.png"}
                  alt={location.pathname === '/script-portal' || location.pathname === '/pricing' || location.pathname === '/script-upload' ? "Honey Writes" : "Honey & Hemlock Productions"}
                  className="h-32 sm:h-40 md:h-60 lg:h-80 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Right Navigation */}
            <div className="hidden lg:flex space-x-6 xl:space-x-8">
              <Link
                to="/sponsorship"
                className="font-special-elite text-sm uppercase tracking-wider hover:text-portfolio-gold transition-colors relative group"
              >
                Sponsorship
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-portfolio-gold transition-all group-hover:w-full"></span>
              </Link>
              <button 
                onClick={() => setIsContactOpen(true)}
                className="font-special-elite text-sm uppercase tracking-wider hover:text-portfolio-gold transition-colors relative group"
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-portfolio-gold transition-all group-hover:w-full"></span>
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-portfolio-black bg-opacity-95 z-40">
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              {/* Mobile Social Icons */}
              <div className="flex space-x-6 mb-8">
                <a 
                  href="https://www.facebook.com/profile.php?id=100085916835325" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                >
                  <Facebook className="w-6 h-6 text-portfolio-white hover:text-portfolio-gold transition-colors" />
                </a>
                <a 
                  href="https://www.tiktok.com/@honeyandhemlock.prod" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                >
                  <TikTokIcon />
                </a>
                <a 
                  href="https://www.instagram.com/honeyandhemlock_productions/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                >
                  <Instagram className="w-6 h-6 text-portfolio-white hover:text-portfolio-gold transition-colors" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/honey-hemlock-productions/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                >
                  <Linkedin className="w-6 h-6 text-portfolio-white hover:text-portfolio-gold transition-colors" />
                </a>
                <a 
                  href="https://pro.imdb.com/company/co0912607?r=cons_ats_co_pro&ref=cons_ats_co_pro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                >
                  <div className="w-6 h-6 text-portfolio-white hover:text-portfolio-gold transition-colors">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="1" y="6" width="22" height="12" rx="2" ry="2" fill="currentColor"/>
                      <path d="M4 9h1v6H4zm2 0h1v6H6zm2 0h2l.5 3L11 9h2v6h-1v-4l-.5 3h-1L10 11v4H8zm4 0h3c1 0 1.5.5 1.5 1.5v3c0 1-.5 1.5-1.5 1.5h-3zm1 1v4h2c.3 0 .5-.2.5-.5v-3c0-.3-.2-.5-.5-.5h-2z" fill="black"/>
                    </svg>
                  </div>
                </a>
              </div>

              {/* Mobile Navigation Links */}
              <Link 
                to="/" 
                className="font-special-elite text-xl uppercase tracking-wider hover:text-portfolio-gold transition-colors text-center py-3"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/films" 
                className="font-special-elite text-xl uppercase tracking-wider hover:text-portfolio-gold transition-colors text-center py-3"
                onClick={closeMobileMenu}
              >
                Films
              </Link>
              <Link
                to="/script-portal"
                className="font-special-elite text-xl uppercase tracking-wider hover:text-portfolio-gold transition-colors text-center py-3"
                onClick={closeMobileMenu}
              >
                Honey Writes
              </Link>
              <Link
                to="/sponsorship"
                className="font-special-elite text-xl uppercase tracking-wider hover:text-portfolio-gold transition-colors text-center py-3"
                onClick={closeMobileMenu}
              >
                Sponsorship
              </Link>
              <button 
                onClick={() => {
                  setIsContactOpen(true);
                  closeMobileMenu();
                }}
                className="font-special-elite text-xl uppercase tracking-wider hover:text-portfolio-gold transition-colors text-center py-3"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </header>
      
      <ContactForm isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
};

export default Header;
