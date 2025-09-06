import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageGallery from '@/components/ImageGallery';
import { Button } from '@/components/ui/button';

interface FilmData {
  title: string;
  images: string[];
  description?: string;
  trailerUrl?: string;
}

const filmData: Record<string, FilmData> = {
  spaceman: {
    title: 'SPACEMAN',
    images: [
      '/lovable-uploads/spaceman-1.png',
      '/lovable-uploads/spaceman-2.png',
      '/lovable-uploads/spaceman-3.png'
    ],
    description: 'Spaceman is an exploration of human emotion that broaches subject matter that is unfortunately too often still considered taboo. It follows Bobby on his first jaunt back into the dating world after escaping an abusive marriage in which he fell victim to domestic violence.',
    trailerUrl: '/lovable-uploads/Copy of spaceman_trailer (1080p).mp4'
  },
  speechless: {
    title: 'SPEECHLESS',
    images: [
      '/lovable-uploads/speechless-1.jpg',
      '/lovable-uploads/speechless-2.png',
      '/lovable-uploads/speechless-3.png'
    ],
    description: 'When faced with the unimaginable of losing his first love in a tragic accident, Jake struggles to find the words in the pivotal moment of giving her eulogy. When literal letters start to pour from Jake, lifelong friend Allison dives deep to help her friend navigate this shared grief.',
    trailerUrl: '/lovable-uploads/Copy of Copy of Speechless Social Clip.mp4'
  },
  solitarity: {
    title: 'SOLITARITY',
    images: [
      '/lovable-uploads/solitarity-1.png',
      '/lovable-uploads/solitarity-2.png',
      '/lovable-uploads/solitarity-3.png'
    ],
    description: 'Solitarity is the surrealist exploration of depression through the experience of Jeremy, a man at the end of his rope. Succumbing to his numbness, Jeremy is ready to throw in the towel when depression manifests itself into a human like entity.',
    trailerUrl: '/lovable-uploads/Copy of Solitarity_Trailer.mp4'
  }
};

const FilmGallery = () => {
  const { filmName } = useParams<{ filmName: string }>();
  const navigate = useNavigate();

  if (!filmName || !filmData[filmName.toLowerCase()]) {
    return (
      <div className="min-h-screen bg-portfolio-black text-portfolio-white">
        <Header />
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="font-special-elite text-4xl font-semibold mb-6">Film Not Found</h1>
          <p className="text-portfolio-white/80 mb-8">The requested film gallery could not be found.</p>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-portfolio-gold text-portfolio-gold bg-transparent hover:bg-portfolio-gold hover:text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const film = filmData[filmName.toLowerCase()];

  return (
    <div className="min-h-screen bg-portfolio-black text-portfolio-white">
      <Header />
      
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url('/lovable-uploads/74c9a851-6d57-412e-9a5e-b83bc5a76b7c.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <div className="container mx-auto px-6 py-12 md:py-20 relative z-10">

        {/* Film Title and Description */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="font-special-elite text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 text-portfolio-gold">
            {film.title}
          </h1>
          {film.description && (
            <p className="font-special-elite text-lg sm:text-xl text-portfolio-white/80 max-w-2xl mx-auto">
              {film.description}
            </p>
          )}
        </div>

        {/* Image Gallery */}
        <div className="max-w-6xl mx-auto">
          <h2 className="font-special-elite text-2xl sm:text-3xl font-semibold mb-6 text-center text-portfolio-gold">
            Behind the Scenes
          </h2>
          <ImageGallery images={film.images} title={film.title} />
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default FilmGallery;