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
  },
  contact: {
    address: {
      line1: "123 Herbal Way",
      line2: "Green District",
      city: "Mumbai",
      pincode: "400001",
      country: "India"
    },
    phone: "+91 98765 43210",
    email: "support@clarysays.com"
  }
};
