import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Award, BookOpen, Calendar } from "lucide-react";

interface Contractor {
  id: number;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  experience: string;
  image?: string;
  awards?: string[];
  education?: string;
  yearsExperience?: number;
}

const ContractorsPanel = () => {
  // TO ADD JUDGES: Uncomment and fill in the template below for each contractor
  // Upload contractor photos to the public/contractors/ directory
  // The page automatically switches from placeholder to live content when contractors are added
  const contractors: Contractor[] = [
    // TEMPLATE - Copy this structure for each contractor:
    // {
    //   id: 1,
    //   name: "Contractor Name",
    //   title: "Professional Title",
    //   bio: "Detailed biography highlighting experience and expertise...",
    //   specialties: ["Genre1", "Genre2", "Specialty Area"],
    //   experience: "X+ years in film industry",
    //   image: "/contractors/contractor-photo.jpg", // Optional - shows placeholder if not provided
    //   awards: ["Award 1", "Award 2"], // Optional
    //   education: "Educational background", // Optional
    //   yearsExperience: 15 // Used for stats calculation
    // },
    // Add more contractors here when available
  ];

  const ContractorCard = ({ contractor }: { contractor: Contractor }) => (
    <Card className="bg-portfolio-dark border-portfolio-gold/30 hover:border-portfolio-gold/60 transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        {/* Contractor Image */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full bg-portfolio-gold/20 flex items-center justify-center border-2 border-portfolio-gold/30 overflow-hidden">
            {contractor.image ? (
              <img 
                src={contractor.image} 
                alt={contractor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-portfolio-gold" />
            )}
          </div>
        </div>

        {/* Contractor Info */}
        <div className="text-center mb-4">
          <h3 className="font-special-elite text-xl font-semibold text-portfolio-gold mb-2">
            {contractor.name}
          </h3>
          <p className="font-special-elite text-sm text-portfolio-white/80 mb-3">
            {contractor.title}
          </p>
          {contractor.yearsExperience && (
            <div className="flex items-center justify-center text-portfolio-white/70 mb-3">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="font-special-elite text-sm">{contractor.yearsExperience}+ Years Experience</span>
            </div>
          )}
        </div>

        {/* Specialties */}
        <div className="mb-4">
          <div className="flex flex-wrap justify-center gap-2">
            {contractor.specialties.map((specialty, index) => (
              <Badge 
                key={index}
                className="bg-portfolio-gold/20 text-portfolio-gold border-portfolio-gold/30 font-special-elite text-xs"
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bio */}
        <p className="font-special-elite text-sm text-portfolio-white/80 leading-relaxed mb-4 text-center">
          {contractor.bio}
        </p>

        {/* Education */}
        {contractor.education && (
          <div className="mb-4">
            <div className="flex items-center justify-center text-portfolio-white/70">
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="font-special-elite text-xs">{contractor.education}</span>
            </div>
          </div>
        )}

        {/* Awards */}
        {contractor.awards && contractor.awards.length > 0 && (
          <div className="border-t border-portfolio-gold/30 pt-4">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-4 h-4 mr-2 text-portfolio-gold" />
              <span className="font-special-elite text-sm text-portfolio-gold">Recognition</span>
            </div>
            <div className="space-y-1">
              {contractor.awards.map((award, index) => (
                <p key={index} className="font-special-elite text-xs text-portfolio-white/70 text-center">
                  {award}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const PlaceholderCard = () => (
    <Card className="bg-portfolio-dark border-portfolio-gold/30 border-dashed">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full bg-portfolio-gold/10 flex items-center justify-center border-2 border-portfolio-gold/20 border-dashed">
            <User className="w-16 h-16 text-portfolio-gold/50" />
          </div>
        </div>
        <h3 className="font-special-elite text-lg font-semibold text-portfolio-gold/70 mb-2">
          Contractor Position Available
        </h3>
        <p className="font-special-elite text-sm text-portfolio-white/60 leading-relaxed">
          We're building our prestigious panel of industry experts. This space is reserved for accomplished professionals who will evaluate and provide valuable feedback on submitted scripts.
        </p>
      </CardContent>
    </Card>
  );

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
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="font-special-elite text-4xl md:text-5xl font-semibold mb-4 text-portfolio-gold">
              Our Contractors Panel
            </h1>
            <p className="font-special-elite text-lg text-portfolio-white/80 max-w-3xl mx-auto leading-relaxed">
              Meet the industry professionals who bring years of experience and expertise to evaluate your scripts with precision and insight.
            </p>
          </div>

          {/* Contractors Grid */}
          {contractors.length > 0 ? (
            <>
              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <Card className="bg-portfolio-dark border-portfolio-gold/30 text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-portfolio-gold mb-2">{contractors.length}</div>
                    <div className="font-special-elite text-sm text-portfolio-white/80">Expert Contractors</div>
                  </CardContent>
                </Card>
                <Card className="bg-portfolio-dark border-portfolio-gold/30 text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-portfolio-gold mb-2">
                      {contractors.reduce((acc, contractor) => acc + (contractor.yearsExperience || 0), 0)}+
                    </div>
                    <div className="font-special-elite text-sm text-portfolio-white/80">Combined Years Experience</div>
                  </CardContent>
                </Card>
                <Card className="bg-portfolio-dark border-portfolio-gold/30 text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-portfolio-gold mb-2">
                      {contractors.reduce((acc, contractor) => acc + (contractor.specialties?.length || 0), 0)}
                    </div>
                    <div className="font-special-elite text-sm text-portfolio-white/80">Areas of Expertise</div>
                  </CardContent>
                </Card>
              </div>

              {/* Contractors Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {contractors.map((contractor) => (
                  <ContractorCard key={contractor.id} contractor={contractor} />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Coming Soon Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-portfolio-gold/20 border-2 border-portfolio-gold/30 mb-6">
                  <Award className="w-10 h-10 text-portfolio-gold" />
                </div>
                <h2 className="font-special-elite text-2xl md:text-3xl font-semibold mb-4 text-portfolio-gold">
                  Building Our Expert Panel
                </h2>
                <p className="font-special-elite text-lg text-portfolio-white/80 max-w-2xl mx-auto leading-relaxed mb-8">
                  We're carefully curating a distinguished panel of industry professionals, including experienced script readers, 
                  development executives, and award-winning writers who will provide comprehensive feedback on your submissions.
                </p>
              </div>

              {/* Placeholder Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <PlaceholderCard />
                <PlaceholderCard />
                <PlaceholderCard />
              </div>

              {/* What to Expect Section */}
              <Card className="bg-portfolio-dark border-portfolio-gold/30 max-w-4xl mx-auto">
                <CardContent className="p-8">
                  <h3 className="font-special-elite text-xl font-semibold text-portfolio-gold mb-6 text-center">
                    What to Expect from Our Contractors
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-portfolio-gold mt-2 flex-shrink-0"></div>
                        <p className="font-special-elite text-sm text-portfolio-white/80">
                          Professional industry experience with major studios and production companies
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-portfolio-gold mt-2 flex-shrink-0"></div>
                        <p className="font-special-elite text-sm text-portfolio-white/80">
                          Specialized expertise across multiple genres and formats
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-portfolio-gold mt-2 flex-shrink-0"></div>
                        <p className="font-special-elite text-sm text-portfolio-white/80">
                          Proven track record in script development and evaluation
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-portfolio-gold mt-2 flex-shrink-0"></div>
                        <p className="font-special-elite text-sm text-portfolio-white/80">
                          Constructive, detailed feedback focused on improving your work
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-portfolio-gold mt-2 flex-shrink-0"></div>
                        <p className="font-special-elite text-sm text-portfolio-white/80">
                          Industry insights and current market knowledge
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-portfolio-gold mt-2 flex-shrink-0"></div>
                        <p className="font-special-elite text-sm text-portfolio-white/80">
                          Professional discretion and confidentiality with all submissions
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Call to Action */}
          <div className="text-center mt-16">
            <p className="font-special-elite text-lg text-portfolio-white/80 mb-6">
              Ready to get professional feedback on your script?
            </p>
            <a 
              href="/script-portal"
              className="inline-block bg-portfolio-gold text-portfolio-black font-special-elite font-semibold px-8 py-3 rounded-lg hover:bg-portfolio-gold/90 transition-colors duration-300"
            >
              Submit Your Script
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContractorsPanel;