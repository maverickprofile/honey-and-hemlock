
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Sponsorship = () => {
  return (
    <div className="min-h-screen bg-portfolio-black">
      <Header />
      
      <section className="bg-portfolio-black text-portfolio-white py-20 relative overflow-hidden">
        {/* Background Lens Images */}
        <div 
          className="absolute top-1/3 right-0 w-1/3 h-1/2 opacity-15 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('/lovable-uploads/74c9a851-6d57-412e-9a5e-b83bc5a76b7c.png')`,
            backgroundPosition: 'center right',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div 
          className="absolute top-0 left-1/4 w-1/4 h-1/3 opacity-20 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('/lovable-uploads/9cf1eb65-bc24-4062-9ec2-2bafdbaa9642.png')`,
            backgroundPosition: 'center left',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          {/* Main Title */}
          <div className="text-center mb-16">
            <h1 className="font-special-elite text-5xl font-semibold mb-8 text-portfolio-gold">
              Support Our Vision
            </h1>
            <p className="font-special-elite text-xl text-portfolio-white leading-relaxed max-w-3xl mx-auto mb-16">
              Honey & Hemlock Productions is proud to be a sponsored artist with
            </p>
          </div>

          {/* The Field Logo Section */}
          <div className="text-center mb-16">
            <a 
              href="https://app.thefield.org/profile/Honey---Hemlock-Productions/629629"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:scale-105 transition-transform duration-300"
            >
              <img 
                src="/lovable-uploads/4774b947-de46-4d2c-aec1-c15b60d7b422.png" 
                alt="The Field Logo"
                className="mx-auto h-40 w-auto mb-6"
              />
            </a>
          </div>

          {/* Main Content Block */}
          <div className="text-center mb-16">
            <p className="font-special-elite text-lg text-portfolio-white leading-relaxed max-w-4xl mx-auto mb-12">
              By making a contribution to Honey & Hemlock via The Field, you are not only supporting our 
              vision, but also supporting independent artists as a whole. All donations made through 
              our artist portal on The Field are considered tax deductible.
            </p>
          </div>

          {/* Call to Action Button */}
          <div className="text-center mb-16">
            <a 
              href="https://app.thefield.org/profile/Honey---Hemlock-Productions/629629"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-portfolio-gold text-black hover:bg-portfolio-gold/90 font-special-elite text-xl px-12 py-4 font-semibold">
                Make a Contribution
              </Button>
            </a>
          </div>

          {/* Footer Information */}
          <div className="text-center">
            <p className="font-special-elite text-sm text-portfolio-white/80 leading-relaxed max-w-3xl mx-auto">
              Honey & Hemlock Productions is a sponsored artist with The Performance Zone Inc (dba The Field), a not-
              for-profit, tax-exempt, 501(c)(3) organization serving the arts community. Contributions to The Field 
              earmarked for Honey & Hemlock Productions are tax-deductible to the extent allowed by law. For more 
              information about The Field contact: The Field, 75 Maiden Lane, Suite 906 New York, NY 10038, phone: 212-
              691-6969. A copy of our latest financial report may be obtained from The Field or from the Office of 
              Attorney General, Charities Bureau, 120 Broadway, New York, NY 10271
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sponsorship;
