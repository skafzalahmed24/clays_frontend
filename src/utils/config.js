import logo from '../assets/logo.png';
import packageJson from '../../package.json';

export const BRAND_CONFIG = {
  version: packageJson.version,
  brandName: "Mershai", 
  logo: logo,
  meta: {
    title: "Mershai",
    description: "Redefining luxury with a fusion of heritage and modernity.",
    image: "https://mershai.com/og-image.jpg",
    url: "https://mershai.com"
  },
  payment: {
    currency: "INR",
    currencySymbol: "₹"
  }
};
