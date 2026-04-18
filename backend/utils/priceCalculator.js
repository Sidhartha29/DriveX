/**
 * Calculate total booking price
 * Formula: Distance (KM) × Price per KM (₹) × Number of Seats
 * @param {number} distance - Distance in kilometers
 * @param {number} pricePerKm - Price per kilometer in ₹
 * @param {number} numberOfSeats - Number of seats being booked
 * @returns {number} Total price in ₹
 */
export const calculatePrice = (distance, pricePerKm, numberOfSeats) => {
  if (distance <= 0 || pricePerKm <= 0 || numberOfSeats <= 0) {
    throw new Error('Invalid calculation parameters');
  }
  return Number((distance * pricePerKm * numberOfSeats).toFixed(2));
};

/**
 * Calculate discounted price
 * @param {number} originalPrice - Original price in ₹
 * @param {number} discountPercentage - Discount percentage (0-100)
 * @returns {number} Final price after discount in ₹
 */
export const applyDiscount = (originalPrice, discountPercentage) => {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Discount percentage must be between 0 and 100');
  }
  const discountAmount = (originalPrice * discountPercentage) / 100;
  return Number((originalPrice - discountAmount).toFixed(2));
};

/**
 * Format price to INR currency string
 * @param {number} price - Price in ₹
 * @returns {string} Formatted price (e.g., "₹2,550.00")
 */
export const formatINR = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(price);
};

/**
 * Calculate GST (Goods and Services Tax)
 * Indian buses typically have 5% GST
 * @param {number} price - Price before GST in ₹
 * @param {number} gstRate - GST rate in percentage (default 5%)
 * @returns {number} Price with GST in ₹
 */
export const applyGST = (price, gstRate = 5) => {
  const gstAmount = (price * gstRate) / 100;
  return Number((price + gstAmount).toFixed(2));
};

/**
 * Calculate refund amount
 * Standard: 90-100% based on cancellation time
 * @param {number} totalPrice - Original booking price
 * @param {number} cancellationPercentage - Refund percentage (50-100)
 * @returns {number} Refund amount in ₹
 */
export const calculateRefund = (totalPrice, cancellationPercentage = 90) => {
  if (cancellationPercentage < 0 || cancellationPercentage > 100) {
    throw new Error('Cancellation percentage must be between 0 and 100');
  }
  return Number(((totalPrice * cancellationPercentage) / 100).toFixed(2));
};

export default {
  calculatePrice,
  applyDiscount,
  formatINR,
  applyGST,
  calculateRefund
};
