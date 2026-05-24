import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const Home = () => {
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [reviews, setReviews] = useState([]);
  const [carousel, setCarousel] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
    fetchCarousel();
    fetchGallery();
  }, []);

  const fetchReviews = async () => {
    try {
      const reviewsData = await api.getReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarousel = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/carousel');
      if (response.ok) {
        const carouselData = await response.json();
        setCarousel(carouselData);
      }
    } catch (error) {
      console.error('Error fetching carousel:', error);
    }
  };

  const fetchGallery = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/gallery');
      if (response.ok) {
        const galleryData = await response.json();
        setGallery(galleryData);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const handleReviewAdded = () => {
    fetchReviews();
  };

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

  const ChairIcon = () => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-chair">
      <rect x="20" y="40" width="40" height="5" rx="2" fill="#C9A84C"/>
      <rect x="20" y="30" width="40" height="12" rx="3" fill="#C9A84C"/>
      <rect x="22" y="45" width="5" height="20" rx="2" fill="#C9A84C"/>
      <rect x="53" y="45" width="5" height="20" rx="2" fill="#C9A84C"/>
      <rect x="15" y="28" width="5" height="37" rx="2" fill="#C9A84C"/>
      <rect x="60" y="28" width="5" height="37" rx="2" fill="#C9A84C"/>
    </svg>
  );

  const SofaIcon = () => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-chair">
      <rect x="10" y="45" width="60" height="8" rx="3" fill="#C9A84C"/>
      <rect x="8" y="35" width="64" height="12" rx="4" fill="#C9A84C"/>
      <rect x="12" y="53" width="8" height="12" rx="2" fill="#C9A84C"/>
      <rect x="60" y="53" width="8" height="12" rx="2" fill="#C9A84C"/>
      <rect x="8" y="30" width="8" height="25" rx="3" fill="#C9A84C"/>
      <rect x="64" y="30" width="8" height="25" rx="3" fill="#C9A84C"/>
    </svg>
  );

  const TableIcon = () => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-chair">
      <rect x="15" y="35" width="50" height="5" rx="2" fill="#C9A84C"/>
      <rect x="18" y="40" width="6" height="25" rx="2" fill="#C9A84C"/>
      <rect x="56" y="40" width="6" height="25" rx="2" fill="#C9A84C"/>
      <ellipse cx="40" cy="35" rx="25" ry="4" fill="#C9A84C" opacity="0.5"/>
    </svg>
  );

  return (
    <>
      {/* HERO */}
      <section id="hero">
        <div className="hero-bg-line"></div>
        <div className="hero-text">
          <div className="hero-tag">Premium Furniture Rentals</div>
          <h1 className="hero-title">
            Elevate Every<br/><em>Event</em> With<br/>Elegant Furniture
          </h1>
          <p className="hero-desc">
            From grand weddings to corporate meetings, we provide premium chairs, sofas, tables, and more — delivered, set up, and collected.
          </p>
          <div className="hero-btns">
            <Link to="/products" className="btn-primary">Explore Catalog</Link>
            <Link to="/booking" className="btn-outline">Get a Quote</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-img">
              {carousel?.weddingHallImage ? (
                <img 
                  src={`http://localhost:3000/uploads/carousel/${carousel.weddingHallImage.filename}`}
                  alt="Wedding Hall Setup"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <ChairIcon />
              )}
              <div className="hero-img-label">Wedding Hall Setup</div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-img tall">
              {carousel?.luxurySofaImage ? (
                <img 
                  src={`http://localhost:3000/uploads/carousel/${carousel.luxurySofaImage.filename}`}
                  alt="Luxury Sofa"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <SofaIcon />
              )}
              <div className="hero-img-label">Luxury Sofa</div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-img tall">
              {carousel?.banquetTablesImage ? (
                <img 
                  src={`http://localhost:3000/uploads/carousel/${carousel.banquetTablesImage.filename}`}
                  alt="Banquet Tables"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <TableIcon />
              )}
              <div className="hero-img-label">Banquet Chairs</div>
            </div>
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

      {/* TESTIMONIALS */}
      <section id="testimonials">
        <div className={`section-header ${visibleSections.has(document.querySelector('#testimonials .section-header')) ? 'visible' : ''}`}>
          <div className="section-tag">Client Reviews</div>
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-sub">Real stories from real events we have helped make beautiful.</p>
        </div>
        <div className="testi-grid">
          {loading ? (
            // Static reviews while loading
            <>
              <div className={`testi-card ${visibleSections.has(document.querySelector('.testi-card:nth-child(1)')) ? 'visible' : ''}`}>
                <div className="testi-quote">"</div>
                <div className="testi-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <p className="testi-text">The chairs and banquet tables looked absolutely stunning at our daughter's wedding. Everything arrived on time and team set it up perfectly. Highly recommend!</p>
                <div className="testi-author">
                  <div className="testi-avatar">RG</div>
                  <div>
                    <div className="testi-name">Ramesh Gupta</div>
                    <div className="testi-event">Wedding Reception — 2024</div>
                  </div>
                </div>
              </div>
              <div className={`testi-card ${visibleSections.has(document.querySelector('.testi-card:nth-child(2)')) ? 'visible' : ''}`}>
                <div className="testi-quote">"</div>
                <div className="testi-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <p className="testi-text">We rented conference chairs and long tables for our company's annual meet. Very professional service, clean furniture, and great pricing. Will rent again next year.</p>
                <div className="testi-author">
                  <div className="testi-avatar">PS</div>
                  <div>
                    <div className="testi-name">Priya Sharma</div>
                    <div className="testi-event">Corporate Event — 2024</div>
                  </div>
                </div>
              </div>
              <div className={`testi-card ${visibleSections.has(document.querySelector('.testi-card:nth-child(3)')) ? 'visible' : ''}`}>
                <div className="testi-quote">"</div>
                <div className="testi-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <p className="testi-text">Booked sofas and decor stands for my son's birthday party. They were delivered exactly on time. The sofas were clean and looked very premium. Amazing service!</p>
                <div className="testi-author">
                  <div className="testi-avatar">AK</div>
                  <div>
                    <div className="testi-name">Anjali Kapoor</div>
                    <div className="testi-event">Birthday Function — 2025</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Dynamic reviews from backend
            reviews.slice(0, 6).map((review, index) => (
              <div key={review._id} className={`testi-card ${visibleSections.has(document.querySelector(`.testi-card:nth-child(${index + 1})`)) ? 'visible' : ''}`}>
                <div className="testi-quote">"</div>
                <div className="testi-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24">
                      <path 
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill={i < review.rating ? '#C9A84C' : '#ddd'}
                      />
                    </svg>
                  ))}
                </div>
                <p className="testi-text">{review.text}</p>
                <div className="testi-author">
                  <div className="testi-avatar">{review.initials}</div>
                  <div>
                    <div className="testi-name">{review.name}</div>
                    <div className="testi-event">{review.event} — {new Date(review.createdAt).getFullYear()}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery">
        <div className={`section-header ${visibleSections.has(document.querySelector('#gallery .section-header')) ? 'visible' : ''}`}>
          <div className="section-tag">Our Work</div>
          <h2 className="section-title">Event Gallery</h2>
          <p className="section-sub">A glimpse of events we have furnished and made beautiful.</p>
        </div>
        <div className="gallery-grid">
          {gallery.length > 0 ? (
            gallery.slice(0, 5).map((item, index) => (
              <div key={item._id} className="gallery-item">
                {item.image ? (
                  <img 
                    src={`http://localhost:3000/uploads/gallery/${item.image.filename}`}
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <div className="gallery-icon" viewBox="0 0 60 60" fill="none">
                    {/* Fallback icon based on category */}
                    {item.category === 'wedding-hall' && (
                      <>
                        <rect x="10" y="25" width="40" height="5" rx="2" fill="#C9A84C"/>
                        <rect x="10" y="18" width="40" height="9" rx="3" fill="#C9A84C"/>
                        <rect x="12" y="30" width="5" height="16" rx="2" fill="#C9A84C"/>
                        <rect x="43" y="30" width="5" height="16" rx="2" fill="#C9A84C"/>
                        <rect x="7" y="16" width="5" height="30" rx="2" fill="#C9A84C"/>
                        <rect x="48" y="16" width="5" height="30" rx="2" fill="#C9A84C"/>
                      </>
                    )}
                    {item.category === 'banquet-tables' && (
                      <>
                        <rect x="8" y="30" width="44" height="5" rx="2" fill="#C9A84C"/>
                        <rect x="11" y="35" width="4" height="16" rx="2" fill="#C9A84C"/>
                        <rect x="45" y="35" width="4" height="16" rx="2" fill="#C9A84C"/>
                        <ellipse cx="30" cy="30" rx="22" ry="4" fill="#C9A84C" opacity="0.4"/>
                      </>
                    )}
                    {item.category === 'sofa-lounge' && (
                      <>
                        <rect x="8" y="32" width="44" height="5" rx="3" fill="#C9A84C"/>
                        <rect x="6" y="24" width="48" height="10" rx="3" fill="#C9A84C"/>
                        <rect x="10" y="37" width="5" height="10" rx="2" fill="#C9A84C"/>
                        <rect x="45" y="37" width="5" height="10" rx="2" fill="#C9A84C"/>
                        <rect x="6" y="20" width="5" height="27" rx="2" fill="#C9A84C"/>
                        <rect x="49" y="20" width="5" height="27" rx="2" fill="#C9A84C"/>
                      </>
                    )}
                    {item.category === 'decor-setups' && (
                      <>
                        <path d="M30 8 L33 20 L46 20 L36 28 L39 40 L30 33 L21 40 L24 28 L14 20 L27 20 Z" fill="#C9A84C" opacity="0.5"/>
                        <rect x="26" y="40" width="8" height="12" rx="2" fill="#C9A84C" opacity="0.4"/>
                      </>
                    )}
                    {item.category === 'corporate-setup' && (
                      <>
                        <rect x="18" y="26" width="24" height="3" rx="1.5" fill="#C9A84C"/>
                        <rect x="18" y="18" width="24" height="10" rx="3" fill="#C9A84C"/>
                        <rect x="20" y="29" width="3" height="18" rx="1.5" fill="#C9A84C"/>
                        <rect x="37" y="29" width="3" height="18" rx="1.5" fill="#C9A84C"/>
                        <circle cx="30" cy="42" rx="4" fill="#C9A84C" opacity="0.35"/>
                      </>
                    )}
                  </div>
                )}
                <div className="gallery-overlay"><span>{item.title}</span></div>
              </div>
            ))
          ) : (
            // Fallback to default icons when no gallery items
            <>
              <div className="gallery-item">
                <div className="gallery-icon" viewBox="0 0 60 60" fill="none">
                  <rect x="10" y="25" width="40" height="5" rx="2" fill="#C9A84C"/>
                  <rect x="10" y="18" width="40" height="9" rx="3" fill="#C9A84C"/>
                  <rect x="12" y="30" width="5" height="16" rx="2" fill="#C9A84C"/>
                  <rect x="43" y="30" width="5" height="16" rx="2" fill="#C9A84C"/>
                  <rect x="7" y="16" width="5" height="30" rx="2" fill="#C9A84C"/>
                  <rect x="48" y="16" width="5" height="30" rx="2" fill="#C9A84C"/>
                </div>
                <div className="gallery-overlay"><span>Wedding Hall</span></div>
              </div>
              <div className="gallery-item">
                <div className="gallery-icon" viewBox="0 0 60 60" fill="none">
                  <rect x="8" y="30" width="44" height="5" rx="2" fill="#C9A84C"/>
                  <rect x="11" y="35" width="4" height="16" rx="2" fill="#C9A84C"/>
                  <rect x="45" y="35" width="4" height="16" rx="2" fill="#C9A84C"/>
                  <ellipse cx="30" cy="30" rx="22" ry="4" fill="#C9A84C" opacity="0.4"/>
                </div>
                <div className="gallery-overlay"><span>Banquet Chairs</span></div>
              </div>
              <div className="gallery-item">
                <div className="gallery-icon" viewBox="0 0 60 60" fill="none">
                  <rect x="8" y="32" width="44" height="5" rx="3" fill="#C9A84C"/>
                  <rect x="6" y="24" width="48" height="10" rx="3" fill="#C9A84C"/>
                  <rect x="10" y="37" width="5" height="10" rx="2" fill="#C9A84C"/>
                  <rect x="45" y="37" width="5" height="10" rx="2" fill="#C9A84C"/>
                  <rect x="6" y="20" width="5" height="27" rx="2" fill="#C9A84C"/>
                  <rect x="49" y="20" width="5" height="27" rx="2" fill="#C9A84C"/>
                </div>
                <div className="gallery-overlay"><span>Sofa Lounge</span></div>
              </div>
              <div className="gallery-item">
                <div className="gallery-icon" viewBox="0 0 60 60" fill="none">
                  <path d="M30 8 L33 20 L46 20 L36 28 L39 40 L30 33 L21 40 L24 28 L14 20 L27 20 Z" fill="#C9A84C" opacity="0.5"/>
                  <rect x="26" y="40" width="8" height="12" rx="2" fill="#C9A84C" opacity="0.4"/>
                </div>
                <div className="gallery-overlay"><span>Decor Setups</span></div>
              </div>
              <div className="gallery-item">
                <div className="gallery-icon" viewBox="0 0 60 60" fill="none">
                  <rect x="18" y="26" width="24" height="3" rx="1.5" fill="#C9A84C"/>
                  <rect x="18" y="18" width="24" height="10" rx="3" fill="#C9A84C"/>
                  <rect x="20" y="29" width="3" height="18" rx="1.5" fill="#C9A84C"/>
                  <rect x="37" y="29" width="3" height="18" rx="1.5" fill="#C9A84C"/>
                  <circle cx="30" cy="42" rx="4" fill="#C9A84C" opacity="0.35"/>
                </div>
                <div className="gallery-overlay"><span>Corporate Setup</span></div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
