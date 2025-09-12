        // Services Popup Management
        function showServicesPopup() {
            const popup = document.getElementById('services-popup');
            const content = document.getElementById('popup-content');
            
            if (popup && content) {
                popup.classList.remove('hidden');
                // Trigger animation after a small delay
                setTimeout(() => {
                    content.classList.remove('scale-95', 'opacity-0');
                    content.classList.add('scale-100', 'opacity-100');
                }, 10);
                
                // Prevent body scroll
                document.body.classList.add('overflow-hidden');
                
                // Handle touch events for mobile scroll within popup
                if (window.innerWidth < 768) {
                    // Ensure content is scrollable on mobile
                    content.style.maxHeight = (window.innerHeight * 0.9) + 'px';
                    // Auto-scroll to top of popup content
                    content.scrollTop = 0;
                }
            }
        }

        function closeServicesPopup() {
            const popup = document.getElementById('services-popup');
            const content = document.getElementById('popup-content');
            
            if (popup && content) {
                content.classList.remove('scale-100', 'opacity-100');
                content.classList.add('scale-95', 'opacity-0');
                
                // Delay hiding to allow animation to complete
                setTimeout(() => {
                    popup.classList.add('hidden');
                    // Re-enable body scroll
                    document.body.classList.remove('overflow-hidden');
                    
                    // Reset any mobile-specific styles
                    if (window.innerWidth < 768) {
                        content.style.maxHeight = '';
                    }
                }, 300);
            }
        }
