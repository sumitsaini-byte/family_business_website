import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
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

  const team = [
    {
      initials: 'BS',
      name: 'Balram Saini',
      role: 'Founder & CEO',
      description: 'With 15+ years in event management, Balram leads our vision and ensures quality in every detail.'
    },
    {
      initials: 'PS',
      name: 'Pirthi Singh Saini',
      role: 'Operations Head',
      description: 'Pirthi ensures smooth operations, from inventory management to timely deliveries.'
    },
    {
      initials: 'RS',
      name: 'Rohit Saini',
      role: 'Logistics Manager',
      description: 'Rohit coordinates all deliveries and setups, ensuring everything arrives on time and perfectly arranged.'
    }
  ];

  return (
    <>
      {/* HERO */}
      <section id="hero" style={{minHeight: '60vh', padding: '8rem 5% 4rem'}}>
        <div className="hero-text">
          <div className="hero-tag">About Us</div>
          <h1 className="hero-title">
            We Make Your<br/>Events<br/><em>Memorable</em>
          </h1>
          <p className="hero-desc">
            We are a family-run furniture rental business passionate about making every event beautiful. From grand weddings to corporate meetings, we provide perfect furniture for your special occasions.
          </p>
          <div className="hero-btns">
            <Link to="/products" className="btn-primary">View Our Collection</Link>
            <Link to="/booking" className="btn-outline">Get a Quote</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-num">500+</div>
          <div className="stat-label">Events Served</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">2000+</div>
          <div className="stat-label">Furniture Items</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">8+</div>
          <div className="stat-label">Years Experience</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">98%</div>
          <div className="stat-label">Client Satisfaction</div>
        </div>
      </div>

      {/* ABOUT */}
      <section id="about">
        <div className="about-grid">
          <div className="about-img-block">
            <div className="about-img-main">
              <img 
                src="/images/furniture-business.jpg"
                alt="Furniture Rental Business"
                onError={(e) => {
                  // Fallback to a placeholder if local image doesn't load
                  e.target.src = "https://images.pexels.com/photos/office-interior-modern-furniture-meeting-room/2762929/freepik?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D&auto=format&fit=crop&w=1000&q=80";
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '2px solid #C9A84C'
                }}
              />
            </div>
            <div className="about-accent-box">
              <div className="about-accent-num">8</div>
              <div className="about-accent-label">Years in Business</div>
            </div>
          </div>
          <div className={`reveal ${visibleSections.has(document.querySelector('#about .reveal')) ? 'visible' : ''}`}>
            <div className="section-tag">Our Story</div>
            <h2 className="section-title">Passion for<br/>Perfect Events</h2>
            <p className="section-sub">
              We started Furnish & Co. with a simple mission: to make every event beautiful and stress-free. What began as a small collection of chairs has grown into a comprehensive furniture rental service serving hundreds of events across the region.
            </p>
            <p className="section-sub" style={{marginTop: '1.5rem'}}>
              As a family-run business, we treat every event like our own. We understand the importance of details, the pressure of deadlines, and the joy of seeing everything come together perfectly. That's why we personally oversee every delivery, setup, and collection.
            </p>
            <div className="about-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 8h14M5 8a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v.01M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-title">Wide Selection</div>
                <div className="feature-desc">Chairs, sofas, tables, and more for any occasion.</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-title">Free Delivery</div>
                <div className="feature-desc">We deliver, set up, and pick up on time.</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-title">Quality Assured</div>
                <div className="feature-desc">All items cleaned and inspected before every rental.</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-title">Affordable Rates</div>
                <div className="feature-desc">Flexible packages for all budgets and event sizes.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section style={{background: 'var(--warm-white)', padding: '6rem 5%'}}>
        <div className={`section-header ${visibleSections.has(document.querySelector('section:nth-child(3) .section-header')) ? 'visible' : ''}`}>
          <div className="section-tag">Our Team</div>
          <h2 className="section-title">Meet The Family</h2>
          <p className="section-sub">The dedicated people behind every successful event.</p>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem'}}>
          {team.map((member, index) => (
            <div key={index} style={{textAlign: 'center', padding: '2rem', background: 'var(--cream)', borderRadius: '4px', border: '1px solid var(--border)'}}>
              <div style={{width: '80px', height: '80px', background: 'var(--gold-light)', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontWeight: '600', color: 'var(--gold)', fontSize: '1.5rem'}}>
                {member.initials}
              </div>
              <h3 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--charcoal)'}}>
                {member.name}
              </h3>
              <p style={{fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem'}}>
                {member.role}
              </p>
              <p style={{fontSize: '0.82rem', color: 'var(--charcoal-soft)', lineHeight: '1.6'}}>
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default About;
