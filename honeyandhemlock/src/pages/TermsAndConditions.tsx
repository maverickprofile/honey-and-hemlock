import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-portfolio-black">
      <Header />
      
      <section className="bg-portfolio-black text-portfolio-white py-20 relative overflow-hidden">
        {/* Background Lens Images */}
        <div 
          className="absolute top-1/4 left-0 w-1/3 h-1/2 opacity-10 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('/lovable-uploads/74c9a851-6d57-412e-9a5e-b83bc5a76b7c.png')`,
            backgroundPosition: 'center left',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-1/4 h-1/3 opacity-15 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('/lovable-uploads/9cf1eb65-bc24-4062-9ec2-2bafdbaa9642.png')`,
            backgroundPosition: 'center right',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="font-special-elite text-4xl md:text-5xl font-semibold mb-4 text-portfolio-gold">
              Terms and Conditions
            </h1>
            <p className="font-special-elite text-lg text-portfolio-white/80">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Terms Content */}
          <div className="space-y-8 font-special-elite text-portfolio-white leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using the Honey & Hemlock Productions website and services, you accept and agree to be bound by the terms and provision of this agreement. These Terms and Conditions apply to all visitors, users, and others who access or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">2. Description of Service</h2>
              <p className="mb-4">
                Honey & Hemlock Productions is a film production company that provides various services including but not limited to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Film production and post-production services</li>
                <li>Script review and evaluation services ("Honey Writes")</li>
                <li>Film portfolio and gallery display</li>
                <li>Contact and communication services</li>
                <li>Sponsorship opportunities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">3. Script Submission and Review Services</h2>
              <p className="mb-4">
                When using our script review services:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>You retain all intellectual property rights to your submitted scripts</li>
                <li>We provide feedback and review services in good faith</li>
                <li>Payment is required before script review begins</li>
                <li>Review timelines are estimates and may vary based on volume and complexity</li>
                <li>We reserve the right to decline review of inappropriate or offensive content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">4. Payment and Refund Policy</h2>
              <p className="mb-4">
                For paid services:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>All payments are processed securely through approved payment processors</li>
                <li>Refunds are available within 7 days of service purchase if no work has begun</li>
                <li>Once script review has commenced, refunds are not available</li>
                <li>All prices are subject to change with notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">5. Intellectual Property</h2>
              <p className="mb-4">
                The content, organization, graphics, design, compilation, magnetic translation, digital conversion, and other matters related to the site are protected under applicable copyrights, trademarks, and other proprietary rights. You may not copy, distribute, display, execute publicly, make available to the public, reduce to human readable form, resell, or use for commercial purposes any portion of the site without our express written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">6. User Conduct</h2>
              <p className="mb-4">
                You agree not to use our services to:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                <li>Upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with any person or entity</li>
                <li>Upload, post, or transmit any content that infringes any patent, trademark, trade secret, copyright, or other proprietary rights</li>
                <li>Upload, post, or transmit any unsolicited or unauthorized advertising, promotional materials, junk mail, spam, or chain letters</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">7. Privacy and Data Protection</h2>
              <p className="mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services, to understand our practices regarding the collection and use of your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">8. Disclaimer of Warranties</h2>
              <p className="mb-4">
                Our services are provided "as is" and "as available" without any representations or warranties, express or implied. We make no representations or warranties in relation to our services or the information and materials provided through our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">9. Limitation of Liability</h2>
              <p className="mb-4">
                In no event shall Honey & Hemlock Productions, its officers, directors, employees, or agents be liable to you for any direct, indirect, incidental, special, punitive, or consequential damages whatsoever resulting from any loss of use, data, or profits arising out of or in connection with the use or performance of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">10. Indemnification</h2>
              <p className="mb-4">
                You agree to indemnify and hold harmless Honey & Hemlock Productions and its subsidiaries, affiliates, officers, agents, employees, partners, and licensors from any claim or demand, including reasonable attorneys' fees, made by any third party due to or arising out of content you submit, post, transmit, or otherwise make available through our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">11. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">12. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">13. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which Honey & Hemlock Productions operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-portfolio-gold">14. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms and Conditions, please contact us through our website's contact form or via our official communication channels.
              </p>
            </section>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;