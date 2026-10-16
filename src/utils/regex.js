/**
 * Global Regular Expressions for Validation
 */

export const REGEX = {
    // Email: Standard alphanumeric with dots/hyphens, @ symbol, domain, dot, and 2-6 char TLD
    EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,

    // Password: Min 8 chars, 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Char
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

    // Indian Mobile Number (+91 strictly): 10 digits starting with 6, 7, 8, 9
    INDIAN_PHONE: /^(\+91[\s-]?)?[6-9]\d{9}$|^91[6-9]\d{9}$|^0[6-9]\d{9}$/,
    INDIAN_PHONE_10_DIGITS: /^[6-9]\d{9}$/,

    // Coupon Code: Uppercase Alphanumeric and Underscores only
    COUPON_CODE: /^[A-Z0-9_]+$/,

    // HTML Tags: Matches any HTML tag (for stripping)
    HTML_TAGS: /<[^>]*>/g,
    
    // URL: Basic check for http/https start
    URL: /^(http|https):\/\/[^ "]+$/,

    // Digits only
    DIGITS: /^\d+$/,

    // Video Extension Check
    IS_VIDEO: /\.(mp4|webm|mov|ogg)$/i,

    // Payment Validations
    CARD_NUMBER: /^\d{13,19}$/,
    EXPIRY_DATE: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/,
    CVC: /^\d{3,4}$/
};
