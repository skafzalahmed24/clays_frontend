import logo from '../assets/logo.png';
import packageJson from '../../package.json';

export const BRAND_CONFIG = {
  version: packageJson.version,
  brandName: "Clarysays", 
  logo: logo,
  meta: {
    title: "Clarysays",
    description: "Premium herbal hair care products crafted with natural ingredients for healthy, beautiful hair.",
    image: "https://Clarysays.com/og-image.jpg",
    url: "https://Clarysays.com"
  },
  payment: {
    currency: "INR",
    currencySymbol: "₹"
  }
};
