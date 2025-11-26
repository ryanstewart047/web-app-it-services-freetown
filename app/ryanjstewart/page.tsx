'use client';

import { useState } from 'react';
import { Moon, Sun, Mail, Phone, MapPin, Linkedin, Github, Globe, Code, Database, Server, Layout, Smartphone, Award, GraduationCap, Briefcase, ExternalLink, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PortfolioPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [imageError, setImageError] = useState(false);

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
      {/* Theme Toggle Button - Fixed Position */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
          darkMode 
            ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
            : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
        }`}
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {/* Hero Section */}
      <section className={`relative py-20 px-4 overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
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
              <p className={`text-2xl md:text-3xl font-semibold mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Stack Developer & IT Specialist
              </p>
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
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Technical Skills
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Full Stack Development Expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Frontend */}
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'} hover:scale-105 transition-transform`}>
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
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-500/20' : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'} hover:scale-105 transition-transform`}>
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
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'} hover:scale-105 transition-transform`}>
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
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-orange-900/50 to-orange-800/30 border border-orange-500/20' : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'} hover:scale-105 transition-transform`}>
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
            <div className={`p-6 rounded-xl md:col-span-2 ${darkMode ? 'bg-gradient-to-br from-pink-900/50 to-pink-800/30 border border-pink-500/20' : 'bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200'} hover:scale-105 transition-transform`}>
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
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
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
                className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'} hover:shadow-2xl transition-all duration-300`}
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
                    <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'} h-full min-h-[400px] flex items-center justify-center`}>
                      <div className="p-8 text-center">
                        <Globe className={`w-24 h-24 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Visit the live website to see the full project
                        </p>
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
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
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
                className={`p-6 rounded-xl ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'} hover:scale-105 transition-transform`}
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
        <div className="max-w-4xl mx-auto text-center">
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
