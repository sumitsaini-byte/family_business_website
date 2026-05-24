import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { getServicePackageBySlug, servicePackages } from '../data/servicePackages';

const PackageInquiry = () => {
  const [searchParams] = useSearchParams();
  const initialSlug = searchParams.get('package');

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    eventDate: '',
    guestCount: '',
    additionalRequirements: '',
    packageSlug: initialSlug || servicePackages[0].slug
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedPackage = useMemo(
    () => getServicePackageBySlug(formData.packageSlug) || servicePackages[0],
    [formData.packageSlug]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (submitError) {
      setSubmitError('');
    }
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await api.createPackageInquiry({
        ...formData,
        guestCount: formData.guestCount ? Number(formData.guestCount) : undefined,
        selectedPackage: {
          slug: selectedPackage.slug,
          name: selectedPackage.name,
          price: selectedPackage.price,
          description: selectedPackage.description,
          features: selectedPackage.features
        }
      });
      setSubmitted(true);
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        address: '',
        eventDate: '',
        guestCount: '',
        additionalRequirements: '',
        packageSlug: selectedPackage.slug
      });
    } catch (error) {
      setSubmitError(error.message || 'Failed to send package inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="hero" style={{ minHeight: '50vh', padding: '8rem 5% 4rem' }}>
        <div className="hero-text">
          <div className="hero-tag">Package Inquiry</div>
          <h1 className="hero-title">
            Choose Your<br />Event <em>Package</em>
          </h1>
          <p className="hero-desc">
            Pick a service package, share your event details, and we will send a tailored response from the admin side.
          </p>
          <div className="hero-btns">
            <Link to="/services" className="btn-outline">Back to Services</Link>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--warm-white)' }}>
        <div className="cart-shell">
          <div className="cart-summary-card" style={{ padding: '2rem' }}>
            <div className="section-tag">Selected Package</div>
            <h2 className="section-title" style={{ fontSize: '2.2rem' }}>{selectedPackage.name}</h2>
            <p className="section-sub" style={{ maxWidth: '100%' }}>{selectedPackage.description}</p>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', color: 'var(--gold)', marginBottom: '1rem' }}>
              {selectedPackage.price}
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {selectedPackage.features.map((feature) => (
                <div key={feature} style={{ padding: '0.8rem 1rem', background: 'var(--warm-white)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="cart-items-panel" style={{ padding: '2rem' }}>
            <div className="section-tag">Inquiry Form</div>
            <h2 className="section-title" style={{ fontSize: '2rem' }}>Send Package Inquiry</h2>

            {submitted ? (
              <div className="success-msg" style={{ display: 'block', padding: 0, textAlign: 'left' }}>
                Your package inquiry has been sent successfully.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {submitError && (
                  <div style={{ color: '#e74c3c', marginBottom: '1rem' }}>{submitError}</div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--charcoal-soft)' }}>Package</label>
                    <select
                      className="payment-modal-input"
                      name="packageSlug"
                      value={formData.packageSlug}
                      onChange={handleChange}
                      required
                    >
                      {servicePackages.map((servicePackage) => (
                        <option key={servicePackage.slug} value={servicePackage.slug}>
                          {servicePackage.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--charcoal-soft)' }}>Name</label>
                    <input className="payment-modal-input" name="customerName" value={formData.customerName} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--charcoal-soft)' }}>Phone</label>
                    <input className="payment-modal-input" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--charcoal-soft)' }}>Email</label>
                    <input className="payment-modal-input" type="email" name="email" value={formData.email} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--charcoal-soft)' }}>Event Date</label>
                    <input className="payment-modal-input" type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--charcoal-soft)' }}>Guest Count</label>
                    <input className="payment-modal-input" type="number" min="1" name="guestCount" value={formData.guestCount} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--charcoal-soft)' }}>Address</label>
                  <input className="payment-modal-input" name="address" value={formData.address} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--charcoal-soft)' }}>Additional Requirements</label>
                  <textarea
                    className="payment-modal-input"
                    style={{ minHeight: '140px', resize: 'vertical' }}
                    name="additionalRequirements"
                    value={formData.additionalRequirements}
                    onChange={handleChange}
                    placeholder="Tell us about venue type, decor, timing, or any custom arrangement needed."
                  />
                </div>

                <button type="submit" className="form-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending Inquiry...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default PackageInquiry;
