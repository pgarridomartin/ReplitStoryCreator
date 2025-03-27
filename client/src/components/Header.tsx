import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-primary text-3xl mr-2">
            <i className="ri-book-open-line"></i>
          </span>
          <h1 className="text-2xl font-bold font-heading text-neutral-dark">StoryWonder</h1>
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="font-heading font-semibold hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/#how-it-works" className="font-heading font-semibold hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="/#testimonials" className="font-heading font-semibold hover:text-primary transition-colors">
            Sample Books
          </Link>
          <Link href="/#faq" className="font-heading font-semibold hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>
        
        <button
          className="md:hidden text-2xl"
          aria-label="Menu"
          onClick={toggleMobileMenu}
        >
          <i className="ri-menu-line"></i>
        </button>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 bg-neutral-light">
          <Link href="/" className="block py-2 font-heading font-semibold hover:text-primary">
            Home
          </Link>
          <Link href="/#how-it-works" className="block py-2 font-heading font-semibold hover:text-primary">
            How It Works
          </Link>
          <Link href="/#testimonials" className="block py-2 font-heading font-semibold hover:text-primary">
            Sample Books
          </Link>
          <Link href="/#faq" className="block py-2 font-heading font-semibold hover:text-primary">
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
