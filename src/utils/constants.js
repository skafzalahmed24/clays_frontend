import clientPearlEarrings from '../assets/client-pearl-earrings.jpg';
import product1 from '../assets/product1.png';
import product3 from '../assets/product3.png';
import catNecklaces from '../assets/cat-necklaces.png';
import heroImg1 from '../assets/hero.png';
import heroImg2 from '../assets/hero-2.png';
import heroImg3 from '../assets/hero-3.png';
import storyImg from '../assets/story.png';
import catBracelet from '../assets/cat-bracelet.png';
import catPendant from '../assets/cat-pendant.png';

// Export previously static data logic only as Fallback/Asset registry if needed
// PRODUCTS_DATA removed - fully dynamic
// FILTER_OPTIONS removed - fully dynamic
// CATEGORIES_DATA removed - fully dynamic
// TESTIMONIALS_DATA removed - fully dynamic

import { BRAND_CONFIG } from './config';

// HERO_SLIDES removed - fully dynamic

export const MEGA_MENU_DATA = {
  "New Arrivals": {
    categories: [
      { title: "Latest Catalog", items: ["Spring Bloom", "Heritage Gold", "Modern Minimalist", "Diamond Sparkle"] },
      { title: "Trending Now", items: ["Stackable Rings", "Layered Necklaces", "Statement Hoops", "Cocktail Rings"] },
    ],
    featured: { img: heroImg1, title: "New Season Essentials", link: "Shop Now" }
  },
  "Earrings": {
    categories: [
      { title: "By Style", items: ["Studs", "Drops", "Hoops", "Jhumkas", "Chandbalis", "Sui Dhaga", "Ear Cuffs"] },
      { title: "By Metal", items: ["Yellow Gold", "White Gold", "Rose Gold", "Platinum", "Oxidised Silver"] },
      { title: "By Gemstone", items: ["Diamond", "Pearl", "Ruby", "Emerald", "Sapphire"] },
      { title: "Occasion", items: ["Daily Wear", "Office Wear", "Party Wear", "Wedding"] },
    ],
    featured: { img: clientPearlEarrings, title: "Vintage Pearl Catalog", link: "Explore" }
  },
  "Rings": {
    categories: [
      { title: "By Style", items: ["Solitaire", "Halo", "Three Stone", "Vintage", "Eternity Bands"] },
      { title: "By Metal", items: ["Gold", "Diamond", "Platinum", "Silver"] },
      { title: "Special", items: ["Engagement Rings", "Wedding Bands", "Couple Rings", "Promise Rings"] },
    ],
    featured: { img: product1, title: "Ethereal Diamonds", link: "Shop Rings" }
  },
  "Diamond Jewellery": {
    categories: [
      { title: "Categories", items: ["Diamond Rings", "Diamond Earrings", "Diamond Pendants", "Diamond Bangles", "Nose Pins"] },
      { title: "Catalog", items: ["Solitaire Catalog", "Daily Wear Diamonds", "Bridal Set", "Cocktail Jewellery"] },
    ],
    featured: { img: product3, title: "Shine Bright", link: "View Catalog" }
  },
  "Necklaces": {
    categories: [
      { title: "By Style", items: ["Chains", "Chokers", "Long Necklaces", "Layered", "Mangalsutra"] },
      { title: "By Metal", items: ["Gold", "Diamond", "Silver", "Platinum"] }
    ],
    featured: { img: catNecklaces, title: "Statement Pieces", link: "Shop Necklaces" }
  },
  "Bracelets": {
    categories: [
      { title: "Style", items: ["Chain", "Bangle", "Cuff", "Charm", "Tennis"] },
      { title: "Material", items: ["Gold", "Diamond", "Silver", "Rose Gold"] }
    ],
    featured: { img: catBracelet, title: "Wrist Essentials", link: "Shop Bracelets" }
  },
  "Pendants": {
    categories: [
      { title: "Style", items: ["Alphabet", "Religious", "Heart", "Floral", "Abstract"] },
      { title: "Metal", items: ["Gold", "Diamond", "Gemstone"] }
    ],
    featured: { img: catPendant, title: "Minimalist Drops", link: "Shop Now" }
  },
  "Wedding Catalog": {
    categories: [
      { title: "By Region", items: ["South Indian", "North Indian", "Bengali", "Maharashtrian"] },
      { title: "Sets", items: ["Bridal Sets", "Necklace Sets", "Bangle Sets"] }
    ],
    featured: { img: storyImg, title: "The Royal Bride", link: "View Sets" }
  },
  "More Jewellery": {
    categories: [
      { title: "Accessories", items: ["Nose Pins", "Maang Tikka", "Anklets", "Toe Rings"] },
      { title: "Men's Jewellery", items: ["Rings", "Chains", "Bracelets", "Cufflinks"] },
      { title: "Kids", items: ["Earrings", "Bracelets", "Chains", "Nazariya"] },
    ],
    featured: { img: heroImg2, title: "For Everyone", link: "Shop All" }
  },
  "Gifting": {
    categories: [
      { title: "By Occasion", items: ["Birthday", "Anniversary", "Wedding", "Festive", "New Born"] },
      { title: "By Price", items: ["Under 10k", "10k - 20k", "20k - 50k", "Above 50k"] },
      { title: "Corporate", items: ["Coins", "Gift Cards", "Custom Orders"] },
    ],
    featured: { img: heroImg3, title: "Gifts of Love", link: "Gift Guide" }
  }
};

/*
export const BLOG_POSTS = [
    {
        id: 1,
        title: "The Art of Layering Jewellery",
        excerpt: "Discover the secrets to creating the perfect stacked look with our guide to layering necklaces and bracelets.",
        date: "October 12, 2023",
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        category: "Styling",
        content: `
            <p class="mb-6">Layering jewellery is an art form that allows you to express your personal style and create a unique look. Whether you prefer a minimalist approach or a bold statement, mastering the art of layering can elevate any outfit.</p>
            
            <h3 class="text-xl font-heading text-primary mb-4">Start with a Focal Point</h3>
            <p class="mb-6">Choose one piece to be the star of your show. This could be a chunky chain, a pendant necklace, or a statement bracelet. Build your other layers around this focal point to create balance and harmony.</p>

            <h3 class="text-xl font-heading text-primary mb-4">Mix Textures and Weights</h3>
            <p class="mb-6">Combine different textures and chain weights to add depth and interest. Pair a delicate chain with a chunkier link bracelet or mix smooth metals with textured finishes. Don't be afraid to experiment!</p>

            <h3 class="text-xl font-heading text-primary mb-4">Play with Lengths</h3>
            <p class="mb-6">When layering necklaces, varying the lengths is key. Start with a choker or shorter chain and cascade down to longer pendants. This draws the eye down and elongates the neckline.</p>

            <p>Remember, there are no strict rules. The most important thing is to have fun and wear what makes you feel confident and beautiful.</p>
        `
    },
    {
        id: 2,
        title: "Understanding Diamond Quality",
        excerpt: "A comprehensive guide to the 4Cs of diamonds: Cut, Color, Clarity, and Carat weight.",
        date: "September 28, 2023",
        image: catCoupleRings,
        category: "Education",
        content: `
            <p class="mb-6">Buying a diamond is a significant investment, and understanding the 4Cs is crucial to making an informed decision. The 4Cs stand for Cut, Color, Clarity, and Carat Weight, and together they determine a diamond's value and beauty.</p>
            
            <h3 class="text-xl font-heading text-primary mb-4">Cut</h3>
            <p class="mb-6">The cut is arguably the most important factor, as it determines how well the diamond interacts with light. A well-cut diamond will sparkle and exhibit fire and brilliance. Cuts range from Excellent to Poor.</p>

            <h3 class="text-xl font-heading text-primary mb-4">Color</h3>
            <p class="mb-6">Diamond color is graded on a scale from D (colorless) to Z (light yellow or brown). Colorless diamonds are the rarest and most valuable, allowing the most light to pass through.</p>

            <h3 class="text-xl font-heading text-primary mb-4">Clarity</h3>
            <p class="mb-6">Clarity refers to the presence of internal inclusions or external blemishes. The scale ranges from Flawless (no inclusions visible under 10x magnification) to Included (inclusions visible to the naked eye).</p>

            <h3 class="text-xl font-heading text-primary mb-4">Carat Weight</h3>
            <p class="mb-6">Carat is the measure of a diamond's weight. Larger diamonds are rarer and therefore more valuable per carat, but two diamonds of equal weight can have very different values depending on the other three Cs.</p>
        `
    },
    {
        id: 3,
        title: "Caring for Your Gold Jewellery",
        excerpt: "Essential tips and tricks to keep your precious gold pieces looking their brilliant best for generations.",
        date: "September 15, 2023",
        image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        category: "Care Guide",
        content: `
            <p class="mb-6">Gold jewellery is timeless and durable, but it still requires care to maintain its luster. Here are some simple tips to keep your gold pieces looking their best.</p>
            
            <h3 class="text-xl font-heading text-primary mb-4">Regular Cleaning</h3>
            <p class="mb-6">Soak your gold jewellery in a bowl of warm water with a few drops of mild dish soap. Gently scrub with a soft-bristle toothbrush to remove dirt and oils. Rinse thoroughly and dry with a soft cloth.</p>

            <h3 class="text-xl font-heading text-primary mb-4">Avoid Chemicals</h3>
            <p class="mb-6">Remove your gold jewellery before swimming in chlorinated pools or using harsh cleaning chemicals. Chlorine and bleach can damage and discolor gold alloys over time.</p>

            <h3 class="text-xl font-heading text-primary mb-4">Proper Storage</h3>
            <p class="mb-6">Store your gold pieces separately in a soft-lined jewellery box or pouch to prevent scratching. Gold is a relatively soft metal and can be scratched by harder gemstones or other jewellery.</p>

            <p>Annual professional cleaning and inspection is also recommended to check for loose settings or wear.</p>
        `
    }

];
*/

// MOCK_ORDERS removed - fully dynamic
