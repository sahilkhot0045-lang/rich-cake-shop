export const formatRupees = (paise) => {
  if (paise === undefined || paise === null || isNaN(paise)) return '₹0';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString;
};

export const calculateEstimatedCustomPrice = ({ weightGram = 1000, tiers = 1, shape = 'Round' }) => {
  const kg = Math.max(1, weightGram / 1000);
  let basePaise = kg * 90000;

  if (tiers > 1) {
    basePaise += (tiers - 1) * 35000;
  }

  if (shape === 'Custom Sculpted') {
    basePaise += 50000;
  } else if (shape === 'Multi-Tier') {
    basePaise += 30000;
  }

  const minPaise = Math.round(basePaise * 0.9);
  const maxPaise = Math.round(basePaise * 1.25);

  return {
    minPaise,
    maxPaise,
    formattedRange: `${formatRupees(minPaise)} - ${formatRupees(maxPaise)}`,
  };
};
