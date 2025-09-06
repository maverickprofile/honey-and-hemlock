
import { useState } from "react";
import ContactForm from "./ContactForm";

const CallToAction = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <section className="bg-portfolio-black text-portfolio-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-special-elite text-2xl mb-8">
            Interested in collaborating?
          </h2>
          <button 
            onClick={() => setIsContactOpen(true)}
            className="border-2 border-portfolio-gold text-portfolio-gold hover:bg-portfolio-gold hover:text-black transition-all duration-300 px-6 py-3 font-special-elite text-sm uppercase tracking-widest font-semibold"
          >
            Contact Us
          </button>
        </div>
      </section>
      
      <ContactForm isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
};

export default CallToAction;
