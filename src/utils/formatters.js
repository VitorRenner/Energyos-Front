export const formatNumber = (value, options = {}) => {
  const minimumFractionDigits = options.minimumFractionDigits ?? 0;
  const maximumFractionDigits = options.maximumFractionDigits ?? Math.max(1, minimumFractionDigits);

  return new Intl.NumberFormat("pt-BR", {
    ...options,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
