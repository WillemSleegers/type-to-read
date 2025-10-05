import { NextRequest, NextResponse } from 'next/server'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TouchToRead/1.0; +https://github.com/yourusername/touch-to-read)'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      )
    }

    const html = await response.text()

    // Parse with Readability
    const dom = new JSDOM(html, { url })
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    if (!article || !article.textContent) {
      return NextResponse.json(
        { error: 'Could not extract readable content from this page' },
        { status: 422 }
      )
    }

    return NextResponse.json({
      title: article.title,
      content: article.textContent.trim(),
      excerpt: article.excerpt,
      siteName: article.siteName,
    })

  } catch (error) {
    console.error('Extract error:', error)
    return NextResponse.json(
      { error: 'An error occurred while extracting text' },
      { status: 500 }
    )
  }
}
