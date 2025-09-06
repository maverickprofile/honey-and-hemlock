import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-portfolio-black">
      <Header />
      
      <section className="bg-portfolio-black text-portfolio-white py-20 relative overflow-hidden">
        {/* Background Lens Images */}
        <div 
          className="absolute top-1/4 right-0 w-1/3 h-1/2 opacity-10 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('/lovable-uploads/74c9a851-6d57-412e-9a5e-b83bc5a76b7c.png')`,
            backgroundPosition: 'center right',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div 
          className="absolute bottom-0 left-1/4 w-1/4 h-1/3 opacity-15 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('/lovable-uploads/9cf1eb65-bc24-4062-9ec2-2bafdbaa9642.png')`,
            backgroundPosition: 'center left',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="font-special-elite text-4xl md:text-5xl font-semibold mb-4 text-portfolio-gold">
              Privacy Policy
            </h1>
            <p className="font-special-elite text-lg text-portfolio-white/80">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Privacy Content */}
          <div className="space-y-8 font-special-elite text-portfolio-white leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">1. Introduction</h2>
              <p className="mb-4">
                Honey & Hemlock Productions ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, including our script review services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3 text-portfolio-gold">Personal Information</h3>
              <p className="mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Fill out contact forms on our website</li>
                <li>Submit scripts for review through our services</li>
                <li>Subscribe to our newsletter or communications</li>
                <li>Create an account for our services</li>
                <li>Make a payment for our services</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-portfolio-gold">Types of Personal Information</h3>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Name and contact information (email address, phone number)</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Scripts and creative content you submit for review</li>
                <li>Communications you send to us</li>
                <li>Professional information relevant to our services</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-portfolio-gold">Automatically Collected Information</h3>
              <p className="mb-4">
                When you visit our website, we may automatically collect certain information about your device and usage:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>IP address and location information</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent on our site</li>
                <li>Referring website addresses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">3. How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect for various purposes:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>To provide and maintain our services</li>
                <li>To process script submissions and provide feedback</li>
                <li>To communicate with you about our services</li>
                <li>To process payments and send receipts</li>
                <li>To improve our website and services</li>
                <li>To send you marketing communications (with your consent)</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">4. Information Sharing and Disclosure</h2>
              <p className="mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold mb-3 text-portfolio-gold">Service Providers</h3>
              <p className="mb-4">
                We may share your information with trusted third-party service providers who assist us in:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Payment processing</li>
                <li>Website hosting and maintenance</li>
                <li>Email communication services</li>
                <li>Analytics and website improvement</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-portfolio-gold">Legal Requirements</h3>
              <p className="mb-4">
                We may disclose your information when required by law or to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Comply with legal processes or government requests</li>
                <li>Protect our rights, property, or safety</li>
                <li>Protect the rights, property, or safety of our users</li>
                <li>Prevent fraud or investigate potential violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">5. Script and Creative Content Protection</h2>
              <p className="mb-4">
                We understand the sensitive nature of creative content. Regarding scripts and creative materials you submit:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>You retain all intellectual property rights to your submitted content</li>
                <li>We treat all submissions as confidential</li>
                <li>Access is limited to authorized reviewers and staff</li>
                <li>We do not share your creative content with third parties without explicit consent</li>
                <li>We securely store and handle all submitted materials</li>
                <li>We may retain copies for quality assurance and legal compliance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">6. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Secure Socket Layer (SSL) encryption for data transmission</li>
                <li>Restricted access to personal information on a need-to-know basis</li>
                <li>Regular security assessments and updates</li>
                <li>Secure storage of submitted scripts and materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">7. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records as required</li>
              </ul>
              <p className="mb-4">
                Scripts and creative content are typically retained for the duration of the review process plus a reasonable period for quality assurance, unless otherwise requested by the client.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">8. Your Privacy Rights</h2>
              <p className="mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate information</li>
                <li>The right to delete your personal information</li>
                <li>The right to restrict processing of your information</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent for marketing communications</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, please contact us using the information provided at the end of this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">9. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                Our website may use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Understand how you interact with our site</li>
                <li>Improve your user experience</li>
                <li>Analyze website traffic and usage patterns</li>
              </ul>
              <p className="mb-4">
                You can control cookie preferences through your browser settings, though some features may not function properly if cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">10. Third-Party Links</h2>
              <p className="mb-4">
                Our website may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">11. Children's Privacy</h2>
              <p className="mb-4">
                Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us to have it removed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">12. International Data Transfers</h2>
              <p className="mb-4">
                If you are accessing our services from outside our operating jurisdiction, please be aware that your information may be transferred to, stored, and processed in our operating location. By using our services, you consent to the transfer of your information to our facilities and service providers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">13. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">14. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, your privacy rights, or how we handle your information, please contact us:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Through our website contact form</li>
                <li>Via our official email communications</li>
                <li>Through our official social media channels</li>
              </ul>
              <p className="mb-4">
                We will respond to your inquiry within a reasonable timeframe and work to address any concerns you may have about your privacy.
              </p>
            </section>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;