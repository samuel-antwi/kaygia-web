export interface SiteConfig {
  name: string;
  nameSuffix: string;
  company: {
    name: string;
    tagline: string;
    email: string;
    supportEmail: string;
    phone: string;
    address: string;
    socials: {
      twitter: string;
      instagram: string;
      linkedin: string;
    };
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
  navigation: {
    main: Array<{
      name: string;
      href: string;
    }>;
    footer: {
      services: Array<{
        name: string;
        href: string;
      }>;
      company: Array<{
        name: string;
        href: string;
      }>;
    };
  };
}
