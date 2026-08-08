// Translation system for BridgeTech IT Services
class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.loadTranslations();
    }

    loadTranslations() {
        this.translations = {
            en: {
                // Navigation
                'nav.home': 'Home',
                'nav.book': 'Book Appointment',
                'nav.track': 'Track Repair',
                'nav.troubleshoot': 'Troubleshoot',
                'nav.chat': 'Chat Support',
                'nav.book-now': 'Book Now',

                // Hero Section
                'hero.title': 'Professional IT Services in Freetown',
                'hero.subtitle': 'Expert computer and mobile repairs with real-time tracking and AI-powered support',
                'hero.book-repair': 'Book Repair Now',
                'hero.track-repair': 'Track Your Repair',

                // Services Section
                'services.title': 'Our Services',
                'services.subtitle': 'We provide comprehensive IT repair services with cutting-edge technology and expert technicians',
                'services.computer.title': 'Computer Repair',
                'services.computer.desc': 'Desktop, laptop, and workstation repairs with genuine parts and warranty',
                'services.computer.feature1': 'Hardware diagnostics',
                'services.computer.feature2': 'Software troubleshooting',
                'services.computer.feature3': 'Data recovery',
                'services.computer.feature4': 'Performance optimization',
                'services.mobile.title': 'Mobile Repair',
                'services.mobile.desc': 'Smartphone and tablet repairs for all major brands and models',
                'services.mobile.feature1': 'Screen replacement',
                'services.mobile.feature2': 'Battery service',
                'services.mobile.feature3': 'Water damage repair',
                'services.mobile.feature4': 'Software restoration',
                'services.network.title': 'Network Setup',
                'services.network.desc': 'Professional network installation and configuration services',
                'services.network.feature1': 'Wi-Fi setup',
                'services.network.feature2': 'Network security',
                'services.network.feature3': 'Cable installation',
                'services.network.feature4': 'System integration',

                // Features Section
                'features.title': 'Why Choose Us?',
                'features.subtitle': 'Advanced technology meets exceptional service for the best repair experience',
                'features.tracking.title': 'Real-Time Tracking',
                'features.tracking.desc': 'Monitor your repair status in real-time with detailed progress updates',
                'features.chat.title': 'Live Chat Support',
                'features.chat.desc': 'Instant communication with our technicians and support team',
                'features.ai.title': 'AI Troubleshooting',
                'features.ai.desc': 'Get instant repair suggestions powered by artificial intelligence',
                'features.quality.title': 'Quality Guarantee',
                'features.quality.desc': 'All repairs come with warranty and satisfaction guarantee',

                // Statistics Section
                'stats.title': 'Our Track Record',
                'stats.subtitle': 'Numbers that speak for our commitment to excellence and customer satisfaction',
                'stats.devices': 'Devices Repaired',
                'stats.satisfaction': 'Customer Satisfaction %',
                'stats.time': 'Hours Average Repair Time',
                'stats.experience': 'Years Experience',

                // Call to Action
                'cta.title': 'Ready to Get Your Device Fixed?',
                'cta.subtitle': 'Book an appointment now and experience the future of IT repair services',
                'cta.schedule': 'Schedule Appointment',
                'cta.try-ai': 'Try AI Troubleshooting',

                // Footer
                'footer.description': 'Professional computer and mobile repair services in Freetown, Sierra Leone. We provide expert repairs with real-time tracking and AI-powered support.',
                'footer.quick-links': 'Quick Links',
                'footer.contact': 'Contact Us',
                'footer.copyright': '© 2025 BridgeTech IT Services. All rights reserved.',

                // Book Appointment Page
                'book.title': 'Book Your Repair Appointment',
                'book.subtitle': 'Schedule your device repair with our expert technicians',
                'book.form.customer-info': 'Customer Information',
                'book.form.name': 'Full Name *',
                'book.form.email': 'Email Address *',
                'book.form.phone': 'Phone Number *',
                'book.form.address': 'Address',
                'book.form.address-placeholder': 'Optional - for pickup service',
                'book.form.device-info': 'Device Information',
                'book.form.device': 'Device Type *',
                'book.form.device.select': 'Select device type',
                'book.form.device.computer': 'PC/Laptop',
                'book.form.device.mobile': 'Mobile Phone',
                'book.form.device.tablet': 'Tablet',
                'book.form.device.other': 'Other',
                'book.form.model': 'Device Model/Brand *',
                'book.form.model-placeholder': 'e.g., iPhone 13, Dell XPS 13, Samsung Galaxy S21',
                'book.form.service': 'Service Type *',
                'book.form.service.select': 'Select service type',
                'book.form.service.repair': 'Repair',
                'book.form.service.diagnostic': 'Diagnostic',
                'book.form.service.maintenance': 'Maintenance',
                'book.form.service.consultation': 'Consultation',
                'book.form.issue': 'Issue Description *',
                'book.form.issue-placeholder': 'Please describe the issue you\'re experiencing with your device...',
                'book.form.appointment-time': 'Preferred Appointment Time',
                'book.form.date': 'Preferred Date *',
                'book.form.time': 'Preferred Time *',
                'book.form.time.select': 'Select a time',
                'book.form.urgent': 'Urgent Repair',
                'book.form.submit': 'Book Appointment',
                'book.success': 'Appointment booked successfully!',
                'book.error': 'Error booking appointment. Please try again.',
                'book.info.response.title': 'Quick Response',
                'book.info.response.desc': 'We\'ll confirm your appointment within 2 hours',
                'book.info.updates.title': 'Email Updates',
                'book.info.updates.desc': 'Receive automatic updates on your repair status',
                'book.info.service.title': 'Flexible Service',
                'book.info.service.desc': 'Drop-off or pickup service available',

                // Track Repair Page
                'track.title': 'Track Your Repair',
                'track.subtitle': 'Enter your tracking ID to get real-time updates on your device repair status',
                'track.form.id': 'Tracking ID',
                'track.form.placeholder': 'Enter your tracking ID (e.g., REP-2024-001)',
                'track.form.submit': 'Track Repair',
                'track.status.pending': 'Pending',
                'track.status.progress': 'In Progress',
                'track.status.testing': 'Testing',
                'track.status.complete': 'Complete',
                'track.status.ready': 'Ready for Pickup',

                // Troubleshoot Page
                'troubleshoot.title': 'AI Troubleshooting Assistant',
                'troubleshoot.subtitle': 'Describe your device issue and get instant AI-powered solutions',
                'troubleshoot.form.issue': 'Describe your issue',
                'troubleshoot.form.submit': 'Get Solution',
                'troubleshoot.loading': 'Analyzing your issue...',

                // Chat Page
                'chat.title': 'Live Chat Support',
                'chat.subtitle': 'Get instant help from our support team',
                'chat.form.name': 'Your Name',
                'chat.form.message': 'Type your message...',
                'chat.form.send': 'Send',
                'chat.connecting': 'Connecting to support...',
                'chat.connected': 'Connected to support',

                // Common
                'common.loading': 'Loading...',
                'common.error': 'An error occurred',
                'common.success': 'Success!',
                'common.required': 'This field is required',
                'common.invalid-email': 'Please enter a valid email address',
                'common.invalid-phone': 'Please enter a valid phone number'
            },
            fr: {
                // Navigation
                'nav.home': 'Accueil',
                'nav.book': 'Prendre RDV',
                'nav.track': 'Suivre Réparation',
                'nav.troubleshoot': 'Dépannage',
                'nav.chat': 'Chat Support',
                'nav.book-now': 'Réserver',

                // Hero Section
                'hero.title': 'Services IT Professionnels à Freetown',
                'hero.subtitle': 'Réparations expertes d\'ordinateurs et mobiles avec suivi en temps réel et support IA',
                'hero.book-repair': 'Réserver Réparation',
                'hero.track-repair': 'Suivre Votre Réparation',

                // Services Section
                'services.title': 'Nos Services',
                'services.subtitle': 'Nous fournissons des services de réparation IT complets avec une technologie de pointe et des techniciens experts',
                'services.computer.title': 'Réparation Ordinateur',
                'services.computer.desc': 'Réparations de bureau, portable et station de travail avec pièces authentiques et garantie',
                'services.computer.feature1': 'Diagnostics matériel',
                'services.computer.feature2': 'Dépannage logiciel',
                'services.computer.feature3': 'Récupération de données',
                'services.computer.feature4': 'Optimisation des performances',
                'services.mobile.title': 'Réparation Mobile',
                'services.mobile.desc': 'Réparations de smartphones et tablettes pour toutes les grandes marques et modèles',
                'services.mobile.feature1': 'Remplacement d\'écran',
                'services.mobile.feature2': 'Service de batterie',
                'services.mobile.feature3': 'Réparation dégâts des eaux',
                'services.mobile.feature4': 'Restauration logicielle',
                'services.network.title': 'Configuration Réseau',
                'services.network.desc': 'Services professionnels d\'installation et de configuration réseau',
                'services.network.feature1': 'Configuration Wi-Fi',
                'services.network.feature2': 'Sécurité réseau',
                'services.network.feature3': 'Installation de câbles',
                'services.network.feature4': 'Intégration système',

                // Features Section
                'features.title': 'Pourquoi Nous Choisir?',
                'features.subtitle': 'La technologie avancée rencontre un service exceptionnel pour la meilleure expérience de réparation',
                'features.tracking.title': 'Suivi en Temps Réel',
                'features.tracking.desc': 'Surveillez l\'état de votre réparation en temps réel avec des mises à jour détaillées',
                'features.chat.title': 'Support Chat en Direct',
                'features.chat.desc': 'Communication instantanée avec nos techniciens et équipe de support',
                'features.ai.title': 'Dépannage IA',
                'features.ai.desc': 'Obtenez des suggestions de réparation instantanées alimentées par l\'intelligence artificielle',
                'features.quality.title': 'Garantie de Qualité',
                'features.quality.desc': 'Toutes les réparations viennent avec garantie et assurance de satisfaction',

                // Statistics Section
                'stats.title': 'Notre Historique',
                'stats.subtitle': 'Des chiffres qui parlent de notre engagement envers l\'excellence et la satisfaction client',
                'stats.devices': 'Appareils Réparés',
                'stats.satisfaction': 'Satisfaction Client %',
                'stats.time': 'Heures Temps Moyen de Réparation',
                'stats.experience': 'Années d\'Expérience',

                // Call to Action
                'cta.title': 'Prêt à Faire Réparer Votre Appareil?',
                'cta.subtitle': 'Prenez rendez-vous maintenant et découvrez l\'avenir des services de réparation IT',
                'cta.schedule': 'Planifier RDV',
                'cta.try-ai': 'Essayer le Dépannage IA',

                // Footer
                'footer.description': 'Services professionnels de réparation d\'ordinateurs et mobiles à Freetown, Sierra Leone. Nous fournissons des réparations expertes avec suivi en temps réel et support IA.',
                'footer.quick-links': 'Liens Rapides',
                'footer.contact': 'Nous Contacter',
                'footer.copyright': '© 2025 BridgeTech IT Services. Tous droits réservés.',

                // Book Appointment Page
                'book.title': 'Réserver Votre Rendez-vous de Réparation',
                'book.subtitle': 'Planifiez la réparation de votre appareil avec nos techniciens experts',
                'book.form.customer-info': 'Informations Client',
                'book.form.name': 'Nom Complet *',
                'book.form.email': 'Adresse Email *',
                'book.form.phone': 'Numéro de Téléphone *',
                'book.form.address': 'Adresse',
                'book.form.address-placeholder': 'Optionnel - pour service de récupération',
                'book.form.device-info': 'Informations de l\'Appareil',
                'book.form.device': 'Type d\'Appareil *',
                'book.form.device.select': 'Sélectionner le type d\'appareil',
                'book.form.device.computer': 'Ordinateur/Portable',
                'book.form.device.mobile': 'Téléphone Mobile',
                'book.form.device.tablet': 'Tablette',
                'book.form.device.other': 'Autre',
                'book.form.model': 'Modèle/Marque de l\'Appareil *',
                'book.form.model-placeholder': 'ex., iPhone 13, Dell XPS 13, Samsung Galaxy S21',
                'book.form.service': 'Type de Service *',
                'book.form.service.select': 'Sélectionner le type de service',
                'book.form.service.repair': 'Réparation',
                'book.form.service.diagnostic': 'Diagnostic',
                'book.form.service.maintenance': 'Maintenance',
                'book.form.service.consultation': 'Consultation',
                'book.form.issue': 'Description du Problème *',
                'book.form.issue-placeholder': 'Veuillez décrire le problème que vous rencontrez avec votre appareil...',
                'book.form.appointment-time': 'Heure de Rendez-vous Préférée',
                'book.form.date': 'Date Préférée *',
                'book.form.time': 'Heure Préférée *',
                'book.form.time.select': 'Sélectionner une heure',
                'book.form.urgent': 'Réparation Urgente',
                'book.form.submit': 'Réserver RDV',
                'book.success': 'Rendez-vous réservé avec succès!',
                'book.error': 'Erreur lors de la réservation. Veuillez réessayer.',
                'book.info.response.title': 'Réponse Rapide',
                'book.info.response.desc': 'Nous confirmerons votre rendez-vous dans les 2 heures',
                'book.info.updates.title': 'Mises à Jour Email',
                'book.info.updates.desc': 'Recevez des mises à jour automatiques sur l\'état de votre réparation',
                'book.info.service.title': 'Service Flexible',
                'book.info.service.desc': 'Service de dépôt ou de récupération disponible',

                // Track Repair Page
                'track.title': 'Suivre Votre Réparation',
                'track.subtitle': 'Entrez votre ID de suivi pour obtenir des mises à jour en temps réel sur l\'état de votre réparation',
                'track.form.id': 'ID de Suivi',
                'track.form.placeholder': 'Entrez votre ID de suivi (ex., REP-2024-001)',
                'track.form.submit': 'Suivre Réparation',
                'track.status.pending': 'En Attente',
                'track.status.progress': 'En Cours',
                'track.status.testing': 'Test',
                'track.status.complete': 'Terminé',
                'track.status.ready': 'Prêt pour Récupération',

                // Troubleshoot Page
                'troubleshoot.title': 'Assistant de Dépannage IA',
                'troubleshoot.subtitle': 'Décrivez le problème de votre appareil et obtenez des solutions IA instantanées',
                'troubleshoot.form.issue': 'Décrivez votre problème',
                'troubleshoot.form.submit': 'Obtenir Solution',
                'troubleshoot.loading': 'Analyse de votre problème...',

                // Chat Page
                'chat.title': 'Support Chat en Direct',
                'chat.subtitle': 'Obtenez une aide instantanée de notre équipe de support',
                'chat.form.name': 'Votre Nom',
                'chat.form.message': 'Tapez votre message...',
                'chat.form.send': 'Envoyer',
                'chat.connecting': 'Connexion au support...',
                'chat.connected': 'Connecté au support',

                // Common
                'common.loading': 'Chargement...',
                'common.error': 'Une erreur s\'est produite',
                'common.success': 'Succès!',
                'common.required': 'Ce champ est requis',
                'common.invalid-email': 'Veuillez entrer une adresse email valide',
                'common.invalid-phone': 'Veuillez entrer un numéro de téléphone valide'
            }
        };
    }

    translate(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            localStorage.setItem('language', language);
            this.updatePageContent();
            this.updateLanguageToggle();
        }
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    updatePageContent() {
        // Update all elements with data-translate attribute
        const translatableElements = document.querySelectorAll('[data-translate]');
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.type === 'submit' || element.type === 'button') {
                    element.value = translation;
                } else {
                    element.placeholder = translation;
                }
            } else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update elements with data-translate-html attribute (for HTML content)
        const htmlTranslatableElements = document.querySelectorAll('[data-translate-html]');
        htmlTranslatableElements.forEach(element => {
            const key = element.getAttribute('data-translate-html');
            const translation = this.translate(key);
            element.innerHTML = translation;
        });

        // Update document title if it has translation
        const titleElement = document.querySelector('title');
        if (titleElement && titleElement.getAttribute('data-translate')) {
            const key = titleElement.getAttribute('data-translate');
            titleElement.textContent = this.translate(key);
        }

        // Update meta description if it has translation
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && metaDescription.getAttribute('data-translate')) {
            const key = metaDescription.getAttribute('data-translate');
            metaDescription.content = this.translate(key);
        }
    }

    updateLanguageToggle() {
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            const flagSpan = languageToggle.querySelector('.flag');
            const langSpan = languageToggle.querySelector('.lang-text');
            
            if (this.currentLanguage === 'en') {
                flagSpan.textContent = '🇺🇸';
                langSpan.textContent = 'EN';
            } else {
                flagSpan.textContent = '🇫🇷';
                langSpan.textContent = 'FR';
            }
        }
    }

    init() {
        // Create language toggle button
        this.createLanguageToggle();
        
        // Update page content on load
        this.updatePageContent();
        this.updateLanguageToggle();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    createLanguageToggle() {
        // Check if toggle already exists
        if (document.getElementById('language-toggle')) {
            return;
        }

        const toggle = document.createElement('button');
        toggle.id = 'language-toggle';
        toggle.className = 'language-toggle flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-950 text-white hover:bg-primary-900 transition-colors duration-200 text-sm font-medium';
        toggle.innerHTML = `
            <span class="flag text-lg">🇺🇸</span>
            <span class="lang-text">EN</span>
        `;

        // Add to desktop navigation
        const desktopNav = document.querySelector('nav .hidden.md\\:flex');
        if (desktopNav) {
            desktopNav.appendChild(toggle);
        }

        // Also add to mobile menu
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            const mobileToggle = toggle.cloneNode(true);
            mobileToggle.id = 'mobile-language-toggle';
            mobileToggle.className = 'language-toggle flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-primary-950 text-white hover:bg-primary-900 transition-colors duration-200 w-full mt-4';
            
            const mobileMenuContent = mobileMenu.querySelector('div');
            if (mobileMenuContent) {
                mobileMenuContent.appendChild(mobileToggle);
            }
        }
    }

    setupEventListeners() {
        // Desktop language toggle
        const desktopToggle = document.getElementById('language-toggle');
        if (desktopToggle) {
            desktopToggle.addEventListener('click', () => {
                const newLanguage = this.currentLanguage === 'en' ? 'fr' : 'en';
                this.setLanguage(newLanguage);
            });
        }

        // Mobile language toggle
        const mobileToggle = document.getElementById('mobile-language-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                const newLanguage = this.currentLanguage === 'en' ? 'fr' : 'en';
                this.setLanguage(newLanguage);
            });
        }
    }
}

// Initialize translation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.translationManager = new TranslationManager();
    window.translationManager.init();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranslationManager;
}
