import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LogIn, Layout, Mail, ShieldCheck, MapPin,
  Phone, Globe, Clock, ChevronLeft, ChevronRight,
  BookOpen, Wallet, Headphones, CheckCircle
} from 'lucide-react';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero Slider Content
  const slides = [
    {
      id: 1,
      image: 'https://d13loartjoc1yn.cloudfront.net/upload/institute/images/large/170406112121_CDGI_Image_Building.webp',
      title: 'CDGI-Dues',
      description: 'Simplify and Speed Up Your No Dues Clearance'
    },
    {
      id: 2,
      image: 'https://assets.collegedunia.com/public/image/Screenshot_521__e248bd09f4f4ca90e28a49eaecb36fa5.png',
      title: 'Digital Transformation',
      description: '“Paperless no dues system for quick, transparent, and easy approvals.”'
    },
    {
      id: 4,
      image: 'https://d13loartjoc1yn.cloudfront.net/upload/institute/images/large/170406112121_CDGI_Image_Building.webp',
      title: 'Modern Infrastructure',
      description: 'The online No Dues platform helps students complete their clearance process quickly and efficiently.'
    }
  ];

  useEffect(() => {
    if (activeTab === 'home') {
      const interval = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab, slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  const renderHero = () => (
    <section className="relative w-full h-[70vh] max-h-[500px] overflow-hidden">
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${slide.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center px-4 w-full">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in drop-shadow-2xl">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl mb-8 animate-fade-in delay-200 opacity-90 drop-shadow-lg max-w-2xl mx-auto">
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-all z-10"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-all z-10"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all ${index === currentSlide ? 'bg-blue-600 w-8' : 'bg-white/50 hover:bg-white/80 w-2.5'
              }`}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-blue-800 leading-none tracking-tight">CDGi</span>
            <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider mt-0.5">Knowledge is Power</span>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="hidden md:flex items-center gap-8 text-[15px] font-bold text-gray-600">
            <button onClick={() => setActiveTab('home')} className={`hover:text-blue-600 transition-colors ${activeTab === 'home' ? 'text-blue-600' : ''}`}>Home</button>
            <button onClick={() => setActiveTab('about')} className={`hover:text-blue-600 transition-colors ${activeTab === 'about' ? 'text-blue-600' : ''}`}>About</button>
            <button onClick={() => setActiveTab('apply')} className={`hover:text-blue-600 transition-colors ${activeTab === 'apply' ? 'text-blue-600' : ''}`}>How To Apply</button>
            <button onClick={() => setActiveTab('contact')} className={`hover:text-blue-600 transition-colors ${activeTab === 'contact' ? 'text-blue-600' : ''}`}>Contact Us</button>
          </div>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Main Content Areas */}
      {activeTab === 'home' && (
        <>
          {renderHero()}
          <main className="flex-grow py-16 px-4 bg-white">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-3xl md:text-[2.5rem] font-bold text-center text-blue-900 mb-6 leading-tight">
                Streamline Your No Dues Process
              </h1>
              <p className="text-gray-600 text-lg md:text-xl text-center mb-16 max-w-3xl mx-auto leading-relaxed">
                A complete digital solution for final-year students to clear all departmental dues
                efficiently and transparently. Say goodbye to long queues and paperwork.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 px-4">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-blue-100 text-center transform transition-all hover:-translate-y-2 hover:shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Fast Processing</h3>
                  <p className="text-gray-600 leading-relaxed">Complete clearance in minimum time with real-time tracking of your requests.</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-blue-100 text-center transform transition-all hover:-translate-y-2 hover:shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Easy to Use</h3>
                  <p className="text-gray-600 leading-relaxed">User-friendly interface designed for quick navigation and effortless clearance.</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-blue-100 text-center transform transition-all hover:-translate-y-2 hover:shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-200">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Secure</h3>
                  <p className="text-gray-600 leading-relaxed">Your data is multi-layer protected with dynamic QR codes for instant verification.</p>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-24 text-center">
                <Link to="/login" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-5 px-12 rounded-2xl text-xl inline-block transition-all transform hover:scale-105 hover:-translate-y-1 shadow-2xl shadow-blue-200">
                  Start Your Clearance Now
                </Link>
                <p className="text-gray-500 mt-6 font-semibold">
                  Already graduation ready? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
                </p>
              </div>
            </div>
          </main>
        </>
      )}

      {activeTab === 'about' && (
        <>
          <section className="relative w-full h-[45vh] max-h-[350px] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-110"
              style={{ backgroundImage: `url('${slides[0].image}')` }}
            >
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
            </div>
            <div className="relative h-full flex items-center justify-center">
              <h1 className="text-white text-5xl md:text-6xl font-black tracking-tighter drop-shadow-2xl">
                About CDGI-Dues
              </h1>
            </div>
          </section>

          <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center">
            <div className="w-full md:w-1/2 rounded-[3.5rem] overflow-hidden shadow-2xl skew-y-1 hover:skew-y-0 transition-all duration-700 border-8 border-white">
              <img src="/assets/about-dues.jpg" alt="Institutional Clearance" className="w-full h-auto hover:scale-105 transition-all duration-1000" />
            </div>
            <div className="w-full md:w-1/2 space-y-10 px-4">
              <h2 className="text-4xl md:text-5xl font-black text-blue-900 leading-[1.1] tracking-tight">
                Revolutionizing <br /> <span className="text-blue-600">Graduation Logistics</span>
              </h2>
              <p className="text-gray-600 leading-relaxed text-xl font-medium">
                The CDGI Digital No Dues System is a mission-critical platform designed to transform
                the end-of-degree clearance process into a seamless digital journey. We eliminate
                bureaucratic delays by providing a transparent, real-time approval ecosystem.
              </p>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-[2.5rem] border-l-[12px] border-blue-600 shadow-sm">
                <p className="text-blue-900 text-lg font-bold italic leading-relaxed">
                  "Our goal is to ensure that students celebrate their academic achievements without the burden
                  of manual clearance paperwork."
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg pb-4">
                Students can track status across Accounts, Faculty, and HOD segments.
                Our platform automates assignment verification, fee clearance checks, and generates a
                QR-authenticated digital certificate that ensures instant verification for
                administrative and professional purposes.
              </p>
            </div>
          </div>
        </>
      )}

      {activeTab === 'apply' && (
        <>
          {renderHero('Apply For CDGI-Dues', 'Follow the simple step-by-step clearance process')}
          <div className="py-16 px-8 bg-blue-50">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold text-blue-900 text-center mb-4">How No Dues Process Works</h2>
              <p className="text-gray-600 text-center mb-16">Follow the simple step-by-step clearance process across all departments</p>

              <div className="bg-white rounded-[40px] p-12 shadow-xl border border-blue-100 flex justify-between items-center gap-4">
                <StepIcon color="bg-blue-600" icon={<LogIn size={32} />} />
                <div className="h-0.5 w-12 bg-gray-200"></div>
                <StepIcon color="bg-purple-600" icon={<BookOpen size={32} />} />
                <div className="h-0.5 w-12 bg-gray-200"></div>
                <StepIcon color="bg-orange-500" icon={<Wallet size={32} />} />
                <div className="h-0.5 w-12 bg-gray-200"></div>
                <StepIcon color="bg-pink-600" icon={<Headphones size={32} />} />
                <div className="h-0.5 w-12 bg-gray-200"></div>
                <StepIcon color="bg-green-600" icon={<CheckCircle size={32} />} />
              </div>
              <div className="grid grid-cols-5 mt-6 text-center text-xs font-bold text-blue-900 tracking-wide uppercase px-4">
                <span>Login</span>
                <span>Complete Work</span>
                <span>Accounts Approval</span>
                <span>HOD Approval</span>
                <span>Final Download</span>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'contact' && (
        <>
          {/* Hero Section */}
          <section className="relative w-full h-[50vh] max-h-[300px]" style={{
            backgroundImage: `url('https://d13loartjoc1yn.cloudfront.net/upload/institute/images/large/170406112121_CDGI_Image_Building.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-3xl md:text-5xl font-bold text-center px-4 drop-shadow-2xl">
              Contact Us
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-16 px-4 flex flex-wrap justify-center items-start gap-10 bg-gray-50">

            {/* Left: Contact Info */}
            <div className="flex-1 min-w-[300px] max-w-[500px] bg-white rounded-2xl p-10 shadow-xl border border-gray-100">
              <h2 className="text-blue-600 font-bold text-2xl mb-6 flex items-center gap-2">
                Get in Touch With Us
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                We'd love to hear from you! Whether you have a question about your no dues process,
                pending approvals, or clearance details — our team is ready to help.
              </p>

              <div className="space-y-8">
                <div>
                  <h3 className="text-blue-400 text-lg font-bold mb-3 flex items-center gap-2">📍 College Address</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Chameli Devi Group of Institutions,<br />
                    Khandwa Road, Village Umrikheda,<br />
                    Near Toll Booth, Indore, Madhya Pradesh 452020
                  </p>
                </div>

                <div>
                  <h3 className="text-blue-400 text-lg font-bold mb-3 flex items-center gap-2">📞 Contact</h3>
                  <div className="space-y-1">
                    <p className="text-gray-700 font-medium">Phone: +91 7314243600</p>
                    <p className="text-gray-700 font-medium">Email: info@cdgi.edu.in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Map */}
            <div className="flex-1 min-w-[300px] max-w-[600px] h-[450px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <iframe
                title="CDGI Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.0489864287592!2d75.88629987360245!3d22.614645831431243!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fb28a5660d8b%3A0x2a7a0698a930c80f!2sChameli%20Devi%20Group%20of%20Institutions!5e0!3m2!1sen!2sin!4v1776963388359!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy">
              </iframe>
            </div>
          </section>
        </>
      )}

      {/* Blue Footer */}
      <footer className="bg-[#1e40af] py-16 px-8 text-white mt-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          {/* Col 1 */}
          <div className="space-y-6">
            <h4 className="text-2xl font-bold">CDGI-Dues</h4>
            <p className="text-blue-100 text-sm leading-relaxed">
              Chameli Devi Group of Institutions
            </p>
            <p className="text-blue-200 text-xs italic">
              Streamlining clearance processes for a better tomorrow
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold border-b border-blue-400 pb-2 inline-block">Quick Links</h4>
            <ul className="space-y-3 text-blue-100 text-sm font-medium">
              <li><button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors">About</button></li>
              <li><button onClick={() => setActiveTab('apply')} className="hover:text-white transition-colors">How To Apply</button></li>
              <li><button onClick={() => setActiveTab('contact')} className="hover:text-white transition-colors">Contact Us</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold border-b border-blue-400 pb-2 inline-block">Contact Us</h4>
            <ul className="space-y-4 text-blue-100 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={16} />
                <span>Email: info@cdgi.edu.in</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} />
                <span>Phone: +91 7314243600</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} />
                <span>Address: Indore, Madhya Pradesh</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold border-b border-blue-400 pb-2 inline-block">Our Location</h4>
            <div className="rounded-xl overflow-hidden border-4 border-white border-opacity-20 shadow-lg h-32">
              <iframe
                title="Footer Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.0489864287592!2d75.88629987360245!3d22.614645831431243!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fb28a5660d8b%3A0x2a7a0698a930c80f!2sChameli%20Devi%20Group%20of%20Institutions!5e0!3m2!1sen!2sin!4v1776963388359!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy">
              </iframe>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-blue-400 border-opacity-30 text-center text-blue-200 text-sm font-medium">
          &copy; 2026 Chameli Devi Group of Institutions. All rights reserved. | CDGI-Dues System
        </div>
      </footer>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-2xl bg-blue-50 hover:shadow-xl hover:-translate-y-2 transition-all border border-blue-100 flex flex-col items-center">
    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">{icon}</div>
    <h3 className="text-xl font-bold text-blue-900 mb-3">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
  </div>
);

const StepIcon = ({ color, icon }) => (
  <div className={`w-16 h-16 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all cursor-pointer`}>
    {icon}
  </div>
);

const ContactInfo = ({ icon, title, content }) => (
  <div className="flex gap-4">
    <div className="mt-1">{icon}</div>
    <div>
      <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wide mb-1">{title}</h4>
      <p className="text-gray-600 text-[15px] leading-relaxed">{content}</p>
    </div>
  </div>
);

export default LandingPage;
