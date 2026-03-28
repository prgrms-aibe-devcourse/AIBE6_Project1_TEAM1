import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

interface PlaceInput {
  id: string
  name: string
  category: string
  lat: number
  lng: number
  transportType?: string
}

export async function POST(req: NextRequest) {
  try {
    const { places } = (await req.json()) as { places: PlaceInput[] }

    if (!places || places.length < 2) {
      return NextResponse.json(
        { error: '2 or more places are required.' },
        { status: 400 },
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured.' },
        { status: 500 },
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    
    const placeList = places
      .map(
        (p, i) =>
          `${i}. ${p.name} (Category: ${p.category}, Lat: ${p.lat.toFixed(4)}, Lng: ${p.lng.toFixed(4)})`,
      )
      .join('\n')

    const prompt = `AI Travel Expert: Optimize travel route for ONE day.
Places:
${placeList}

Criteria:
1. Minimize total distance.
2. Natural flow (Sightseeing -> Restaurant -> Cafe -> etc.).
3. Group nearby locations.

Respond ONLY with JSON:
{
  "order": [original_index_array],
  "reason": "Short 2-3 sentence explanation in KOREAN"
}`

    // Based on diagnostic check, using ONLY models confirmed to exist in this project.
    const configToTry = [
      { model: 'gemini-2.0-flash-lite', apiVersion: 'v1beta' }, // Highly recommended lite model
      { model: 'gemini-3.1-flash-lite-preview', apiVersion: 'v1beta' }, // Latest preview
      { model: 'gemini-2.0-flash', apiVersion: 'v1beta' }, // Original
      { model: 'gemini-2.5-flash', apiVersion: 'v1beta' }
    ]
    
    let result = null
    let lastError: any = null

    for (const config of configToTry) {
      try {
        const model = genAI.getGenerativeModel(
          { model: config.model }, 
          { apiVersion: config.apiVersion as any }
        )
        result = await model.generateContent(prompt)
        if (result) break
      } catch (err: any) {
        lastError = err
        console.warn(`[AI Optimize] Model ${config.model} failed:`, err.message)
        if (err?.status === 429) continue
        continue
      }
    }

    if (!result) {
      const is429 = lastError?.status === 429 || lastError?.message?.includes('429')
      return NextResponse.json(
        { 
          error: is429 
            ? 'API quota limit hit. Please wait a moment and retry.' 
            : `AI optimization failed (Project-specific): ${lastError?.message || 'Unknown'}` 
        },
        { status: is429 ? 429 : 500 }
      )
    }

    const text = result.response.text().trim()
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(jsonStr)

    return NextResponse.json({
      order: parsed.order,
      reason: parsed.reason || 'AI has optimized the route.',
    })
  } catch (err: any) {
    console.error('[AI Optimize Error]', err)
    return NextResponse.json(
      { error: err.message || 'Error during AI optimization.' },
      { status: 500 },
    )
  }
}
