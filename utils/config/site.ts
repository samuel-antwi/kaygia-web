export const siteConfig = {
  name: "Kaygia",
  nameSuffix: "Web",

  // Company details
  company: {
    name: "Kaygia Web",
    tagline:
      "Crafting beautiful, functional websites for businesses that want to stand out.",
    email: "contact@kaygiaweb.com",
    phone: "+1 (555) 123-4567",
    address: "123 Web Dev Street, Internet City",
    socials: {
      twitter: "https://twitter.com/kaygiaweb",
      instagram: "https://instagram.com/kaygiaweb",
      linkedin: "https://linkedin.com/company/kaygiaweb",
    },
  },

  // SEO defaults
  seo: {
    title: "Kaygia Web - Professional Web Development Agency",
    description:
      "Kaygia Web is a professional web development agency specializing in custom websites, e-commerce solutions, and digital marketing services.",
    ogImage: "/images/og-image.jpg",
  },

  // Navigation
  navigation: {
    main: [
      { name: "Home", href: "/" },
      { name: "Services", href: "/services" },
      { name: "About", href: "/about" },
      { name: "Portfolio", href: "/portfolio" },
      { name: "Contact", href: "/contact" },
    ],
    footer: {
      services: [
        { name: "Web Development", href: "/services" },
        { name: "UI/UX Design", href: "/services" },
        { name: "E-Commerce", href: "/services" },
        { name: "SEO Optimization", href: "/services" },
      ],
      company: [
        { name: "About Us", href: "/about" },
        { name: "Portfolio", href: "/portfolio" },
        { name: "Contact", href: "/contact" },
        { name: "Privacy Policy", href: "/privacy" },
      ],
    },
  },
};

export type SiteConfig = typeof siteConfig;
