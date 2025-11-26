'use client';

import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Mail, Phone, MapPin, Linkedin, Github, Globe, Code, Database, Server, Layout, Smartphone, Award, GraduationCap, Briefcase, ExternalLink, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PortfolioPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-animate class
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [darkMode]); // Re-run when theme changes to catch new elements

  const specialties = [
    { text: 'Full Stack Developer', color: 'from-blue-400 to-cyan-400' },
    { text: 'IT Specialist', color: 'from-purple-400 to-pink-400' },
    { text: 'Computer Repair Technician', color: 'from-green-400 to-emerald-400' },
    { text: 'Mobile Repair Technician', color: 'from-orange-400 to-red-400' },
    { text: 'Network Administrator', color: 'from-yellow-400 to-orange-400' },
    { text: 'System Administrator', color: 'from-indigo-400 to-purple-400' },
    { text: 'Cloud Solutions Architect', color: 'from-cyan-400 to-blue-400' },
    { text: 'DevOps Engineer', color: 'from-pink-400 to-rose-400' },
  ];

  useEffect(() => {
    const currentText = specialties[currentSpecialty].text;
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 500 : 2000;

    if (!isDeleting && displayText === currentText) {
      // Pause before deleting
      const timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayText === '') {
      // Move to next specialty
      setIsDeleting(false);
      setCurrentSpecialty((prev) => (prev + 1) % specialties.length);
      return;
    }

    // Type or delete character
    const timeout = setTimeout(() => {
      setDisplayText(
        isDeleting
          ? currentText.substring(0, displayText.length - 1)
          : currentText.substring(0, displayText.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentSpecialty]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const skills = {
    frontend: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Redux', 'Vue.js'],
    backend: ['Node.js', 'Express.js', 'Python', 'Django', 'FastAPI', 'PHP', 'RESTful APIs', 'GraphQL'],
    database: ['MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Redis', 'Airtable'],
    devOps: ['Git', 'GitHub', 'Docker', 'CI/CD', 'Vercel', 'Railway', 'AWS', 'Linux', 'Nginx'],
    other: ['System Administration', 'Network Configuration', 'CCNA', 'IT Services', 'Troubleshooting', 'Cloud Services']
  };

  const projects = [
    {
      id: 1,
      name: 'IT Services Freetown',
      url: 'https://www.itservicesfreetown.com',
      description: 'Comprehensive IT services platform for device repairs, sales, and technical support',
      image: '/assets/logo.png',
      category: 'Full Stack Web Application',
      year: '2024-2025',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Airtable', 'Vercel'],
      features: [
        'AI-Powered Chat Support with GROQ API integration',
        'Real-time Repair Tracking System with SMS notifications',
        'Online Marketplace with infinite scroll and advanced filtering',
        'Appointment Booking System with calendar integration',
        'Blog Platform with AI content generation',
        'Interactive Device Troubleshooting wizard',
        'Mobile-responsive design with PWA capabilities',
        'Admin Dashboard for managing repairs, products, and appointments',
        'Payment Instructions & Receipt Generation',
        'Google AdSense integration',
        'SEO optimized with metadata and sitemap',
        'Email notification system',
        'Analytics and form tracking',
        'Multi-language support ready',
        'Cloud sync for mobile desktop apps'
      ],
      highlights: [
        'Serves 1000+ customers in Freetown, Sierra Leone',
        'Integrated multiple third-party APIs',
        'Fully automated booking and tracking system',
        'Revenue-generating marketplace platform'
      ]
    },
    {
      id: 2,
      name: 'EARPI - Environmental Action & Reforestation',
      url: 'https://www.earpi.org',
      description: 'NGO platform dedicated to combating climate change through tree planting and sustainable agriculture',
      image: '/assets/earpi-preview.png',
      category: 'Non-Profit Organization Website',
      year: '2024',
      technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vercel'],
      features: [
        'Interactive mission and vision presentation',
        'Project showcase with image galleries',
        'Volunteer registration and management',
        'Donation integration system',
        'Blog for environmental awareness articles',
        'Event calendar for tree planting activities',
        'Impact metrics dashboard (trees planted, CO2 offset)',
        'Multilingual support for global reach',
        'Newsletter subscription system',
        'Social media integration',
        'Mobile-first responsive design',
        'Contact forms for partnerships'
      ],
      highlights: [
        'Promotes green vegetation initiatives',
        'Facilitates sustainable agriculture programs',
        'Engages community in climate action',
        'Tracks environmental impact metrics'
      ]
    }
  ];

  const education = [
    {
      degree: 'Bachelor of Computer Applications (BCA)',
      institution: 'Amity University, India',
      year: 'Completed',
      icon: <GraduationCap className="w-6 h-6" />,
      description: 'Comprehensive study in computer science, programming, databases, and software engineering'
    },
    {
      degree: 'Cisco Certified Network Associate (CCNA)',
      institution: 'BlueCrest College, Freetown',
      year: 'Routing and Switching',
      icon: <Award className="w-6 h-6" />,
      description: 'Professional certification in network configuration, routing protocols, and switching technologies'
    },
    {
      degree: 'System Administration and IT Services',
      institution: 'Google Professional Certificate',
      year: 'Certified',
      icon: <Award className="w-6 h-6" />,
      description: 'Expert training in IT support, system administration, network management, and troubleshooting'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        
        .scroll-animate {
          opacity: 0;
          transform: translateY(2rem);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        /* Stagger animation delays */
        .scroll-animate:nth-child(1) { transition-delay: 0ms; }
        .scroll-animate:nth-child(2) { transition-delay: 100ms; }
        .scroll-animate:nth-child(3) { transition-delay: 200ms; }
        .scroll-animate:nth-child(4) { transition-delay: 300ms; }
        .scroll-animate:nth-child(5) { transition-delay: 400ms; }
        .scroll-animate:nth-child(6) { transition-delay: 500ms; }
      `}</style>
      
      {/* Custom Navigation Header - Sticky */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} border-b transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Custom Logo */}
            <div className="flex items-center gap-3">
              <div className={`relative w-12 h-12 rounded-lg ${darkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-purple-600 to-pink-600'} flex items-center justify-center font-bold text-white text-xl shadow-lg`}>
                <span>RJS</span>
                <div className={`absolute inset-0 rounded-lg ${darkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-purple-600 to-pink-600'} blur-md opacity-50 -z-10`}></div>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Ryan J Stewart
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Full Stack Developer
                </p>
              </div>
            </div>

            {/* Navigation Links & Theme Toggle */}
            <div className="flex items-center gap-4">
              <a 
                href="#projects" 
                className={`hidden md:block text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors`}
              >
                Projects
              </a>
              <a 
                href="#skills" 
                className={`hidden md:block text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors`}
              >
                Skills
              </a>
              <a 
                href="#education" 
                className={`hidden md:block text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors`}
              >
                Education
              </a>
              <a 
                href="mailto:support@itservicesfreetown.com"
                className={`hidden md:block text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors`}
              >
                Contact
              </a>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  darkMode 
                    ? 'bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20' 
                    : 'bg-gray-800/10 text-gray-800 hover:bg-gray-800/20'
                }`}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative pt-32 pb-20 px-4 overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Profile Image */}
            <div className="flex justify-center md:justify-start">
              <div className={`relative group ${darkMode ? 'hover:shadow-blue-500/50' : 'hover:shadow-purple-500/50'} hover:shadow-2xl transition-all duration-300`}>
                <div className={`absolute inset-0 rounded-full ${darkMode ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'} blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                <div className="relative">
                  {!imageError ? (
                    <Image
                      src="/assets/profile-ryan.jpg"
                      alt="Ryan J Stewart"
                      width={300}
                      height={300}
                      className="rounded-full border-4 border-white/20 shadow-2xl relative z-10"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className={`w-[300px] h-[300px] rounded-full border-4 ${darkMode ? 'border-white/20 bg-gradient-to-br from-blue-600 to-purple-600' : 'border-white bg-gradient-to-br from-purple-500 to-pink-500'} shadow-2xl relative z-10 flex items-center justify-center`}>
                      <span className="text-8xl font-bold text-white">RJS</span>
                    </div>
                  )}
                  <div className={`absolute bottom-4 right-4 z-20 ${darkMode ? 'bg-green-500' : 'bg-green-400'} w-8 h-8 rounded-full border-4 ${darkMode ? 'border-gray-900' : 'border-white'}`}></div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center md:text-left">
              <h1 className={`text-5xl md:text-6xl font-bold mb-4 ${darkMode ? 'bg-gradient-to-r from-blue-400 to-purple-400' : 'bg-gradient-to-r from-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
                Ryan J Stewart
              </h1>
              <div className="h-12 mb-6">
                <p className={`text-2xl md:text-3xl font-semibold bg-gradient-to-r ${specialties[currentSpecialty].color} bg-clip-text text-transparent`}>
                  {displayText}
                  <span className={`inline-block w-0.5 h-8 ml-1 ${darkMode ? 'bg-blue-400' : 'bg-purple-600'} animate-pulse`}></span>
                </p>
              </div>
              <p className={`text-lg mb-8 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Passionate about creating innovative web solutions and providing expert IT services. 
                Specialized in building scalable applications with modern technologies and delivering 
                exceptional user experiences.
              </p>
              
              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-8">
                <a 
                  href="mailto:support@itservicesfreetown.com" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email</span>
                </a>
                <a 
                  href="tel:+23276123456" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Call</span>
                </a>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Freetown, SL</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link 
                  href="/"
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'} text-white shadow-lg hover:shadow-xl transform hover:scale-105`}
                >
                  <Globe className="w-5 h-5" />
                  Visit Main Site
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 scroll-animate">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Technical Skills
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Full Stack Development Expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Frontend */}
            <div className={`scroll-animate p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'} hover:scale-105 transition-transform`}>
              <div className="flex items-center gap-3 mb-4">
                <Layout className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-xl font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Frontend</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.frontend.map((skill) => (
                  <span 
                    key={skill}
                    className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-200 text-blue-800'}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Backend */}
            <div className={`scroll-animate p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/20' : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'} hover:scale-105 transition-transform`}>
              <div className="flex items-center gap-3 mb-4">
                <Server className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                <h3 className={`text-xl font-bold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>Backend</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.backend.map((skill) => (
                  <span 
                    key={skill}
                    className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-200 text-green-800'}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Database */}
            <div className={`scroll-animate p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'} hover:scale-105 transition-transform`}>
              <div className="flex items-center gap-3 mb-4">
                <Database className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <h3 className={`text-xl font-bold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>Database</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.database.map((skill) => (
                  <span 
                    key={skill}
                    className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-200 text-purple-800'}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* DevOps */}
            <div className={`scroll-animate p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-orange-900/50 to-orange-800/30 border border-orange-500/20' : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'} hover:scale-105 transition-transform`}>
              <div className="flex items-center gap-3 mb-4">
                <Code className={`w-8 h-8 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                <h3 className={`text-xl font-bold ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>DevOps & Tools</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.devOps.map((skill) => (
                  <span 
                    key={skill}
                    className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-200 text-orange-800'}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Other Skills */}
            <div className={`scroll-animate p-6 rounded-xl md:col-span-2 ${darkMode ? 'bg-gradient-to-br from-pink-900/50 to-pink-800/30 border border-pink-500/20' : 'bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200'} hover:scale-105 transition-transform`}>
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className={`w-8 h-8 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                <h3 className={`text-xl font-bold ${darkMode ? 'text-pink-300' : 'text-pink-700'}`}>Specialized Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.other.map((skill) => (
                  <span 
                    key={skill}
                    className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-pink-500/20 text-pink-300' : 'bg-pink-200 text-pink-800'}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className={`py-20 px-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 scroll-animate">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Featured Projects
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showcasing real-world applications and solutions
            </p>
          </div>

          <div className="space-y-12">
            {projects.map((project, index) => (
              <div 
                key={project.id}
                className={`scroll-animate rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'} hover:shadow-2xl transition-all duration-300`}
              >
                <div className={`grid md:grid-cols-5 gap-6 p-8 ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                  {/* Project Info */}
                  <div className={`md:col-span-3 ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {project.name}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {project.category} • {project.year}
                        </p>
                      </div>
                      <a 
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
                      >
                        Visit <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="mb-6">
                      <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Technologies Used:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span 
                            key={tech}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Key Features:
                      </h4>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {project.features.slice(0, 8).map((feature, idx) => (
                          <li 
                            key={idx}
                            className={`flex items-start gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {project.features.length > 8 && (
                        <details className="mt-3">
                          <summary className={`cursor-pointer text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                            View {project.features.length - 8} more features
                          </summary>
                          <ul className="grid md:grid-cols-2 gap-2 mt-3">
                            {project.features.slice(8).map((feature, idx) => (
                              <li 
                                key={idx}
                                className={`flex items-start gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                              >
                                <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>

                    {/* Highlights */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'}`}>
                      <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        Project Highlights:
                      </h4>
                      <ul className="space-y-1">
                        {project.highlights.map((highlight, idx) => (
                          <li 
                            key={idx}
                            className={`flex items-start gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Project Preview */}
                  <div className={`md:col-span-2 ${index % 2 === 1 ? 'md:col-start-4' : ''}`}>
                    <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'} h-full min-h-[400px]`}>
                      <div className="relative h-full group">
                        {/* Browser Chrome */}
                        <div className={`p-3 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'} flex items-center gap-2`}>
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                          <div className={`flex-1 mx-4 px-3 py-1 rounded text-xs ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                            {project.url}
                          </div>
                        </div>
                        
                        {/* Website Preview Frame */}
                        <div className={`relative h-[calc(100%-48px)] ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-white via-gray-50 to-white'} overflow-hidden`}>
                          {project.id === 1 ? (
                            // IT Services Freetown Preview
                            <div className="p-6 space-y-4">
                              {/* Header Bar */}
                              <div className={`h-12 rounded-lg ${darkMode ? 'bg-blue-900/30 border border-blue-500/20' : 'bg-blue-100 border border-blue-200'} flex items-center px-4`}>
                                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600"></div>
                                <div className="ml-3 flex-1 space-y-1">
                                  <div className={`h-2 w-32 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                  <div className={`h-1.5 w-24 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                                </div>
                              </div>
                              
                              {/* Hero Section Mockup */}
                              <div className={`h-32 rounded-lg ${darkMode ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20' : 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200'} p-4`}>
                                <div className={`h-3 w-3/4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mb-2`}></div>
                                <div className={`h-2 w-1/2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} mb-3`}></div>
                                <div className="flex gap-2">
                                  <div className={`h-6 w-20 rounded ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}></div>
                                  <div className={`h-6 w-20 rounded ${darkMode ? 'bg-purple-600' : 'bg-purple-500'}`}></div>
                                </div>
                              </div>
                              
                              {/* Cards Grid */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className={`h-24 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} p-3`}>
                                  <div className={`w-8 h-8 rounded mb-2 ${darkMode ? 'bg-green-600/20' : 'bg-green-100'}`}></div>
                                  <div className={`h-2 w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`h-24 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} p-3`}>
                                  <div className={`w-8 h-8 rounded mb-2 ${darkMode ? 'bg-orange-600/20' : 'bg-orange-100'}`}></div>
                                  <div className={`h-2 w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`h-24 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} p-3`}>
                                  <div className={`w-8 h-8 rounded mb-2 ${darkMode ? 'bg-purple-600/20' : 'bg-purple-100'}`}></div>
                                  <div className={`h-2 w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`h-24 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} p-3`}>
                                  <div className={`w-8 h-8 rounded mb-2 ${darkMode ? 'bg-red-600/20' : 'bg-red-100'}`}></div>
                                  <div className={`h-2 w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                              </div>
                              
                              {/* Footer Bar */}
                              <div className={`h-8 rounded ${darkMode ? 'bg-gray-900/50' : 'bg-gray-200'}`}></div>
                            </div>
                          ) : (
                            // EARPI Environmental NGO Preview
                            <div className="p-6 space-y-4">
                              {/* Header with Logo */}
                              <div className={`h-12 rounded-lg ${darkMode ? 'bg-green-900/30 border border-green-500/20' : 'bg-green-100 border border-green-200'} flex items-center px-4`}>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                                  🌱
                                </div>
                                <div className="ml-3 flex gap-4">
                                  <div className={`h-2 w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                  <div className={`h-2 w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                  <div className={`h-2 w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                              </div>
                              
                              {/* Hero Banner */}
                              <div className={`h-28 rounded-lg ${darkMode ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/20' : 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200'} p-4 relative overflow-hidden`}>
                                <div className="absolute top-2 right-2 text-4xl opacity-20">🌳</div>
                                <div className={`h-3 w-2/3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mb-2`}></div>
                                <div className={`h-2 w-1/2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} mb-3`}></div>
                                <div className={`h-6 w-24 rounded ${darkMode ? 'bg-green-600' : 'bg-green-500'}`}></div>
                              </div>
                              
                              {/* Impact Stats */}
                              <div className="grid grid-cols-3 gap-2">
                                <div className={`h-16 rounded ${darkMode ? 'bg-green-900/20 border border-green-500/20' : 'bg-green-50 border border-green-200'} p-2`}>
                                  <div className={`h-3 w-12 rounded mb-1 ${darkMode ? 'bg-green-600' : 'bg-green-500'}`}></div>
                                  <div className={`h-1.5 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`h-16 rounded ${darkMode ? 'bg-blue-900/20 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'} p-2`}>
                                  <div className={`h-3 w-12 rounded mb-1 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}></div>
                                  <div className={`h-1.5 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`h-16 rounded ${darkMode ? 'bg-yellow-900/20 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'} p-2`}>
                                  <div className={`h-3 w-12 rounded mb-1 ${darkMode ? 'bg-yellow-600' : 'bg-yellow-500'}`}></div>
                                  <div className={`h-1.5 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                              </div>
                              
                              {/* Project Cards */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className={`h-20 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} p-2`}>
                                  <div className={`h-10 w-full rounded mb-1 ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}></div>
                                  <div className={`h-1.5 w-3/4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`h-20 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} p-2`}>
                                  <div className={`h-10 w-full rounded mb-1 ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}></div>
                                  <div className={`h-1.5 w-3/4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                            <a 
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                            >
                              View Live Site <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 scroll-animate">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Education & Certifications
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Professional qualifications and continuous learning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {education.map((edu, index) => (
              <div 
                key={index}
                className={`scroll-animate p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'} hover:scale-105 transition-transform`}
              >
                <div className={`w-12 h-12 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} flex items-center justify-center mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {edu.icon}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {edu.degree}
                </h3>
                <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {edu.institution}
                </p>
                <p className={`text-xs mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {edu.year}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {edu.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900' : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'}`}>
        <div className="max-w-4xl mx-auto text-center scroll-animate">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Let's Work Together
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Looking for a skilled full stack developer or IT specialist? Let's discuss your project.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="mailto:support@itservicesfreetown.com"
              className="flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              <Mail className="w-5 h-5" />
              Get in Touch
            </a>
            <Link 
              href="/"
              className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border-2 border-white/30"
            >
              <Globe className="w-5 h-5" />
              Visit IT Services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gray-900'} text-center`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          © {new Date().getFullYear()} Ryan J Stewart. All rights reserved.
        </p>
        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-600' : 'text-gray-600'}`}>
          Built with Next.js, TypeScript & Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
