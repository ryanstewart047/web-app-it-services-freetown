'use client';

import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Mail, Phone, MapPin, Linkedin, Github, Globe, Code, Database, Server, Layout, Smartphone, Award, GraduationCap, Briefcase, ExternalLink, ChevronRight, Lock, X, Upload, Save, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PortfolioPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Settings state
  const [settings, setSettings] = useState({
    email: 'support@itservicesfreetown.com',
    phone: '+232 76 123 456',
    location: 'Freetown, Sierra Leone',
    profilePhoto: '/assets/profile-ryan.jpg',
    logoText: 'RJS',
  });
  
  const [editedSettings, setEditedSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const cropperCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropperImageRef = useRef<HTMLImageElement>(null);

  // Prevent scroll restoration and ensure top position on load
  useEffect(() => {
    // Force scroll to top on component mount
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Load settings from API
    loadSettings();
  }, []);
  
  // Load settings
  const loadSettings = async () => {
    try {
      const response = await fetch('/api/portfolio-settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setEditedSettings(data);
        setImageError(false); // Reset image error on new settings
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  // Handle admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (adminPassword.length < 3) {
      setError('Password required');
      return;
    }
    
    // Validate password with API
    try {
      const response = await fetch('/api/portfolio-settings/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: adminPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Invalid password. Please try again.');
        setAdminPassword('');
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
      setAdminPassword('');
    }
  };
  
  // Handle settings save
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/portfolio-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: adminPassword,
          settings: editedSettings,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSettings(editedSettings);
        setSuccessMessage('Settings saved successfully!');
        setTimeout(() => {
          setSuccessMessage('');
          handleCloseAdmin();
          // Reload to apply changes
          window.location.reload();
        }, 1500);
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch (error) {
      setError('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle file selection - show cropper instead of direct upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, or WebP');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB');
      return;
    }
    
    // Read file and show cropper
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setShowCropper(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Crop and upload the image
  const handleCropComplete = async () => {
    if (!cropperCanvasRef.current || !cropperImageRef.current) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      const canvas = cropperCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const image = cropperImageRef.current;
      const size = 300; // Output size
      
      canvas.width = size;
      canvas.height = size;
      
      // Calculate crop area
      const scale = image.naturalWidth / image.width;
      const cropSize = Math.min(image.width, image.height) / zoom;
      const cropX = (image.width - cropSize) / 2 + crop.x;
      const cropY = (image.height - cropSize) / 2 + crop.y;
      
      // Draw cropped circular image
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(
        image,
        cropX * scale,
        cropY * scale,
        cropSize * scale,
        cropSize * scale,
        0,
        0,
        size,
        size
      );
      ctx.restore();
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to process image');
          setIsUploading(false);
          return;
        }
        
        const formData = new FormData();
        formData.append('file', blob, 'profile-photo.png');
        formData.append('password', adminPassword);
        
        const response = await fetch('/api/upload-profile-photo', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          setEditedSettings({ ...editedSettings, profilePhoto: data.url });
          setSuccessMessage('Photo uploaded! Click Save to apply changes.');
          setShowCropper(false);
          setImageToCrop(null);
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setError(data.message || 'Failed to upload photo');
        }
        
        setIsUploading(false);
      }, 'image/png', 0.95);
    } catch (error) {
      setError('Error uploading photo');
      setIsUploading(false);
    }
  };
  
  // Cancel cropping
  const handleCancelCrop = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };
  
  // Handle file upload (legacy - replaced by cropper)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, or WebP');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', adminPassword);
      
      const response = await fetch('/api/upload-profile-photo', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setEditedSettings({ ...editedSettings, profilePhoto: data.url });
        setSuccessMessage('Photo uploaded! Click Save to apply changes.');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      setError('Error uploading photo');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Close admin panel
  const handleCloseAdmin = () => {
    setShowAdminPanel(false);
    setIsAuthenticated(false);
    setAdminPassword('');
    setEditedSettings(settings);
    setError('');
    setSuccessMessage('');
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, observerOptions);

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.scroll-animate');
      elements.forEach(el => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
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
      description: 'Comprehensive study in computer science, programming, databases, and software engineering',
      verificationLink: 'https://www.amity.edu/OCVS/'
    },
    {
      degree: 'Diploma in Information Technology Management',
      institution: 'Alison',
      year: 'Certified',
      icon: <Award className="w-6 h-6" />,
      description: 'Advanced diploma covering IT management principles, project management, and business technology',
      verificationLink: 'https://alison.com/certification/check/%242y%2410%24Ekw.WxHpgVlyu5T8Pj3lL.PRveisiifd0R4Ywm1eiDrMPPe8.SJu'
    },
    {
      degree: 'Cisco Certified Network Associate (CCNA)',
      institution: 'BlueCrest College, Freetown',
      year: 'Routing and Switching',
      icon: <Award className="w-6 h-6" />,
      description: 'Professional certification in network configuration, routing protocols, and switching technologies',
      certNumber: 'C-3bff183a8f-8c7f89'
    },
    {
      degree: 'System Administration and IT Services',
      institution: 'Google Professional Certificate',
      year: 'Certified',
      icon: <Award className="w-6 h-6" />,
      description: 'Expert training in IT support, system administration, network management, and troubleshooting',
      verificationLink: 'https://www.coursera.org/account/accomplishments/verify/4E86D9NHXPZ8'
    },
    {
      degree: 'Technical Support Fundamentals',
      institution: 'Google Professional Certificate',
      year: 'Certified',
      icon: <Award className="w-6 h-6" />,
      description: 'Foundational skills in technical support, customer service, troubleshooting, and IT fundamentals',
      verificationLink: 'https://www.coursera.org/account/accomplishments/verify/U6EXD9LQ44BA'
    },
    {
      degree: 'Cloud Computing Basics (Cloud 101)',
      institution: 'Google Professional Certificate',
      year: 'Certified',
      icon: <Award className="w-6 h-6" />,
      description: 'Introduction to cloud computing concepts, services, deployment models, and cloud infrastructure',
      verificationLink: 'https://www.coursera.org/account/accomplishments/verify/MUS4NV9JJVN4'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        
        /* Prevent scroll restoration on refresh */
        html, body {
          overflow-x: hidden;
        }
        
        .scroll-animate {
          opacity: 0;
          transform: translateY(2rem);
          transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), 
                      transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-fade-in-up {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        /* Stagger animation delays */
        .scroll-animate:nth-child(1) { transition-delay: 0ms; }
        .scroll-animate:nth-child(2) { transition-delay: 150ms; }
        .scroll-animate:nth-child(3) { transition-delay: 300ms; }
        .scroll-animate:nth-child(4) { transition-delay: 450ms; }
        .scroll-animate:nth-child(5) { transition-delay: 600ms; }
        .scroll-animate:nth-child(6) { transition-delay: 750ms; }
      `}</style>
      
      {/* Custom Navigation Header - Sticky */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} border-b transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Custom Logo */}
            <div className="flex items-center gap-3">
              <div className={`relative w-12 h-12 rounded-lg ${darkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-purple-600 to-pink-600'} flex items-center justify-center font-bold text-white text-xl shadow-lg`}>
                <span>{settings.logoText}</span>
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
                      src={settings.profilePhoto}
                      alt="Ryan J Stewart"
                      width={300}
                      height={300}
                      className="rounded-full border-4 border-white/20 shadow-2xl relative z-10"
                      onError={() => setImageError(true)}
                      key={settings.profilePhoto}
                      unoptimized={settings.profilePhoto.startsWith('data:')}
                    />
                  ) : (
                    <div className={`w-[300px] h-[300px] rounded-full border-4 ${darkMode ? 'border-white/20 bg-gradient-to-br from-blue-600 to-purple-600' : 'border-white bg-gradient-to-br from-purple-500 to-pink-500'} shadow-2xl relative z-10 flex items-center justify-center`}>
                      <span className="text-8xl font-bold text-white">{settings.logoText}</span>
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
                  href={`mailto:${settings.email}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email</span>
                </a>
                <a 
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Call</span>
                </a>
                <a 
                  href={`https://wa.me/${settings.phone.replace(/\s/g, '').replace(/^\+/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-green-600/20 hover:bg-green-600/30 border border-green-500/30' : 'bg-green-50 hover:bg-green-100 border border-green-200'} transition-colors`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-sm">WhatsApp</span>
                </a>
                <a 
                  href="https://chat.whatsapp.com/FuS9EBvCF455geNHqQl3Iz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-green-600/20 hover:bg-green-600/30 border border-green-500/30' : 'bg-green-50 hover:bg-green-100 border border-green-200'} transition-colors`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <svg className="w-3 h-3 -ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14.5h-9v-1.5h9v1.5zm0-3h-9V12h9v1.5zm0-3h-9V9h9v1.5z"/>
                  </svg>
                  <span className="text-sm">Join Group</span>
                </a>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{settings.location}</span>
                </div>
                <button
                  onClick={async () => {
                    setIsSharing(true);
                    try {
                      const shareData = {
                        title: 'Ryan J Stewart - Full Stack Developer',
                        text: 'Check out my portfolio and professional experience',
                        url: window.location.href
                      };
                      
                      if (navigator.share) {
                        await navigator.share(shareData);
                      } else {
                        // Fallback: copy to clipboard
                        await navigator.clipboard.writeText(window.location.href);
                        setShowShareToast(true);
                        setTimeout(() => setShowShareToast(false), 3000);
                      }
                    } catch (err) {
                      if ((err as Error).name !== 'AbortError') {
                        console.error('Error sharing:', err);
                      }
                    } finally {
                      setIsSharing(false);
                    }
                  }}
                  disabled={isSharing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30' : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSharing ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  <span className="text-sm">{isSharing ? 'Sharing...' : 'Share Profile'}</span>
                </button>
                <a
                  href={`mailto:${settings.email}?subject=Hire%20Ryan%20J%20Stewart%20-%20Full%20Stack%20Developer&body=Hi%20Ryan,%0D%0A%0D%0AI'm%20interested%20in%20discussing%20a%20project%20opportunity%20with%20you.%0D%0A%0D%0ABest%20regards`}
                  className={`relative group flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
                    darkMode 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500' 
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
                  } text-white shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse hover:animate-none overflow-hidden`}
                >
                  {/* Shimmer effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  
                  <Briefcase className="w-5 h-5 relative z-10" />
                  <span className="text-sm relative z-10">Hire Me</span>
                  
                  {/* Glow effect */}
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-75 blur-md transition-opacity duration-300 -z-10"></span>
                </a>
              </div>              {/* CTA Buttons */}
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
                <div className={`grid md:grid-cols-5 gap-6 p-4 md:p-8 ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                  {/* Project Info */}
                  <div className={`md:col-span-3 ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-2xl sm:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'} break-words`}>
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
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors whitespace-nowrap flex-shrink-0`}
                      >
                        Visit <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'} break-words`}>
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="mb-6 overflow-hidden">
                      <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Technologies Used:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span 
                            key={tech}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200'} whitespace-nowrap`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6 overflow-hidden">
                      <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Key Features:
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {project.features.slice(0, 8).map((feature, idx) => (
                          <li 
                            key={idx}
                            className={`flex items-start gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} break-words`}
                          >
                            <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <span className="break-words">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {project.features.length > 8 && (
                        <details className="mt-3">
                          <summary className={`cursor-pointer text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                            View {project.features.length - 8} more features
                          </summary>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                            {project.features.slice(8).map((feature, idx) => (
                              <li 
                                key={idx}
                                className={`flex items-start gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} break-words`}
                              >
                                <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                <span className="break-words">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>

                    {/* Highlights */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'} overflow-hidden`}>
                      <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        Project Highlights:
                      </h4>
                      <ul className="space-y-1">
                        {project.highlights.map((highlight, idx) => (
                          <li 
                            key={idx}
                            className={`flex items-start gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} break-words`}
                          >
                            <span className={`flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>•</span>
                            <span className="break-words">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Project Preview */}
                  <div className={`md:col-span-2 ${index % 2 === 1 ? 'md:col-start-4' : ''} overflow-hidden`}>
                    <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'} h-full min-h-[300px] md:min-h-[400px]`}>
                      <div className="relative h-full group">
                        {/* Browser Chrome */}
                        <div className={`p-2 md:p-3 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'} flex items-center gap-2`}>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                          </div>
                          <div className={`flex-1 mx-2 md:mx-4 px-2 md:px-3 py-1 rounded text-xs ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'} truncate`}>
                            {project.url}
                          </div>
                        </div>
                        
                        {/* Website Preview Frame */}
                        <div className={`relative h-[calc(100%-40px)] md:h-[calc(100%-48px)] ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-white via-gray-50 to-white'} overflow-hidden`}>
                          {project.id === 1 ? (
                            // IT Services Freetown Preview
                            <div className="p-3 md:p-6 space-y-3 md:space-y-4">
                              {/* Header Bar */}
                              <div className={`h-10 md:h-12 rounded-lg ${darkMode ? 'bg-blue-900/30 border border-blue-500/20' : 'bg-blue-100 border border-blue-200'} flex items-center px-3 md:px-4`}>
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"></div>
                                <div className="ml-2 md:ml-3 flex-1 space-y-1 min-w-0">
                                  <div className={`h-2 w-20 md:w-32 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                  <div className={`h-1.5 w-16 md:w-24 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                                </div>
                              </div>
                              
                              {/* Hero Section Mockup */}
                              <div className={`h-24 md:h-32 rounded-lg ${darkMode ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20' : 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200'} p-3 md:p-4`}>
                                <div className={`h-2.5 md:h-3 w-3/4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mb-2`}></div>
                                <div className={`h-2 w-1/2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} mb-2 md:mb-3`}></div>
                                <div className="flex gap-2">
                                  <div className={`h-5 md:h-6 w-16 md:w-20 rounded ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}></div>
                                  <div className={`h-5 md:h-6 w-16 md:w-20 rounded ${darkMode ? 'bg-purple-600' : 'bg-purple-500'}`}></div>
                                </div>
                              </div>
                              
                              {/* Cards Grid */}
                              <div className="grid grid-cols-2 gap-2 md:gap-3">
                                <div className={`h-20 md:h-24 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} p-2 md:p-3`}>
                                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded mb-1 md:mb-2 ${darkMode ? 'bg-green-600/20' : 'bg-green-100'}`}></div>
                                  <div className={`h-1.5 md:h-2 w-12 md:w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`h-20 md:h-24 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} p-2 md:p-3`}>
                                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded mb-1 md:mb-2 ${darkMode ? 'bg-orange-600/20' : 'bg-orange-100'}`}></div>
                                  <div className={`h-1.5 md:h-2 w-12 md:w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`h-20 md:h-24 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} p-2 md:p-3`}>
                                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded mb-1 md:mb-2 ${darkMode ? 'bg-purple-600/20' : 'bg-purple-100'}`}></div>
                                  <div className={`h-1.5 md:h-2 w-12 md:w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`h-20 md:h-24 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} p-2 md:p-3`}>
                                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded mb-1 md:mb-2 ${darkMode ? 'bg-red-600/20' : 'bg-red-100'}`}></div>
                                  <div className={`h-1.5 md:h-2 w-12 md:w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                              </div>
                              
                              {/* Footer Bar */}
                              <div className={`h-6 md:h-8 rounded ${darkMode ? 'bg-gray-900/50' : 'bg-gray-200'}`}></div>
                            </div>
                          ) : (
                            // EARPI Environmental NGO Preview
                            <div className="p-3 md:p-6 space-y-3 md:space-y-4">
                              {/* Header with Logo */}
                              <div className={`h-10 md:h-12 rounded-lg ${darkMode ? 'bg-green-900/30 border border-green-500/20' : 'bg-green-100 border border-green-200'} flex items-center px-3 md:px-4`}>
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  🌱
                                </div>
                                <div className="ml-2 md:ml-3 flex gap-2 md:gap-4 overflow-hidden">
                                  <div className={`h-1.5 md:h-2 w-12 md:w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                  <div className={`h-1.5 md:h-2 w-12 md:w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                  <div className={`h-1.5 md:h-2 w-12 md:w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} hidden sm:block`}></div>
                                </div>
                              </div>
                              
                              {/* Hero Banner */}
                              <div className={`h-24 md:h-28 rounded-lg ${darkMode ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/20' : 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200'} p-3 md:p-4 relative overflow-hidden`}>
                                <div className="absolute top-1 right-1 md:top-2 md:right-2 text-2xl md:text-4xl opacity-20">🌳</div>
                                <div className={`h-2.5 md:h-3 w-2/3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mb-2`}></div>
                                <div className={`h-2 w-1/2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} mb-2 md:mb-3`}></div>
                                <div className={`h-5 md:h-6 w-20 md:w-24 rounded ${darkMode ? 'bg-green-600' : 'bg-green-500'}`}></div>
                              </div>
                              
                              {/* Impact Stats */}
                              <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                                <div className={`h-14 md:h-16 rounded ${darkMode ? 'bg-green-900/20 border border-green-500/20' : 'bg-green-50 border border-green-200'} p-1.5 md:p-2`}>
                                  <div className={`h-2.5 md:h-3 w-10 md:w-12 rounded mb-1 ${darkMode ? 'bg-green-600' : 'bg-green-500'}`}></div>
                                  <div className={`h-1 md:h-1.5 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`h-14 md:h-16 rounded ${darkMode ? 'bg-blue-900/20 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'} p-1.5 md:p-2`}>
                                  <div className={`h-2.5 md:h-3 w-10 md:w-12 rounded mb-1 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}></div>
                                  <div className={`h-1 md:h-1.5 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`h-14 md:h-16 rounded ${darkMode ? 'bg-yellow-900/20 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'} p-1.5 md:p-2`}>
                                  <div className={`h-2.5 md:h-3 w-10 md:w-12 rounded mb-1 ${darkMode ? 'bg-yellow-600' : 'bg-yellow-500'}`}></div>
                                  <div className={`h-1 md:h-1.5 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                              </div>
                              
                              {/* Project Cards */}
                              <div className="grid grid-cols-2 gap-2 md:gap-3">
                                <div className={`h-16 md:h-20 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} p-1.5 md:p-2`}>
                                  <div className={`h-8 md:h-10 w-full rounded mb-1 ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}></div>
                                  <div className={`h-1 md:h-1.5 w-3/4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`h-16 md:h-20 rounded-lg ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} p-1.5 md:p-2`}>
                                  <div className={`h-8 md:h-10 w-full rounded mb-1 ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}></div>
                                  <div className={`h-1 md:h-1.5 w-3/4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
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
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {edu.description}
                </p>
                
                {/* Verification Link or Cert Number */}
                {(edu as any).verificationLink && (
                  <a
                    href={(edu as any).verificationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Verify Certificate
                  </a>
                )}
                {(edu as any).certNumber && (
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <span className="font-semibold">Cert #:</span> {(edu as any).certNumber}
                  </p>
                )}
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
              href={`mailto:${settings.email}`}
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
      <footer className={`py-8 px-4 ${darkMode ? 'bg-gray-950' : 'bg-gray-900'} text-center relative`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          © {new Date().getFullYear()} Ryan J Stewart. All rights reserved.
        </p>
        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-600' : 'text-gray-600'}`}>
          Built with Next.js, TypeScript & Tailwind CSS
        </p>
        
        {/* Discreet Admin Button */}
        <button
          onClick={() => setShowAdminPanel(true)}
          className={`absolute bottom-4 right-4 p-2 rounded-md opacity-20 hover:opacity-60 transition-opacity ${darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-700 hover:text-gray-500'}`}
          title="Admin Panel"
        >
          <Lock className="w-4 h-4" />
        </button>
      </footer>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={handleCloseAdmin}>
          <div 
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'} shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`sticky top-0 z-10 flex justify-between items-center p-6 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <Lock className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Portfolio Admin
                </h2>
              </div>
              <button
                onClick={handleCloseAdmin}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
              >
                <X className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!isAuthenticated ? (
                // Login Form
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <Lock className={`w-10 h-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Enter admin password to manage portfolio settings
                    </p>
                  </div>
                  
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Admin Password"
                        className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        autoFocus
                      />
                    </div>
                    
                    {error && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-red-500 text-sm">{error}</p>
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all"
                    >
                      Login
                    </button>
                  </form>
                </div>
              ) : (
                // Settings Form
                <div className="space-y-6">
                  {successMessage && (
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-green-500 font-medium">{successMessage}</p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-red-500">{error}</p>
                    </div>
                  )}

                  {/* Profile Photo */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Profile Photo
                    </label>
                    
                    {/* Photo Preview */}
                    {editedSettings.profilePhoto && (
                      <div className="mb-3">
                        <img 
                          src={editedSettings.profilePhoto} 
                          alt="Profile preview" 
                          className="w-32 h-32 rounded-full object-cover border-4 border-blue-500/20"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Upload className="w-5 h-5" />
                      {isUploading ? 'Uploading...' : 'Upload New Photo'}
                    </button>
                    
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      JPG, PNG, or WebP • Max 5MB • Square images work best
                    </p>
                    
                    {/* Manual URL Input (Optional) */}
                    <details className="mt-3">
                      <summary className={`text-xs cursor-pointer ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`}>
                        Or enter URL manually
                      </summary>
                      <input
                        type="text"
                        value={editedSettings.profilePhoto}
                        onChange={(e) => setEditedSettings({ ...editedSettings, profilePhoto: e.target.value })}
                        placeholder="/assets/profile-ryan.jpg"
                        className={`w-full mt-2 px-3 py-2 text-sm rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </details>
                  </div>

                  {/* Logo Text */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Logo Text (Initials)
                    </label>
                    <input
                      type="text"
                      value={editedSettings.logoText}
                      onChange={(e) => setEditedSettings({ ...editedSettings, logoText: e.target.value.substring(0, 3) })}
                      placeholder="RJS"
                      maxLength={3}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editedSettings.email}
                      onChange={(e) => setEditedSettings({ ...editedSettings, email: e.target.value })}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editedSettings.phone}
                      onChange={(e) => setEditedSettings({ ...editedSettings, phone: e.target.value })}
                      placeholder="+232 76 123 456"
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={editedSettings.location}
                      onChange={(e) => setEditedSettings({ ...editedSettings, location: e.target.value })}
                      placeholder="Freetown, Sierra Leone"
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
                    >
                      <Save className="w-5 h-5" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCloseAdmin}
                      className={`px-6 py-3 rounded-lg font-semibold transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl overflow-hidden`}>
            {/* Header */}
            <div className={`flex justify-between items-center p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Adjust Your Profile Photo
              </h3>
              <button
                onClick={handleCancelCrop}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                disabled={isUploading}
              >
                <X className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
            
            {/* Cropper Area */}
            <div className="p-6">
              <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                <div 
                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                  onMouseDown={(e) => {
                    const startX = e.clientX - crop.x;
                    const startY = e.clientY - crop.y;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      setCrop({
                        x: e.clientX - startX,
                        y: e.clientY - startY
                      });
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <img
                    ref={cropperImageRef}
                    src={imageToCrop}
                    alt="Crop preview"
                    className="max-w-full max-h-full object-contain select-none"
                    style={{
                      transform: `scale(${zoom}) translate(${crop.x / zoom}px, ${crop.y / zoom}px)`,
                      cursor: 'move'
                    }}
                    draggable={false}
                  />
                </div>
                
                {/* Circular overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full">
                    <defs>
                      <mask id="circle-mask">
                        <rect width="100%" height="100%" fill="white" />
                        <circle cx="50%" cy="50%" r="140" fill="black" />
                      </mask>
                    </defs>
                    <rect width="100%" height="100%" fill="black" opacity="0.6" mask="url(#circle-mask)" />
                    <circle cx="50%" cy="50%" r="140" stroke="white" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                  </svg>
                </div>
                
                {/* Helper text */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                  Drag to reposition • Scroll to zoom
                </div>
              </div>
              
              {/* Zoom Slider */}
              <div className="mt-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Zoom
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.1 : 0.1;
                    setZoom(Math.max(1, Math.min(3, zoom + delta)));
                  }}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1x</span>
                  <span>3x</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancelCrop}
                  disabled={isUploading}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-gray-800 hover:bg-gray-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropComplete}
                  disabled={isUploading}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Photo
                    </>
                  )}
                </button>
              </div>
              
              {/* Hidden canvas for cropping */}
              <canvas ref={cropperCanvasRef} className="hidden" />
            </div>
          </div>
        </div>
      )}

      {/* Share Toast Notification */}
      {showShareToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                Profile link copied to clipboard!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
