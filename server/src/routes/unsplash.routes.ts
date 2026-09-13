import { Router, Request, Response } from 'express';

export const unsplashRouter = Router();

interface FormattedPhoto {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  photographerName: string;
  photographerUrl: string;
  unsplashUrl: string;
}

// Curated high-res editorial photos for fallback when no API key is provided
const CURATED_EDITORIAL_PHOTOS: FormattedPhoto[] = [
  {
    id: 'editorial-1',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&auto=format&fit=crop&q=80',
    alt: 'Fountain pen resting on an open journal with handwritten notes',
    photographerName: 'Aaron Burden',
    photographerUrl: 'https://unsplash.com/@aaronburden',
    unsplashUrl: 'https://unsplash.com/photos/y02jEX_B0O0',
  },
  {
    id: 'editorial-2',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&auto=format&fit=crop&q=80',
    alt: 'Minimalist workspace with coffee, notebook and clean desk',
    photographerName: 'Andrew Neel',
    photographerUrl: 'https://unsplash.com/@andrewtneel',
    unsplashUrl: 'https://unsplash.com/photos/cckf4TsHAuw',
  },
  {
    id: 'editorial-3',
    url: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=400&auto=format&fit=crop&q=80',
    alt: 'Stacks of vintage books in a quiet library',
    photographerName: 'Tom Hermans',
    photographerUrl: 'https://unsplash.com/@tomhermans',
    unsplashUrl: 'https://unsplash.com/photos/s95oB2n9jng',
  },
  {
    id: 'editorial-4',
    url: 'https://images.unsplash.com/photo-1507842229451-7f41c30ab9b1?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1507842229451-7f41c30ab9b1?w=400&auto=format&fit=crop&q=80',
    alt: 'Sunlight filtering through library bookshelves',
    photographerName: 'Susan Q Yin',
    photographerUrl: 'https://unsplash.com/@itsq',
    unsplashUrl: 'https://unsplash.com/photos/2JIvboGLeho',
  },
  {
    id: 'editorial-5',
    url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&auto=format&fit=crop&q=80',
    alt: 'Architectural geometry and tranquil warm light',
    photographerName: 'Simone Hutsch',
    photographerUrl: 'https://unsplash.com/@heysupersimi',
    unsplashUrl: 'https://unsplash.com/photos/4_jhDO54BYg',
  },
  {
    id: 'editorial-6',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&auto=format&fit=crop&q=80',
    alt: 'Open book on wooden table in soft natural daylight',
    photographerName: 'Jaredd Craig',
    photographerUrl: 'https://unsplash.com/@jaredd_craig',
    unsplashUrl: 'https://unsplash.com/photos/HH4WBGNyltc',
  },
  {
    id: 'editorial-7',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
    alt: 'Vintage books arranged neatly on dark wood',
    photographerName: 'Kimberly Farmer',
    photographerUrl: 'https://unsplash.com/@kimberlyfarmer',
    unsplashUrl: 'https://unsplash.com/photos/lUaaKCUANVI',
  },
  {
    id: 'editorial-8',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=80',
    alt: 'Person writing thoughtful ideas on paper with pencil',
    photographerName: 'Cathryn Lavery',
    photographerUrl: 'https://unsplash.com/@cathrynlavery',
    unsplashUrl: 'https://unsplash.com/photos/fMD_Wrhfn Royale',
  },
];

/**
 * GET /api/unsplash/search
 * Searches Unsplash API with client-provided query, or falls back to curated editorial collection
 */
unsplashRouter.get('/search', async (req: Request, res: Response): Promise<void> => {
  const query = (req.query.query as string)?.trim() || 'editorial';
  const page = parseInt(req.query.page as string, 10) || 1;
  const perPage = parseInt(req.query.per_page as string, 10) || 12;

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    // If no access key is provided, filter curated fallback by query keywords
    const lowerQuery = query.toLowerCase();
    const filtered = CURATED_EDITORIAL_PHOTOS.filter(
      (p) =>
        p.alt.toLowerCase().includes(lowerQuery) ||
        p.photographerName.toLowerCase().includes(lowerQuery)
    );
    const results = filtered.length > 0 ? filtered : CURATED_EDITORIAL_PHOTOS;

    res.json({
      results,
      total: results.length,
      totalPages: 1,
      isFallback: true,
      message: 'Add UNSPLASH_ACCESS_KEY to server/.env for live Unsplash global search.',
    });
    return;
  }

  try {
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&page=${page}&per_page=${perPage}&orientation=landscape`;

    const response = await fetch(unsplashUrl, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Unsplash API responded with error:', response.status, errorText);
      res.json({
        results: CURATED_EDITORIAL_PHOTOS,
        total: CURATED_EDITORIAL_PHOTOS.length,
        totalPages: 1,
        isFallback: true,
        error: `Unsplash API returned ${response.status}`,
      });
      return;
    }

    const data: any = await response.json();
    const formatted: FormattedPhoto[] = (data.results || []).map((photo: any) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumb: photo.urls.small,
      alt: photo.alt_description || photo.description || 'Editorial photography',
      photographerName: photo.user?.name || 'Unsplash Photographer',
      photographerUrl: photo.user?.links?.html || 'https://unsplash.com',
      unsplashUrl: photo.links?.html || 'https://unsplash.com',
    }));

    res.json({
      results: formatted,
      total: data.total || formatted.length,
      totalPages: data.total_pages || 1,
      isFallback: false,
    });
  } catch (err: any) {
    console.error('Error querying Unsplash API:', err);
    res.json({
      results: CURATED_EDITORIAL_PHOTOS,
      total: CURATED_EDITORIAL_PHOTOS.length,
      totalPages: 1,
      isFallback: true,
      error: err.message,
    });
  }
});

export default unsplashRouter;
