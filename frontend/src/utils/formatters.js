export const formatCurrency = (value, listingType = 'sale') => {
  const amount = Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
  return `$${amount}${listingType === 'rent' ? '/mo' : ''}`;
};

export const formatStatus = (value = '') => String(value)
  .split('_')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

export const compactQuery = (values) => Object.fromEntries(
  Object.entries(values).filter(([, value]) => value !== '' && value !== null && value !== undefined)
);

export const formatDate = (value) => value
  ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
  : '—';
