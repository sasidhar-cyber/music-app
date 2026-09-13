// backend/src/services/musicEngine.js
// Next-Generation SoundWave Music Engine
// Apple iTunes Search API (Primary Catalog) + YouTube (yt-search) + Deezer (Fallback) + LRCLIB (Lyrics)
// Completely free of any JioSaavn dependency.

const fs = require('fs');
const axios = require('axios');

// Upstream patch for yt-search@2.13.1 TypeError: title.trim is not a function
try {
  const ytSearchPath = require.resolve('yt-search/dist/yt-search.js');
  if (fs.existsSync(ytSearchPath)) {
    let content = fs.readFileSync(ytSearchPath, 'utf8');
    if (content.includes('title: title.trim()')) {
      content = content.replace(/title:\s*title\.trim\(\)/g, 'title: (typeof title === "string" ? title.trim() : (title && (title.text || title.simpleText)) || "Untitled")');
      fs.writeFileSync(ytSearchPath, content, 'utf8');
    }
  }
} catch (e) {}

const yts = require('yt-search');

// In-memory response cache with TTL
const cache = new Map();
const CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data, ttlMs = CACHE_TTL_MS) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  });
  // Simple cache pruning
  if (cache.size > 800) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

// Format milliseconds to mm:ss
function formatMs(ms) {
  if (!ms || isNaN(ms)) return '3:30';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Clean titles from noisy strings
function cleanTitle(title = '') {
  return String(title || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

// Upgrades Apple iTunes artwork URL to high resolution (600x600)
function upgradeAppleArtwork(url = '') {
  if (!url) return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop';
  return url.replace('100x100bb', '600x600bb').replace('60x60bb', '600x600bb');
}

// Known English and International Artists / Keywords
const ENGLISH_INTERNATIONAL_INDICATORS = new Set([
  'ed sheeran', 'taylor swift', 'the weeknd', 'billie eilish', 'imagine dragons',
  'coldplay', 'adele', 'drake', 'post malone', 'bruno mars', 'dua lipa',
  'justin bieber', 'maroon 5', 'katy perry', 'rihanna', 'eminem', 'shawn mendes',
  'ariana grande', 'beyoncé', 'beyonce', 'selena gomez', 'harry styles', 'sza',
  'olivia rodrigo', 'charlie puth', 'sam smith', 'david guetta', 'calvin harris',
  'alan walker', 'marshmello', 'chainsmokers', 'avicii', 'linkin park',
  'queen', 'beatles', 'michael jackson', 'lady gaga', 'sia', 'travis scott',
  'kendrick lamar', 'kanye west', 'twenty one pilots', 'onerepublic', 'maroon',
  'cardi b', 'nicki minaj', 'doja cat', 'sabrina carpenter', 'chappell roan',
  'teddy swims', 'benson boone', 'hozier', 'tate mcrae', 'shakira', 'camila cabello'
]);

// Detect language from text, hint or genre
function detectLanguage(text = '', hint = '', genre = '') {
  const str = String(text || '').toLowerCase();
  const genreLower = String(genre || '').toLowerCase();

  // 1. Check if text or artist name matches known English/International artists
  for (const artist of ENGLISH_INTERNATIONAL_INDICATORS) {
    if (str.includes(artist)) {
      return 'English';
    }
  }

  // 2. Indic Unicode Script Detection (definitive)
  if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu';
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'Malayalam';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'Kannada';
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) return 'Korean';

  // 3. Clear Korean indicators
  if (/(\bk-pop\b|\bkpop\b|\bbts\b|\bblackpink\b|\bnewjeans\b|\bjungkook\b|\bstray kids\b|\btwice\b|\bseventeen\b|\benhypen\b)/i.test(str)) {
    return 'Korean';
  }

  // 4. Regional Indian keyword detection (strictly targeted words with word boundaries to avoid false positives)
  if (/\b(telugu|tollywood|pushpa|devara|guntur kaaram|chuttamalle|samajavaragamana|ram miriyala|siri vennela|keeravani|chiranjeevi|balakrishna|allu arjun|mahesh babu|prabhas|jr ntr|nani|raviteja|dsp hits|anirudh telugu)\b/i.test(str)) {
    return 'Telugu';
  }
  if (/\b(hindi|bollywood|arijit singh|pritam|vishal mishra|kesariya|chaleya|badshah|neha kakkar|kumar sanu|lata mangeshkar|kishore kumar|alka yagnik|sonu nigam|jubin nautiyal)\b/i.test(str)) {
    return 'Hindi';
  }
  if (/\b(tamil|kollywood|jailer|leo|vijay thalapathy|rajinikanth|yuvan shankar|ilaiyaraaja|harris jayaraj|anirudh ravichander)\b/i.test(str)) {
    return 'Tamil';
  }
  if (/\b(malayalam|mollywood|aavesham|illuminati song|sushin shyam|manjummel boys|premam)\b/i.test(str)) {
    return 'Malayalam';
  }
  if (/\b(kannada|sandalwood|kantara|kgf chapter|ajaneesh loknath|puneeth rajkumar)\b/i.test(str)) {
    return 'Kannada';
  }

  // 5. If genre clearly implies English/Western
  if (/^(pop|rock|hip-hop|rap|r&b|soul|alternative|indie|country|electronic|dance|edm|metal|folk|blues|jazz|punk|dance-pop|singer\/songwriter)/i.test(genreLower)) {
    return 'English';
  }

  // 6. If explicit hint was requested by user and is English or matches
  if (hint && hint.toLowerCase() !== 'all' && hint.toLowerCase() !== 'international') {
    const h = hint.toLowerCase();
    if (h === 'english') return 'English';
    // Only return regional hint if text does not look purely English
    const isAscii = /^[\x00-\x7F]*$/.test(text);
    if (!isAscii) {
      return h.charAt(0).toUpperCase() + h.slice(1);
    }
  }

  // Default to English
  return 'English';
}

/**
 * 1. Apple iTunes Search API (Primary Catalog)
 */
async function searchItunes({ term, entity = 'song', limit = 25, country = '' }) {
  if (!term || !term.trim()) return [];
  const cleanTerm = term.trim();
  const cacheKey = `itunes_${cleanTerm}_${entity}_${limit}_${country}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const params = {
      term: cleanTerm,
      entity,
      limit: Math.min(limit, 50),
      media: 'music'
    };
    if (country) params.country = country;

    const res = await axios.get('https://itunes.apple.com/search', {
      params,
      timeout: 6500
    });

    let results = res.data?.results || [];

    // Typo / Punctuation fallback: if no results, try stripping punctuation and symbols
    if (results.length === 0 && /[^\w\s]/.test(cleanTerm)) {
      const stripped = cleanTerm.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      if (stripped && stripped !== cleanTerm) {
        try {
          const retryRes = await axios.get('https://itunes.apple.com/search', {
            params: { term: stripped, entity, limit: Math.min(limit, 50), media: 'music' },
            timeout: 5000
          });
          if (retryRes.data?.results?.length > 0) {
            results = retryRes.data.results;
          }
        } catch (e) {}
      }
    }

    setCached(cacheKey, results, CACHE_TTL_MS);
    return results;
  } catch (err) {
    console.warn(`[iTunes Search] Error searching "${cleanTerm}":`, err.message);
    // Fallback: If country search failed, retry without country
    if (country) {
      try {
        const retryRes = await axios.get('https://itunes.apple.com/search', {
          params: { term: cleanTerm, entity, limit: Math.min(limit, 50), media: 'music' },
          timeout: 5000
        });
        const r = retryRes.data?.results || [];
        setCached(cacheKey, r, CACHE_TTL_MS);
        return r;
      } catch (retryErr) {
        return [];
      }
    }
    return [];
  }
}

/**
 * Lookup by iTunes ID (Collection or Artist or Track)
 */
async function lookupItunes({ id, entity = 'song', limit = 30 }) {
  if (!id) return null;
  const cacheKey = `itunes_lookup_${id}_${entity}_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const res = await axios.get('https://itunes.apple.com/lookup', {
      params: { id, entity, limit },
      timeout: 6500
    });
    const results = res.data?.results || [];
    setCached(cacheKey, results, CACHE_TTL_MS * 2);
    return results;
  } catch (err) {
    console.warn(`[iTunes Lookup] Error for ID "${id}":`, err.message);
    return null;
  }
}

/**
 * 2. YouTube Search via yt-search (Videos, Covers, Regional hits)
 */
async function searchYouTube({ query, limit = 20 }) {
  if (!query || !query.trim()) return { videos: [], songs: [] };
  const cleanQ = query.trim();
  const cacheKey = `yt_${cleanQ}_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const searchPromise = yts({ query: cleanQ });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('YouTube search timeout')), 6500)
    );

    const r = await Promise.race([searchPromise, timeoutPromise]);
    const rawVideos = (r?.videos || []).slice(0, limit);

    const normalized = rawVideos
      .filter((v) => {
        if (!v || !v.videoId) return false;
        const titleStr = typeof v.title === 'string' ? v.title : (v.title?.text || '');
        if (!titleStr) return false;
        // Filter out shorts, reels, status memes
        const lower = (titleStr + ' ' + (v.description || '')).toLowerCase();
        return !/(#shorts|\bshorts\b|\breel\b|\breels\b|\bstatus video\b|\bwhatsapp status\b|\b30 sec status\b|\bgta 5\b|\bfreefire\b|\bpubg\b)/i.test(lower);
      })
      .map((v) => {
        const titleStr = typeof v.title === 'string' ? v.title : (v.title?.text || 'Official Video');
        const authorStr = typeof v.author?.name === 'string' ? v.author.name : 'YouTube Music';
        const dur = v.timestamp || formatMs((v.seconds || 0) * 1000);
        return {
          id: v.videoId,
          videoId: v.videoId,
          title: cleanTitle(titleStr),
          artist: cleanTitle(authorStr),
          album: 'YouTube Official',
          duration: dur,
          seconds: v.seconds || 210,
          thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          audioUrl: `/api/music/audio-stream/${v.videoId}?title=${encodeURIComponent(titleStr)}&artist=${encodeURIComponent(authorStr)}`,
          previewUrl: `/api/music/audio-stream/${v.videoId}?title=${encodeURIComponent(titleStr)}&artist=${encodeURIComponent(authorStr)}`,
          isYouTube: true,
          source: 'youtube',
          playable: true,
          genre: 'Music',
          language: detectLanguage(titleStr + ' ' + authorStr)
        };
      });

    const result = {
      videos: normalized,
      songs: normalized
    };
    setCached(cacheKey, result, CACHE_TTL_MS);
    return result;
  } catch (err) {
    console.warn(`[YouTube Search] Handled search error for "${cleanQ}":`, err.message);
    return { videos: [], songs: [] };
  }
}

/**
 * 3. Deezer Metadata Fallback
 */
async function searchDeezer({ query, type = 'track', limit = 10 }) {
  if (!query || !query.trim()) return [];
  const cacheKey = `deezer_${query}_${type}_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const endpoint = type === 'artist' ? 'search/artist' : type === 'album' ? 'search/album' : 'search';
    const res = await axios.get(`https://api.deezer.com/${endpoint}`, {
      params: { q: query.trim(), limit: Math.min(limit, 25) },
      timeout: 5000
    });
    const results = res.data?.data || [];
    setCached(cacheKey, results, CACHE_TTL_MS);
    return results;
  } catch (err) {
    return [];
  }
}

/**
 * 4. LRCLIB Lyrics Integration
 */
async function fetchLyrics({ track, artist }) {
  if (!track || !track.trim()) return { plainLyrics: null, syncedLyrics: null };
  const cleanTrack = String(track)
    .replace(/(\[.*?\]|\(.*?\))/g, '')
    .replace(/(official video|lyrics|audio|video|remix|hd|full song|single|original|telugu|hindi|tamil|english)/gi, '')
    .trim();

  try {
    const response = await axios.get('https://lrclib.net/api/get', {
      params: {
        track_name: cleanTrack,
        artist_name: artist ? String(artist).trim() : undefined
      },
      timeout: 4500
    });

    if (response.data) {
      return {
        plainLyrics: response.data.plainLyrics,
        syncedLyrics: response.data.syncedLyrics,
        trackName: response.data.trackName,
        artistName: response.data.artistName
      };
    }
  } catch (err) {
    // Search fallback
    try {
      const searchRes = await axios.get('https://lrclib.net/api/search', {
        params: { q: `${cleanTrack} ${artist || ''}`.trim() },
        timeout: 4500
      });
      if (searchRes.data && searchRes.data.length > 0) {
        const best = searchRes.data[0];
        return {
          plainLyrics: best.plainLyrics,
          syncedLyrics: best.syncedLyrics,
          trackName: best.trackName,
          artistName: best.artistName
        };
      }
    } catch (searchErr) {}
  }

  return {
    plainLyrics: `🎵 ${track}\n\nLyrics not yet indexed on LRCLIB. Enjoy high-fidelity listening on SoundWave!`,
    syncedLyrics: null
  };
}

/**
 * 5. Search Suggestions Engine (YouTube complete + iTunes terms)
 */
async function getSearchSuggestions(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim();
  const cacheKey = `sugg_${q}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const suggestions = new Set();

  try {
    const [ytRes, itunesRes] = await Promise.allSettled([
      axios.get(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`, { timeout: 3500 }),
      axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=6`, { timeout: 3500 })
    ]);

    if (ytRes.status === 'fulfilled' && Array.isArray(ytRes.value?.data?.[1])) {
      ytRes.value.data[1].slice(0, 7).forEach((item) => {
        if (typeof item === 'string') suggestions.add(item);
      });
    }

    if (itunesRes.status === 'fulfilled' && Array.isArray(itunesRes.value?.data?.results)) {
      itunesRes.value.data.results.forEach((item) => {
        if (item.trackName) suggestions.add(item.trackName);
        if (item.artistName && suggestions.size < 12) suggestions.add(item.artistName);
      });
    }
  } catch (e) {}

  const finalArr = Array.from(suggestions).slice(0, 10);
  setCached(cacheKey, finalArr, 10 * 60 * 1000);
  return finalArr;
}

/**
 * 6. Unified Search Endpoint
 * /api/music/search?q=<term>&language=&genre=&category=
 * Searches Apple iTunes and YouTube in parallel.
 * Merges, normalizes, deduplicates, and preserves the frontend contract:
 * { topResult, songs, videos, albums, artists, playlists, total }
 */
async function unifiedSearch({ q, language = '', genre = '', category = '', limit = 30 }) {
  const cleanQ = (q || '').trim();
  if (!cleanQ) {
    return {
      topResult: null,
      songs: [],
      videos: [],
      albums: [],
      artists: [],
      playlists: [],
      relatedSongs: [],
      lyrics: null,
      total: 0
    };
  }

  const cacheKey = `unified_search_${cleanQ}_${language}_${genre}_${category}_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Regional country hint for Apple iTunes
  // NEVER force country if query is Latin/English, unless user specifically chose a regional language
  const langLower = (language || '').toLowerCase();
  let itunesCountry = '';
  const isPureAscii = /^[\x00-\x7F]*$/.test(cleanQ);
  if (!isPureAscii && ['telugu', 'hindi', 'tamil', 'malayalam', 'kannada'].includes(langLower)) {
    itunesCountry = 'IN';
  } else if (!isPureAscii && langLower === 'korean') {
    itunesCountry = 'KR';
  }

  // Pure query term - NEVER pollute query with appended language names
  const itunesQuery = cleanQ;

  // Search iTunes (Songs, Albums, Artists), YouTube, and Deezer in parallel
  const [itunesSongsRes, itunesAlbumsRes, itunesArtistsRes, ytRes, deezerRes] = await Promise.allSettled([
    searchItunes({ term: itunesQuery, entity: 'song', limit: 30, country: itunesCountry }),
    searchItunes({ term: cleanQ, entity: 'album', limit: 12, country: itunesCountry }),
    searchItunes({ term: cleanQ, entity: 'musicArtist', limit: 10, country: itunesCountry }),
    searchYouTube({ query: cleanQ, limit: 20 }),
    searchDeezer({ query: cleanQ, type: 'track', limit: 10 })
  ]);

  const rawItunesSongs = itunesSongsRes.status === 'fulfilled' ? itunesSongsRes.value : [];
  const rawItunesAlbums = itunesAlbumsRes.status === 'fulfilled' ? itunesAlbumsRes.value : [];
  const rawItunesArtists = itunesArtistsRes.status === 'fulfilled' ? itunesArtistsRes.value : [];
  const rawYt = ytRes.status === 'fulfilled' ? ytRes.value : { videos: [], songs: [] };
  const rawDeezer = deezerRes.status === 'fulfilled' ? deezerRes.value : [];

  // Normalize Apple iTunes Songs
  const itunesSongs = rawItunesSongs.map((item) => {
    const songLang = detectLanguage(
      `${item.trackName} ${item.artistName} ${item.collectionName}`,
      language,
      item.primaryGenreName
    );
    return {
      id: `itunes-${item.trackId}`,
      trackId: item.trackId,
      title: cleanTitle(item.trackName),
      artist: cleanTitle(item.artistName || 'Unknown Artist'),
      album: cleanTitle(item.collectionName || ''),
      duration: formatMs(item.trackTimeMillis),
      seconds: Math.floor((item.trackTimeMillis || 0) / 1000),
      thumbnail: upgradeAppleArtwork(item.artworkUrl100),
      audioUrl: item.previewUrl || '',
      previewUrl: item.previewUrl || '',
      videoId: null,
      isYouTube: false,
      source: 'itunes',
      playable: Boolean(item.previewUrl),
      genre: item.primaryGenreName || genre || 'Music',
      language: songLang,
      releaseDate: item.releaseDate || ''
    };
  });

  // Normalize YouTube Music Videos & Songs
  const ytVideos = [...(rawYt.videos || [])];

  // If YouTube search returned 0 videos (e.g. rate limit / network), synthesize video entries from top songs
  if (ytVideos.length === 0 && itunesSongs.length > 0) {
    itunesSongs.slice(0, 10).forEach((s, idx) => {
      ytVideos.push({
        id: `yt-synth-${s.id}`,
        videoId: s.id,
        title: `${s.title} (Official Music Video)`,
        artist: s.artist,
        album: s.album || 'Official Music Video',
        duration: s.duration,
        seconds: s.seconds,
        thumbnail: s.thumbnail,
        audioUrl: s.audioUrl || s.previewUrl,
        previewUrl: s.previewUrl,
        isYouTube: true,
        source: 'youtube',
        playable: true,
        genre: s.genre || 'Music',
        language: s.language || 'English'
      });
    });
  }

  // Deduplicate and Merge Songs
  const songsMap = new Map();
  // 1. Add iTunes songs first (Priority: Studio audio & high-res artwork)
  itunesSongs.forEach((song) => {
    const key = `${song.title.toLowerCase()}___${song.artist.toLowerCase()}`;
    if (!songsMap.has(key)) {
      songsMap.set(key, song);
    }
  });

  // 2. Add YouTube songs if they don't duplicate
  ytVideos.forEach((ytSong) => {
    const key = `${ytSong.title.toLowerCase()}___${ytSong.artist.toLowerCase()}`;
    if (!songsMap.has(key) && songsMap.size < 40) {
      songsMap.set(key, ytSong);
    }
  });

  // 3. Add Deezer preview songs as fallback if still sparse
  if (songsMap.size < 5 && rawDeezer.length > 0) {
    rawDeezer.forEach((d) => {
      const title = cleanTitle(d.title);
      const artist = cleanTitle(d.artist?.name || 'Unknown Artist');
      const key = `${title.toLowerCase()}___${artist.toLowerCase()}`;
      if (!songsMap.has(key)) {
        songsMap.set(key, {
          id: `deezer-${d.id}`,
          trackId: d.id,
          title,
          artist,
          album: cleanTitle(d.album?.title || ''),
          duration: formatMs((d.duration || 0) * 1000),
          seconds: d.duration || 180,
          thumbnail: d.album?.cover_big || d.album?.cover_medium || upgradeAppleArtwork(''),
          audioUrl: d.preview || '',
          previewUrl: d.preview || '',
          videoId: null,
          isYouTube: false,
          source: 'deezer',
          playable: Boolean(d.preview),
          genre: genre || 'Music',
          language: detectLanguage(`${title} ${artist}`, language)
        });
      }
    });
  }

  let finalSongs = Array.from(songsMap.values());

  // Prioritize exact matches with query
  const lowerQ = cleanQ.toLowerCase();
  finalSongs.sort((a, b) => {
    const aTitleMatch = a.title.toLowerCase().includes(lowerQ);
    const bTitleMatch = b.title.toLowerCase().includes(lowerQ);
    const aArtistMatch = a.artist.toLowerCase().includes(lowerQ);
    const bArtistMatch = b.artist.toLowerCase().includes(lowerQ);

    if (aTitleMatch && !bTitleMatch) return -1;
    if (!aTitleMatch && bTitleMatch) return 1;
    if (aArtistMatch && !bArtistMatch) return -1;
    if (!aArtistMatch && bArtistMatch) return 1;
    return 0;
  });

  // Normalize Albums from iTunes
  const finalAlbums = rawItunesAlbums.map((alb) => ({
    id: `itunes-album-${alb.collectionId}`,
    collectionId: alb.collectionId,
    title: cleanTitle(alb.collectionName),
    artist: cleanTitle(alb.artistName),
    cover: upgradeAppleArtwork(alb.artworkUrl100),
    year: alb.releaseDate ? new Date(alb.releaseDate).getFullYear().toString() : '2024',
    tracksCount: alb.trackCount || 0,
    genre: alb.primaryGenreName || 'Music',
    source: 'itunes',
    language: detectLanguage(`${alb.collectionName} ${alb.artistName}`, language, alb.primaryGenreName)
  }));

  // Normalize Artists from iTunes with upgraded artwork
  const finalArtists = rawItunesArtists.map((art) => {
    const artName = cleanTitle(art.artistName);
    // Try to find artwork from songs by this artist
    const matchingSong = finalSongs.find(
      (s) => s.artist.toLowerCase() === artName.toLowerCase() || s.artist.toLowerCase().includes(artName.toLowerCase())
    );
    const matchingAlbum = finalAlbums.find(
      (a) => a.artist.toLowerCase() === artName.toLowerCase() || a.artist.toLowerCase().includes(artName.toLowerCase())
    );
    const artistImage =
      matchingSong?.thumbnail ||
      matchingAlbum?.cover ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop';

    return {
      id: `itunes-artist-${art.artistId}`,
      artistId: art.artistId,
      name: artName,
      genre: art.primaryGenreName || 'Music',
      image: artistImage,
      source: 'itunes'
    };
  });

  // Construct Rich Curated Playlists for the query
  const cover1 = finalSongs[0]?.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop';
  const cover2 = finalSongs[1]?.thumbnail || cover1;
  const cover3 = finalSongs[2]?.thumbnail || cover1;

  const finalPlaylists = [
    {
      id: `pl-${encodeURIComponent(cleanQ)}-essentials`,
      title: `${cleanQ} Essentials`,
      subtitle: `The definitive hits and essential tracks`,
      cover: cover1,
      tracksCount: Math.max(finalSongs.length, 15),
      source: 'soundwave',
      songs: finalSongs.slice(0, 10)
    },
    {
      id: `pl-${encodeURIComponent(cleanQ)}-radio`,
      title: `${cleanQ} Radio`,
      subtitle: `Endless stream inspired by ${cleanQ}`,
      cover: cover2,
      tracksCount: 25,
      source: 'soundwave',
      songs: finalSongs.slice(0, 10)
    },
    {
      id: `pl-${encodeURIComponent(cleanQ)}-global-hits`,
      title: `Global Top Hits: ${cleanQ}`,
      subtitle: `Chart-topping tracks and trending anthems`,
      cover: cover3,
      tracksCount: 20,
      source: 'soundwave',
      songs: finalSongs.slice(0, 10)
    }
  ];

  // Determine Top Result with intelligent matching
  let topResult = null;
  const topArtistMatch = finalArtists.find((art) => {
    const artLower = art.name.toLowerCase();
    return artLower === lowerQ ||
      artLower.includes(lowerQ) ||
      lowerQ.includes(artLower) ||
      artLower.replace(/^the\s+/i, '') === lowerQ.replace(/^the\s+/i, '');
  });

  const topAlbumMatch = finalAlbums.find((alb) => {
    const albLower = alb.title.toLowerCase();
    return albLower === lowerQ || albLower.startsWith(lowerQ);
  });

  if (topArtistMatch) {
    topResult = {
      type: 'artist',
      data: topArtistMatch
    };
  } else if (topAlbumMatch) {
    topResult = {
      type: 'album',
      data: topAlbumMatch
    };
  } else if (finalSongs.length > 0) {
    topResult = {
      type: 'song',
      data: finalSongs[0]
    };
  } else if (ytVideos.length > 0) {
    topResult = {
      type: 'video',
      data: ytVideos[0]
    };
  }

  // Related songs: songs after the top 5
  const relatedSongs = finalSongs.slice(5, 15);

  const responseData = {
    topResult,
    songs: finalSongs,
    videos: ytVideos,
    albums: finalAlbums,
    artists: finalArtists,
    playlists: finalPlaylists,
    relatedSongs,
    lyrics: null,
    total: finalSongs.length + ytVideos.length + finalAlbums.length + finalArtists.length,
    // Backwards compatibility aliases for existing frontend
    results: finalSongs,
    tracks: finalSongs,
    hasMore: false,
    page: 1,
    query: cleanQ
  };

  setCached(cacheKey, responseData, CACHE_TTL_MS);
  return responseData;
}

/**
 * 7. Audio Stream Resolver
 * Handles playback securely:
 * - Direct iTunes preview URLs
 * - Deezer preview URLs
 * - YouTube search & stream resolution
 */
async function resolveAudioStream({ videoId, title = '', artist = '' }) {
  if (!videoId) throw new Error('Video/Track ID is required');

  // Case 1: If it's already an iTunes ID (e.g. 'itunes-123456789')
  if (videoId.startsWith('itunes-')) {
    const rawId = videoId.replace('itunes-', '');
    const lookup = await lookupItunes({ id: rawId });
    const track = lookup?.find((x) => x.wrapperType === 'track');
    if (track?.previewUrl) {
      return {
        streamUrl: track.previewUrl,
        direct: true,
        source: 'itunes',
        title: track.trackName,
        artist: track.artistName
      };
    }
  }

  // Case 2: If title and artist are supplied, query iTunes for an official high-fidelity preview stream
  if (title) {
    const cleanT = cleanTitle(title)
      .replace(/(\[.*?\]|\(.*?\))/g, '')
      .replace(/(official video|lyrics|audio|video|remix|hd|full song)/gi, '')
      .trim();
    const cleanA = cleanTitle(artist);
    const itunesMatch = await searchItunes({ term: `${cleanT} ${cleanA}`.trim(), entity: 'song', limit: 3 });
    if (itunesMatch && itunesMatch[0]?.previewUrl) {
      return {
        streamUrl: itunesMatch[0].previewUrl,
        direct: true,
        source: 'itunes',
        title: itunesMatch[0].trackName,
        artist: itunesMatch[0].artistName
      };
    }

    // Case 3: Deezer preview fallback
    const deezerMatch = await searchDeezer({ query: `${cleanT} ${cleanA}`.trim(), type: 'track', limit: 2 });
    if (deezerMatch && deezerMatch[0]?.preview) {
      return {
        streamUrl: deezerMatch[0].preview,
        direct: true,
        source: 'deezer',
        title: deezerMatch[0].title,
        artist: deezerMatch[0].artist?.name
      };
    }
  }

  // Case 4: If it's a YouTube video ID, proxy via server route
  const proxyUrl = `/api/music/audio-stream/${videoId}${title ? `?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}` : ''}`;
  return {
    streamUrl: proxyUrl,
    direct: false,
    source: 'youtube',
    videoId
  };
}

module.exports = {
  searchItunes,
  lookupItunes,
  searchYouTube,
  searchDeezer,
  fetchLyrics,
  getSearchSuggestions,
  unifiedSearch,
  resolveAudioStream,
  upgradeAppleArtwork,
  detectLanguage,
  formatMs,
  cleanTitle
};
