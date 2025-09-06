
const HeroSection = () => {
  return (
    <section className="bg-portfolio-black text-portfolio-white py-20 relative overflow-hidden min-h-[700px] flex items-center">
      {/* Background Camera Lens Image - positioned on the right side */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-full opacity-15 z-0"
        style={{
          backgroundImage: `url('/lovable-uploads/74c9a851-6d57-412e-9a5e-b83bc5a76b7c.png')`,
          backgroundPosition: 'center right',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column - Single Image - Reduced by 25% */}
          <div className="lg:col-span-7 relative">
            <div className="relative h-[450px] mx-12">
              {/* Main Image from uploaded content - reduced from h-[600px] to h-[450px] */}
              <div className="absolute top-0 left-0 z-30">
                <img 
                  src="/lovable-uploads/921dc20e-d8e8-4341-8aa0-c542f110c9c8.png"
                  alt="Honey & Hemlock Productions work"
                  className="w-full h-[375px] object-cover rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-5 relative z-20">
            <h1 className="font-special-elite text-4xl lg:text-5xl font-semibold mb-6 leading-tight">
              Honey & Hemlock Productions
            </h1>
            <p className="font-special-elite text-lg leading-relaxed text-portfolio-white/80 max-w-md">
              A female run production company committed to captivating audiences by creating new worlds through the art of filmmaking.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
