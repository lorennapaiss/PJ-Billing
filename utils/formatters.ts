export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const parseCurrency = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // Remove currency symbol, spaces, and swap comma for dot
  const cleanStr = value.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleanStr) || 0;
};

export const getInitials = (name: string): string => {
  if (!name) return '??';
  const names = name.trim().split(/\s+/);
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};