export const servicePackages = [
  {
    slug: 'basic-package',
    name: 'Basic Package',
    price: 'Rs. 5,000',
    description: 'Perfect for small gatherings (up to 50 guests)',
    features: ['25 chairs', '5 tables', 'Free delivery', 'Setup included'],
    popular: false
  },
  {
    slug: 'standard-package',
    name: 'Standard Package',
    price: 'Rs. 12,000',
    description: 'Ideal for medium events (up to 150 guests)',
    features: ['75 chairs', '15 tables', '2 sofas', 'Free delivery & setup', 'Decor items included'],
    popular: true
  },
  {
    slug: 'premium-package',
    name: 'Premium Package',
    price: 'Rs. 25,000',
    description: 'Perfect for large events (up to 500 guests)',
    features: ['200 chairs', '40 tables', '6 sofas', 'Complete decor setup', 'Priority delivery', 'Event coordinator'],
    popular: false
  }
];

export const getServicePackageBySlug = (slug) =>
  servicePackages.find((servicePackage) => servicePackage.slug === slug);
