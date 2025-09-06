
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, X, ExternalLink } from "lucide-react";

const Films = () => {
  const navigate = useNavigate();
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<any>(null);
  
  const films = [
    {
      id: 1,
      slug: "spaceman",
      image: "/lovable-uploads/c3efdeb0-642b-46d9-ac6b-7d1d5641a0b5.png",
      title: "SPACEMAN",
      description: "Spaceman is an exploration of human emotion that broaches subject matter that is unfortunately too often still considered taboo. It follows Bobby on his first jaunt back into the dating world after escaping an abusive marriage in which he fell victim to domestic violence. This story is powerful and provides a sliver of hope that one can, in fact, put themselves out there again.",
      imdbLink: "https://www.imdb.com/title/tt21265664/?ref_=nm_knf_t_3",
      trailerUrl: "/lovable-uploads/Copy of spaceman_trailer (1080p).mp4"
    },
    {
      id: 2,
      slug: "speechless",
      image: "/lovable-uploads/26af3cda-d0cf-411b-8f0b-ac411f441ed3.png",
      title: "SPEECHLESS",
      description: "Speechless - When faced with the unimaginable of losing his first love in a tragic accident, Jake struggles to find the words in the pivotal moment of giving her eulogy. When literal letters start to pour from Jake, lifelong friend Allison dives deep to help her friend navigate this shared grief and find the words in a sea of letters.",
      imdbLink: "https://www.imdb.com/title/tt28655918/?ref_=fn_all_ttl_27",
      trailerUrl: "/lovable-uploads/Copy of Copy of Speechless Social Clip.mp4"
    },
    {
      id: 3,
      slug: "solitarity",
      image: "/lovable-uploads/107207e5-b126-4464-b5ad-4576c7b7c1ae.png",
      title: "SOLITARITY",
      description: "Solitarity is the surrealist exploration of depression through the expereince of Jeremy, a man at the end of his rope. Succumbing to his numbness, Jeremy is ready to throw in the towel when depression manifests itself into a human like entity and forces Jeremy to look his issues in the eye and realize that he cannot continue alone.",
      imdbLink: "https://www.imdb.com/title/tt18573788/?ref_=nv_sr_srsg_0_tt_8_nm_0_in_0_q_Solitarity",
      trailerUrl: "/lovable-uploads/Copy of Solitarity_Trailer.mp4"
    }
  ];

  const openTrailer = (film: any) => {
    setSelectedFilm(film);
    setSelectedTrailer(film.trailerUrl);
  };

  const closeTrailer = () => {
    setSelectedTrailer(null);
    setSelectedFilm(null);
  };

  return (
    <div className="min-h-screen bg-portfolio-black">
      <Header />
      
      <section className="bg-portfolio-black text-portfolio-white py-20 relative overflow-hidden">
        {/* Background Lens Images */}
        <div 
          className="absolute top-1/4 left-0 w-1/3 h-1/2 opacity-15 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('/lovable-uploads/74c9a851-6d57-412e-9a5e-b83bc5a76b7c.png')`,
            backgroundPosition: 'center left',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-1/4 h-1/3 opacity-18 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('/lovable-uploads/9cf1eb65-bc24-4062-9ec2-2bafdbaa9642.png')`,
            backgroundPosition: 'center right',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h1 className="font-special-elite text-4xl font-semibold mb-4">Our Films</h1>
            <p className="font-special-elite text-lg text-portfolio-gold">Showcasing our cinematic productions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {films.map((film) => (
              <div
                key={film.id}
                className="bg-portfolio-dark rounded-lg overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300"
              >
                <div className="aspect-[3/4] overflow-hidden relative group">
                  <img 
                    src={film.image}
                    alt={film.title}
                    className="w-full h-full object-contain bg-black"
                  />
                  {/* Trailer Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openTrailer(film);
                      }}
                      className="bg-portfolio-gold text-portfolio-black hover:bg-portfolio-gold/90 p-4 rounded-full"
                    >
                      <Play className="w-8 h-8" fill="currentColor" />
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-special-elite text-xl font-semibold mb-3 text-portfolio-gold">{film.title}</h3>
                  <p className="font-special-elite text-base text-portfolio-white/80 leading-relaxed mb-4">
                    {film.description}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => openTrailer(film)}
                      className="bg-portfolio-gold text-portfolio-black hover:bg-portfolio-gold/90 flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch Trailer
                    </Button>
                    <Button
                      onClick={() => navigate(`/film-gallery/${film.slug}`)}
                      variant="outline"
                      className="border-portfolio-gold text-portfolio-gold hover:bg-portfolio-gold/10 flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Gallery
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      <Dialog open={selectedTrailer !== null} onOpenChange={(open) => !open && closeTrailer()}>
        <DialogContent className="max-w-4xl w-full bg-portfolio-black border-portfolio-gold/30">
          <DialogHeader>
            <DialogTitle className="text-portfolio-gold font-special-elite text-xl">
              {selectedFilm?.title} - Trailer
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full rounded-lg overflow-hidden bg-black">
            {selectedTrailer && (
              <video
                src={selectedTrailer}
                className="w-full h-full"
                controls
                autoPlay
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={() => navigate(`/film-gallery/${selectedFilm?.slug}`)}
              variant="outline"
              className="border-portfolio-gold text-portfolio-gold hover:bg-portfolio-gold/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Gallery
            </Button>
            <Button
              onClick={closeTrailer}
              variant="outline"
              className="border-portfolio-gold/50 text-portfolio-white hover:bg-portfolio-gold/10"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Films;
