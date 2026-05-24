import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { downloadBookingReceiptPdf } from '../utils/receiptPdf';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const callbackStatus = searchParams.get('razorpay_payment_link_status');
  const { clearCart } = useCart();

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!bookingId) {
        setError('Missing booking reference.');
        setLoading(false);
        return;
      }

      try {
        const bookingData = await api.getPaymentStatus(bookingId);
        setBooking(bookingData);
        setError('');

        if (bookingData.paymentStatus === 'paid' || bookingData.paymentStatus === 'demo-paid') {
          clearCart();
        }
      } catch (fetchError) {
        if (!booking) {
          setError(fetchError.message || 'Failed to fetch payment status.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [bookingId]);

  if (loading) {
    return (
      <section style={{ minHeight: '70vh', padding: '8rem 5%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="section-tag">Payment Status</div>
          <h1 className="section-title">Checking Payment Status...</h1>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ minHeight: '70vh', padding: '8rem 5%' }}>
        <div className="cart-empty-state" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1 className="section-title">We Could Not Verify the Payment</h1>
          <p className="section-sub" style={{ margin: '0 auto 1.5rem' }}>{error}</p>
          <Link to="/booking" className="btn-primary">Back to Booking</Link>
        </div>
      </section>
    );
  }

  const paymentState = booking?.paymentStatus || callbackStatus || 'pending';
  const isPaid = paymentState === 'paid' || paymentState === 'demo-paid';
  const isFailed = paymentState === 'failed' || paymentState === 'cancelled' || paymentState === 'expired';

  const handleReceiptDownload = () => {
    if (!booking) {
      setReceiptError('Booking details are not available yet.');
      return;
    }

    try {
      downloadBookingReceiptPdf(booking);
      setReceiptError('');
    } catch (downloadError) {
      setReceiptError('We could not generate the receipt PDF. Please try again.');
    }
  };

  return (
    <section style={{ minHeight: '70vh', padding: '8rem 5%' }}>
      <div className="cart-empty-state" style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'left' }}>
        <div className="section-tag">Payment Status</div>
        <h1 className="section-title">
          {isPaid
            ? 'Advance Payment Successful'
            : isFailed
              ? 'Payment Was Not Completed'
              : 'Payment Is Still Pending'}
        </h1>
        <p className="section-sub" style={{ maxWidth: '100%', marginBottom: '2rem' }}>
          {isPaid
            ? 'Your 25% advance has been recorded and the booking is now stored in the system.'
            : isFailed
              ? 'The payment was not completed. You can go back to the booking page and try again.'
              : 'The Razorpay payment link has not been marked paid yet. You can retry from the booking page if needed.'}
        </p>

        {booking && (
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Customer</div>
                <div style={{ fontWeight: '600' }}>{booking.customerName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rental Dates</div>
                <div style={{ fontWeight: '600' }}>
                  {booking.startDate
                    ? `${new Date(booking.startDate).toLocaleDateString('en-IN')} - ${new Date(booking.endDate).toLocaleDateString('en-IN')}`
                    : new Date(booking.eventDate).toLocaleDateString('en-IN')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Advance Paid</div>
                <div style={{ fontWeight: '600' }}>₹{(booking.advanceAmount || 0).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Remaining</div>
                <div style={{ fontWeight: '600' }}>₹{(booking.remainingAmount || 0).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Payment State</div>
                <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{paymentState}</div>
              </div>
            </div>
          </div>
        )}

        {isPaid && (
          <div style={{ background: '#f7f3eb', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.35rem', color: 'var(--charcoal)' }}>Download Receipt</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
              A PDF receipt is ready for this booking. You can download it now and keep it for your records.
            </div>
            {receiptError && (
              <div style={{ color: '#b42318', fontSize: '0.9rem', marginTop: '0.75rem' }}>
                {receiptError}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {isPaid && (
            <button type="button" className="btn-primary" onClick={handleReceiptDownload}>
              Download Receipt PDF
            </button>
          )}
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/products" className="btn-outline">Browse More Items</Link>
          {!isPaid && <Link to="/booking" className="btn-outline">Back to Booking</Link>}
        </div>
      </div>
    </section>
  );
};

export default PaymentStatus;
