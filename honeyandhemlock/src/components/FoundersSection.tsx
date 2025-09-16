
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

const FoundersSection = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const founders = [
    {
      name: "Shanna Riker",
      title: "Writer, Director & Producer",
      image: "/lovable-uploads/94dcbd50-94f9-49c9-a62e-e8f4082790d0.png",
      imdb: "https://www.imdb.me/shannariker",
      bio: "Shanna Riker is a Writer, Director, and Producer of Honey & Hemlock Productions. Her award winning short film, SPACEMAN, was an official selection in 15+ festivals. The Austin Revolution Film Festival named her the 2023 FEMALE FILMMAKER OF THE YEAR & Spaceman received 3 Best Director Nominations. Shanna has directed and produced multiple, award-winning short films. Highlights include: SOLITARITY (Co-directed with the talented Melissa Bronski) & THE LEAP. Shanna's most recent film, DUELING WATCHERS is currently in post production. Her screenplays BOTTOM OF THE BARREL, BLOOD SPLATTERED PEARLS, UNFINISHED WORKS, & THE LIGHT BEFORE CHRISTMAS have also created buzz in the festival circuit, claiming awards for Best Screenplay across various festivals. Shanna has produced 100+ national and award-winning commercials and client testimonials for SPECTRUM REACH. She also produces live events for clients such as DISNEY, NISSAN, BLIZZARD, and SPOTIFY. Shanna hopes her work with Honey & Hemlock inspires audiences and provides characters who are authentically human."
    },
    {
      name: "Melissa Bronski",
      title: "Co-Founder, Executive Producer & Director",
      image: "/lovable-uploads/53eb1d38-cf71-455a-be1e-9a7383960f98.png",
      imdb: "https://www.imdb.com/name/nm10558693/?ref_=nv_sr_srsg_0_tt_0_nm_4_in_0_q_Melissa%2520Bronski",
      bio: "Melissa Bronski, Co-Founder, Executive Producer - Director, a California based female filmmaker dedicated to the art of storytelling. She has produced 5 short films, two seasons of 'Honey Writes Screenplay competition', Co-directed the short film Solitarity, made her solo directorial debut with 'Speechless' which is now in its festival run and has most recently won Best Short Drama and Directors Choice of Best Short at the Austin Revolution Film Festival. She is now in post production for the horror short Beholder. One of the true joys and dedications of her life is to her company Honey & Hemlock Productions, which she founded with producer/director Shanna Riker. Along with her work at Honey & Hemlock Melissa works at NBCUniversal in Lot operations and Corporate Services. She has a deep passion for the work that she does and hopes that her work inspires others to do and be more than they were before seeing it."
    }
  ];

  return (
    <section id="founders" className="bg-portfolio-black text-portfolio-white py-20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-special-elite text-4xl font-semibold mb-4">Meet Our Founders</h2>
          <p className="font-special-elite text-lg text-portfolio-gold">The creative minds behind Honey & Hemlock Productions</p>
        </div>

        {/* Founders Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {founders.map((founder, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg bg-portfolio-dark shadow-2xl transition-all duration-700 ease-out hover:shadow-3xl group cursor-pointer"
              style={{ height: '500px' }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: `url(${founder.image})`,
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-700 ease-out" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 transition-transform duration-700 ease-out">
                <div className={`transition-transform duration-700 ease-out ${hoveredCard === index ? 'transform translate-y-0' : 'transform translate-y-8'}`}>
                  <h3 className="font-special-elite text-2xl font-semibold mb-2 text-portfolio-white">{founder.name}</h3>
                  <h4 className="font-special-elite text-lg text-portfolio-gold mb-4">{founder.title}</h4>
                  
                  {/* IMDB Link */}
                  <a 
                    href={founder.imdb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-portfolio-gold hover:text-portfolio-white transition-colors mb-4"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">View IMDB Profile</span>
                  </a>
                  
                  {/* Bio Text - Hidden by default, shown on hover */}
                  <div className={`font-special-elite text-sm leading-relaxed text-portfolio-white/90 transition-all duration-700 ease-out ${
                    hoveredCard === index
                      ? 'opacity-100 transform translate-y-0 max-h-60 overflow-y-auto custom-scrollbar'
                      : 'opacity-0 transform translate-y-4 max-h-0 overflow-hidden'
                  }`}>
                    {founder.bio}
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

export default FoundersSection;
