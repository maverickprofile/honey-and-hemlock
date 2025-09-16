
const HeroSection = () => {
  return (
    <section className="bg-portfolio-black text-portfolio-white py-12 md:py-20 relative overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
      {/* Background Camera Lens Image - positioned on the right side */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full opacity-15 z-0 hidden md:block"
        style={{
          backgroundImage: `url('/lovable-uploads/74c9a851-6d57-412e-9a5e-b83bc5a76b7c.png')`,
          backgroundPosition: 'center right',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-center">
          {/* Left Column - Responsive Image */}
          <div className="lg:col-span-7 relative">
            <div className="relative mx-0 md:mx-12">
              {/* Main Image - Responsive for mobile */}
              <div className="relative">
                <img
                  src="/lovable-uploads/921dc20e-d8e8-4341-8aa0-c542f110c9c8.png"
                  alt="Honey & Hemlock Productions work"
                  className="w-full h-auto md:h-[375px] object-cover md:object-cover rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-5 relative z-20 text-center lg:text-left">
            <h1 className="font-special-elite text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 md:mb-6 leading-tight">
              Honey & Hemlock Productions
            </h1>
            <p className="font-special-elite text-base md:text-lg leading-relaxed text-portfolio-white/80 max-w-md mx-auto lg:mx-0">
              A female run production company committed to captivating audiences by creating new worlds through the art of filmmaking.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
