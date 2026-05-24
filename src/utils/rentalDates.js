export const isValidRentalDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return false;
  }

  return new Date(endDate) > new Date(startDate);
};

export const formatRentalDate = (value) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const getMinimumEndDate = (startDate) => {
  if (!startDate) return '';

  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + 1);

  return date.toISOString().split('T')[0];
};
