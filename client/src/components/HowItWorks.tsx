export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-heading text-center mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-edit-line text-2xl text-primary"></i>
            </div>
            <h3 className="text-xl font-bold font-heading mb-2">Customize</h3>
            <p>Tell us about your child and choose story elements that they'll love.</p>
          </div>
          
          <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-[#4ECDC4] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-magic-line text-2xl text-[#4ECDC4]"></i>
            </div>
            <h3 className="text-xl font-bold font-heading mb-2">Generate</h3>
            <p>Our AI creates a unique story and illustrations featuring your child as the hero.</p>
          </div>
          
          <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-[#FFD166] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-book-read-line text-2xl text-[#FFD166]"></i>
            </div>
            <h3 className="text-xl font-bold font-heading mb-2">Enjoy</h3>
            <p>Receive your beautifully illustrated personalized storybook to cherish forever.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
