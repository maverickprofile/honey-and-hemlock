import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ImageGalleryProps {
  images: string[];
  title: string;
  autoOpenModal?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title, autoOpenModal = false }) => {
  const navigate = useNavigate();
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(autoOpenModal);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Calculate rotation angle for 3 images (360° / 3 = 120°)
  const rotationStep = 360 / images.length;
  const minSwipeDistance = 50;

  const rotateCarousel = useCallback((direction: 'next' | 'prev') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (direction === 'next') {
      setCurrentRotation(prev => prev - rotationStep);
      setCurrentIndex(prev => (prev + 1) % images.length);
    } else {
      setCurrentRotation(prev => prev + rotationStep);
      setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    }
    
    // Reset transition lock after animation
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [rotationStep, images.length, isTransitioning]);

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    if (!isVerticalSwipe) {
      if (isLeftSwipe) {
        rotateCarousel('next');
      } else if (isRightSwipe) {
        rotateCarousel('prev');
      }
    }
  };

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isModalOpen) {
        if (e.key === 'ArrowLeft') rotateCarousel('prev');
        if (e.key === 'ArrowRight') rotateCarousel('next');
        if (e.key === 'Escape') closeModal();
      } else {
        if (e.key === 'ArrowLeft') rotateCarousel('prev');
        if (e.key === 'ArrowRight') rotateCarousel('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isModalOpen, rotateCarousel]);

  return (
    <div className="w-full relative">
      {/* 3D Carousel Container */}
      <div 
        className="carousel-container relative bg-portfolio-black rounded-lg overflow-hidden"
        style={{
          perspective: '1200px',
          height: '80vh',
          minHeight: '600px',
          marginBottom: '3rem'
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* 3D Spinner */}
        <figure 
          className="carousel-spinner"
          style={{
            transformStyle: 'preserve-3d',
            height: '100%',
            transformOrigin: '50% 50% -800px',
            transition: isTransitioning ? '1s ease-out' : 'none',
            transform: `rotateY(${currentRotation}deg)`,
            position: 'relative'
          }}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${title} still ${index + 1}`}
              className="carousel-image cursor-pointer hover:brightness-110 transition-all duration-300"
              style={{
                width: '85%',
                maxWidth: '1000px',
                height: 'auto',
                maxHeight: '75vh',
                position: 'absolute',
                left: '7.5%',
                top: '50%',
                transform: `translateY(-50%) rotateY(${index * rotationStep}deg)`,
                transformOrigin: '50% 50% -800px',
                outline: '1px solid transparent',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
              onClick={() => openModal(index)}
              draggable={false}
            />
          ))}
        </figure>

        {/* Navigation Controls */}
        <button
          onClick={() => rotateCarousel('prev')}
          disabled={isTransitioning}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 active:bg-black/80 text-white p-4 rounded-full transition-all duration-200 z-10 disabled:opacity-50"
          style={{ minHeight: '56px', minWidth: '56px' }}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        
        <button
          onClick={() => rotateCarousel('next')}
          disabled={isTransitioning}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 active:bg-black/80 text-white p-4 rounded-full transition-all duration-200 z-10 disabled:opacity-50"
          style={{ minHeight: '56px', minWidth: '56px' }}
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8" />
        </button>


        {/* Full Screen Button */}
        <button
          onClick={() => openModal(currentIndex)}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200 z-10"
          style={{ minHeight: '50px', minWidth: '50px' }}
          aria-label="Full screen view"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        {/* Touch Hint for Mobile */}
        <div className="absolute top-4 left-4 md:hidden z-10">
          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs animate-pulse">
            Swipe or use arrows
          </div>
        </div>
      </div>

      {/* Image Navigation Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const targetRotation = -index * rotationStep;
              setCurrentRotation(targetRotation);
              setCurrentIndex(index);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-portfolio-gold scale-125' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>


      {/* Full Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <img
              src={images[currentIndex]}
              alt={`${title} still ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
            
            {/* Modal Navigation */}
            <button
              onClick={() => {
                const newIndex = (currentIndex - 1 + images.length) % images.length;
                setCurrentIndex(newIndex);
                setCurrentRotation(-newIndex * rotationStep);
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-colors duration-200"
              style={{ minHeight: '56px', minWidth: '56px' }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <button
              onClick={() => {
                const newIndex = (currentIndex + 1) % images.length;
                setCurrentIndex(newIndex);
                setCurrentRotation(-newIndex * rotationStep);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-colors duration-200"
              style={{ minHeight: '56px', minWidth: '56px' }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            
            {/* Navigation Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => navigate('/')}
                className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200"
                style={{ minHeight: '50px', minWidth: '50px' }}
                aria-label="Back to home"
              >
                <Home className="w-6 h-6" />
              </button>
              <button
                onClick={closeModal}
                className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200"
                style={{ minHeight: '50px', minWidth: '50px' }}
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;