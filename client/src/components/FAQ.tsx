import { useState } from "react";

const faqs = [
  {
    id: 1,
    question: "How personalized are the stories?",
    answer: "Each story is uniquely generated based on your child's name, appearance, and interests. The AI creates a completely custom narrative with your child as the protagonist, and all illustrations feature your child's likeness based on the customization options you select."
  },
  {
    id: 2,
    question: "How long does it take to receive a physical book?",
    answer: "Physical books are printed and shipped within 3-5 business days. Delivery times depend on your location, but typically take 5-7 additional days for standard shipping. Express shipping options are available at checkout."
  },
  {
    id: 3,
    question: "Can I make changes after I preview the story?",
    answer: "Yes! During the preview stage, you can regenerate the story if you're not completely satisfied. You can also go back to previous steps and adjust the character details or story elements before finalizing your purchase."
  },
  {
    id: 4,
    question: "Are the stories age-appropriate?",
    answer: "Absolutely! Our AI is specifically designed to create content appropriate for the age range you select. Stories for younger children (3-5) feature simpler language and plots, while stories for older children (6-12) include more complex narratives and vocabulary suitable for their reading level."
  }
];

export default function FAQ() {
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 bg-[#F8F9FA]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-heading text-center mb-12">Frequently Asked Questions</h2>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <div key={faq.id} className="mb-6 bg-white rounded-lg shadow overflow-hidden">
              <button 
                className="w-full text-left p-4 font-bold flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                onClick={() => toggleFaq(faq.id)}
                aria-expanded={openFaqId === faq.id}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <span>{faq.question}</span>
                <i className={`ri-arrow-down-s-line text-xl transition-transform ${openFaqId === faq.id ? 'rotate-180' : ''}`}></i>
              </button>
              <div 
                id={`faq-answer-${faq.id}`}
                className={`px-4 pb-4 ${openFaqId === faq.id ? 'block' : 'hidden'}`}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
