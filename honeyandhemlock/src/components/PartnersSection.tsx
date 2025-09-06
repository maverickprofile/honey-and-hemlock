
const PartnersSection = () => {
  const recognitions = [
    "/lovable-uploads/e2050bdd-3ebf-4ba7-966d-ce1890f2b0ac.png",
    "/lovable-uploads/006f06b8-073e-4954-91fd-26243a35ac99.png",
    "/lovable-uploads/8503da56-823a-4c60-8deb-327a17127135.png",
    "/lovable-uploads/dd4ddeb5-96e2-4c76-8bbe-ac90b5c33755.png",
    "/lovable-uploads/b4b37d22-6783-4ebd-8088-867677f279f5.png",
    "/lovable-uploads/65f0aa8c-5593-4fad-9aba-e7eea97f2988.png",
    "/lovable-uploads/30432083-8e56-4a80-bb26-974c357354f7.png",
    "/lovable-uploads/08354c69-e36b-4dc6-8756-1bdc0e435087.png",
    "/lovable-uploads/b57fa408-4c81-4a6c-ba5f-64d2cf7d0dc4.png",
    "/lovable-uploads/16a0fa7d-dd23-4385-a582-b0646598def1.png",
    "/lovable-uploads/51574bd2-5bd6-4a97-bf51-91ac36ab41bc.png",
    "/lovable-uploads/d3e6a88c-742d-4bcd-83b2-b895c032a1e7.png",
    "/lovable-uploads/79fdfb56-6819-449c-89ce-1129134611c4.png"
  ];

  return (
    <section className="bg-portfolio-black text-portfolio-white py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-special-elite text-2xl font-semibold mb-2">Recognitions</h2>
          <h3 className="font-special-elite text-xl text-portfolio-gold">Awards and Nominations</h3>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 max-w-6xl mx-auto">
          {recognitions.map((recognition, index) => (
            <div 
              key={index}
              className="hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <img 
                src={recognition}
                alt={`Recognition ${index + 1}`}
                className={`w-32 h-auto object-contain filter brightness-100 hover:brightness-110 transition-all duration-300 ${
                  [0, 4, 5, 8, 9].includes(index) ? 'invert' : ''
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
