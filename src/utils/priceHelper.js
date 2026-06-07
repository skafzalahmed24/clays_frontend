export const formatPrice = (amount, currency = 'INR') => {
    if (amount === undefined || amount === null) return '';
    
    // Normalize currency code if needed, though Intl handles most standard ones
    const currencyCode = currency.toUpperCase();

    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: 0 // Remove decimals for cleaner look, typical for INR
        }).format(amount);
    } catch (error) {
        console.error('Price formatting failed:', error);
        // Fallback
        return `${currencyCode} ${amount}`;
    }
};
