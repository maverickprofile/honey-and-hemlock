
// Custom elegant film industry icons
const FilmReel = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <circle cx="8" cy="8" r="2" />
    <circle cx="16" cy="8" r="2" />
    <circle cx="8" cy="16" r="2" />
    <circle cx="16" cy="16" r="2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const VintageCamera = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <rect x="16" y="8" width="2" height="1" />
  </svg>
);

const Clapperboard = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.5 6H3.5c-.83 0-1.5.67-1.5 1.5v9c0 .83.67 1.5 1.5 1.5h17c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5z" />
    <path d="M7 6L9 9" />
    <path d="M13 6L15 9" />
    <path d="M19 6L17 9" />
    <path d="M2 12h20" />
  </svg>
);

const AwardTrophy = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SkillsetSection = () => {
  const skills = [
    {
      icon: FilmReel,
      title: "End-to-end Production",
      description: "Complete film production services"
    },
    {
      icon: VintageCamera,
      title: "Directors", 
      description: "Visionary creative leadership"
    },
    {
      icon: AwardTrophy,
      title: "Award Winners",
      description: "Recognition for excellence"
    }
  ];

  return (
    <section className="bg-portfolio-black text-portfolio-white py-20 relative overflow-hidden">
      {/* Background Image - positioned on the left and more opaque */}
      <div 
        className="absolute inset-0 opacity-20 z-0"
        style={{
          backgroundImage: `url('/lovable-uploads/9cf1eb65-bc24-4062-9ec2-2bafdbaa9642.png')`,
          backgroundPosition: 'left center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-special-elite text-4xl font-semibold mb-4">Our Work</h2>
          <p className="font-special-elite text-lg text-portfolio-gold">Award Winning Films</p>
        </div>

        {/* Two Column Layout - Adjusted for better balance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Left Column - Skills Grid in a row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {skills.map((skill, index) => (
              <div key={index} className="flex flex-col items-center justify-start p-3 group hover:bg-white/5 transition-all duration-300 rounded-lg">
                <div className="h-10 flex items-center justify-center mb-3">
                  <skill.icon className="w-10 h-10 text-portfolio-gold group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-special-elite text-lg font-semibold mb-2 text-center min-h-[2.5rem] flex items-center">
                  {index === 0 ? (
                    <div>
                      <span className="whitespace-nowrap">End-to-end</span>
                      <br />
                      Production
                    </div>
                  ) : index === 2 ? (
                    <span className="whitespace-nowrap">{skill.title}</span>
                  ) : (
                    skill.title
                  )}
                </h3>
                <p className="font-special-elite text-sm text-portfolio-white/80 text-center">{skill.description}</p>
              </div>
            ))}
          </div>

          {/* Right Column - Balanced size image */}
          <div className="relative flex justify-center">
            <div className="w-full" style={{ maxWidth: '30rem' }}>
              <img
                src="/H&H_work_updated.png"
                alt="Our work showcase"
                className="w-full h-auto object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsetSection;
