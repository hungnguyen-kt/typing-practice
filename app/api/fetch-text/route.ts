import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, language } = await request.json();

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    let extractedText = '';

    if (language === 'english') {
      // Extract text from Fox News - look for article content
      const articleMatches = html.match(/<p[^>]*>(.*?)<\/p>/gi);
      if (articleMatches) {
        const cleanedTexts = articleMatches
          .slice(0, 5) // Take first 5 paragraphs
          .map(match => match.replace(/<[^>]*>/g, '').trim())
          .filter(text => text.length > 50 && !text.includes('@') && !text.includes('http'));

        if (cleanedTexts.length > 0) {
          extractedText = cleanedTexts[Math.floor(Math.random() * cleanedTexts.length)];
        }
      }
    } else if (language === 'japanese') {
      // Extract text from NHK - look for Japanese content
      const japaneseMatches = html.match(/<p[^>]*>([^<]*[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF][^<]*)<\/p>/gi);
      if (japaneseMatches) {
        const cleanedTexts = japaneseMatches
          .slice(0, 5) // Take first 5 paragraphs
          .map(match => match.replace(/<[^>]*>/g, '').trim())
          .filter(text => text.length > 20 && text.length < 200);

        if (cleanedTexts.length > 0) {
          extractedText = cleanedTexts[Math.floor(Math.random() * cleanedTexts.length)];
        }
      }
    }

    // If no text found, return null so the frontend can use default texts
    if (!extractedText) {
      return NextResponse.json({ text: null });
    }

    // Clean up the text further
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .trim();

    // Limit text length for typing practice
    if (extractedText.length > 300) {
      extractedText = extractedText.substring(0, 300).trim();
      // Try to end at a sentence
      const lastPeriod = extractedText.lastIndexOf('.');
      const lastExclamation = extractedText.lastIndexOf('!');
      const lastQuestion = extractedText.lastIndexOf('?');
      const lastSentence = Math.max(lastPeriod, lastExclamation, lastQuestion);

      if (lastSentence > 200) {
        extractedText = extractedText.substring(0, lastSentence + 1);
      }
    }

    return NextResponse.json({ text: extractedText });

  } catch (error) {
    console.error('Error fetching text:', error);
    return NextResponse.json(
      { error: 'Failed to fetch text', text: null },
      { status: 500 }
    );
  }
}