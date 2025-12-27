import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-0 pt-10 pb-10 overflow-hidden bg-muted text-foreground border-t border-border transition-colors duration-300">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-primary opacity-50"></div>
      <div className="absolute -top-[500px] -right-[500px] w-[1000px] h-[1000px] rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
      <div className="absolute top-[20%] -left-[200px] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group w-fit">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary-foreground text-xl font-bold">I</span>
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">Islami Zindagi</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Embark on a transformative journey of Islamic learning. Access comprehensive dars, engage with our community, and discover the path to true success.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110">
                <Github size={18} />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h4 className="text-foreground font-semibold text-lg mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-primary rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">Home</Link></li>
              <li><Link to="/dars" className="text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">Dars (Lessons)</Link></li>
              <li><Link to="/qna" className="text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">Q&A Forum</Link></li>
              <li><Link to="/events" className="text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">Events</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">About Us</Link></li>
              <li><Link to="/profile" className="text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block">My Profile</Link></li>
            </ul>
          </div>



          {/* Contact */}
          <div className="md:col-span-1">
            <h4 className="text-foreground font-semibold text-lg mb-6 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-primary rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-muted-foreground group">
                <Mail className="w-5 h-5 mt-1 text-primary group-hover:text-foreground transition-colors" />
                <span className="text-sm hover:text-foreground transition-colors">info@islamizindagi.com</span>
              </li>
              <li className="flex items-start space-x-3 text-muted-foreground group">
                <Phone className="w-5 h-5 mt-1 text-primary group-hover:text-foreground transition-colors" />
                <span className="text-sm hover:text-foreground transition-colors">+1 (234) 567-890</span>
              </li>
              <li className="flex items-start space-x-3 text-muted-foreground group">
                <MapPin className="w-5 h-5 mt-1 text-primary group-hover:text-foreground transition-colors" />
                <span className="text-sm hover:text-foreground transition-colors">123 Islamic Center Dr,<br />Knowledge City, IL 60601</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground/60">
          <p>&copy; {currentYear} Islami Zindagi. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
