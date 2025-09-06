import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-portfolio-black relative overflow-hidden">
      {/* Background Lens Images */}
      <div 
        className="absolute top-1/4 right-1/4 w-1/3 h-1/2 opacity-19 z-0 pointer-events-none"
        style={{
          backgroundImage: `url('/lovable-uploads/74c9a851-6d57-412e-9a5e-b83bc5a76b7c.png')`,
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div 
        className="absolute bottom-1/3 left-1/3 w-1/4 h-1/3 opacity-17 z-0 pointer-events-none"
        style={{
          backgroundImage: `url('/lovable-uploads/9cf1eb65-bc24-4062-9ec2-2bafdbaa9642.png')`,
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="text-center relative z-10">
        <h1 className="text-4xl font-bold mb-4 text-portfolio-white font-special-elite">404</h1>
        <p className="text-xl text-portfolio-white/80 mb-4 font-special-elite">Oops! Page not found</p>
        <a href="/" className="text-portfolio-gold hover:text-portfolio-white underline font-special-elite">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
