import type { SiteConfig } from "../types/site";

export const site: SiteConfig = {
  name: "Kaygia Web",
  nameSuffix: "Web Development Agency",
  founder: {
    firstName: "Samuel",
    lastName: "Antwi",
    position: "Founder & Lead Developer",
    bio: "With a passion for clean code and beautiful design, Samuel founded Kaygia web to help businesses establish meaningful online presences. Combining technical expertise with a keen eye for user experience, Samuel is committed to delivering websites that not only look great but also drive results.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },

  // Company details
  company: {
    name: "Kaygia Web",
    tagline: "Transforming Ideas into Digital Reality",
    email: "admin@kaygia.com",
    supportEmail: "support@kaygia.com",
    phone: "+44 (0) 20 7123 4567",
    address: "123 Web Street, London, EC1A 1BB",
    socials: {
      twitter: "https://twitter.com/kaygiaweb",
      instagram: "https://instagram.com/kaygiaweb",
      linkedin: "https://linkedin.com/company/kaygiaweb",
    },
    businessHours: "Monday - Friday: 9:00 AM - 6:00 PM (GMT)",
  },

  // SEO defaults
  seo: {
    title: "Kaygia Web - Professional Web Development Agency",
    description:
      "Transform your online presence with our expert web development, UI/UX design, and e-commerce solutions. Get a website that drives results.",
    ogImage: "/og.jpg",
  },

  // Navigation
  navigation: {
    main: [
      { name: "Services", href: "/services" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
    footer: {
      services: [
        { name: "Web Development", href: "/services#web-development" },
        { name: "UI/UX Design", href: "/services#ui-ux-design" },
        { name: "E-Commerce", href: "/services#e-commerce" },
        { name: "SEO Services", href: "/services#seo" },
      ],
      company: [
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Client Login", href: "/dashboard" },
      ],
    },
  },
};

export default site;
