import { Link } from "wouter";

export default function CTA() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold font-heading mb-4">Ready to Create Your Child's Adventure?</h2>
        <p className="mb-8 max-w-2xl mx-auto">Give the gift of imagination and make your child the hero of their very own story book.</p>
        <Link 
          href="/create-book" 
          className="bg-[#FFD166] hover:bg-opacity-90 text-neutral-dark font-bold py-3 px-8 rounded-full inline-flex items-center shadow-lg transition-all transform hover:scale-105"
        >
          <span>Start Creating Now</span>
          <i className="ri-arrow-right-line ml-2"></i>
        </Link>
      </div>
    </section>
  );
}
