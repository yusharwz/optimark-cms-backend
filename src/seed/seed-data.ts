/**
 * Data Seeding Artikel Produksi dari https://optimark.ai/blog
 * Memuat metadata, konten, dan terjemahan dwibahasa (ID & EN).
 */

export interface SeedCategory {
  slug: string;
  slugId?: string;
  slugEn?: string;
  name: string;
  nameId?: string;
  nameEn?: string;
  description: string;
  descriptionId?: string;
  descriptionEn?: string;
  metaTitleId?: string;
  metaTitleEn?: string;
  metaDescriptionId?: string;
  metaDescriptionEn?: string;
  sortOrder: number;
}

export interface SeedPerson {
  slug: string;
  name: string;
  role: string;
  roleId?: string;
  roleEn?: string;
  positionId?: string;
  positionEn?: string;
  bio: string;
  bioId?: string;
  bioEn?: string;
  expertiseId?: string[];
  expertiseEn?: string[];
  experienceId?: Array<{ title: string; org: string; period: string; logo?: string }>;
  experienceEn?: Array<{ title: string; org: string; period: string; logo?: string }>;
  educationId?: Array<{ title: string; org: string; period: string; logo?: string }>;
  educationEn?: Array<{ title: string; org: string; period: string; logo?: string }>;
  avatarUrl: string;
  linkedinUrl: string;
  type: "AUTHOR" | "REVIEWER" | "BOTH";
}

export interface SeedTranslation {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
}

export interface SeedArticle {
  slug: string;
  slugId?: string;
  slugEn?: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  coverImageUrl: string;
  coverImageAlt: string;
  canonicalUrl: string;
  categorySlug: string;
  authorSlug: string;
  reviewerSlug: string;
  tags: string[];
  readMinutes: number;
  publishedAt: string;
  contentUpdatedAt: string | null;
  featured: boolean;
  translations?: {
    id: SeedTranslation;
    en: SeedTranslation;
  };
}

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    slug: "seo",
    slugId: "seo",
    slugEn: "seo",
    name: "SEO",
    nameId: "SEO",
    nameEn: "SEO",
    description: "Strategi optimasi mesin pencari organik, indexing, dan riset keyword",
    descriptionId: "Panduan praktis optimasi mesin pencari untuk bisnis lokal dan UMKM — mulai dari riset keyword, indexing Google, hingga strategi konten yang mendatangkan calon pelanggan organik.",
    descriptionEn: "Practical search engine optimization guides for local businesses and SMBs — from keyword research and Google indexing to organic traffic strategies.",
    metaTitleId: "Artikel & Panduan SEO | Optimark",
    metaTitleEn: "SEO Articles & Guides | Optimark",
    metaDescriptionId: "Kumpulan panduan praktis SEO, riset keyword, dan optimasi Google Search Console untuk bisnis kecil dan UMKM.",
    metaDescriptionEn: "Practical SEO guides, keyword research, and Google Search Console optimization for small businesses.",
    sortOrder: 1,
  },
  {
    slug: "content-marketing",
    slugId: "content-marketing",
    slugEn: "content-marketing",
    name: "Content Marketing",
    nameId: "Content Marketing",
    nameEn: "Content Marketing",
    description: "Strategi pembuatan konten digital, pilar konten, dan repurpose artikel",
    descriptionId: "Pelajari cara menyusun strategi konten yang konsisten — mulai dari content pillar, repurpose materi, hingga mendistribusikan pesan brand ke berbagai kanal.",
    descriptionEn: "Learn how to build consistent content strategies — from content pillars to repurposing and multi-channel brand distribution.",
    metaTitleId: "Artikel & Panduan Content Marketing | Optimark",
    metaTitleEn: "Content Marketing Articles & Guides | Optimark",
    metaDescriptionId: "Panduan content marketing, content pillar, dan strategi repurpose konten untuk memperkuat kehadiran digital bisnis Anda.",
    metaDescriptionEn: "Content marketing guides, content pillars, and repurposing strategies to strengthen your digital presence.",
    sortOrder: 2,
  },
  {
    slug: "social-media",
    slugId: "media-sosial",
    slugEn: "social-media",
    name: "Social Media",
    nameId: "Media Sosial",
    nameEn: "Social Media",
    description: "Optimasi media sosial Instagram, TikTok, jadwal posting dan engagement",
    descriptionId: "Tips mengelola Instagram, TikTok, dan kanal sosial lainnya — dari jadwal posting, penulisan caption yang engaging, hingga membaca insight akun bisnis.",
    descriptionEn: "Tips for managing Instagram, TikTok, and other channels — from posting schedules and engaging captions to business analytics.",
    metaTitleId: "Artikel & Panduan Media Sosial | Optimark",
    metaTitleEn: "Social Media Articles & Guides | Optimark",
    metaDescriptionId: "Kumpulan tips praktis media sosial untuk UMKM: strategi posting, optimasi caption, dan analisis engagement.",
    metaDescriptionEn: "Practical social media tips for small businesses: posting strategies, captions, and engagement analysis.",
    sortOrder: 3,
  },
  {
    slug: "visual-content",
    slugId: "konten-visual",
    slugEn: "visual-content",
    name: "Visual Content",
    nameId: "Konten Visual",
    nameEn: "Visual Content",
    description: "Foto produk AI, estetika feed brand, dan video promosi singkat",
    descriptionId: "Eksplorasi teknik visual untuk brand kecil: foto produk smartphone berbantuan AI, estetika feed, hingga pembuatan video promosi tanpa tim produksi besar.",
    descriptionEn: "Explore visual techniques for small brands: AI-assisted smartphone product photography, feed aesthetics, and video production without big crews.",
    metaTitleId: "Artikel & Panduan Konten Visual | Optimark",
    metaTitleEn: "Visual Content Articles & Guides | Optimark",
    metaDescriptionId: "Panduan membuat visual promosi, foto produk AI, dan video pendek menarik dengan modal smartphone untuk bisnis kecil.",
    metaDescriptionEn: "Guides for creating promotional visuals, AI product photography, and engaging short videos on a smartphone budget.",
    sortOrder: 4,
  },
];

export const SEED_PEOPLE: SeedPerson[] = [
  {
    slug: "jonathan-anderson",
    name: "Jonathan Anderson T.",
    role: "SEO Lead & Editorial Reviewer",
    roleId: "SEO Lead & Editorial Reviewer",
    roleEn: "SEO Lead & Editorial Reviewer",
    positionId: "SEO Lead & Editorial Reviewer",
    positionEn: "SEO Lead & Editorial Reviewer",
    bio: "Jonathan Anderson adalah SEO Lead dan Editorial Reviewer di Optimark yang berfokus pada strategi SEO, content strategy, dan perkembangan AI-driven search. Ia memiliki pengalaman dalam mengembangkan strategi organic search, technical SEO, content marketing, serta optimasi konten untuk meningkatkan visibilitas dan relevansi website di mesin pencari.\n\nSebagai Editorial Reviewer, ia bertanggung jawab meninjau dan mengevaluasi konten Optimark sebelum dipublikasikan. Proses review mencakup search intent, struktur dan kualitas konten, topical relevance, on-page SEO, serta penerapan strategi AEO dan GEO untuk menyesuaikan konten dengan perkembangan pencarian berbasis AI.\n\nDalam menjalankan perannya, ia menggabungkan pendekatan SEO dengan pemahaman terhadap kebutuhan pengguna dan kualitas informasi. Fokusnya adalah memastikan setiap konten yang diterbitkan Optimark memiliki informasi yang akurat, relevan, terstruktur dengan baik, dan memberikan nilai nyata bagi pembaca.",
    bioId: "Jonathan Anderson adalah SEO Lead dan Editorial Reviewer di Optimark yang berfokus pada strategi SEO, content strategy, dan perkembangan AI-driven search. Ia memiliki pengalaman dalam mengembangkan strategi organic search, technical SEO, content marketing, serta optimasi konten untuk meningkatkan visibilitas dan relevansi website di mesin pencari.\n\nSebagai Editorial Reviewer, ia bertanggung jawab meninjau dan mengevaluasi konten Optimark sebelum dipublikasikan. Proses review mencakup search intent, struktur dan kualitas konten, topical relevance, on-page SEO, serta penerapan strategi AEO dan GEO untuk menyesuaikan konten dengan perkembangan pencarian berbasis AI.\n\nDalam menjalankan perannya, ia menggabungkan pendekatan SEO dengan pemahaman terhadap kebutuhan pengguna dan kualitas informasi. Fokusnya adalah memastikan setiap konten yang diterbitkan Optimark memiliki informasi yang akurat, relevan, terstruktur dengan baik, dan memberikan nilai nyata bagi pembaca.",
    bioEn: "Jonathan Anderson is the SEO Lead and Editorial Reviewer at Optimark, focusing on organic search strategy, content architecture, and the evolution of AI-driven search engines (AEO and GEO). With extensive hands-on experience in technical SEO, keyword taxonomy, and content evaluation, he ensures that every guide published meets strict standards for search intent, factual depth, and actionable clarity.",
    expertiseId: [
      "SEO",
      "Technical SEO",
      "Content Strategy",
      "Content Marketing",
      "AEO",
      "GEO",
      "AI SEO",
      "On-Page SEO",
      "International SEO",
      "Local SEO",
      "Digital Marketing",
    ],
    expertiseEn: [
      "SEO",
      "Technical SEO",
      "Content Strategy",
      "Content Marketing",
      "AEO",
      "GEO",
      "AI SEO",
      "On-Page SEO",
      "International SEO",
      "Local SEO",
      "Digital Marketing",
    ],
    experienceId: [
      {
        title: "SEO Lead",
        org: "PT Usaha Kreatif Indonesia",
        period: "2025 - Saat ini",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/usaha-kreatif.webp",
      },
      {
        title: "Digital Client Solutions Manager",
        org: "PT Sribu Digital Kreatif",
        period: "2023 - 2025",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/sribu.webp",
      },
      {
        title: "SEO Specialist",
        org: "MNC Group",
        period: "2021 - 2023",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/mnc-group.webp",
      },
      {
        title: "Lead Marketing",
        org: "PT. Citra Jasa Andalan",
        period: "2019 - 2020",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/pt-citra-jasa-andalan.webp",
      },
    ],
    experienceEn: [
      {
        title: "SEO Lead",
        org: "PT Usaha Kreatif Indonesia",
        period: "2025 - Present",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/pt-usaha-kreatif-indonesia.webp",
      },
      {
        title: "Digital Client Solutions Manager",
        org: "PT Sribu Digital Kreatif",
        period: "2023 - 2025",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/pt-sribu-digital-kreatif.webp",
      },
      {
        title: "SEO Specialist",
        org: "MNC Group",
        period: "2021 - 2023",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/mnc-group.webp",
      },
      {
        title: "Lead Marketing",
        org: "PT. Citra Jasa Andalan",
        period: "2019 - 2020",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/pt-citra-jasa-andalan.webp",
      },
    ],
    educationId: [
      {
        title: "Bachelor’s in Management",
        org: "Sanata Dharma University",
        period: "2015 - 2019",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/sanata-dharma-university.webp",
      },
      {
        title: "Digital Marketing (SEO Specialist)",
        org: "Purwadhika Digital Technology School",
        period: "",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/digital-marketing-(seo-spesialist).webp",
      },
    ],
    educationEn: [
      {
        title: "Bachelor’s in Management",
        org: "Sanata Dharma University",
        period: "2015 - 2019",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/sanata-dharma-university.webp",
      },
      {
        title: "Digital Marketing (SEO Specialist)",
        org: "Purwadhika Digital Technology School",
        period: "",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/digital-marketing-(seo-spesialist).webp",
      },
    ],
    avatarUrl: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/jonathan-anderson.webp",
    linkedinUrl: "https://www.linkedin.com/in/jonathan-anderson-tjitrabudi",
    type: "REVIEWER",
  },
  {
    slug: "rafi-rizky",
    name: "Rafi Rizky",
    role: "SEO & Content Marketing Specialist",
    roleId: "SEO & Content Marketing Specialist",
    roleEn: "SEO & Content Marketing Specialist",
    positionId: "SEO & Content Marketing Specialist",
    positionEn: "SEO & Content Marketing Specialist",
    bio: "Rafi Rizky adalah digital marketing specialist yang berfokus pada SEO dan Content Marketing. Ia memiliki pengalaman dalam mengembangkan strategi konten berbasis search intent, optimasi SEO, serta pembuatan konten yang informatif dan relevan bagi audiens. Di Optimark, Rafi berkontribusi dalam pengembangan konten SEO dan strategi content marketing untuk meningkatkan visibilitas organik serta membangun topical relevance.",
    bioId: "Rafi Rizky adalah digital marketing specialist yang berfokus pada SEO dan Content Marketing. Ia memiliki pengalaman dalam mengembangkan strategi konten berbasis search intent, optimasi SEO, serta pembuatan konten yang informatif dan relevan bagi audiens. Di Optimark, Rafi berkontribusi dalam pengembangan konten SEO dan strategi content marketing untuk meningkatkan visibilitas organik serta membangun topical relevance.",
    bioEn: "Rafi Rizky is a digital marketing specialist focusing on SEO and Content Marketing. He has hands-on experience in search intent keyword strategies, technical SEO optimization, and creating highly relevant educational guides. At Optimark, Rafi leads organic content development to establish topical relevance and drive qualified traffic for local businesses.",
    expertiseId: [
      "SEO",
      "Content Marketing",
      "Keyword Research",
      "Search Intent",
      "Content Strategy",
    ],
    expertiseEn: [
      "SEO",
      "Content Marketing",
      "Keyword Research",
      "Search Intent",
      "Content Strategy",
    ],
    experienceId: [
      {
        title: "SEO & Content Specialist",
        org: "Optimark",
        period: "2024 - Saat ini",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/usaha-kreatif.webp",
      },
    ],
    experienceEn: [
      {
        title: "SEO & Content Specialist",
        org: "Optimark",
        period: "2024 - Present",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/usaha-kreatif.webp",
      },
    ],
    educationId: [],
    educationEn: [],
    avatarUrl: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/rafi-rizky.webp",
    linkedinUrl: "https://www.linkedin.com/in/rafirizky",
    type: "AUTHOR",
  },
  {
    slug: "thia-rahmani",
    name: "Thia Rahmani",
    role: "Social Media & Visual Content Specialist",
    roleId: "Social Media & Visual Content Specialist",
    roleEn: "Social Media & Visual Content Specialist",
    positionId: "Social Media & Visual Content Specialist",
    positionEn: "Social Media & Visual Content Specialist",
    bio: "Thia Rahmani adalah digital marketing specialist yang berfokus pada Social Media Marketing dan Visual Content. Ia memiliki pengalaman dalam mengembangkan ide konten, menyusun strategi media sosial, serta membuat materi visual yang relevan dengan kebutuhan brand dan audiens. Di Optimark, Thia berkontribusi dalam pengembangan konten digital, social media, dan visual marketing untuk membantu bisnis menyampaikan pesan secara lebih menarik dan konsisten.",
    bioId: "Thia Rahmani adalah digital marketing specialist yang berfokus pada Social Media Marketing dan Visual Content. Ia memiliki pengalaman dalam mengembangkan ide konten, menyusun strategi media sosial, serta membuat materi visual yang relevan dengan kebutuhan brand dan audiens. Di Optimark, Thia berkontribusi dalam pengembangan konten digital, social media, dan visual marketing untuk membantu bisnis menyampaikan pesan secara lebih menarik dan konsisten.",
    bioEn: "Thia Rahmani is a social media and visual content strategist. She specializes in content pillars, cross-platform distribution (Instagram, TikTok), and AI visual creation for emerging brands. At Optimark, Thia designs frameworks that turn complex marketing workflows into visual assets that convert.",
    expertiseId: [
      "Social Media Marketing",
      "Content Planning",
      "Visual Content",
      "Digital Marketing",
    ],
    expertiseEn: [
      "Social Media Marketing",
      "Content Planning",
      "Visual Content",
      "Digital Marketing",
    ],
    experienceId: [
      {
        title: "Social Media Specialist",
        org: "Optimark",
        period: "2024 - Saat ini",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/usaha-kreatif.webp",
      },
    ],
    experienceEn: [
      {
        title: "Social Media Specialist",
        org: "Optimark",
        period: "2024 - Present",
        logo: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/logos/usaha-kreatif.webp",
      },
    ],
    educationId: [],
    educationEn: [],
    avatarUrl: "https://optimark-staging-media.dritech.co.id/optimark/blog/people/thia-rahmani.webp",
    linkedinUrl: "https://www.linkedin.com/in/thiarahmani",
    type: "AUTHOR",
  },
];

export const SEED_ARTICLES: SeedArticle[] = [
  {
    "slug": "riset-keyword-bisnis-lokal",
    "slugId": "riset-keyword-bisnis-lokal",
    "slugEn": "how-to-research-keywords-local-business",
    "categorySlug": "seo",
    "publishedAt": "2026-10-01T00:00:00.000Z",
    "contentUpdatedAt": "2026-10-02T00:00:00.000Z",
    "readMinutes": 6,
    "coverImageUrl": "https://optimark-staging-media.dritech.co.id/optimark/blog/riset-keyword-bisnis-lokal.webp",
    "tags": [
      "riset-keyword",
      "seo-lokal",
      "umkm",
      "google-autocomplete"
    ],
    "authorSlug": "rafi-rizky",
    "reviewerSlug": "jonathan-anderson",
    "featured": true,
    "title": "Cara Riset Keyword untuk Bisnis Lokal Tanpa Tools Berbayar",
    "excerpt": "Kata kunci yang dicari pelanggan di sekitar Anda bisa ditemukan dari Google sendiri, tanpa langganan tools SEO.",
    "metaTitle": "Cara Riset Keyword untuk Bisnis Lokal Tanpa Tools Berbayar - Blog OPTIMARK",
    "metaDescription": "Kata kunci yang dicari pelanggan di sekitar Anda bisa ditemukan dari Google sendiri, tanpa langganan tools SEO.",
    "coverImageAlt": "Pemilik toko roti sedang riset keyword di laptop",
    "canonicalUrl": "https://optimark.ai/blog/riset-keyword-bisnis-lokal",
    "content": "Riset keyword adalah langkah awal penting sebelum membuat konten digital. Meskipun ada banyak tool berbayar, Anda tetap bisa memulai riset keyword untuk bisnis lokal dengan cara manual yang efektif. Artikel ini membahas cara memulai riset keyword tanpa biaya tambahan, mulai dari memahami kebutuhan bisnis, mencari kata kunci relevan, hingga menentukan prioritas konten yang tepat.\n\n## 1. Pahami kebutuhan bisnis Anda\n\nSebelum mencari keyword, kenali dulu siapa target audiens Anda dan apa yang mereka cari. Bisnis lokal seperti toko makanan, jasa servis, atau klinik kecantikan memiliki kebutuhan yang berbeda-beda. Misalnya, jika Anda memiliki toko makanan di Jakarta Selatan, target Anda mungkin orang-orang yang mencari “restoran dekat sini” atau “menu makan siang murah”.\n\nSebelum lanjut, jawab tiga pertanyaan ini:\n\n- Siapa pelanggan utama Anda dan di area mana mereka berada?\n- Masalah apa yang ingin mereka selesaikan?\n- Kata apa yang mereka pakai saat bertanya ke teman atau di media sosial?\n\n## 2. Gunakan Google Autocomplete\n\nKetikkan kata kunci utama Anda di Google, lalu lihat saran yang muncul. Fitur autocomplete ini menunjukkan apa yang paling sering dicari orang. Contohnya, jika Anda mengetik “cuci ac”, Google mungkin menyarankan “cuci ac jakarta”, “cuci ac bandung”, atau “cuci ac murah”. Ini membantu Anda menemukan long-tail keyword yang spesifik dan memiliki kompetisi lebih rendah.\n\n### Catat pola yang muncul\n\nSalin setiap saran ke spreadsheet sederhana, lalu kelompokkan berdasarkan lokasi, harga, atau jenis layanan. Pola yang paling sering muncul adalah topik yang paling layak dibuatkan konten.\n\n![Kelompokkan saran autocomplete berdasarkan pola supaya prioritas kontennya terlihat.](/images/blog/artikel-jadi-konten-media-sosial.jpg)\n\n### Bandingkan dengan Google Trends\n\nUntuk membandingkan dua keyword, buka [Google Trends](https://trends.google.com/trends/?geo=ID) dan pilih wilayah Indonesia. Anda bisa melihat keyword mana yang lebih sering dicari dan kapan minatnya naik.\n\n## 3. Analisis kompetitor\n\nLihat website kompetitor Anda. Perhatikan judul halaman, deskripsi meta, dan subjudul mereka. Ini memberikan gambaran tentang keyword apa yang mereka targetkan. Jangan lupa untuk mencatat juga kekurangan konten mereka, sehingga Anda bisa membuat konten yang lebih lengkap dan relevan.\n\nLakukan tiga langkah ini untuk setiap keyword utama:\n\n1. Cari keyword utama Anda di Google dan buka tiga hasil teratas.\n2. Catat judul, deskripsi meta, dan subjudul di setiap halaman.\n3. Tandai topik yang belum mereka bahas, lalu jadikan bahan konten Anda.\n\n## 4. Prioritaskan keyword lokal\n\nJika bisnis Anda berfokus pada area tertentu, pastikan untuk menyertakan nama kota atau wilayah. Misalnya, “jasa fotocopy jakarta timur” atau “kursus memasak bogor”. Keyword lokal memiliki volume pencarian yang lebih kecil, tapi konversinya lebih tinggi karena orang yang mencari biasanya sudah siap untuk melakukan aksi.\n\n> Keyword lokal memang jarang dicari, tapi orang yang mengetiknya biasanya sudah siap datang ke toko Anda.\n> — *Jonathan Anderson T., SEO Lead & Editorial Reviewer*\n\nKalau website Anda belum juga muncul di hasil pencarian, cek penyebabnya di artikel [kenapa website belum muncul di halaman pertama Google](/blog/website-belum-muncul-di-google).\n\n## Penutup\n\nRiset keyword tanpa tools berbayar memang membutuhkan waktu lebih lama, tapi hasilnya sangat berharga. Dengan memahami kebutuhan audiens dan menggunakan sumber daya gratis seperti Google, Anda bisa membuat konten yang relevan dan meningkatkan visibilitas bisnis lokal Anda di mesin pencari.",
    "translations": {
      "id": {
        "slug": "riset-keyword-bisnis-lokal",
        "title": "Cara Riset Keyword untuk Bisnis Lokal Tanpa Tools Berbayar",
        "excerpt": "Kata kunci yang dicari pelanggan di sekitar Anda bisa ditemukan dari Google sendiri, tanpa langganan tools SEO.",
        "content": "Riset keyword adalah langkah awal penting sebelum membuat konten digital. Meskipun ada banyak tool berbayar, Anda tetap bisa memulai riset keyword untuk bisnis lokal dengan cara manual yang efektif. Artikel ini membahas cara memulai riset keyword tanpa biaya tambahan, mulai dari memahami kebutuhan bisnis, mencari kata kunci relevan, hingga menentukan prioritas konten yang tepat.\n\n## 1. Pahami kebutuhan bisnis Anda\n\nSebelum mencari keyword, kenali dulu siapa target audiens Anda dan apa yang mereka cari. Bisnis lokal seperti toko makanan, jasa servis, atau klinik kecantikan memiliki kebutuhan yang berbeda-beda. Misalnya, jika Anda memiliki toko makanan di Jakarta Selatan, target Anda mungkin orang-orang yang mencari “restoran dekat sini” atau “menu makan siang murah”.\n\nSebelum lanjut, jawab tiga pertanyaan ini:\n\n- Siapa pelanggan utama Anda dan di area mana mereka berada?\n- Masalah apa yang ingin mereka selesaikan?\n- Kata apa yang mereka pakai saat bertanya ke teman atau di media sosial?\n\n## 2. Gunakan Google Autocomplete\n\nKetikkan kata kunci utama Anda di Google, lalu lihat saran yang muncul. Fitur autocomplete ini menunjukkan apa yang paling sering dicari orang. Contohnya, jika Anda mengetik “cuci ac”, Google mungkin menyarankan “cuci ac jakarta”, “cuci ac bandung”, atau “cuci ac murah”. Ini membantu Anda menemukan long-tail keyword yang spesifik dan memiliki kompetisi lebih rendah.\n\n### Catat pola yang muncul\n\nSalin setiap saran ke spreadsheet sederhana, lalu kelompokkan berdasarkan lokasi, harga, atau jenis layanan. Pola yang paling sering muncul adalah topik yang paling layak dibuatkan konten.\n\n![Kelompokkan saran autocomplete berdasarkan pola supaya prioritas kontennya terlihat.](/images/blog/artikel-jadi-konten-media-sosial.jpg)\n\n### Bandingkan dengan Google Trends\n\nUntuk membandingkan dua keyword, buka [Google Trends](https://trends.google.com/trends/?geo=ID) dan pilih wilayah Indonesia. Anda bisa melihat keyword mana yang lebih sering dicari dan kapan minatnya naik.\n\n## 3. Analisis kompetitor\n\nLihat website kompetitor Anda. Perhatikan judul halaman, deskripsi meta, dan subjudul mereka. Ini memberikan gambaran tentang keyword apa yang mereka targetkan. Jangan lupa untuk mencatat juga kekurangan konten mereka, sehingga Anda bisa membuat konten yang lebih lengkap dan relevan.\n\nLakukan tiga langkah ini untuk setiap keyword utama:\n\n1. Cari keyword utama Anda di Google dan buka tiga hasil teratas.\n2. Catat judul, deskripsi meta, dan subjudul di setiap halaman.\n3. Tandai topik yang belum mereka bahas, lalu jadikan bahan konten Anda.\n\n## 4. Prioritaskan keyword lokal\n\nJika bisnis Anda berfokus pada area tertentu, pastikan untuk menyertakan nama kota atau wilayah. Misalnya, “jasa fotocopy jakarta timur” atau “kursus memasak bogor”. Keyword lokal memiliki volume pencarian yang lebih kecil, tapi konversinya lebih tinggi karena orang yang mencari biasanya sudah siap untuk melakukan aksi.\n\n> Keyword lokal memang jarang dicari, tapi orang yang mengetiknya biasanya sudah siap datang ke toko Anda.\n> — *Jonathan Anderson T., SEO Lead & Editorial Reviewer*\n\nKalau website Anda belum juga muncul di hasil pencarian, cek penyebabnya di artikel [kenapa website belum muncul di halaman pertama Google](/blog/website-belum-muncul-di-google).\n\n## Penutup\n\nRiset keyword tanpa tools berbayar memang membutuhkan waktu lebih lama, tapi hasilnya sangat berharga. Dengan memahami kebutuhan audiens dan menggunakan sumber daya gratis seperti Google, Anda bisa membuat konten yang relevan dan meningkatkan visibilitas bisnis lokal Anda di mesin pencari.",
        "metaTitle": "Cara Riset Keyword untuk Bisnis Lokal Tanpa Tools Berbayar - Blog OPTIMARK",
        "metaDescription": "Kata kunci yang dicari pelanggan di sekitar Anda bisa ditemukan dari Google sendiri, tanpa langganan tools SEO."
      },
      "en": {
        "slug": "how-to-research-keywords-local-business",
        "title": "How to Research Keywords for a Local Business Without Paid Tools",
        "excerpt": "The phrases nearby customers search for can be found in Google itself, no SEO tool subscription needed.",
        "content": "Keyword research is an essential first step before creating digital content. Paid tools are plentiful, but you can still start keyword research for a local business with an effective manual approach. This article covers how to research keywords at no extra cost, from understanding your business needs and finding relevant keywords to deciding which content to prioritise.\n\n## 1. Understand your business needs\n\nBefore looking for keywords, get to know your target audience and what they are searching for. Local businesses such as food shops, repair services, or beauty clinics all have different needs. For example, if you run a food shop in South Jakarta, your audience may be people searching for “restaurants near me” or “cheap lunch menu”.\n\nBefore going further, answer these three questions:\n\n- Who are your main customers, and where are they?\n- What problem are they trying to solve?\n- What words do they use when asking friends or posting on social media?\n\n## 2. Use Google Autocomplete\n\nType your main keyword into Google and look at the suggestions that appear. Autocomplete shows what people search for most often. For example, if you type “ac cleaning”, Google might suggest “ac cleaning jakarta”, “ac cleaning bandung”, or “cheap ac cleaning”. This helps you find specific long-tail keywords with lower competition.\n\n### Note the patterns that appear\n\nCopy every suggestion into a simple spreadsheet, then group them by location, price, or service type. The patterns that show up most often are the topics most worth writing about.\n\n![Group autocomplete suggestions by pattern so your content priorities become clear.](/images/blog/artikel-jadi-konten-media-sosial.jpg)\n\n### Compare with Google Trends\n\nTo compare two keywords, open [Google Trends](https://trends.google.com/trends/?geo=ID) and choose Indonesia as the region. You can see which keyword is searched more often and when interest rises.\n\n## 3. Analyse your competitors\n\nLook at your competitors’ websites. Pay attention to their page titles, meta descriptions, and subheadings. This shows you which keywords they are targeting. Also note the gaps in their content, so you can write something more complete and relevant.\n\nFollow these three steps for each main keyword:\n\n1. Search for your main keyword on Google and open the top three results.\n2. Note the title, meta description, and subheadings on each page.\n3. Mark the topics they have not covered, and turn them into your content.\n\n## 4. Prioritise local keywords\n\nIf your business focuses on a specific area, make sure to include the city or district name. For example, “photocopy service east jakarta” or “cooking class bogor”. Local keywords have smaller search volumes, but they convert better because people searching for them are usually ready to act.\n\n> Local keywords may not be searched often, but the people typing them are usually ready to walk into your shop.\n> — *Jonathan Anderson T., SEO Lead & Editorial Reviewer*\n\nIf your website still isn’t showing up in search results, find out why in [why your website isn’t on Google’s first page yet](/blog/website-belum-muncul-di-google).\n\n## Conclusion\n\nKeyword research without paid tools takes longer, but the results are well worth it. By understanding your audience and using free resources like Google, you can create relevant content and improve your local business’s visibility in search engines.",
        "metaTitle": "How to Research Keywords for a Local Business Without Paid Tools - OPTIMARK Blog",
        "metaDescription": "The phrases nearby customers search for can be found in Google itself, no SEO tool subscription needed."
      }
    }
  },
  {
    "slug": "jadwal-posting-instagram-umkm-kuliner",
    "slugId": "jadwal-posting-instagram-umkm-kuliner",
    "slugEn": "best-instagram-posting-schedule-food-smb",
    "categorySlug": "social-media",
    "publishedAt": "2026-09-29T00:00:00.000Z",
    "contentUpdatedAt": null,
    "readMinutes": 4,
    "coverImageUrl": "https://optimark-staging-media.dritech.co.id/optimark/blog/jadwal-posting-instagram-umkm-kuliner.webp",
    "tags": [
      "instagram",
      "umkm-kuliner",
      "jadwal-posting"
    ],
    "authorSlug": "thia-rahmani",
    "reviewerSlug": "jonathan-anderson",
    "featured": true,
    "title": "Jadwal Posting Instagram Terbaik untuk UMKM Kuliner di Tahun 2026",
    "excerpt": "Jam posting terbaik bukan angka universal. Untuk bisnis kuliner, jam lapar pelanggan Anda adalah patokannya.",
    "metaTitle": "Jadwal Posting Instagram Terbaik untuk UMKM Kuliner di Tahun 2026 - Blog OPTIMARK",
    "metaDescription": "Jam posting terbaik bukan angka universal. Untuk bisnis kuliner, jam lapar pelanggan Anda adalah patokannya.",
    "coverImageAlt": "Pemilik warung makan memotret hidangan dengan ponsel untuk Instagram",
    "canonicalUrl": "https://optimark.ai/blog/jadwal-posting-instagram-umkm-kuliner",
    "content": "Artikel “jam terbaik posting Instagram” biasanya memberi satu angka untuk semua bisnis. Untuk kuliner, patokan yang lebih jujur adalah kapan pelanggan Anda mulai memikirkan makanan.\n\n## Ikuti jam makan, bukan jam kantor\n\nPosting 30–60 menit sebelum jam makan siang dan makan malam memberi waktu orang melihat, lalu memesan. Cek Insight akun Anda untuk memastikan polanya.\n\n- Uji slot 10.30–11.30 dan 16.30–17.30 selama dua minggu\n- Bandingkan jangkauan per slot di Instagram Insight\n- Simpan Reels menu baru untuk akhir pekan\n- Posting promo sehari sebelum hari gajian\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
    "translations": {
      "id": {
        "slug": "jadwal-posting-instagram-umkm-kuliner",
        "title": "Jadwal Posting Instagram Terbaik untuk UMKM Kuliner di Tahun 2026",
        "excerpt": "Jam posting terbaik bukan angka universal. Untuk bisnis kuliner, jam lapar pelanggan Anda adalah patokannya.",
        "content": "Artikel “jam terbaik posting Instagram” biasanya memberi satu angka untuk semua bisnis. Untuk kuliner, patokan yang lebih jujur adalah kapan pelanggan Anda mulai memikirkan makanan.\n\n## Ikuti jam makan, bukan jam kantor\n\nPosting 30–60 menit sebelum jam makan siang dan makan malam memberi waktu orang melihat, lalu memesan. Cek Insight akun Anda untuk memastikan polanya.\n\n- Uji slot 10.30–11.30 dan 16.30–17.30 selama dua minggu\n- Bandingkan jangkauan per slot di Instagram Insight\n- Simpan Reels menu baru untuk akhir pekan\n- Posting promo sehari sebelum hari gajian\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
        "metaTitle": "Jadwal Posting Instagram Terbaik untuk UMKM Kuliner di Tahun 2026 - Blog OPTIMARK",
        "metaDescription": "Jam posting terbaik bukan angka universal. Untuk bisnis kuliner, jam lapar pelanggan Anda adalah patokannya."
      },
      "en": {
        "slug": "best-instagram-posting-schedule-food-smb",
        "title": "The Best Instagram Posting Schedule for Food Businesses in 2026",
        "excerpt": "There is no universal best time to post. For food businesses, your customers’ hungry hours are the benchmark.",
        "content": "“Best time to post on Instagram” articles usually give one number for every business. For food, a more honest benchmark is when your customers start thinking about their next meal.\n\n## Follow meal times, not office hours\n\nPosting 30–60 minutes before lunch and dinner gives people time to see the post, then order. Check your account Insights to confirm the pattern.\n\n- Test the 10:30–11:30 and 16:30–17:30 slots for two weeks\n- Compare reach per slot in Instagram Insights\n- Save new-menu Reels for the weekend\n- Post promotions the day before payday\n\n> **Note:** This is a sample article used to review the blog layout. Replace it with real writing before the site goes live.",
        "metaTitle": "The Best Instagram Posting Schedule for Food Businesses in 2026 - OPTIMARK Blog",
        "metaDescription": "There is no universal best time to post. For food businesses, your customers’ hungry hours are the benchmark."
      }
    }
  },
  {
    "slug": "foto-produk-ai-smartphone",
    "slugId": "foto-produk-ai-smartphone",
    "slugEn": "smartphone-ai-product-photography-guide",
    "categorySlug": "visual-content",
    "publishedAt": "2026-09-26T00:00:00.000Z",
    "contentUpdatedAt": null,
    "readMinutes": 5,
    "coverImageUrl": "https://optimark-staging-media.dritech.co.id/optimark/blog/foto-produk-ai-smartphone.webp",
    "tags": [
      "foto-produk",
      "ai",
      "smartphone"
    ],
    "authorSlug": "thia-rahmani",
    "reviewerSlug": "jonathan-anderson",
    "featured": false,
    "title": "Panduan Membuat Foto Produk Menarik Pakai AI dari Smartphone",
    "excerpt": "Foto dari smartphone plus sedikit bantuan AI sudah cukup untuk katalog yang rapi, asalkan bahan awalnya benar.",
    "metaTitle": "Panduan Membuat Foto Produk Menarik Pakai AI dari Smartphone - Blog OPTIMARK",
    "metaDescription": "Foto dari smartphone plus sedikit bantuan AI sudah cukup untuk katalog yang rapi, asalkan bahan awalnya benar.",
    "coverImageAlt": "Memotret produk serum di atas meja kayu dengan smartphone",
    "canonicalUrl": "https://optimark.ai/blog/foto-produk-ai-smartphone",
    "content": "AI bisa membersihkan latar, merapikan cahaya, dan membuat variasi suasana. Tapi hasilnya hanya sebaik foto awal yang Anda ambil dengan smartphone.\n\n## Ambil foto awal yang bersih\n\nGunakan cahaya jendela dari samping, latar polos, dan posisi kamera sejajar produk. Foto yang tajam dan terang memberi AI bahan yang cukup untuk diolah.\n\n- Foto di dekat jendela, hindari lampu kuning\n- Bersihkan lensa sebelum memotret\n- Ambil beberapa sudut untuk setiap produk\n- Gunakan AI untuk latar dan variasi, bukan untuk mengubah bentuk produk\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
    "translations": {
      "id": {
        "slug": "foto-produk-ai-smartphone",
        "title": "Panduan Membuat Foto Produk Menarik Pakai AI dari Smartphone",
        "excerpt": "Foto dari smartphone plus sedikit bantuan AI sudah cukup untuk katalog yang rapi, asalkan bahan awalnya benar.",
        "content": "AI bisa membersihkan latar, merapikan cahaya, dan membuat variasi suasana. Tapi hasilnya hanya sebaik foto awal yang Anda ambil dengan smartphone.\n\n## Ambil foto awal yang bersih\n\nGunakan cahaya jendela dari samping, latar polos, dan posisi kamera sejajar produk. Foto yang tajam dan terang memberi AI bahan yang cukup untuk diolah.\n\n- Foto di dekat jendela, hindari lampu kuning\n- Bersihkan lensa sebelum memotret\n- Ambil beberapa sudut untuk setiap produk\n- Gunakan AI untuk latar dan variasi, bukan untuk mengubah bentuk produk\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
        "metaTitle": "Panduan Membuat Foto Produk Menarik Pakai AI dari Smartphone - Blog OPTIMARK",
        "metaDescription": "Foto dari smartphone plus sedikit bantuan AI sudah cukup untuk katalog yang rapi, asalkan bahan awalnya benar."
      },
      "en": {
        "slug": "smartphone-ai-product-photography-guide",
        "title": "A Guide to Attractive Product Photos Using AI and a Smartphone",
        "excerpt": "Smartphone photos plus a little AI help are enough for a clean catalogue, as long as the source shot is right.",
        "content": "AI can clean up backgrounds, fix lighting, and create mood variations. But the result is only as good as the source photo you take on your phone.\n\n## Take a clean source photo\n\nUse side light from a window, a plain background, and a camera level with the product. A sharp, bright photo gives the AI enough to work with.\n\n- Shoot near a window and avoid warm indoor bulbs\n- Wipe the lens before shooting\n- Take several angles of each product\n- Use AI for backgrounds and variations, not to change the product itself\n\n> **Note:** This is a sample article used to review the blog layout. Replace it with real writing before the site goes live.",
        "metaTitle": "A Guide to Attractive Product Photos Using AI and a Smartphone - OPTIMARK Blog",
        "metaDescription": "Smartphone photos plus a little AI help are enough for a clean catalogue, as long as the source shot is right."
      }
    }
  },
  {
    "slug": "strategi-content-pillar",
    "slugId": "strategi-content-pillar",
    "slugEn": "content-pillar-strategy-small-brands",
    "categorySlug": "content-marketing",
    "publishedAt": "2026-09-23T00:00:00.000Z",
    "contentUpdatedAt": null,
    "readMinutes": 7,
    "coverImageUrl": "https://optimark-staging-media.dritech.co.id/optimark/blog/strategi-content-pillar.webp",
    "tags": [
      "content-pillar",
      "konsistensi",
      "brand-kecil"
    ],
    "authorSlug": "rafi-rizky",
    "reviewerSlug": "jonathan-anderson",
    "featured": false,
    "title": "Strategi Content Pillar yang Bikin Brand Kecil Tetap Konsisten Posting",
    "excerpt": "Tiga sampai empat pilar konten membuat Anda tidak lagi bingung mau posting apa setiap pagi.",
    "metaTitle": "Strategi Content Pillar yang Bikin Brand Kecil Tetap Konsisten Posting - Blog OPTIMARK",
    "metaDescription": "Tiga sampai empat pilar konten membuat Anda tidak lagi bingung mau posting apa setiap pagi.",
    "coverImageAlt": "Perempuan menyusun rencana konten di buku catatan di samping laptop dan sticky notes",
    "canonicalUrl": "https://optimark.ai/blog/strategi-content-pillar",
    "content": "Brand kecil jarang kehabisan ide karena malas. Biasanya karena setiap hari dimulai dari nol. Content pillar memberi kerangka supaya ide tidak perlu dicari ulang.\n\n## Pilih pilar dari pertanyaan pelanggan\n\nTulis pertanyaan yang paling sering diajukan pelanggan, lalu kelompokkan. Tiap kelompok bisa menjadi satu pilar, misalnya edukasi, produk, di balik layar, dan testimoni.\n\n- Batasi tiga sampai empat pilar\n- Tetapkan porsi tiap pilar per minggu\n- Siapkan lima ide cadangan per pilar\n- Tinjau pilar yang paling banyak disimpan dan dibagikan tiap bulan\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
    "translations": {
      "id": {
        "slug": "strategi-content-pillar",
        "title": "Strategi Content Pillar yang Bikin Brand Kecil Tetap Konsisten Posting",
        "excerpt": "Tiga sampai empat pilar konten membuat Anda tidak lagi bingung mau posting apa setiap pagi.",
        "content": "Brand kecil jarang kehabisan ide karena malas. Biasanya karena setiap hari dimulai dari nol. Content pillar memberi kerangka supaya ide tidak perlu dicari ulang.\n\n## Pilih pilar dari pertanyaan pelanggan\n\nTulis pertanyaan yang paling sering diajukan pelanggan, lalu kelompokkan. Tiap kelompok bisa menjadi satu pilar, misalnya edukasi, produk, di balik layar, dan testimoni.\n\n- Batasi tiga sampai empat pilar\n- Tetapkan porsi tiap pilar per minggu\n- Siapkan lima ide cadangan per pilar\n- Tinjau pilar yang paling banyak disimpan dan dibagikan tiap bulan\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
        "metaTitle": "Strategi Content Pillar yang Bikin Brand Kecil Tetap Konsisten Posting - Blog OPTIMARK",
        "metaDescription": "Tiga sampai empat pilar konten membuat Anda tidak lagi bingung mau posting apa setiap pagi."
      },
      "en": {
        "slug": "content-pillar-strategy-small-brands",
        "title": "A Content Pillar Strategy That Keeps Small Brands Posting Consistently",
        "excerpt": "Three or four content pillars mean you no longer wonder what to post every morning.",
        "content": "Small brands rarely run out of ideas out of laziness. Usually every day starts from zero. Content pillars give you a frame so ideas don’t have to be found again.\n\n## Pick pillars from customer questions\n\nWrite down the questions customers ask most, then group them. Each group can become a pillar, for example education, product, behind the scenes, and testimonials.\n\n- Keep it to three or four pillars\n- Set a weekly share for each pillar\n- Keep five backup ideas per pillar\n- Review which pillar gets saved and shared most each month\n\n> **Note:** This is a sample article used to review the blog layout. Replace it with real writing before the site goes live.",
        "metaTitle": "A Content Pillar Strategy That Keeps Small Brands Posting Consistently - OPTIMARK Blog",
        "metaDescription": "Three or four content pillars mean you no longer wonder what to post every morning."
      }
    }
  },
  {
    "slug": "website-belum-muncul-di-google",
    "slugId": "website-belum-muncul-di-google",
    "slugEn": "why-website-not-ranking-on-google",
    "categorySlug": "seo",
    "publishedAt": "2026-09-19T00:00:00.000Z",
    "contentUpdatedAt": null,
    "readMinutes": 8,
    "coverImageUrl": "https://optimark-staging-media.dritech.co.id/optimark/blog/website-belum-muncul-di-google.webp",
    "tags": [
      "seo",
      "google-search-console",
      "indexing"
    ],
    "authorSlug": "rafi-rizky",
    "reviewerSlug": "jonathan-anderson",
    "featured": false,
    "title": "Kenapa Website Kamu Belum Muncul di Halaman Pertama Google",
    "excerpt": "Sebelum menyalahkan algoritma, periksa dulu apakah Google sudah bisa menemukan dan memahami halaman Anda.",
    "metaTitle": "Kenapa Website Kamu Belum Muncul di Halaman Pertama Google - Blog OPTIMARK",
    "metaDescription": "Sebelum menyalahkan algoritma, periksa dulu apakah Google sudah bisa menemukan dan memahami halaman Anda.",
    "coverImageAlt": "Pria memeriksa website di laptop sambil mencatat",
    "canonicalUrl": "https://optimark.ai/blog/website-belum-muncul-di-google",
    "content": "Website yang tidak muncul di halaman pertama belum tentu kontennya buruk. Sering kali Google belum mengindeks halaman itu, atau tidak paham halaman itu menjawab pencarian apa.\n\n## Periksa indeks sebelum konten\n\nKetik site:domainanda.com di Google. Kalau halaman penting tidak muncul, masalahnya ada di pengindeksan, bukan di tulisan. Google Search Console bisa menunjukkan alasannya.\n\n- Daftarkan situs dan sitemap di Google Search Console\n- Pastikan setiap halaman punya judul dan H1 yang jelas\n- Perbaiki halaman yang lambat dibuka di ponsel\n- Tautkan halaman baru dari halaman lama yang sudah ramai\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
    "translations": {
      "id": {
        "slug": "website-belum-muncul-di-google",
        "title": "Kenapa Website Kamu Belum Muncul di Halaman Pertama Google",
        "excerpt": "Sebelum menyalahkan algoritma, periksa dulu apakah Google sudah bisa menemukan dan memahami halaman Anda.",
        "content": "Website yang tidak muncul di halaman pertama belum tentu kontennya buruk. Sering kali Google belum mengindeks halaman itu, atau tidak paham halaman itu menjawab pencarian apa.\n\n## Periksa indeks sebelum konten\n\nKetik site:domainanda.com di Google. Kalau halaman penting tidak muncul, masalahnya ada di pengindeksan, bukan di tulisan. Google Search Console bisa menunjukkan alasannya.\n\n- Daftarkan situs dan sitemap di Google Search Console\n- Pastikan setiap halaman punya judul dan H1 yang jelas\n- Perbaiki halaman yang lambat dibuka di ponsel\n- Tautkan halaman baru dari halaman lama yang sudah ramai\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
        "metaTitle": "Kenapa Website Kamu Belum Muncul di Halaman Pertama Google - Blog OPTIMARK",
        "metaDescription": "Sebelum menyalahkan algoritma, periksa dulu apakah Google sudah bisa menemukan dan memahami halaman Anda."
      },
      "en": {
        "slug": "why-website-not-ranking-on-google",
        "title": "Why Your Website Isn’t on Google’s First Page Yet",
        "excerpt": "Before blaming the algorithm, check whether Google can actually find and understand your pages.",
        "content": "A site missing from the first page doesn’t necessarily have bad content. Often Google hasn’t indexed the page, or can’t tell which search it answers.\n\n## Check indexing before content\n\nSearch site:yourdomain.com on Google. If important pages don’t show up, the problem is indexing, not writing. Google Search Console can show you why.\n\n- Register the site and sitemap in Google Search Console\n- Give every page a clear title and H1\n- Fix pages that load slowly on mobile\n- Link new pages from older pages that already get traffic\n\n> **Note:** This is a sample article used to review the blog layout. Replace it with real writing before the site goes live.",
        "metaTitle": "Why Your Website Isn’t on Google’s First Page Yet - OPTIMARK Blog",
        "metaDescription": "Before blaming the algorithm, check whether Google can actually find and understand your pages."
      }
    }
  },
  {
    "slug": "warna-feed-instagram",
    "slugId": "warna-feed-instagram",
    "slugEn": "instagram-feed-color-palette-guide",
    "categorySlug": "visual-content",
    "publishedAt": "2026-09-16T00:00:00.000Z",
    "contentUpdatedAt": null,
    "readMinutes": 4,
    "coverImageUrl": "https://optimark-staging-media.dritech.co.id/optimark/blog/warna-feed-instagram.webp",
    "tags": [
      "instagram",
      "branding",
      "palet-warna"
    ],
    "authorSlug": "thia-rahmani",
    "reviewerSlug": "jonathan-anderson",
    "featured": false,
    "title": "Tips Memilih Warna Feed Instagram yang Sesuai dengan Karakter Brand",
    "excerpt": "Palet feed yang konsisten membuat akun mudah dikenali, bahkan sebelum orang membaca nama brand Anda.",
    "metaTitle": "Tips Memilih Warna Feed Instagram yang Sesuai dengan Karakter Brand - Blog OPTIMARK",
    "metaDescription": "Palet feed yang konsisten membuat akun mudah dikenali, bahkan sebelum orang membaca nama brand Anda.",
    "coverImageAlt": "Pemilik usaha menata contoh warna dan bahan di atas meja kerja",
    "canonicalUrl": "https://optimark.ai/blog/warna-feed-instagram",
    "content": "Feed yang rapi bukan soal semua foto harus sama. Yang penting ada dua atau tiga warna yang terus muncul, sehingga akun Anda terasa punya satu karakter.\n\n## Turunkan warna dari logo dan produk\n\nAmbil satu warna utama dari logo, satu warna netral, dan satu aksen dari produk. Gunakan ketiganya di latar foto, teks, dan properti.\n\n- Batasi palet pada tiga warna\n- Simpan kode warna agar desainer dan fotografer sepakat\n- Pakai preset edit yang sama untuk semua foto\n- Lihat grid sembilan post terakhir sebelum mengunggah\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
    "translations": {
      "id": {
        "slug": "warna-feed-instagram",
        "title": "Tips Memilih Warna Feed Instagram yang Sesuai dengan Karakter Brand",
        "excerpt": "Palet feed yang konsisten membuat akun mudah dikenali, bahkan sebelum orang membaca nama brand Anda.",
        "content": "Feed yang rapi bukan soal semua foto harus sama. Yang penting ada dua atau tiga warna yang terus muncul, sehingga akun Anda terasa punya satu karakter.\n\n## Turunkan warna dari logo dan produk\n\nAmbil satu warna utama dari logo, satu warna netral, dan satu aksen dari produk. Gunakan ketiganya di latar foto, teks, dan properti.\n\n- Batasi palet pada tiga warna\n- Simpan kode warna agar desainer dan fotografer sepakat\n- Pakai preset edit yang sama untuk semua foto\n- Lihat grid sembilan post terakhir sebelum mengunggah\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
        "metaTitle": "Tips Memilih Warna Feed Instagram yang Sesuai dengan Karakter Brand - Blog OPTIMARK",
        "metaDescription": "Palet feed yang konsisten membuat akun mudah dikenali, bahkan sebelum orang membaca nama brand Anda."
      },
      "en": {
        "slug": "instagram-feed-color-palette-guide",
        "title": "Tips for Choosing Instagram Feed Colours That Match Your Brand",
        "excerpt": "A consistent feed palette makes an account recognisable before anyone reads your brand name.",
        "content": "A tidy feed doesn’t mean every photo looks the same. What matters is two or three colours that keep appearing, so the account feels like one character.\n\n## Derive colours from your logo and product\n\nTake one main colour from the logo, one neutral, and one accent from the product. Use all three in photo backgrounds, text, and props.\n\n- Keep the palette to three colours\n- Save the colour codes so designers and photographers agree\n- Use the same editing preset on every photo\n- Check the last nine posts in the grid before uploading\n\n> **Note:** This is a sample article used to review the blog layout. Replace it with real writing before the site goes live.",
        "metaTitle": "Tips for Choosing Instagram Feed Colours That Match Your Brand - OPTIMARK Blog",
        "metaDescription": "A consistent feed palette makes an account recognisable before anyone reads your brand name."
      }
    }
  },
  {
    "slug": "caption-tiktok",
    "slugId": "caption-tiktok",
    "slugEn": "write-engaging-tiktok-captions",
    "categorySlug": "social-media",
    "publishedAt": "2026-09-12T00:00:00.000Z",
    "contentUpdatedAt": null,
    "readMinutes": 3,
    "coverImageUrl": "https://optimark-staging-media.dritech.co.id/optimark/blog/caption-tiktok.webp",
    "tags": [
      "tiktok",
      "caption",
      "engagement"
    ],
    "authorSlug": "thia-rahmani",
    "reviewerSlug": "jonathan-anderson",
    "featured": false,
    "title": "Cara Menulis Caption TikTok yang Mendorong Penonton untuk Berinteraksi",
    "excerpt": "Caption TikTok yang baik tidak mengulang isi video. Ia memberi penonton alasan untuk berkomentar.",
    "metaTitle": "Cara Menulis Caption TikTok yang Mendorong Penonton untuk Berinteraksi - Blog OPTIMARK",
    "metaDescription": "Caption TikTok yang baik tidak mengulang isi video. Ia memberi penonton alasan untuk berkomentar.",
    "coverImageAlt": "Kreator merekam video TikTok dengan ponsel dan ring light",
    "canonicalUrl": "https://optimark.ai/blog/caption-tiktok",
    "content": "Penonton TikTok sudah melihat videonya. Caption yang hanya mengulang isi video tidak menambah apa-apa. Caption yang baik membuka percakapan.\n\n## Akhiri dengan pertanyaan yang mudah dijawab\n\nPertanyaan pilihan seperti “Tim pedas atau tim manis?” lebih mudah dijawab daripada pertanyaan terbuka. Semakin ringan jawabannya, semakin banyak yang berkomentar.\n\n- Taruh kalimat terpenting di baris pertama\n- Ajukan satu pertanyaan pilihan di akhir caption\n- Pakai tiga sampai lima hashtag yang relevan\n- Balas komentar awal dalam satu jam pertama\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
    "translations": {
      "id": {
        "slug": "caption-tiktok",
        "title": "Cara Menulis Caption TikTok yang Mendorong Penonton untuk Berinteraksi",
        "excerpt": "Caption TikTok yang baik tidak mengulang isi video. Ia memberi penonton alasan untuk berkomentar.",
        "content": "Penonton TikTok sudah melihat videonya. Caption yang hanya mengulang isi video tidak menambah apa-apa. Caption yang baik membuka percakapan.\n\n## Akhiri dengan pertanyaan yang mudah dijawab\n\nPertanyaan pilihan seperti “Tim pedas atau tim manis?” lebih mudah dijawab daripada pertanyaan terbuka. Semakin ringan jawabannya, semakin banyak yang berkomentar.\n\n- Taruh kalimat terpenting di baris pertama\n- Ajukan satu pertanyaan pilihan di akhir caption\n- Pakai tiga sampai lima hashtag yang relevan\n- Balas komentar awal dalam satu jam pertama\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
        "metaTitle": "Cara Menulis Caption TikTok yang Mendorong Penonton untuk Berinteraksi - Blog OPTIMARK",
        "metaDescription": "Caption TikTok yang baik tidak mengulang isi video. Ia memberi penonton alasan untuk berkomentar."
      },
      "en": {
        "slug": "write-engaging-tiktok-captions",
        "title": "How to Write TikTok Captions That Get Viewers Interacting",
        "excerpt": "A good TikTok caption doesn’t repeat the video. It gives viewers a reason to comment.",
        "content": "TikTok viewers have already watched the video. A caption that repeats it adds nothing. A good caption starts a conversation.\n\n## End with an easy question\n\nEither-or questions like “Team spicy or team sweet?” are easier to answer than open ones. The lighter the answer, the more people comment.\n\n- Put the most important line first\n- Ask one either-or question at the end\n- Use three to five relevant hashtags\n- Reply to early comments within the first hour\n\n> **Note:** This is a sample article used to review the blog layout. Replace it with real writing before the site goes live.",
        "metaTitle": "How to Write TikTok Captions That Get Viewers Interacting - OPTIMARK Blog",
        "metaDescription": "A good TikTok caption doesn’t repeat the video. It gives viewers a reason to comment."
      }
    }
  },
  {
    "slug": "artikel-jadi-konten-media-sosial",
    "slugId": "artikel-jadi-konten-media-sosial",
    "slugEn": "turn-one-blog-post-into-ten-social-posts",
    "categorySlug": "content-marketing",
    "publishedAt": "2026-09-09T00:00:00.000Z",
    "contentUpdatedAt": null,
    "readMinutes": 7,
    "coverImageUrl": "https://optimark-staging-media.dritech.co.id/optimark/blog/artikel-jadi-konten-media-sosial.webp",
    "tags": [
      "repurpose-konten",
      "media-sosial",
      "blog"
    ],
    "authorSlug": "rafi-rizky",
    "reviewerSlug": "jonathan-anderson",
    "featured": false,
    "title": "Cara Mengubah Satu Artikel Blog Menjadi Sepuluh Konten Media Sosial",
    "excerpt": "Satu artikel yang sudah diriset bisa menjadi bahan konten untuk dua minggu, tanpa menulis dari nol lagi.",
    "metaTitle": "Cara Mengubah Satu Artikel Blog Menjadi Sepuluh Konten Media Sosial - Blog OPTIMARK",
    "metaDescription": "Satu artikel yang sudah diriset bisa menjadi bahan konten untuk dua minggu, tanpa menulis dari nol lagi.",
    "coverImageAlt": "Tim kecil merencanakan konten media sosial dengan kartu ide dan laptop",
    "canonicalUrl": "https://optimark.ai/blog/artikel-jadi-konten-media-sosial",
    "content": "Artikel blog yang baik berisi riset, contoh, dan kesimpulan. Semua itu bisa dipecah menjadi konten media sosial yang lebih pendek.\n\n## Pecah per poin, bukan per paragraf\n\nSetiap poin utama bisa menjadi satu carousel, setiap kutipan kuat menjadi satu post teks, dan setiap langkah praktis menjadi satu video singkat.\n\n- Satu carousel untuk ringkasan artikel\n- Tiga post kutipan dari kalimat terkuat\n- Tiga video singkat untuk tiap langkah praktis\n- Satu polling dan dua story untuk mengajak diskusi\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
    "translations": {
      "id": {
        "slug": "artikel-jadi-konten-media-sosial",
        "title": "Cara Mengubah Satu Artikel Blog Menjadi Sepuluh Konten Media Sosial",
        "excerpt": "Satu artikel yang sudah diriset bisa menjadi bahan konten untuk dua minggu, tanpa menulis dari nol lagi.",
        "content": "Artikel blog yang baik berisi riset, contoh, dan kesimpulan. Semua itu bisa dipecah menjadi konten media sosial yang lebih pendek.\n\n## Pecah per poin, bukan per paragraf\n\nSetiap poin utama bisa menjadi satu carousel, setiap kutipan kuat menjadi satu post teks, dan setiap langkah praktis menjadi satu video singkat.\n\n- Satu carousel untuk ringkasan artikel\n- Tiga post kutipan dari kalimat terkuat\n- Tiga video singkat untuk tiap langkah praktis\n- Satu polling dan dua story untuk mengajak diskusi\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
        "metaTitle": "Cara Mengubah Satu Artikel Blog Menjadi Sepuluh Konten Media Sosial - Blog OPTIMARK",
        "metaDescription": "Satu artikel yang sudah diriset bisa menjadi bahan konten untuk dua minggu, tanpa menulis dari nol lagi."
      },
      "en": {
        "slug": "turn-one-blog-post-into-ten-social-posts",
        "title": "How to Turn One Blog Post Into Ten Social Media Posts",
        "excerpt": "One well-researched article can feed two weeks of content without writing from scratch again.",
        "content": "A good blog post holds research, examples, and a conclusion. All of it can be broken into shorter social posts.\n\n## Split by point, not by paragraph\n\nEach main point can become a carousel, each strong quote a text post, and each practical step a short video.\n\n- One carousel summarising the article\n- Three quote posts from the strongest lines\n- Three short videos, one per practical step\n- One poll and two stories to invite discussion\n\n> **Note:** This is a sample article used to review the blog layout. Replace it with real writing before the site goes live.",
        "metaTitle": "How to Turn One Blog Post Into Ten Social Media Posts - OPTIMARK Blog",
        "metaDescription": "One well-researched article can feed two weeks of content without writing from scratch again."
      }
    }
  },
  {
    "slug": "video-promosi-singkat",
    "slugId": "video-promosi-singkat",
    "slugEn": "create-engaging-promo-videos-without-editor",
    "categorySlug": "visual-content",
    "publishedAt": "2026-09-02T00:00:00.000Z",
    "contentUpdatedAt": null,
    "readMinutes": 5,
    "coverImageUrl": "https://optimark-staging-media.dritech.co.id/optimark/blog/video-promosi-singkat.webp",
    "tags": [
      "video",
      "promosi",
      "smartphone"
    ],
    "authorSlug": "thia-rahmani",
    "reviewerSlug": "jonathan-anderson",
    "featured": false,
    "title": "Membuat Video Promosi Singkat yang Menarik Tanpa Harus Menyewa Editor",
    "excerpt": "Video promosi 15 detik bisa direkam dan diedit sendiri dari smartphone, asalkan tiga detik pertamanya kuat.",
    "metaTitle": "Membuat Video Promosi Singkat yang Menarik Tanpa Harus Menyewa Editor - Blog OPTIMARK",
    "metaDescription": "Video promosi 15 detik bisa direkam dan diedit sendiri dari smartphone, asalkan tiga detik pertamanya kuat.",
    "coverImageAlt": "Pemilik toko kain merekam video promosi dengan ponsel dan gimbal",
    "canonicalUrl": "https://optimark.ai/blog/video-promosi-singkat",
    "content": "Penonton memutuskan menonton atau menggeser dalam beberapa detik pertama. Editor profesional pun tidak bisa menyelamatkan video yang pembukaannya lemah.\n\n## Buka dengan hasil, bukan logo\n\nTunjukkan produk dipakai atau hasil akhirnya di detik pertama. Logo dan nama brand bisa muncul di akhir.\n\n- Rencanakan tiga adegan: hasil, proses, ajakan\n- Rekam dalam format vertikal 9:16\n- Tambahkan teks di layar untuk yang menonton tanpa suara\n- Batasi durasi 15–30 detik\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
    "translations": {
      "id": {
        "slug": "video-promosi-singkat",
        "title": "Membuat Video Promosi Singkat yang Menarik Tanpa Harus Menyewa Editor",
        "excerpt": "Video promosi 15 detik bisa direkam dan diedit sendiri dari smartphone, asalkan tiga detik pertamanya kuat.",
        "content": "Penonton memutuskan menonton atau menggeser dalam beberapa detik pertama. Editor profesional pun tidak bisa menyelamatkan video yang pembukaannya lemah.\n\n## Buka dengan hasil, bukan logo\n\nTunjukkan produk dipakai atau hasil akhirnya di detik pertama. Logo dan nama brand bisa muncul di akhir.\n\n- Rencanakan tiga adegan: hasil, proses, ajakan\n- Rekam dalam format vertikal 9:16\n- Tambahkan teks di layar untuk yang menonton tanpa suara\n- Batasi durasi 15–30 detik\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
        "metaTitle": "Membuat Video Promosi Singkat yang Menarik Tanpa Harus Menyewa Editor - Blog OPTIMARK",
        "metaDescription": "Video promosi 15 detik bisa direkam dan diedit sendiri dari smartphone, asalkan tiga detik pertamanya kuat."
      },
      "en": {
        "slug": "create-engaging-promo-videos-without-editor",
        "title": "Making Short, Engaging Promo Videos Without Hiring an Editor",
        "excerpt": "A 15-second promo can be shot and edited on a smartphone, as long as the first three seconds are strong.",
        "content": "Viewers decide whether to keep watching or swipe within the first few seconds. Even a professional editor can’t save a video with a weak opening.\n\n## Open with the result, not the logo\n\nShow the product in use or the end result in the first second. The logo and brand name can come at the end.\n\n- Plan three scenes: result, process, call to action\n- Shoot vertically in 9:16\n- Add on-screen text for people watching muted\n- Keep it to 15–30 seconds\n\n> **Note:** This is a sample article used to review the blog layout. Replace it with real writing before the site goes live.",
        "metaTitle": "Making Short, Engaging Promo Videos Without Hiring an Editor - OPTIMARK Blog",
        "metaDescription": "A 15-second promo can be shot and edited on a smartphone, as long as the first three seconds are strong."
      }
    }
  },
  {
    "slug": "target-audiens",
    "slugId": "target-audiens",
    "slugEn": "define-target-audience-online-business",
    "categorySlug": "content-marketing",
    "publishedAt": "2026-08-28T00:00:00.000Z",
    "contentUpdatedAt": null,
    "readMinutes": 4,
    "coverImageUrl": "https://optimark-staging-media.dritech.co.id/optimark/blog/target-audiens.webp",
    "tags": [
      "target-audiens",
      "bisnis-online",
      "riset-pelanggan"
    ],
    "authorSlug": "rafi-rizky",
    "reviewerSlug": "jonathan-anderson",
    "featured": false,
    "title": "Menentukan Target Audiens Sebelum Mulai Membuat Konten untuk Bisnis Online",
    "excerpt": "Konten untuk semua orang biasanya tidak menarik siapa pun. Tentukan dulu siapa yang Anda ajak bicara.",
    "metaTitle": "Menentukan Target Audiens Sebelum Mulai Membuat Konten untuk Bisnis Online - Blog OPTIMARK",
    "metaDescription": "Konten untuk semua orang biasanya tidak menarik siapa pun. Tentukan dulu siapa yang Anda ajak bicara.",
    "coverImageAlt": "Dua orang berdiskusi tentang target audiens di depan dinding sticky notes",
    "canonicalUrl": "https://optimark.ai/blog/target-audiens",
    "content": "Banyak bisnis online mulai membuat konten sebelum tahu siapa pembacanya. Hasilnya konten yang sopan, tapi tidak terasa ditujukan untuk siapa pun.\n\n## Mulai dari pelanggan yang sudah membeli\n\nLihat sepuluh pelanggan terakhir Anda: usia, pekerjaan, kota, dan alasan mereka membeli. Pola yang muncul adalah titik awal target audiens.\n\n- Wawancarai tiga pelanggan tentang alasan mereka membeli\n- Tulis satu paragraf profil pelanggan ideal\n- Catat kata-kata yang mereka pakai saat bertanya\n- Uji konten ke satu segmen dulu sebelum melebar\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
    "translations": {
      "id": {
        "slug": "target-audiens",
        "title": "Menentukan Target Audiens Sebelum Mulai Membuat Konten untuk Bisnis Online",
        "excerpt": "Konten untuk semua orang biasanya tidak menarik siapa pun. Tentukan dulu siapa yang Anda ajak bicara.",
        "content": "Banyak bisnis online mulai membuat konten sebelum tahu siapa pembacanya. Hasilnya konten yang sopan, tapi tidak terasa ditujukan untuk siapa pun.\n\n## Mulai dari pelanggan yang sudah membeli\n\nLihat sepuluh pelanggan terakhir Anda: usia, pekerjaan, kota, dan alasan mereka membeli. Pola yang muncul adalah titik awal target audiens.\n\n- Wawancarai tiga pelanggan tentang alasan mereka membeli\n- Tulis satu paragraf profil pelanggan ideal\n- Catat kata-kata yang mereka pakai saat bertanya\n- Uji konten ke satu segmen dulu sebelum melebar\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
        "metaTitle": "Menentukan Target Audiens Sebelum Mulai Membuat Konten untuk Bisnis Online - Blog OPTIMARK",
        "metaDescription": "Konten untuk semua orang biasanya tidak menarik siapa pun. Tentukan dulu siapa yang Anda ajak bicara."
      },
      "en": {
        "slug": "define-target-audience-online-business",
        "title": "Defining Your Target Audience Before Creating Content for an Online Business",
        "excerpt": "Content for everyone usually appeals to no one. Decide who you are talking to first.",
        "content": "Many online businesses start making content before they know who it is for. The result is polite content that doesn’t feel meant for anyone.\n\n## Start with customers who already bought\n\nLook at your last ten customers: age, job, city, and why they bought. The pattern that shows up is where your target audience starts.\n\n- Interview three customers about why they bought\n- Write a one-paragraph ideal customer profile\n- Note the words they use when asking questions\n- Test content on one segment before widening\n\n> **Note:** This is a sample article used to review the blog layout. Replace it with real writing before the site goes live.",
        "metaTitle": "Defining Your Target Audience Before Creating Content for an Online Business - OPTIMARK Blog",
        "metaDescription": "Content for everyone usually appeals to no one. Decide who you are talking to first."
      }
    }
  },
  {
    "slug": "insight-instagram",
    "slugId": "insight-instagram",
    "slugEn": "reading-instagram-insights-effective-content",
    "categorySlug": "social-media",
    "publishedAt": "2026-08-25T00:00:00.000Z",
    "contentUpdatedAt": null,
    "readMinutes": 6,
    "coverImageUrl": "https://optimark-staging-media.dritech.co.id/optimark/blog/insight-instagram.webp",
    "tags": [
      "instagram-insight",
      "analitik",
      "engagement"
    ],
    "authorSlug": "thia-rahmani",
    "reviewerSlug": "jonathan-anderson",
    "featured": false,
    "title": "Membaca Insight Instagram untuk Mengetahui Konten Mana yang Paling Efektif",
    "excerpt": "Jumlah like bukan satu-satunya ukuran. Simpan dan bagikan sering lebih jujur menunjukkan konten yang berguna.",
    "metaTitle": "Membaca Insight Instagram untuk Mengetahui Konten Mana yang Paling Efektif - Blog OPTIMARK",
    "metaDescription": "Jumlah like bukan satu-satunya ukuran. Simpan dan bagikan sering lebih jujur menunjukkan konten yang berguna.",
    "coverImageAlt": "Perempuan memeriksa Instagram Insight di ponsel sambil duduk di kafe",
    "canonicalUrl": "https://optimark.ai/blog/insight-instagram",
    "content": "Instagram Insight menyediakan banyak angka, dan mudah tersesat di dalamnya. Beberapa metrik saja sudah cukup untuk menentukan konten apa yang perlu diulang.\n\n## Fokus pada simpan dan bagikan\n\nKonten yang disimpan dianggap berguna, konten yang dibagikan dianggap layak direkomendasikan. Dua metrik ini lebih mencerminkan nilai konten daripada like.\n\n- Bandingkan post per format: foto, carousel, Reels\n- Urutkan post berdasarkan jumlah simpan\n- Catat jam posting dari lima post terbaik\n- Ulangi topik terbaik dengan format berbeda\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
    "translations": {
      "id": {
        "slug": "insight-instagram",
        "title": "Membaca Insight Instagram untuk Mengetahui Konten Mana yang Paling Efektif",
        "excerpt": "Jumlah like bukan satu-satunya ukuran. Simpan dan bagikan sering lebih jujur menunjukkan konten yang berguna.",
        "content": "Instagram Insight menyediakan banyak angka, dan mudah tersesat di dalamnya. Beberapa metrik saja sudah cukup untuk menentukan konten apa yang perlu diulang.\n\n## Fokus pada simpan dan bagikan\n\nKonten yang disimpan dianggap berguna, konten yang dibagikan dianggap layak direkomendasikan. Dua metrik ini lebih mencerminkan nilai konten daripada like.\n\n- Bandingkan post per format: foto, carousel, Reels\n- Urutkan post berdasarkan jumlah simpan\n- Catat jam posting dari lima post terbaik\n- Ulangi topik terbaik dengan format berbeda\n\n> **Catatan:** Ini artikel contoh yang dipakai untuk meninjau tampilan halaman blog. Gantilah dengan tulisan asli sebelum situs dipublikasikan.",
        "metaTitle": "Membaca Insight Instagram untuk Mengetahui Konten Mana yang Paling Efektif - Blog OPTIMARK",
        "metaDescription": "Jumlah like bukan satu-satunya ukuran. Simpan dan bagikan sering lebih jujur menunjukkan konten yang berguna."
      },
      "en": {
        "slug": "reading-instagram-insights-effective-content",
        "title": "Reading Instagram Insights to Find Your Most Effective Content",
        "excerpt": "Likes aren’t the only measure. Saves and shares often show more honestly which content is useful.",
        "content": "Instagram Insights offers plenty of numbers, and it’s easy to get lost. A few metrics are enough to decide which content to repeat.\n\n## Focus on saves and shares\n\nSaved content is seen as useful, shared content as worth recommending. These two reflect a post’s value better than likes.\n\n- Compare posts by format: photo, carousel, Reels\n- Sort posts by number of saves\n- Note the posting times of your top five posts\n- Repeat the best topics in a different format\n\n> **Note:** This is a sample article used to review the blog layout. Replace it with real writing before the site goes live.",
        "metaTitle": "Reading Instagram Insights to Find Your Most Effective Content - OPTIMARK Blog",
        "metaDescription": "Likes aren’t the only measure. Saves and shares often show more honestly which content is useful."
      }
    }
  }
];
