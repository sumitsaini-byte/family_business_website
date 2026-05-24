import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicePackages } from '../data/servicePackages';

const Services = () => {
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal');
      const newVisibleSections = new Set(visibleSections);
      
      reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
          newVisibleSections.add(element);
        }
      });
      
      setVisibleSections(newVisibleSections);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleSections]);

  const services = [
    {
      number: '01',
      title: 'Wedding Events',
      description: 'Complete furniture packages for wedding halls — from royal seating to bridal stages and reception tables.'
    },
    {
      number: '02',
      title: 'Corporate Meetings',
      description: 'Professional conference tables, ergonomic chairs, and lounge setups for seminars and business events.'
    },
    {
      number: '03',
      title: 'Social Functions',
      description: 'Birthday parties, engagements, religious gatherings — we cover every kind of social occasion.'
    },
    {
      number: '04',
      title: 'Delivery and Setup',
      description: 'We deliver everything to your venue on time, set it all up, and collect it once event is over.'
    },
    {
      number: '05',
      title: 'Custom Packages',
      description: 'Need a specific combination of furniture? We build custom rental packages to match your exact requirements.'
    },
    {
      number: '06',
      title: 'Multi-Day Rentals',
      description: 'Extended event? We offer flexible multi-day rental agreements with special pricing for longer bookings.'
    }
  ];

  return (
    <>
      {/* HERO */}
      <section id="hero" style={{minHeight: '60vh', padding: '8rem 5% 4rem'}}>
        <div className="hero-text">
          <div className="hero-tag">What We Offer</div>
          <h1 className="hero-title">
            Services Tailored<br/>For Every<br/><em>Occasion</em>
          </h1>
          <p className="hero-desc">
            Whatever the scale, we handle it all seamlessly. From intimate gatherings to grand celebrations, our comprehensive services ensure your event is perfectly furnished.
          </p>
          <div className="hero-btns">
            <Link to="/booking" className="btn-primary">Book Our Services</Link>
            <Link to="/products" className="btn-outline">View Collection</Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className={`section-header ${visibleSections.has(document.querySelector('#services .section-header')) ? 'visible' : ''}`}>
          <div className="section-tag">What We Offer</div>
          <h2 className="section-title" style={{color: 'var(--cream)'}}>Services Tailored<br/>For Every Occasion</h2>
          <p className="section-sub">Whatever scale, we handle it all seamlessly.</p>
        </div>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <div className="service-num">{service.number}</div>
              <div className="service-title">{service.title}</div>
              <div className="service-desc">{service.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section style={{background: 'var(--warm-white)', padding: '6rem 5%'}}>
        <div className={`section-header ${visibleSections.has(document.querySelector('section:nth-child(3) .section-header')) ? 'visible' : ''}`}>
          <div className="section-tag">How It Works</div>
          <h2 className="section-title">Simple 4-Step Process</h2>
          <p className="section-sub">From inquiry to collection, we make furniture rental hassle-free.</p>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem'}}>
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <div style={{width: '60px', height: '60px', background: 'var(--gold)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontWeight: '600', color: 'var(--charcoal)', fontSize: '1.8rem'}}>1</div>
            <h3 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--charcoal)'}}>Browse & Select</h3>
            <p style={{fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.6'}}>Explore our catalog and choose perfect furniture pieces for your event.</p>
          </div>
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <div style={{width: '60px', height: '60px', background: 'var(--gold)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontWeight: '600', color: 'var(--charcoal)', fontSize: '1.8rem'}}>2</div>
            <h3 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--charcoal)'}}>Get Quote</h3>
            <p style={{fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.6'}}>Fill out our booking form or call us for a customized quote based on your needs.</p>
          </div>
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <div style={{width: '60px', height: '60px', background: 'var(--gold)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontWeight: '600', color: 'var(--charcoal)', fontSize: '1.8rem'}}>3</div>
            <h3 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--charcoal)'}}>Delivery & Setup</h3>
            <p style={{fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.6'}}>We deliver, arrange, and set up everything at your venue before the event.</p>
          </div>
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <div style={{width: '60px', height: '60px', background: 'var(--gold)', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontWeight: '600', color: 'var(--charcoal)', fontSize: '1.8rem'}}>4</div>
            <h3 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--charcoal)'}}>Collection</h3>
            <p style={{fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.6'}}>After your event, we handle the pickup and return of all furniture items.</p>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section style={{background: 'var(--cream)', padding: '6rem 5%'}}>
        <div className={`section-header ${visibleSections.has(document.querySelector('section:nth-child(4) .section-header')) ? 'visible' : ''}`}>
          <div className="section-tag">Pricing</div>
          <h2 className="section-title">Transparent Pricing</h2>
          <p className="section-sub">No hidden fees. Just quality furniture at fair rates.</p>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '3rem'}}>
          {servicePackages.map((pkg, index) => (
            <div key={index} style={{background: 'var(--card-bg)', border: pkg.popular ? '2px solid var(--gold)' : '1px solid var(--border)', borderRadius: '4px', padding: '2rem', textAlign: 'center', position: 'relative'}}>
              {pkg.popular && (
                <div style={{position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: 'var(--charcoal)', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', letterSpacing: '0.05em'}}>
                  POPULAR
                </div>
              )}
              <h3 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--charcoal)', marginBottom: '1rem'}}>
                {pkg.name}
              </h3>
              <div style={{fontSize: '2.5rem', color: 'var(--gold)', fontFamily: "'Cormorant Garamond', serif", fontWeight: '600', marginBottom: '0.5rem'}}>
                {pkg.price}
              </div>
              <p style={{color: 'var(--muted)', marginBottom: '2rem'}}>
                {pkg.description}
              </p>
              <ul style={{textAlign: 'left', color: 'var(--charcoal-soft)', fontSize: '0.9rem', lineHeight: '1.8', marginBottom: '2rem'}}>
                {pkg.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
              <Link to={`/package-inquiry?package=${pkg.slug}`} className="btn-primary">Choose Package</Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Services;
