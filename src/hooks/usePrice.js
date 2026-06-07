import { useCallback } from 'react';
import { BRAND_CONFIG } from '../utils/config';
import { formatPrice } from '../utils/priceHelper';

export const usePrice = () => {
    // const { data: settings } = useGetSettingsQuery(); // No longer needed for currency
    const currency = BRAND_CONFIG.payment.currency || 'INR';

    const format = useCallback((amount) => {
        return formatPrice(amount, currency);
    }, [currency]);

    return { format, currency };
};
