import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-[#FF6B6B] to-[#4ECDC4] text-white py-16">
      <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center">
        <div className="md:w-1/2 mt-8 md:mt-0">
          <h1 className="text-4xl md:text-5xl font-bold font-heading leading-tight mb-4">
            Create Magical Stories<br/>
            <span className="text-[#FFD166]">Starring Your Child</span>
          </h1>
          <p className="text-lg mb-8 max-w-md">
            Personalized books where your little one becomes the hero of their own adventure, created by AI with your guidance.
          </p>
          <Link 
            href="/create-book" 
            className="bg-[#FFD166] hover:bg-opacity-90 text-neutral-dark font-bold py-3 px-8 rounded-full inline-flex items-center shadow-lg transition-all transform hover:scale-105"
          >
            <span>Create Their Story</span>
            <i className="ri-arrow-right-line ml-2"></i>
          </Link>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1512253229843-c2c1289d9529?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
              alt="Child reading a book" 
              className="rounded-lg shadow-2xl" 
              width="500" 
              height="375"
            />
            <div className="absolute -bottom-6 -right-6 bg-[#FFD166] p-4 rounded-lg shadow-lg">
              <span className="font-feature font-bold text-neutral-dark block">100% Unique</span>
              <span className="text-sm text-neutral-dark">AI-Generated Stories</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
