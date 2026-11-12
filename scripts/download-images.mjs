import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const imagesToDownload = [
  // Hero
  {
    folder: "public/images/hero",
    filename: "hero-salon-main.jpg",
    url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80",
    author: "Adam Winger",
    title: "Luxury Salon Ambience",
  },
  {
    folder: "public/images/hero",
    filename: "hero-hair-styling.jpg",
    url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1920&q=80",
    author: "Valeriia Kogan",
    title: "Master Stylist Blowdry",
  },

  // Salon Interior & Stations
  {
    folder: "public/images/salon",
    filename: "salon-interior.jpg",
    url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
    author: "Guilherme Petri",
    title: "Modern Salon Mirrors & Chairs",
  },
  {
    folder: "public/images/salon",
    filename: "salon-chairs.jpg",
    url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
    author: "Arthur Humeau",
    title: "Barber & Styling Chair",
  },
  {
    folder: "public/images/salon",
    filename: "salon-wash-basin.jpg",
    url: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=1200&q=80",
    author: "Nick Karvounis",
    title: "Hair Washing Lounger",
  },
  {
    folder: "public/images/salon",
    filename: "salon-reception.jpg",
    url: "https://images.unsplash.com/photo-1629853472097-f58c734bdf8d?auto=format&fit=crop&w=1200&q=80",
    author: "Shari Sirotnak",
    title: "Luxury Salon Desk",
  },

  // Services
  {
    folder: "public/images/services",
    filename: "service-haircut.jpg",
    url: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80",
    author: "Paul Siewert",
    title: "Precision Haircut",
  },
  {
    folder: "public/images/services",
    filename: "service-hair-wash.jpg",
    url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
    author: "Element5 Digital",
    title: "Relaxing Hair Cleansing",
  },
  {
    folder: "public/images/services",
    filename: "service-hair-styling.jpg",
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    author: "Alvin Mahmudov",
    title: "Professional Hair Styling",
  },
  {
    folder: "public/images/services",
    filename: "service-hair-color.jpg",
    url: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80",
    author: "Engin Akyurt",
    title: "Balayage and Hair Color",
  },
  {
    folder: "public/images/services",
    filename: "service-hair-spa.jpg",
    url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80",
    author: "Sarah Comeau",
    title: "Deep Hair Conditioning Spa",
  },
  {
    folder: "public/images/services",
    filename: "service-facial.jpg",
    url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    author: "Content Pixie",
    title: "Facial & Glow Therapy",
  },
  {
    folder: "public/images/services",
    filename: "service-skincare.jpg",
    url: "https://images.unsplash.com/photo-1512290900672-1f02f90a2a47?auto=format&fit=crop&w=800&q=80",
    author: "Raphael Lovaski",
    title: "Advanced Skin Health",
  },
  {
    folder: "public/images/services",
    filename: "service-bridal-makeup.jpg",
    url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    author: "Gisela Merkuur",
    title: "Royal Bridal Makeover",
  },
  {
    folder: "public/images/services",
    filename: "service-party-makeup.jpg",
    url: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=800&q=80",
    author: "Alexander Krivitskiy",
    title: "Evening Party Glamour",
  },
  {
    folder: "public/images/services",
    filename: "service-beard-grooming.jpg",
    url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80",
    author: "Allef Vinicius",
    title: "Royal Beard Sculpting",
  },
  {
    folder: "public/images/services",
    filename: "service-mens-grooming.jpg",
    url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    author: "Arthur Humeau",
    title: "Executive Men's Grooming",
  },

  // Haircuts
  {
    folder: "public/images/haircuts",
    filename: "haircut-women-1.jpg",
    url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80",
    author: "Ali Pazani",
    title: "Long Layers Haircut",
  },
  {
    folder: "public/images/haircuts",
    filename: "haircut-women-2.jpg",
    url: "https://images.unsplash.com/photo-1597225244660-1cd128c64284?auto=format&fit=crop&w=800&q=80",
    author: "Michael Dam",
    title: "Classic Bob Cut",
  },
  {
    folder: "public/images/haircuts",
    filename: "haircut-men-1.jpg",
    url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
    author: "Aiony Haust",
    title: "Modern Textured Taper",
  },
  {
    folder: "public/images/haircuts",
    filename: "haircut-men-2.jpg",
    url: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=800&q=80",
    author: "Austin Wilcox",
    title: "Executive Low Fade",
  },

  // Makeup
  {
    folder: "public/images/makeup",
    filename: "makeup-bridal-1.jpg",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    author: "Aiony Haust",
    title: "Indian Traditional Bride Look",
  },
  {
    folder: "public/images/makeup",
    filename: "makeup-bridal-2.jpg",
    url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
    author: "Laura Chouette",
    title: "Dewy Bridal Finish",
  },
  {
    folder: "public/images/makeup",
    filename: "makeup-party-1.jpg",
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    author: "Alvin Mahmudov",
    title: "Smokey Eyes Party Look",
  },

  // Gallery
  {
    folder: "public/images/gallery",
    filename: "gallery-1.jpg",
    url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80",
    author: "Adam Winger",
    title: "Salon Floor Overview",
  },
  {
    folder: "public/images/gallery",
    filename: "gallery-2.jpg",
    url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=80",
    author: "Guilherme Petri",
    title: "Styling Stations & Lighting",
  },
  {
    folder: "public/images/gallery",
    filename: "gallery-3.jpg",
    url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80",
    author: "Valeriia Kogan",
    title: "Blowdry Styling Experience",
  },
  {
    folder: "public/images/gallery",
    filename: "gallery-4.jpg",
    url: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=1000&q=80",
    author: "Engin Akyurt",
    title: "Color Balayage Highlights",
  },
  {
    folder: "public/images/gallery",
    filename: "gallery-5.jpg",
    url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1000&q=80",
    author: "Allef Vinicius",
    title: "Gentlemen's Hot Towel Grooming",
  },
  {
    folder: "public/images/gallery",
    filename: "gallery-6.jpg",
    url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80",
    author: "Content Pixie",
    title: "Rejuvenating Facial Suite",
  },
  {
    folder: "public/images/gallery",
    filename: "gallery-7.jpg",
    url: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=1000&q=80",
    author: "Nick Karvounis",
    title: "Hair Spa Wash Stations",
  },
  {
    folder: "public/images/gallery",
    filename: "gallery-8.jpg",
    url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    author: "Gisela Merkuur",
    title: "Bridal Preparation Suite",
  },

  // Staff / Stylists
  {
    folder: "public/images/staff",
    filename: "stylist-1.jpg",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    author: "Aiony Haust",
    title: "Master Colorist Profile",
  },
  {
    folder: "public/images/staff",
    filename: "stylist-2.jpg",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    author: "Joseph Gonzalez",
    title: "Senior Hair Artist Profile",
  },
  {
    folder: "public/images/staff",
    filename: "stylist-3.jpg",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    author: "Christina @ wocintechchat.com",
    title: "Skin & Facial Specialist Profile",
  },
  {
    folder: "public/images/staff",
    filename: "stylist-4.jpg",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    author: "Jurica Koletić",
    title: "Beard Architect Profile",
  },

  // Transformations (Pair before & after)
  {
    folder: "public/images/transformations",
    filename: "trans-1-before.jpg",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    author: "Albert Dera",
    title: "Men Haircut Before (Overgrown)",
  },
  {
    folder: "public/images/transformations",
    filename: "trans-1-after.jpg",
    url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
    author: "Aiony Haust",
    title: "Men Haircut After (Sharp Fade & Contoured Beard)",
  },
  {
    folder: "public/images/transformations",
    filename: "trans-2-before.jpg",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    author: "Clarisse Meyer",
    title: "Women Hair Color Before (Dull Brown)",
  },
  {
    folder: "public/images/transformations",
    filename: "trans-2-after.jpg",
    url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80",
    author: "Ali Pazani",
    title: "Women Hair Color After (Caramel Honey Balayage)",
  },
  {
    folder: "public/images/transformations",
    filename: "trans-3-before.jpg",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    author: "Kimson Doan",
    title: "Keratin Treatment Before (Frizzy & Damaged)",
  },
  {
    folder: "public/images/transformations",
    filename: "trans-3-after.jpg",
    url: "https://images.unsplash.com/photo-1597225244660-1cd128c64284?auto=format&fit=crop&w=800&q=80",
    author: "Michael Dam",
    title: "Keratin Treatment After (Silk Glass Hair)",
  },
  {
    folder: "public/images/transformations",
    filename: "trans-4-before.jpg",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    author: "Christian Buehner",
    title: "Bridal Prep Before (Natural Complexion)",
  },
  {
    folder: "public/images/transformations",
    filename: "trans-4-after.jpg",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    author: "Aiony Haust",
    title: "Bridal Prep After (Radiant HD Glow & Jewels)",
  },
  {
    folder: "public/images/transformations",
    filename: "trans-5-before.jpg",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    author: "Michael Dam",
    title: "Women Haircut Before (Split Ends)",
  },
  {
    folder: "public/images/transformations",
    filename: "trans-5-after.jpg",
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    author: "Alvin Mahmudov",
    title: "Women Haircut After (Feathered Voluminous Blowout)",
  },
];

async function downloadAll() {
  console.log(`Starting download of ${imagesToDownload.length} curated images...`);

  let docContent = `# Image Sources & Attribution

All images utilized in the demonstration website for **The Jawed Habib Salon – Lalganj** are sourced from legitimate public royalty-free licenses (Unsplash License - free for commercial and non-commercial use, no permission required).

> **Important Business Note**: These photographs represent curated demonstration assets until authentic salon photography from the Lalganj salon at 1st Floor, Tinpulwa Chowk is supplied by the salon management.

| Category / File | Description | Author / Source | License |
| :--- | :--- | :--- | :--- |
`;

  for (const item of imagesToDownload) {
    const targetDir = path.join(rootDir, item.folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, item.filename);

    if (fs.existsSync(filePath)) {
      console.log(`Already exists: ${item.filename}`);
    } else {
      console.log(`Downloading: ${item.filename}...`);
      try {
        const response = await fetch(item.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));
        console.log(`✓ Saved: ${item.filename}`);
      } catch (err) {
        console.error(`✗ Failed to download ${item.filename}:`, err.message);
      }
    }

    docContent += `| \`${item.folder}/${item.filename}\` | ${item.title} | [${item.author}](${item.url}) | Unsplash License |\n`;
  }

  fs.writeFileSync(path.join(rootDir, "image-sources.md"), docContent);
  console.log("✓ image-sources.md generated successfully!");
}

downloadAll();
