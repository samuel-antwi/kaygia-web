import type { SiteConfig } from "../types/site";

export const site: SiteConfig = {
  name: "Kaygia Web",
  nameSuffix: "Web Development Agency",

  // Company details
  company: {
    name: "Kaygia Web",
    tagline: "Transforming Ideas into Digital Reality",
    email: "hello@kaygiaweb.co.uk",
    phone: "+44 (0) 20 7123 4567",
    address: "123 Web Street, London, EC1A 1BB",
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
      "Transform your online presence with our expert web development, UI/UX design, and e-commerce solutions. Get a website that drives results.",
    ogImage: "/og.jpg",
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
        { name: "Web Development", href: "/services#web-development" },
        { name: "UI/UX Design", href: "/services#ui-ux-design" },
        { name: "E-Commerce", href: "/services#e-commerce" },
        { name: "SEO Services", href: "/services#seo" },
      ],
      company: [
        { name: "About", href: "/about" },
        { name: "Portfolio", href: "/portfolio" },
        { name: "Contact", href: "/contact" },
        { name: "Client Login", href: "/dashboard" },
      ],
    },
  },
};

export default site;
