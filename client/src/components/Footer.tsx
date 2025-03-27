import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-neutral-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <span className="text-primary text-2xl mr-2">
                <i className="ri-book-open-line"></i>
              </span>
              <h2 className="text-xl font-bold font-heading">StoryWonder</h2>
            </Link>
            <p className="text-gray-400 mb-4">Creating magical personalized stories for children everywhere.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <i className="ri-facebook-fill"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <i className="ri-instagram-line"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <i className="ri-twitter-fill"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Pinterest">
                <i className="ri-pinterest-fill"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold font-heading mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/create-book" className="text-gray-400 hover:text-white transition-colors">Story Themes</Link></li>
              <li><Link href="/#testimonials" className="text-gray-400 hover:text-white transition-colors">Sample Books</Link></li>
              <li><Link href="/#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold font-heading mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><Link href="/#faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shipping Information</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Returns Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold font-heading mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">Subscribe for updates and special offers.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="p-2 rounded-l-lg w-full focus:outline-none text-neutral-dark"
              />
              <button 
                type="submit" 
                className="bg-primary hover:bg-opacity-90 px-4 rounded-r-lg transition-colors"
              >
                <i className="ri-send-plane-fill"></i>
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} StoryWonder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
