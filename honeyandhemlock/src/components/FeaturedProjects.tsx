
import { useNavigate } from 'react-router-dom';

const FeaturedProjects = () => {
  const navigate = useNavigate();

  const projects = [
    {
      image: "/lovable-uploads/spaceman-poster.png",
      title: "SPACEMAN",
      slug: "spaceman"
    },
    {
      image: "/lovable-uploads/speechless-poster.png",
      title: "SPEECHLESS",
      slug: "speechless"
    },
    {
      image: "/lovable-uploads/solitarity-poster.png",
      title: "SOLITARITY",
      slug: "solitarity"
    }
  ];

  const handleProjectClick = (slug: string) => {
    navigate(`/film-gallery/${slug}`);
  };

  return (
    <section className="bg-portfolio-black text-portfolio-white py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-special-elite text-4xl font-semibold">Featured Projects</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-2xl hover:scale-105 transition-transform duration-300"
              onClick={() => handleProjectClick(project.slug)}
            >
              <img 
                src={project.image}
                alt={project.title}
                className="w-full h-auto object-contain"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                <div className="p-4">
                  <span className="text-portfolio-white font-special-elite text-lg font-semibold">{project.title}</span>
                  <div className="text-portfolio-gold text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to view stills
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
