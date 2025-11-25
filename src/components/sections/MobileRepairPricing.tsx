'use client';

import React, { useState } from 'react';

interface RepairService {
  name: string;
  price: string;
}

interface DeviceBrand {
  id: string;
  name: string;
  icon: string;
  services: RepairService[];
}

const MobileRepairPricing: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceBrand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const devices: DeviceBrand[] = [
    {
      id: 'tecno',
      name: 'Tecno',
      icon: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
      services: [
        { name: 'Screen Replacement', price: 'Le 350 - Le 700' },
        { name: 'Charging Board Change', price: 'Le 75' },
        { name: 'Water Damage Repair', price: 'Le 150 (+ parts if needed)' },
        { name: 'Speaker Change', price: 'Le 50 - Le 120' },
        { name: 'Battery Replacement', price: 'Le 150 - Le 250+' },
      ],
    },
    {
      id: 'samsung',
      name: 'Samsung',
      icon: 'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=400',
      services: [
        { name: 'LCD Change', price: 'Le 500 - Le 1400+' },
        { name: 'Charging Board', price: 'Le 120 - Le 250+' },
        { name: 'Water Damage Repair', price: 'Le 250 - Le 300+' },
        { name: 'Speaker Change', price: 'Le 120 - Le 150+' },
        { name: 'Battery Replacement', price: 'Le 300 - Le 500+' },
      ],
    },
    {
      id: 'itel',
      name: 'iTel',
      icon: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
      services: [
        { name: 'Screen Replacement', price: 'Le 350 - Le 700' },
        { name: 'Charging Board Change', price: 'Le 75' },
        { name: 'Water Damage Repair', price: 'Le 150 (+ parts if needed)' },
        { name: 'Speaker Change', price: 'Le 50 - Le 120' },
        { name: 'Battery Replacement', price: 'Le 150 - Le 250+' },
      ],
    },
    {
      id: 'infinix',
      name: 'Infinix',
      icon: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400',
      services: [
        { name: 'Screen Replacement', price: 'Le 350 - Le 700' },
        { name: 'Charging Board Change', price: 'Le 75' },
        { name: 'Water Damage Repair', price: 'Le 150 (+ parts if needed)' },
        { name: 'Speaker Change', price: 'Le 50 - Le 120' },
        { name: 'Battery Replacement', price: 'Le 150 - Le 250+' },
      ],
    },
    {
      id: 'iphone',
      name: 'iPhone',
      icon: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
      services: [
        { name: 'LCD Change', price: 'Le 1400 - Le 5000+' },
        { name: 'Battery Replacement', price: 'Le 250 - Le 800+' },
      ],
    },
  ];

  const handleDeviceClick = (device: DeviceBrand) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedDevice(null), 300);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full mb-6">
              <i className="fas fa-mobile-alt text-2xl"></i>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Mobile Repair Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional repair services for all major mobile brands. Click on any device to see our competitive pricing.
            </p>
          </div>

          {/* Device Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {devices.map((device) => (
              <div
                key={device.id}
                onClick={() => handleDeviceClick(device)}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group"
              >
                <div className="relative w-full h-32 mb-4 flex items-center justify-center overflow-hidden rounded-lg">
                  <img 
                    src={device.icon} 
                    alt={`${device.name} device`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center group-hover:text-red-600 transition-colors">
                  {device.name}
                </h3>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Click for pricing
                </p>
              </div>
            ))}
          </div>

          {/* Info Banner */}
          <div className="mt-12 bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <i className="fas fa-shield-check text-3xl"></i>
                <div className="text-left">
                  <h4 className="font-bold">Warranty Included</h4>
                  <p className="text-sm text-red-100">30 days on all repairs</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-clock text-3xl"></i>
                <div className="text-left">
                  <h4 className="font-bold">Fast Service</h4>
                  <p className="text-sm text-red-100">Same day repairs available</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-certificate text-3xl"></i>
                <div className="text-left">
                  <h4 className="font-bold">Expert Technicians</h4>
                  <p className="text-sm text-red-100">Certified professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedDevice && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={selectedDevice.icon} 
                      alt={selectedDevice.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedDevice.name} Repairs</h3>
                    <p className="text-red-100 text-sm">Professional repair pricing</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-3">
                {selectedDevice.services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-red-50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-all">
                        <i className={`fas ${
                          service.name.includes('Screen') || service.name.includes('LCD') ? 'fa-desktop' :
                          service.name.includes('Battery') ? 'fa-battery-three-quarters' :
                          service.name.includes('Charging') ? 'fa-charging-station' :
                          service.name.includes('Speaker') ? 'fa-volume-up' :
                          'fa-tools'
                        } text-red-600`}></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{service.name}</h4>
                        {service.name.includes('Water Damage') && (
                          <p className="text-xs text-gray-500">Additional charges apply if parts need replacement</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 text-lg">{service.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Terms */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <i className="fas fa-info-circle text-yellow-600"></i>
                  Important Information
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• All repairs tested before collection</li>
                  <li>• 30-day warranty on parts (excludes LCD damage from drops)</li>
                  <li>• Issues must be reported within 1 hour of collection</li>
                  <li>• Water damage repair price may vary based on damage extent</li>
                  <li>• We are not responsible for data loss - please backup before repair</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <a
                  href="/book-appointment"
                  className="btn-primary text-center py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  <i className="fas fa-calendar-check mr-2"></i>
                  Book Repair
                </a>
                <a
                  href="/chat"
                  className="bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  Chat Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </section>
  );
};

export default MobileRepairPricing;
