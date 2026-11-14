import { PrismaClient, RoleType, GenderTarget, DiscountType, AppointmentStatus, BookingSource, PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for The Jawed Habib Salon – Lalganj...");

  // 1. Roles & Permissions
  const permissionsList = [
    { slug: "appointments:read", action: "read", subject: "appointments", description: "View appointments" },
    { slug: "appointments:manage", action: "manage", subject: "appointments", description: "Create, confirm, reschedule or cancel appointments" },
    { slug: "services:manage", action: "manage", subject: "services", description: "Add or edit services and pricing" },
    { slug: "staff:manage", action: "manage", subject: "staff", description: "Manage staff profiles and availability" },
    { slug: "reviews:moderate", action: "moderate", subject: "reviews", description: "Approve or decline customer reviews" },
    { slug: "analytics:read", action: "read", subject: "analytics", description: "View financial reports and booking analytics" },
    { slug: "settings:manage", action: "manage", subject: "settings", description: "Change salon configuration and hours" },
  ];

  for (const perm of permissionsList) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: perm,
      create: perm,
    });
  }

  const allPerms = await prisma.permission.findMany();

  const roleDefinitions = [
    { name: RoleType.SUPER_ADMIN, displayName: "Super Administrator", description: "Full access to salon business platform", perms: allPerms },
    { name: RoleType.ADMIN, displayName: "Salon Administrator", description: "Manage day-to-day salon operations", perms: allPerms },
    { name: RoleType.MANAGER, displayName: "Salon Manager", description: "Floor management and staff scheduling", perms: allPerms.filter((p) => p.slug !== "settings:manage") },
    { name: RoleType.STAFF, displayName: "Stylist / Staff", description: "View assigned appointments and manage schedule", perms: allPerms.filter((p) => p.slug.startsWith("appointments:read")) },
    { name: RoleType.CUSTOMER, displayName: "Registered Customer", description: "Book appointments, leave reviews, and earn loyalty points", perms: [] },
  ];

  for (const r of roleDefinitions) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {
        displayName: r.displayName,
        description: r.description,
        permissions: {
          set: r.perms.map((p) => ({ id: p.id })),
        },
      },
      create: {
        name: r.name,
        displayName: r.displayName,
        description: r.description,
        permissions: {
          connect: r.perms.map((p) => ({ id: p.id })),
        },
      },
    });
  }

  const superAdminRole = await prisma.role.findUnique({ where: { name: RoleType.SUPER_ADMIN } });
  const staffRole = await prisma.role.findUnique({ where: { name: RoleType.STAFF } });
  const customerRole = await prisma.role.findUnique({ where: { name: RoleType.CUSTOMER } });

  // 2. Core Salon Settings
  const defaultSettings = [
    { key: "SALON_NAME", value: "The Jawed Habib Salon – Lalganj", description: "Official business name" },
    { key: "ADDRESS", value: "1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121", description: "Exact physical address" },
    { key: "PHONE_PRIMARY", value: "7707000463", description: "Main customer booking line" },
    { key: "PHONE_SECONDARY", value: "9831722983", description: "Secondary contact phone" },
    { key: "PHONE_TERTIARY", value: "9580000175", description: "Tertiary support line" },
    { key: "OPENING_HOURS", value: "Monday to Sunday: 10:00 AM – 10:00 PM", description: "Operational hours (all 7 days)" },
    { key: "START_TIME", value: "10:00", description: "Salon opening time in 24h" },
    { key: "END_TIME", value: "22:00", description: "Salon closing time in 24h" },
    { key: "TIMEZONE", value: "Asia/Kolkata", description: "Default business timezone" },
    { key: "INSTAGRAM_URL", value: "https://www.instagram.com/the_jawedhabib_lalganj/", description: "Official Instagram" },
    { key: "MAPS_URL", value: "https://maps.app.goo.gl/TVx48xoWEu8dMvXT9", description: "Google Maps direct link" },
    { key: "SLOT_INTERVAL_MINUTES", value: "30", description: "Booking slot interval" },
    { key: "CANCELLATION_HOURS_WINDOW", value: "2", description: "Minimum hours prior to appointment required for customer cancellation" },
  ];

  for (const s of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }

  // 3. Super Admin User
  const adminDefaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@JawedHabib2026!";
  const adminPasswordHash = await bcrypt.hash(adminDefaultPassword, 10);
  const adminUser = await prisma.user.upsert({
    where: { phone: "7707000463" },
    update: {
      roleId: superAdminRole?.id,
      roleType: RoleType.SUPER_ADMIN,
    },
    create: {
      name: "Salon Manager (Lalganj)",
      email: "admin@jawedhabib-lalganj.in",
      phone: "7707000463",
      passwordHash: adminPasswordHash,
      roleId: superAdminRole?.id,
      roleType: RoleType.SUPER_ADMIN,
    },
  });

  // 4. Staff Users
  const staffPasswordHash = await bcrypt.hash("Stylist@2026!", 10);
  const staffMembers = [
    {
      name: "Vikram Sharma",
      phone: "9831722983",
      email: "vikram@jawedhabib-lalganj.in",
      designation: "Master Hair Stylist & Creative Director",
      bio: "10+ years mastering Jawed Habib precision geometric cutting and international hair fashion.",
      experienceYears: 10,
      specialties: ["Precision Haircut", "Creative Styling", "Fade & Beard Contouring"],
      rating: 4.9,
    },
    {
      name: "Pooja Singh",
      phone: "9580000175",
      email: "pooja@jawedhabib-lalganj.in",
      designation: "Senior Colorist & Chemical Specialist",
      bio: "Certified L'Oréal Professionnel colorist specializing in balayage, keratin smoothing and hair botox.",
      experienceYears: 7,
      specialties: ["Global Hair Colour", "Balayage", "Keratin Therapy", "Hair Spa"],
      rating: 4.8,
    },
    {
      name: "Anjali Kumari",
      phone: "9123456780",
      email: "anjali@jawedhabib-lalganj.in",
      designation: "Bridal Makeup Artist & Aesthetician",
      bio: "Expert bridal makeup specialist with in-depth knowledge of skin rejuvenation therapies and Hydra facials.",
      experienceYears: 6,
      specialties: ["Bridal Makeup", "Gold Facial", "Pre-Bridal Packages", "Skin Therapy"],
      rating: 5.0,
    },
  ];

  const createdStaffRecords = [];
  for (const sm of staffMembers) {
    const user = await prisma.user.upsert({
      where: { phone: sm.phone },
      update: {
        name: sm.name,
        roleId: staffRole?.id,
        roleType: RoleType.STAFF,
      },
      create: {
        name: sm.name,
        phone: sm.phone,
        email: sm.email,
        passwordHash: staffPasswordHash,
        roleId: staffRole?.id,
        roleType: RoleType.STAFF,
      },
    });

    const staffRecord = await prisma.staff.upsert({
      where: { userId: user.id },
      update: {
        designation: sm.designation,
        bio: sm.bio,
        experienceYears: sm.experienceYears,
        specialties: sm.specialties,
        rating: sm.rating,
      },
      create: {
        userId: user.id,
        designation: sm.designation,
        bio: sm.bio,
        experienceYears: sm.experienceYears,
        specialties: sm.specialties,
        rating: sm.rating,
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        startTime: "10:00",
        endTime: "22:00",
        isAvailable: true,
      },
    });

    // Create availability rules for all 7 days (0 = Sunday to 6 = Saturday)
    for (let day = 0; day <= 6; day++) {
      const existingRule = await prisma.availabilityRule.findFirst({
        where: { staffId: staffRecord.id, dayOfWeek: day },
      });
      if (!existingRule) {
        await prisma.availabilityRule.create({
          data: {
            staffId: staffRecord.id,
            dayOfWeek: day,
            startTime: "10:00",
            endTime: "22:00",
            isWorkingDay: true,
          },
        });
      }
    }

    createdStaffRecords.push(staffRecord);
  }

  // 5. Service Categories
  const categoriesData = [
    {
      name: "Haircuts & Styling",
      slug: "haircuts-styling",
      description: "Precision haircuts crafted by Jawed Habib certified master stylists for men, women, and kids.",
      imageUrl: "/images/services/womens-cut.webp",
      iconName: "Scissors",
      sortOrder: 1,
    },
    {
      name: "Hair Spa & Intensive Treatments",
      slug: "hair-spa-treatments",
      description: "Restorative deep conditioning, keratin, botox, and organic scalp revitalizing therapies.",
      imageUrl: "/images/services/hair-spa.webp",
      iconName: "Sparkles",
      sortOrder: 2,
    },
    {
      name: "Hair Color & Highlights",
      slug: "hair-color-highlights",
      description: "Global color, balayage, ombré, and ammonia-free fashion colors tailored to your skin tone.",
      imageUrl: "/images/services/hair-color.webp",
      iconName: "Palette",
      sortOrder: 3,
    },
    {
      name: "Skin Care & Premium Facials",
      slug: "skin-care-facials",
      description: "Gold facials, Hydra facial glow, anti-tan, and detoxifying therapies for radiant skin.",
      imageUrl: "/images/services/gold-facial.webp",
      iconName: "HeartPulse",
      sortOrder: 4,
    },
    {
      name: "Beard & Men's Grooming",
      slug: "beard-mens-grooming",
      description: "Luxury beard contouring, royal hot towel shaves, and executive styling.",
      imageUrl: "/images/services/beard-grooming.webp",
      iconName: "UserCheck",
      sortOrder: 5,
    },
    {
      name: "Bridal, Groom & Special Events",
      slug: "bridal-groom-packages",
      description: "Comprehensive luxury bridal makeup, groom prep, engagement, and wedding packages.",
      imageUrl: "/images/services/bridal-makeup.webp",
      iconName: "Crown",
      sortOrder: 6,
    },
  ];

  for (const cat of categoriesData) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  // 6. Services with Indicative / Confirmed Pricing
  const haircutCat = await prisma.serviceCategory.findUnique({ where: { slug: "haircuts-styling" } });
  const spaCat = await prisma.serviceCategory.findUnique({ where: { slug: "hair-spa-treatments" } });
  const colorCat = await prisma.serviceCategory.findUnique({ where: { slug: "hair-color-highlights" } });
  const facialCat = await prisma.serviceCategory.findUnique({ where: { slug: "skin-care-facials" } });
  const beardCat = await prisma.serviceCategory.findUnique({ where: { slug: "beard-mens-grooming" } });
  const bridalCat = await prisma.serviceCategory.findUnique({ where: { slug: "bridal-groom-packages" } });

  const servicesData = [
    // Indicative Ground Truth prices:
    // Standard Haircut: ₹299
    // Haircut with Hairwash: ₹299–399
    // Hair Colour: Starting ₹1,999
    // Global Hair Colour: Starting ₹2,499
    // Party Makeup: ₹1,499–1,999
    {
      name: "Standard Precision Haircut",
      slug: "standard-precision-haircut",
      description: "Precision haircut tailored to facial geometry by certified Jawed Habib stylists.",
      price: 299,
      discountedPrice: 299,
      durationMinutes: 30,
      gender: GenderTarget.UNISEX,
      categoryId: haircutCat!.id,
      imageUrl: "/images/services/mens-haircut.webp",
      isPopular: true,
      isFeatured: true,
    },
    {
      name: "Haircut with Deep Hairwash & Blowdry",
      slug: "haircut-with-hairwash",
      description: "Signature haircut accompanied by deep cleansing wash, conditioning, and editorial blowdry.",
      price: 399,
      discountedPrice: 349,
      durationMinutes: 45,
      gender: GenderTarget.UNISEX,
      categoryId: haircutCat!.id,
      imageUrl: "/images/services/womens-cut.webp",
      isPopular: true,
      isFeatured: true,
    },
    {
      name: "Global Hair Colour",
      slug: "global-hair-colour",
      description: "Seamless single-tone full hair color using ammonia-free professional pigments.",
      price: 2499,
      discountedPrice: 2499,
      durationMinutes: 90,
      gender: GenderTarget.UNISEX,
      categoryId: colorCat!.id,
      imageUrl: "/images/services/hair-color.webp",
      isPopular: true,
      isFeatured: true,
    },
    {
      name: "Creative Highlights & Balayage",
      slug: "creative-highlights-balayage",
      description: "Multi-dimensional foil highlights, balayage, or ombré customized to your style.",
      price: 1999,
      discountedPrice: 1999,
      durationMinutes: 120,
      gender: GenderTarget.UNISEX,
      categoryId: colorCat!.id,
      imageUrl: "/images/services/hair-color.webp",
      isPopular: true,
      isFeatured: true,
    },
    {
      name: "L'Oréal Professionnel Deep Nourishing Hair Spa",
      slug: "loreal-deep-nourishing-hair-spa",
      description: "Deep fiber rejuvenation with therapeutic scalp acupressure massage.",
      price: 1200,
      discountedPrice: 999,
      durationMinutes: 60,
      gender: GenderTarget.UNISEX,
      categoryId: spaCat!.id,
      imageUrl: "/images/services/hair-spa.webp",
      isPopular: true,
      isFeatured: true,
    },
    {
      name: "Keratin Protein Treatment & Smoothening",
      slug: "keratin-protein-treatment",
      description: "Frizz-eliminating keratin infusion providing ultra-smooth, silky, and manageable hair.",
      price: 3999,
      discountedPrice: 3499,
      durationMinutes: 150,
      gender: GenderTarget.UNISEX,
      categoryId: spaCat!.id,
      imageUrl: "/images/services/keratin-treatment.webp",
      isPopular: true,
      isFeatured: false,
    },
    {
      name: "Jawed Habib Signature Gold Radiance Facial",
      slug: "jawed-habib-gold-radiance-facial",
      description: "24K Gold enriched facial therapy for instant luminous complexion and anti-aging glow.",
      price: 2000,
      discountedPrice: 1699,
      durationMinutes: 60,
      gender: GenderTarget.UNISEX,
      categoryId: facialCat!.id,
      imageUrl: "/images/services/gold-facial.webp",
      isPopular: true,
      isFeatured: true,
    },
    {
      name: "Advanced Hydra Radiance Clean-Up",
      slug: "advanced-hydra-radiance-cleanup",
      description: "Pore-clearing exfoliation, steam, blackhead extraction, and soothing cooling mask.",
      price: 999,
      discountedPrice: 799,
      durationMinutes: 40,
      gender: GenderTarget.UNISEX,
      categoryId: facialCat!.id,
      imageUrl: "/images/services/skin-treatment.webp",
      isPopular: false,
      isFeatured: false,
    },
    {
      name: "Royal Hot Towel Beard Sculpting",
      slug: "royal-hot-towel-beard-sculpting",
      description: "Razor precision contouring with soothing steam, hot towel, and argan beard massage.",
      price: 250,
      discountedPrice: 199,
      durationMinutes: 25,
      gender: GenderTarget.MALE,
      categoryId: beardCat!.id,
      imageUrl: "/images/services/beard-grooming.webp",
      isPopular: true,
      isFeatured: false,
    },
    {
      name: "Party Makeup & Glam Styling",
      slug: "party-makeup-glam-styling",
      description: "Flawless HD party makeup, false lashes, contouring, and elegant hairstyling.",
      price: 1999,
      discountedPrice: 1499,
      durationMinutes: 60,
      gender: GenderTarget.FEMALE,
      categoryId: bridalCat!.id,
      imageUrl: "/images/services/bridal-makeup.webp",
      isPopular: true,
      isFeatured: true,
    },
    {
      name: "Royal HD Bridal Makeup Experience",
      slug: "royal-hd-bridal-makeup-experience",
      description: "Complete bridal makeover including HD Airbrush base, jewelry setting, dupatta drape, and hair artistry.",
      price: 9999,
      discountedPrice: 8499,
      durationMinutes: 180,
      gender: GenderTarget.FEMALE,
      categoryId: bridalCat!.id,
      imageUrl: "/images/services/bridal-makeup.webp",
      isPopular: false,
      isFeatured: true,
    },
  ];

  const createdServices = [];
  for (const s of servicesData) {
    const serviceRecord = await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
    createdServices.push(serviceRecord);

    // Link staff to services
    for (const st of createdStaffRecords) {
      await prisma.staffService.upsert({
        where: {
          staffId_serviceId: {
            staffId: st.id,
            serviceId: serviceRecord.id,
          },
        },
        update: {},
        create: {
          staffId: st.id,
          serviceId: serviceRecord.id,
        },
      });
    }
  }

  // 7. Packages
  const packagesData = [
    {
      name: "Gentleman's Royal Grooming Affair",
      slug: "gentlemans-royal-grooming-affair",
      description: "Precision Haircut + Hot Towel Beard Sculpting + De-stress Hair Spa & Head Massage.",
      price: 899,
      originalPrice: 1350,
      durationMinutes: 75,
      servicesList: ["Precision Haircut", "Hot Towel Beard Styling", "Hair Spa", "Scalp Massage"],
      imageUrl: "/images/services/beard-grooming.webp",
      isFeatured: true,
    },
    {
      name: "Diva's Glow & Hair Rejuvenation",
      slug: "divas-glow-hair-rejuvenation",
      description: "Luxury Haircut + Deep Nourishing Hair Spa + Habib Gold Radiance Facial.",
      price: 2499,
      originalPrice: 3500,
      durationMinutes: 120,
      servicesList: ["Designer Haircut & Blowdry", "Deep Rejuvenation Hair Spa", "Gold Radiance Facial"],
      imageUrl: "/images/services/gold-facial.webp",
      isFeatured: true,
    },
    {
      name: "Complete Bridal Glamour Package",
      slug: "complete-bridal-glamour-package",
      description: "Pre-bridal cleanup, 24K Gold Facial, full body waxing, HD Airbrush Bridal Makeup, and Hair Styling.",
      price: 14999,
      originalPrice: 19999,
      durationMinutes: 240,
      servicesList: ["Pre-bridal Skin Prep", "Gold Facial", "HD Airbrush Bridal Makeup", "Dupatta & Jewelry Draping"],
      imageUrl: "/images/services/bridal-makeup.webp",
      isFeatured: true,
    },
  ];

  for (const p of packagesData) {
    await prisma.package.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  // 8. Offers & Coupons
  await prisma.offer.upsert({
    where: { slug: "first-visit-welcome-special" },
    update: {},
    create: {
      title: "First Visit Welcome Delight – Flat ₹100 OFF",
      slug: "first-visit-welcome-special",
      description: "Enjoy ₹100 instant discount on your first appointment booking at The Jawed Habib Salon, Lalganj.",
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 100,
      bannerImageUrl: "/images/home/hero-salon-interior.webp",
      validFrom: new Date("2026-01-01"),
      validUntil: new Date("2027-12-31"),
      isActive: true,
      isFeatured: true,
      termsConditions: [
        "Valid only on first online booking",
        "Applicable on billing above ₹499",
        "Cannot be clubbed with other coupon codes",
      ],
    },
  });

  await prisma.coupon.upsert({
    where: { code: "WELCOME100" },
    update: {},
    create: {
      code: "WELCOME100",
      description: "Flat ₹100 OFF on your first online booking at Lalganj Salon",
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 100,
      minOrderValue: 499,
      validFrom: new Date("2026-01-01"),
      validUntil: new Date("2027-12-31"),
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "GOLDGLOW20" },
    update: {},
    create: {
      code: "GOLDGLOW20",
      description: "20% OFF on all Luxury Hair Spa & Skin Care treatments",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      minOrderValue: 800,
      maxDiscount: 400,
      validFrom: new Date("2026-01-01"),
      validUntil: new Date("2027-12-31"),
      isActive: true,
    },
  });

  // 9. Videos, Brands & FAQs
  const existingVideo = await prisma.video.findFirst();
  if (!existingVideo) {
    await prisma.video.create({
      data: {
        title: "Royal HD Bridal Glow & Reception Transformation",
        description: "Full bridal makeup, jewellery styling, and hair artistry.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "/images/transformations/trans-2-after.jpg",
        category: "Bridal",
        isFeatured: true,
        sortOrder: 1,
      },
    });
  }

  const existingBrand = await prisma.brand.findFirst();
  if (!existingBrand) {
    await prisma.brand.createMany({
      data: [
        {
          name: "L'Oréal Professionnel",
          category: "Hair Care & Spa",
          description: "Parisian hair spas and ammonia-free colors.",
          isFeatured: true,
          sortOrder: 1,
        },
        {
          name: "MAC Cosmetics",
          category: "Bridal & HD Makeup",
          description: "Studio-finish professional cosmetics.",
          isFeatured: true,
          sortOrder: 2,
        },
        {
          name: "Charlotte Tilbury",
          category: "Luxury Cosmetics",
          description: "Airbrush flawless finish and Hollywood glow.",
          isFeatured: true,
          sortOrder: 3,
        },
      ],
    });
  }

  const existingFaq = await prisma.faq.findFirst();
  if (!existingFaq) {
    await prisma.faq.create({
      data: {
        question: "Where is The Jawed Habib Salon located in Lalganj?",
        answer: "1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121.",
        category: "Location",
        sortOrder: 1,
        isActive: true,
      },
    });
  }

  // 10. Sample Customer User for testing
  const customerPasswordHash = await bcrypt.hash("Customer@123!", 10);
  const demoCustomer = await prisma.user.upsert({
    where: { phone: "9876543210" },
    update: {
      roleId: customerRole?.id,
      roleType: RoleType.CUSTOMER,
    },
    create: {
      name: "Rohan Kumar",
      email: "rohan@example.com",
      phone: "9876543210",
      passwordHash: customerPasswordHash,
      roleId: customerRole?.id,
      roleType: RoleType.CUSTOMER,
    },
  });

  const demoCustomerProfile = await prisma.customerProfile.upsert({
    where: { userId: demoCustomer.id },
    update: {},
    create: {
      userId: demoCustomer.id,
      address: "Lalganj Main Market, Vaishali, Bihar",
      totalVisits: 3,
      totalSpent: 1250,
    },
  });

  // 11. Sample Reviews
  const existingReview = await prisma.review.findFirst({
    where: { customerProfileId: demoCustomerProfile.id },
  });
  if (!existingReview) {
    await prisma.review.create({
      data: {
        customerProfileId: demoCustomerProfile.id,
        rating: 5,
        title: "Best salon in Lalganj without a doubt!",
        comment: "Outstanding experience at The Jawed Habib Salon Lalganj. The staff is polite, hygiene is 10/10, and the haircut was world class. Highly recommended!",
        isApproved: true,
        isFeatured: true,
      },
    });
  }

  // 12. Gallery Images
  const gallerySeedData = [
    {
      title: "Luxury Styling Stations",
      caption: "Spacious ergonomic leather styling stations with warm Champagne Gold lighting.",
      imageUrl: "/images/home/hero-salon-interior.webp",
      category: "Salon Ambience",
      isFeatured: true,
      sortOrder: 1,
    },
    {
      title: "Precision Men's Fade",
      caption: "Master haircut with razor-sharp taper fade and textured crop.",
      imageUrl: "/images/services/mens-haircut.webp",
      category: "Hair Styling",
      isFeatured: true,
      sortOrder: 2,
    },
    {
      title: "Dimensional Caramel Balayage",
      caption: "Seamless hand-painted highlights on virgin dark hair.",
      imageUrl: "/images/services/hair-color.webp",
      category: "Hair Colour",
      isFeatured: true,
      sortOrder: 3,
    },
    {
      title: "Royal HD Bridal Artistry",
      caption: "Flawless matte finish bridal glamour with traditional maang tikka placement.",
      imageUrl: "/images/services/bridal-makeup.webp",
      category: "Bridal",
      isFeatured: true,
      sortOrder: 4,
    },
  ];

  for (const g of gallerySeedData) {
    const existing = await prisma.galleryImage.findFirst({ where: { title: g.title } });
    if (!existing) {
      await prisma.galleryImage.create({ data: g });
    }
  }

  // 13. Transformations
  const existingTrans = await prisma.transformation.findFirst({
    where: { title: "Frizzy to Silk Glass Hair Makeover" },
  });
  if (!existingTrans && createdServices[0]) {
    await prisma.transformation.create({
      data: {
        title: "Frizzy to Silk Glass Hair Makeover",
        description: "Transforming unruly, dry, damaged hair into mirror-like silky hair with Keratin protein infusion.",
        beforeImageUrl: "/images/transformations/keratin-before.webp",
        afterImageUrl: "/images/transformations/keratin-after.webp",
        serviceId: createdServices.find((s) => s.slug === "keratin-protein-treatment")?.id,
        staffId: createdStaffRecords[1]?.id,
        clientGender: GenderTarget.FEMALE,
        isFeatured: true,
        sortOrder: 1,
      },
    });
  }

  // 14. Service Add-ons
  const serviceAddonsList = [
    {
      name: "Airbrush HD Makeup Upgrade",
      slug: "addon_airbrush_hd",
      price: 1500,
      durationMinutes: 20,
      description: "Silicon-based ultra-fine mist airbrush finish for 18-hour sweatproof wear.",
      isPopular: true,
      isActive: true,
    },
    {
      name: "Pre-Bridal Glow Facial & D-Tan",
      slug: "addon_pre_bridal_facial",
      price: 2200,
      durationMinutes: 45,
      description: "Hydrating brightening facial with botanical skin clarifying mask.",
      isPopular: true,
      isActive: true,
    },
    {
      name: "Luxury Designer Saree Draping & Styling",
      slug: "addon_saree_draping",
      price: 800,
      durationMinutes: 25,
      description: "Precision pleating and security pin placement for Banarasi or Kanjeevaram sarees.",
      isPopular: false,
      isActive: true,
    },
    {
      name: "Bridal Nail Extensions & French Artistry",
      slug: "addon_nail_extensions",
      price: 1800,
      durationMinutes: 40,
      description: "Acrylic/gel nail extensions with glitter ombré and Swarovski crystals.",
      isPopular: true,
      isActive: true,
    },
    {
      name: "24K Gold Radiant Foil Boost",
      slug: "addon_gold_radiant_foil",
      price: 1200,
      durationMinutes: 15,
      description: "Pure 24K edible gold leaf infusion for luminous glass-skin radiance.",
      isPopular: false,
      isActive: true,
    },
  ];

  for (const addon of serviceAddonsList) {
    await prisma.serviceAddon.upsert({
      where: { slug: addon.slug },
      update: addon,
      create: addon,
    });
  }

  console.log("✅ Database seeded successfully for The Jawed Habib Salon – Lalganj!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
