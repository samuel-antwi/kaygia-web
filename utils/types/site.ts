export interface SiteConfig {
  name: string;
  nameSuffix: string;
  founder: {
    firstName: string;
    lastName: string;
    position: string;
    bio: string;
    image: string;
  };
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
    businessHours: string;
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
