const testimonials = [
  {
    id: 1,
    content: "My daughter absolutely loves her personalized storybook! She gets so excited seeing herself as the main character. It's become her favorite bedtime story.",
    author: "Sarah M.",
    relation: "Mom of Emma, 5",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    rating: 5
  },
  {
    id: 2,
    content: "Such a creative gift! My nephew couldn't believe he was in his own book. The illustrations are beautiful and the story was engaging for him. Great quality too.",
    author: "James K.",
    relation: "Uncle to Liam, 7",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    rating: 5
  },
  {
    id: 3,
    content: "My son has asked me to read his adventure book every night for weeks! The personalization makes reading so much more engaging for him. Wonderful educational tool.",
    author: "Maria J.",
    relation: "Mom of Noah, 6",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    rating: 4.5
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-heading text-center mb-12">Happy Readers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-[#F8F9FA] p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <span className="text-[#FFD166] text-lg">
                  {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                    <i key={i} className="ri-star-fill"></i>
                  ))}
                  {testimonial.rating % 1 !== 0 && (
                    <i className="ri-star-half-fill"></i>
                  )}
                </span>
              </div>
              <p className="mb-4 italic">{testimonial.content}</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.relation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
