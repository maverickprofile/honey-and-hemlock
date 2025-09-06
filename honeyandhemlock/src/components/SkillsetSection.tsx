
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
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M6 9a9 9 0 0 0 12 0" />
    <path d="M12 18v-9" />
    <path d="M8 21h8" />
    <path d="M12 21v-3" />
    <circle cx="12" cy="6" r="3" />
  </svg>
);

const SkillsetSection = () => {
  const skills = [
    {
      icon: FilmReel,
      title: "End to End Production",
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-center">
          {/* Left Column - Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {skills.map((skill, index) => (
              <div key={index} className="text-center p-8 group hover:bg-white/5 transition-all duration-300 rounded-lg">
                <skill.icon className="w-12 h-12 text-portfolio-gold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-special-elite text-xl font-semibold mb-2">{skill.title}</h3>
                <p className="font-special-elite text-sm text-portfolio-white/80">{skill.description}</p>
              </div>
            ))}
          </div>

          {/* Right Column - Single Image */}
          <div className="relative">
            <img 
              src="/lovable-uploads/2b22540e-5ab5-40fb-bf0b-1b453ba62491.png"
              alt="Our work showcase"
              className="w-full h-auto object-cover rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsetSection;
