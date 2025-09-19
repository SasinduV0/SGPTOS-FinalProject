export const getEfficiencyColor = (efficiency) => {
  if (efficiency >= 85) return 'bg-green-500';
  if (efficiency >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const getEfficiencyTextColor = (efficiency) => {
  if (efficiency >= 85) return 'text-green-600';
  if (efficiency >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

export const getAlertStyle = (type) => {
  switch (type) {
    case 'high': return 'bg-red-50 border-l-red-500 text-red-800';
    case 'medium': return 'bg-yellow-50 border-l-yellow-500 text-yellow-800';
    case 'low': return 'bg-blue-50 border-l-blue-500 text-blue-800';
    default: return 'bg-gray-50 border-l-gray-500 text-gray-800';
  }
};