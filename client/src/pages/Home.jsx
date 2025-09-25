// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import HeroBanner from '../components/HeroBanner';
import FeaturedProducts from '../components/FeaturedProducts';
import CategorySelector from '../components/CategorySelector';
import CallToAction from '../components/CallToAction';
import LoadingScreen from '../components/LoadingScreen';
import { Star, Package, Truck, Shield, Clock, Award, TrendingUp, Sparkles, Zap, Crown } from 'lucide-react';

const Home = () => {
  const [counters, setCounters] = useState({ hotels: 0, products: 0, cities: 0, satisfaction: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [featureCardsVisible, setFeatureCardsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Loading screen and animation effects
  useEffect(() => {
    // Check navigation type using modern API
    const navigationEntries = performance.getEntriesByType('navigation');
    const navigationType = navigationEntries.length > 0 ? navigationEntries[0].type : 'navigate';
    
    // Check if user has visited the site in this session
    const hasVisitedInSession = sessionStorage.getItem('hasVisitedHomePage');
    
    // Show loading screen only on:
    // 1. Initial site load (reload/enter URL)
    // 2. Page refresh
    // 3. First visit in browser session
    const shouldShowLoading = 
      navigationType === 'reload' || 
      navigationType === 'navigate' && !hasVisitedInSession;
    
    if (shouldShowLoading) {
      // Show loading screen for 1.5 seconds
      const loadingTimer = setTimeout(() => setIsLoading(false), 1500);
      // Start animations just 100ms AFTER loading screen disappears
      const animationTimer = setTimeout(() => setIsVisible(true), 1600);
      
      // Mark that user has visited home page in this session
      sessionStorage.setItem('hasVisitedHomePage', 'true');
      
      return () => {
        clearTimeout(loadingTimer);
        clearTimeout(animationTimer);
      };
    } else {
      // Skip loading screen for internal navigation, show content immediately
      setIsLoading(false);
      setIsVisible(true);
    }
  }, []);

  // Scroll-triggered counter animations
  useEffect(() => {
    if (!statsVisible) return;

    const animateCounter = (target, key, duration = 2000) => {
      const increment = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, 16);
    };

    animateCounter(500, 'hotels');
    animateCounter(10000, 'products');
    animateCounter(50, 'cities');
    animateCounter(99, 'satisfaction');
  }, [statsVisible]);

  // Intersection Observer for stats section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsVisible(true);
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
        rootMargin: '-50px 0px' // Trigger slightly before the section is fully visible
      }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => {
      if (statsSection) {
        observer.unobserve(statsSection);
      }
    };
  }, []);

  // Intersection Observer for features section (truck animation) - only after loading
  useEffect(() => {
    // Only set up observer after loading is complete
    if (isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFeaturesVisible(true);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '-50px 0px'
      }
    );

    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      observer.observe(featuresSection);
    }

    return () => {
      if (featuresSection) {
        observer.unobserve(featuresSection);
      }
    };
  }, [isLoading]); // Depend on isLoading state

  // Intersection Observer for feature cards animation
  useEffect(() => {
    if (isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFeatureCardsVisible(true);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '-50px 0px'
      }
    );

    const featureCardsSection = document.getElementById('feature-cards-grid');
    if (featureCardsSection) {
      observer.observe(featureCardsSection);
    }

    return () => {
      if (featureCardsSection) {
        observer.unobserve(featureCardsSection);
      }
    };
  }, [isLoading]);

  // Testimonials carousel auto-rotation
  useEffect(() => {
    if (isLoading) return;
    
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 6); // 6 testimonials total
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      <div className="min-h-screen bg-white text-gray-800 overflow-hidden">
        <HeroBanner isVisible={isVisible} />
      
      {/* Premium Animated Stats Section */}
      <section id="stats-section" className="py-20 bg-royal-gradient relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 animate-gradient">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/5 rounded-full animate-float delay-200"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float delay-400"></div>
          <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white/5 rounded-full animate-float delay-600"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ease-out ${statsVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-yellow-300 animate-bounce-in" />
              <h2 className="text-5xl font-bold text-white">
                Trusted by Industry Leaders
              </h2>
              <Crown className="w-8 h-8 text-yellow-300 animate-bounce-in delay-200" />
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Powering premium hospitality experiences across India
            </p>
          </div>

          {/* Scroll-triggered Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { 
                number: counters.hotels, 
                suffix: '+', 
                label: 'Hotels Served', 
                icon: Package,
                delay: 0.1
              },
              { 
                number: counters.products >= 1000 ? Math.floor(counters.products / 1000) : counters.products, 
                suffix: counters.products >= 1000 ? 'K+' : '+', 
                label: 'Products Delivered', 
                icon: Truck,
                delay: 0.2
              },
              { 
                number: counters.cities, 
                suffix: '+', 
                label: 'Cities Covered', 
                icon: Award,
                delay: 0.3
              },
              { 
                number: counters.satisfaction, 
                suffix: '%', 
                label: 'Customer Satisfaction', 
                icon: Star,
                delay: 0.4
              }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div 
                  key={index}
                  className={`text-center glass-effect rounded-2xl p-8 hover-lift group transition-all duration-1000 ease-out ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: statsVisible ? `${stat.delay}s` : '0s' }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 group-hover:animate-pulse-glow transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-white animate-float" style={{ animationDelay: `${index * 0.2}s` }} />
                  </div>
                  <div className="text-5xl font-bold mb-2 text-white">
                    {stat.number}{stat.suffix}
                  </div>
                  <div className="text-blue-100 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-20 bg-royal-gradient-light relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-white/50"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 animate-fade-in-up delay-200">
          <CategorySelector showAll={true} />
        </div>
      </section>

      {/* Premium Features Section with Truck Animation */}
      <section id="features-section" className="py-20 bg-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-float"></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-float delay-300"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative overflow-hidden">
          {/* Section Header */}
          <div className="text-center mb-16 relative">
            {/* Truck Animation - Continuous movement */}
            <div 
              className="absolute top-0 left-0 w-full pointer-events-none overflow-hidden transition-transform duration-6000 ease-linear"
              style={{ 
                transform: featuresVisible 
                  ? 'translateX(calc(100vw + 100px))' 
                  : 'translateX(-300px)',
                zIndex: 9999,
                transitionDelay: '0s'
              }}
            >
              <Truck className="w-16 h-16 text-blue-600 drop-shadow-2xl" />
            </div>

            {/* Section Title */}
            <div 
              className="inline-flex items-center gap-2 mb-6 transition-transform duration-5000 ease-linear relative z-10"
              style={{ 
                transform: featuresVisible 
                  ? 'translateX(0px)' 
                  : 'translateX(-100vw)',
                transitionDelay: featuresVisible ? '0s' : '0s'
              }}
            >
              <Sparkles className="w-8 h-8 text-blue-600 animate-rotate" />
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent whitespace-nowrap">
                Why Choose Hot-Del?
              </h2>
              <Sparkles className="w-8 h-8 text-blue-600 animate-rotate" style={{ animationDelay: '1s' }} />
            </div>
            
            {/* Section Description */}
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-800 ease-out ${
              featuresVisible ? 'opacity-100' : 'opacity-0'
            }`} style={{ transitionDelay: featuresVisible ? '3s' : '0s' }}>
              We're committed to delivering the highest quality products with exceptional service
            </p>
          </div>
          
          {/* Animated Features Grid */}
          <div id="feature-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: 'Premium Quality',
                description: 'All products are sourced from certified suppliers and maintained in optimal cold-chain conditions',
                gradient: 'from-blue-500 to-blue-600',
                bgGradient: 'from-blue-50 to-blue-100',
                delay: 'delay-100'
              },
              {
                icon: Truck,
                title: 'Fast Delivery',
                description: 'Same-day delivery across major cities with temperature-controlled logistics',
                gradient: 'from-green-500 to-green-600',
                bgGradient: 'from-green-50 to-green-100',
                delay: 'delay-200'
              },
              {
                icon: Shield,
                title: 'Quality Assurance',
                description: '100% quality guarantee with easy returns and dedicated customer support',
                gradient: 'from-purple-500 to-purple-600',
                bgGradient: 'from-purple-50 to-purple-100',
                delay: 'delay-300'
              },
              {
                icon: Clock,
                title: '24/7 Support',
                description: 'Round-the-clock customer support to help you with orders and queries',
                gradient: 'from-orange-500 to-orange-600',
                bgGradient: 'from-orange-50 to-orange-100',
                delay: 'delay-400'
              },
              {
                icon: Award,
                title: 'Trusted Partner',
                description: 'Serving 500+ hotels across India with consistent quality and reliability',
                gradient: 'from-indigo-500 to-indigo-600',
                bgGradient: 'from-indigo-50 to-indigo-100',
                delay: 'delay-500'
              },
              {
                icon: TrendingUp,
                title: 'Competitive Pricing',
                description: 'Best market prices with bulk discounts and flexible payment options',
                gradient: 'from-pink-500 to-pink-600',
                bgGradient: 'from-pink-50 to-pink-100',
                delay: 'delay-600'
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                  className={`bg-gradient-to-br ${feature.bgGradient} rounded-2xl p-8 text-center group cursor-pointer transition-all duration-800 ease-out transform ${
                    featureCardsVisible 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ transitionDelay: featureCardsVisible ? `${index * 0.15}s` : '0s' }}
                >
                  <div className={`p-4 bg-gradient-to-r ${feature.gradient} rounded-2xl w-fit mx-auto mb-6 group-hover:animate-pulse-glow transition-all duration-300 group-hover:scale-110`}>
                    <IconComponent className="w-8 h-8 text-white animate-float" style={{ animationDelay: `${index * 0.2}s` }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      <FeaturedProducts />

      {/* Premium Testimonials Section */}
      <section className="py-20 bg-royal-gradient-light relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-40 h-40 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute bottom-10 right-1/4 w-32 h-32 bg-blue-200/20 rounded-full animate-float delay-400"></div>
          <div className="absolute top-1/2 right-10 w-20 h-20 bg-blue-300/30 rounded-full animate-float delay-200"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-blue-600 animate-bounce-in" />
              <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                What Our Customers Say
              </h2>
            </div>
            <p className="text-xl text-blue-700 font-medium">Trusted by hotels across India</p>
          </div>
          
          {/* Sliding Testimonials Carousel - 3 visible with smooth sliding */}
          <div className="relative w-full max-w-6xl mx-auto overflow-hidden" style={{ minHeight: '460px', paddingTop: '40px' }}>
            <div 
              className="flex justify-center items-center gap-12 transition-transform duration-800 ease-linear"
              key={activeTestimonial}
              style={{
                animation: 'slideInFromRight 0.8s linear'
              }}
            >
              {(() => {
                const allTestimonials = [
                  {
                    quote: "Hot-Del has been our trusted partner for dairy supplies. Their quality is consistent and delivery is always on time.",
                    name: "Raj Hotel",
                    location: "Mumbai",
                    initials: "RH",
                    gradient: "from-blue-500 to-purple-500"
                  },
                  {
                    quote: "Excellent service and premium quality products. The cold-chain maintenance is top-notch.",
                    name: "Grand Resort",
                    location: "Delhi",
                    initials: "GR",
                    gradient: "from-green-500 to-blue-500"
                  },
                  {
                    quote: "Their customer support is amazing and they always deliver exactly what we need for our restaurant.",
                    name: "Luxury Hotel",
                    location: "Bangalore",
                    initials: "LH",
                    gradient: "from-purple-500 to-pink-500"
                  },
                  {
                    quote: "Outstanding quality and reliability. Hot-Del has transformed our kitchen operations with their premium supplies.",
                    name: "Royal Palace",
                    location: "Jaipur",
                    initials: "RP",
                    gradient: "from-orange-500 to-red-500"
                  },
                  {
                    quote: "Best in class service with timely deliveries. Their team understands our hospitality needs perfectly.",
                    name: "Ocean View Resort",
                    location: "Goa",
                    initials: "OV",
                    gradient: "from-teal-500 to-cyan-500"
                  },
                  {
                    quote: "Exceptional product range and competitive pricing. Hot-Del is our go-to partner for all dairy needs.",
                    name: "Mountain Lodge",
                    location: "Shimla",
                    initials: "ML",
                    gradient: "from-indigo-500 to-purple-500"
                  }
                ];

                // Get current 3 testimonials with wrapping
                const currentTestimonials = [];
                for (let i = 0; i < 3; i++) {
                  currentTestimonials.push(allTestimonials[(activeTestimonial + i) % 6]);
                }

                return currentTestimonials.map((testimonial, index) => {
                  const isMiddle = index === 1; // Middle card (index 1) - always highlighted
                  const isSide = index === 0 || index === 2; // Side cards (index 0 and 2)
                  
                  return (
                    <div 
                      key={`${activeTestimonial}-${index}`}
                      className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg transition-all duration-700 ease-in-out transform ${
                        isMiddle 
                          ? 'bg-white/95 border-blue-300 shadow-2xl scale-105 z-20' // Middle: highlighted
                          : 'bg-white/75 border-white/40 shadow-md scale-95 z-10 opacity-85' // Sides: dimmed
                      }`}
                      style={{ 
                        width: '320px', 
                        height: '340px', // Increased height to accommodate longer text
                        filter: isSide ? 'blur(0.3px)' : 'none',
                        transform: `translateX(${index === 0 ? '-20px' : index === 2 ? '20px' : '0px'})` // Sliding effect
                      }}
                    >
                {/* Animated Stars */}
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-6 h-6 text-yellow-400 fill-current animate-bounce-in" 
                      style={{ animationDelay: `${i * 0.1 + index * 0.2}s` }}
                    />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-gray-700 mb-6 text-sm leading-relaxed italic font-medium group-hover:text-gray-800 transition-colors">
                  "{testimonial.quote}"
                </p>
                
                {/* Customer Info */}
                <div className="flex items-center">
                  <div className={`w-14 h-14 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold mr-4 group-hover:animate-pulse-glow transition-all duration-300 group-hover:scale-110`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">{testimonial.location}</div>
                  </div>
                </div>
              </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Trust Badge */}
          <div className="text-center mt-16 animate-fade-in-up delay-400">
            <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm px-8 py-4 rounded-full border border-white/50">
              <Crown className="w-6 h-6 text-yellow-500 animate-float" />
              <span className="text-blue-800 font-bold text-lg">Rated 4.9/5 by 500+ Hotels</span>
              <Crown className="w-6 h-6 text-yellow-500 animate-float delay-200" />
            </div>
          </div>
        </div>
      </section>

        <CallToAction />
      </div>
    </>
  );
};

export default Home;
