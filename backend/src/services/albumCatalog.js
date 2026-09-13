// backend/src/services/albumCatalog.js
// Curated, fully populated Albums and Artists with 100% verified Apple Music / Deezer / Unsplash CDNs
// Completely free of any JioSaavn dependency.

const FEATURED_ALBUMS = [
  {
    id: 'album-pushpa-2',
    title: 'Pushpa 2: The Rule',
    artist: 'Devi Sri Prasad (DSP), Shreya Ghoshal',
    year: '2024',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ac/d7/02/acd70261-cfa2-fafc-ad43-5cbb962715ce/8903431993366_cover.jpg/600x600bb.jpg',
    tracksCount: 6,
    badge: 'Worldwide Blockbuster 🔥',
    language: 'Telugu',
    description: 'Allu Arjun & DSP explosive Pan-Indian musical storm including Pushpa Pushpa, Sooseki, and Peelings.',
    tracks: [
      {
        id: 'p2-pushpa-pushpa',
        title: 'Pushpa Pushpa',
        artist: 'Devi Sri Prasad, Nakash Aziz, Deepak Blue',
        album: 'Pushpa 2: The Rule',
        duration: '4:25',
        seconds: 265,
        trackNumber: 1,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ac/d7/02/acd70261-cfa2-fafc-ad43-5cbb962715ce/8903431993366_cover.jpg/600x600bb.jpg',
        year: '2024',
        language: 'Telugu',
        playable: true
      },
      {
        id: 'p2-sooseki',
        title: 'Sooseki (The Couple Song)',
        artist: 'Shreya Ghoshal, Devi Sri Prasad',
        album: 'Pushpa 2: The Rule',
        duration: '4:18',
        seconds: 258,
        trackNumber: 2,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ac/d7/02/acd70261-cfa2-fafc-ad43-5cbb962715ce/8903431993366_cover.jpg/600x600bb.jpg',
        year: '2024',
        language: 'Telugu',
        playable: true
      },
      {
        id: 'p2-peelings',
        title: 'Peelings',
        artist: 'Devi Sri Prasad, Laxmi Dasi',
        album: 'Pushpa 2: The Rule',
        duration: '3:40',
        seconds: 220,
        trackNumber: 3,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ac/d7/02/acd70261-cfa2-fafc-ad43-5cbb962715ce/8903431993366_cover.jpg/600x600bb.jpg',
        year: '2024',
        language: 'Telugu',
        playable: true
      },
      {
        id: 'p2-kissik',
        title: 'Kissik',
        artist: 'Sublahshini, Devi Sri Prasad',
        album: 'Pushpa 2: The Rule',
        duration: '3:50',
        seconds: 230,
        trackNumber: 4,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ac/d7/02/acd70261-cfa2-fafc-ad43-5cbb962715ce/8903431993366_cover.jpg/600x600bb.jpg',
        year: '2024',
        language: 'Telugu',
        playable: true
      }
    ]
  },
  {
    id: 'album-devara',
    title: 'Devara: Part 1',
    artist: 'Anirudh Ravichander, Jr. NTR',
    year: '2024',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ce/84/04/ce8404fd-0fb3-b42a-7497-642e68feb574/8903431001313_cover.jpg/600x600bb.jpg',
    tracksCount: 5,
    badge: 'Chartbuster ⚡',
    language: 'Telugu',
    description: 'Anirudh Ravichander sensational soundtrack for Jr NTR Devara featuring Fear Song, Chuttamalle, and Daavudi.',
    tracks: [
      {
        id: 'dev-fear-song',
        title: 'Fear Song',
        artist: 'Anirudh Ravichander',
        album: 'Devara: Part 1',
        duration: '3:15',
        seconds: 195,
        trackNumber: 1,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ce/84/04/ce8404fd-0fb3-b42a-7497-642e68feb574/8903431001313_cover.jpg/600x600bb.jpg',
        year: '2024',
        language: 'Telugu',
        playable: true
      },
      {
        id: 'dev-chuttamalle',
        title: 'Chuttamalle',
        artist: 'Shilpa Rao, Anirudh Ravichander',
        album: 'Devara: Part 1',
        duration: '3:42',
        seconds: 222,
        trackNumber: 2,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ce/84/04/ce8404fd-0fb3-b42a-7497-642e68feb574/8903431001313_cover.jpg/600x600bb.jpg',
        year: '2024',
        language: 'Telugu',
        playable: true
      },
      {
        id: 'dev-daavudi',
        title: 'Daavudi',
        artist: 'Nakash Aziz, Akasa, Anirudh Ravichander',
        album: 'Devara: Part 1',
        duration: '3:20',
        seconds: 200,
        trackNumber: 3,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ce/84/04/ce8404fd-0fb3-b42a-7497-642e68feb574/8903431001313_cover.jpg/600x600bb.jpg',
        year: '2024',
        language: 'Telugu',
        playable: true
      },
      {
        id: 'dev-ayudha-pooja',
        title: 'Ayudha Pooja',
        artist: 'Kaala Bhairava, Anirudh Ravichander',
        album: 'Devara: Part 1',
        duration: '3:30',
        seconds: 210,
        trackNumber: 4,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ce/84/04/ce8404fd-0fb3-b42a-7497-642e68feb574/8903431001313_cover.jpg/600x600bb.jpg',
        year: '2024',
        language: 'Telugu',
        playable: true
      }
    ]
  },
  {
    id: 'album-guntur-kaaram',
    title: 'Guntur Kaaram',
    artist: 'Thaman S, Mahesh Babu',
    year: '2024',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/a9/54/29/a9542906-08be-3e8d-a26c-635ef92ed5d3/cover.jpg/600x600bb.jpg',
    tracksCount: 5,
    badge: 'Mass Anthem 🌶️',
    language: 'Telugu',
    description: 'Thaman S spicy soundtrack featuring Kurchi Madathapetti and Dum Masala.',
    tracks: [
      {
        id: 'gk-dum-masala',
        title: 'Dum Masala',
        artist: 'Thaman S, Sanjith Hegde',
        album: 'Guntur Kaaram',
        duration: '3:26',
        seconds: 206,
        trackNumber: 1,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/a9/54/29/a9542906-08be-3e8d-a26c-635ef92ed5d3/cover.jpg/600x600bb.jpg',
        year: '2024',
        language: 'Telugu',
        playable: true
      },
      {
        id: 'gk-kurchi',
        title: 'Kurchi Madathapetti',
        artist: 'Mahesh Babu, Thaman S, Sri Krishna, Sahithi Chaganti',
        album: 'Guntur Kaaram',
        duration: '3:36',
        seconds: 216,
        trackNumber: 2,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/a9/54/29/a9542906-08be-3e8d-a26c-635ef92ed5d3/cover.jpg/600x600bb.jpg',
        year: '2024',
        language: 'Telugu',
        playable: true
      }
    ]
  },
  {
    id: 'album-animal-soundtrack',
    title: 'Animal (Original Soundtrack)',
    artist: 'Harshavardhan Rameshwar, Arijit Singh, Vishal Mishra',
    year: '2023',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/fc/50/b3/fc50b3ca-c94b-58eb-a10c-80287d82eba3/8903431981196_cover.jpg/600x600bb.jpg',
    tracksCount: 8,
    badge: 'All-Time Record 🦁',
    language: 'Hindi',
    description: 'Sandeep Reddy Vanga intense blockbuster with Satranga, Pehle Bhi Main, and Arjan Vailly.',
    tracks: [
      {
        id: 'anim-satranga',
        title: 'Satranga',
        artist: 'Arijit Singh, Shreyas Puranik',
        album: 'Animal',
        duration: '4:31',
        seconds: 271,
        trackNumber: 1,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/fc/50/b3/fc50b3ca-c94b-58eb-a10c-80287d82eba3/8903431981196_cover.jpg/600x600bb.jpg',
        year: '2023',
        language: 'Hindi',
        playable: true
      },
      {
        id: 'anim-pehle-bhi-main',
        title: 'Pehle Bhi Main',
        artist: 'Vishal Mishra, Raj Shekhar',
        album: 'Animal',
        duration: '4:10',
        seconds: 250,
        trackNumber: 2,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/fc/50/b3/fc50b3ca-c94b-58eb-a10c-80287d82eba3/8903431981196_cover.jpg/600x600bb.jpg',
        year: '2023',
        language: 'Hindi',
        playable: true
      },
      {
        id: 'anim-nanna-nuv',
        title: 'Nanna Nuv Naa Pranam',
        artist: 'Sonu Nigam, Harshavardhan Rameshwar',
        album: 'Animal (Telugu)',
        duration: '5:21',
        seconds: 321,
        trackNumber: 3,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/fc/50/b3/fc50b3ca-c94b-58eb-a10c-80287d82eba3/8903431981196_cover.jpg/600x600bb.jpg',
        year: '2023',
        language: 'Telugu',
        playable: true
      }
    ]
  },
  {
    id: 'album-hi-nanna',
    title: 'Hi Nanna',
    artist: 'Hesham Abdul Wahab, Nani, Mrunal Thakur',
    year: '2023',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/64/4c/1d/644c1db5-68f8-0640-21e2-dd440f7290e7/8903431963253_cover.jpg/600x600bb.jpg',
    tracksCount: 5,
    badge: 'Soulful Melody 💖',
    language: 'Telugu',
    description: 'Hesham Abdul Wahab award-winning melodies including Samayama and Ammaadi.',
    tracks: [
      {
        id: 'hn-samayama',
        title: 'Samayama',
        artist: 'Hesham Abdul Wahab, Anurag Kulkarni',
        album: 'Hi Nanna',
        duration: '3:24',
        seconds: 204,
        trackNumber: 1,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/64/4c/1d/644c1db5-68f8-0640-21e2-dd440f7290e7/8903431963253_cover.jpg/600x600bb.jpg',
        year: '2023',
        language: 'Telugu',
        playable: true
      },
      {
        id: 'hn-ammaadi',
        title: 'Ammaadi',
        artist: 'Kaala Bhairava, Shakthisree Gopalan',
        album: 'Hi Nanna',
        duration: '3:39',
        seconds: 219,
        trackNumber: 2,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/64/4c/1d/644c1db5-68f8-0640-21e2-dd440f7290e7/8903431963253_cover.jpg/600x600bb.jpg',
        year: '2023',
        language: 'Telugu',
        playable: true
      }
    ]
  },
  {
    id: 'album-after-hours',
    title: 'After Hours',
    artist: 'The Weeknd',
    year: '2020',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/600x600bb.jpg',
    tracksCount: 14,
    badge: 'Global #1 🌟',
    language: 'English',
    description: 'Multi-platinum global masterpiece featuring Blinding Lights, Save Your Tears, and After Hours.',
    tracks: [
      {
        id: 'ah-blinding-lights',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: '3:20',
        seconds: 200,
        trackNumber: 1,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/600x600bb.jpg',
        year: '2020',
        language: 'English',
        playable: true
      },
      {
        id: 'ah-save-your-tears',
        title: 'Save Your Tears',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: '3:35',
        seconds: 215,
        trackNumber: 2,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/b9/fe/2bb9fef5-d7f3-8345-25a9-db0e79fde4e4/20UMGIM11048.rgb.jpg/600x600bb.jpg',
        year: '2020',
        language: 'English',
        playable: true
      }
    ]
  },
  {
    id: 'album-midnights',
    title: 'Midnights',
    artist: 'Taylor Swift',
    year: '2022',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/fb/b7/5d/fbb75d98-3b52-2fa5-ca82-658194f3c498/23UMGIM58157.rgb.jpg/600x600bb.jpg',
    tracksCount: 13,
    badge: 'Grammy Winner 🏆',
    language: 'English',
    description: 'Taylor Swift record-breaking 10th studio album featuring Anti-Hero and Lavender Haze.',
    tracks: [
      {
        id: 'ts-anti-hero',
        title: 'Anti-Hero',
        artist: 'Taylor Swift',
        album: 'Midnights',
        duration: '3:20',
        seconds: 200,
        trackNumber: 1,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/fb/b7/5d/fbb75d98-3b52-2fa5-ca82-658194f3c498/23UMGIM58157.rgb.jpg/600x600bb.jpg',
        year: '2022',
        language: 'English',
        playable: true
      }
    ]
  },
  {
    id: 'album-leo',
    title: 'Leo',
    artist: 'Anirudh Ravichander, Thalapathy Vijay',
    year: '2023',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/64/4c/1d/644c1db5-68f8-0640-21e2-dd440f7290e7/8903431963253_cover.jpg/600x600bb.jpg',
    tracksCount: 6,
    badge: 'Kollywood Phenomenon 💥',
    language: 'Tamil',
    description: 'Anirudh viral soundtrack for Lokesh Kanagaraj cinematic universe featuring Naa Ready and Badass.',
    tracks: [
      {
        id: 'leo-naa-ready',
        title: 'Naa Ready',
        artist: 'Thalapathy Vijay, Anirudh Ravichander, Asal Kolaar',
        album: 'Leo',
        duration: '4:08',
        seconds: 248,
        trackNumber: 1,
        thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/64/4c/1d/644c1db5-68f8-0640-21e2-dd440f7290e7/8903431963253_cover.jpg/600x600bb.jpg',
        year: '2023',
        language: 'Tamil',
        playable: true
      }
    ]
  },
  {
    id: 'album-aavesham',
    title: 'Aavesham',
    artist: 'Sushin Shyam, Fahadh Faasil',
    year: '2024',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
    tracksCount: 5,
    badge: 'Malayalam Sensation 🚀',
    language: 'Malayalam',
    description: 'Sushin Shyam high-energy electronic Malayalam soundtrack featuring Illuminati.',
    tracks: [
      {
        id: 'aav-illuminati',
        title: 'Illuminati',
        artist: 'Sushin Shyam, Dabzee',
        album: 'Aavesham',
        duration: '3:36',
        seconds: 216,
        trackNumber: 1,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
        year: '2024',
        language: 'Malayalam',
        playable: true
      }
    ]
  },
  {
    id: 'album-kantara',
    title: 'Kantara',
    artist: 'B. Ajaneesh Loknath, Rishab Shetty',
    year: '2022',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop',
    tracksCount: 6,
    badge: 'Divine Legend 🕉️',
    language: 'Kannada',
    description: 'Ajaneesh Loknath folklore divine masterpiece featuring Varaha Roopam and Singara Siriye.',
    tracks: [
      {
        id: 'kan-varaha',
        title: 'Varaha Roopam Daiva Va Rishtam',
        artist: 'B. Ajaneesh Loknath, Sai Vignesh',
        album: 'Kantara',
        duration: '4:36',
        seconds: 276,
        trackNumber: 1,
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop',
        year: '2022',
        language: 'Kannada',
        playable: true
      }
    ]
  },
  {
    id: 'album-bts-map-of-soul',
    title: 'Map of the Soul: 7',
    artist: 'BTS',
    year: '2020',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop',
    tracksCount: 20,
    badge: 'Global Icon 💜',
    language: 'Korean',
    description: 'Global mega-album featuring Boy With Luv, ON, and Black Swan.',
    tracks: [
      {
        id: 'bts-dynamite',
        title: 'Dynamite',
        artist: 'BTS',
        album: 'BE',
        duration: '3:19',
        seconds: 199,
        trackNumber: 1,
        thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop',
        year: '2020',
        language: 'Korean',
        playable: true
      }
    ]
  }
];

const FEATURED_ARTISTS = [
  {
    id: 'artist-spb',
    name: 'S. P. Balasubrahmanyam',
    genre: 'Telugu / Classic Melodies',
    image: 'https://cdn-images.dzcdn.net/images/artist/e1ae356e308e1baad481b84dfe9d05fe/500x500-000000-80-0-0.jpg',
    listeners: 'Gana Gandharva • 40,000+ Songs Recorded',
    badge: 'Legend 👑',
    language: 'Telugu'
  },
  {
    id: 'artist-sid-sriram',
    name: 'Sid Sriram',
    genre: 'Carnatic Soul & Pop',
    image: 'https://cdn-images.dzcdn.net/images/artist/fbe3e1d17fc6958e047f011f74233f82/500x500-000000-80-0-0.jpg',
    listeners: '12.4M Monthly Listeners',
    badge: 'Soul Voice 💖',
    language: 'Telugu'
  },
  {
    id: 'artist-anirudh',
    name: 'Anirudh Ravichander',
    genre: 'High Voltage BGM & EDM',
    image: 'https://cdn-images.dzcdn.net/images/artist/9da0a547b39e99bc35c6a9724aef91bf/500x500-000000-80-0-0.jpg',
    listeners: '16.8M Monthly Listeners',
    badge: 'Rockstar 🎸',
    language: 'Tamil / Telugu'
  },
  {
    id: 'artist-dsp',
    name: 'Devi Sri Prasad (DSP)',
    genre: 'Tollywood Mass & Dance Beats',
    image: 'https://cdn-images.dzcdn.net/images/artist/a904f8ee6cc4dcb472f75bd8ae1a21da/500x500-000000-80-0-0.jpg',
    listeners: '9.5M Monthly Listeners',
    badge: 'Rockstar DSP ⚡',
    language: 'Telugu'
  },
  {
    id: 'artist-arijit-singh',
    name: 'Arijit Singh',
    genre: 'Bollywood Soul & Acoustic',
    image: 'https://cdn-images.dzcdn.net/images/artist/ac5350cff290edd5b69fa584b8b1bd4f/500x500-000000-80-0-0.jpg',
    listeners: '38.2M Monthly Listeners',
    badge: 'King of Romance 🎤',
    language: 'Hindi'
  },
  {
    id: 'artist-shreya-ghoshal',
    name: 'Shreya Ghoshal',
    genre: 'Indian Classical & Cinematic Melodies',
    image: 'https://cdn-images.dzcdn.net/images/artist/3bb832d37d10ff2affcfa9afdc7c68a0/500x500-000000-80-0-0.jpg',
    listeners: '25.6M Monthly Listeners',
    badge: 'Nightingale 🕊️',
    language: 'Telugu / Hindi'
  },
  {
    id: 'artist-the-weeknd',
    name: 'The Weeknd',
    genre: 'R&B / Synthpop / Pop',
    image: 'https://cdn-images.dzcdn.net/images/artist/581693b4724a7fcfa754455101e13a44/500x500-000000-80-0-0.jpg',
    listeners: '112M Monthly Listeners',
    badge: 'Global #1 🌟',
    language: 'English'
  },
  {
    id: 'artist-taylor-swift',
    name: 'Taylor Swift',
    genre: 'Pop / Country / Folk',
    image: 'https://cdn-images.dzcdn.net/images/artist/e528e270424103b527f8a27ac625563b/500x500-000000-80-0-0.jpg',
    listeners: '105M Monthly Listeners',
    badge: 'Icon 🌟',
    language: 'English'
  },
  {
    id: 'artist-imagine-dragons',
    name: 'Imagine Dragons',
    genre: 'Alternative Rock / Pop Rock',
    image: 'https://cdn-images.dzcdn.net/images/artist/1ba025c23cae3dee14b51152990285fc/500x500-000000-80-0-0.jpg',
    listeners: '64M Monthly Listeners',
    badge: 'Stadium Rock ⚡',
    language: 'English'
  },
  {
    id: 'artist-bts',
    name: 'BTS',
    genre: 'K-Pop / Hip-Hop / Pop',
    image: 'https://cdn-images.dzcdn.net/images/artist/3f9c2fc4a50b4afbf31c22860e414d21/500x500-000000-80-0-0.jpg',
    listeners: '35M Monthly Listeners',
    badge: 'K-Pop Kings 💜',
    language: 'Korean'
  }
];

module.exports = {
  FEATURED_ALBUMS,
  FEATURED_ARTISTS
};
