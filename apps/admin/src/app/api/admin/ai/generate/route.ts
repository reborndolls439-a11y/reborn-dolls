import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type GenerateField =
  | "description"
  | "shortDescription"
  | "seoTitle"
  | "seoDescription"
  | "tags"
  | "materials"
  | "careInstructions"
  | "whatsIncluded";

interface ProductContext {
  name: string;
  shortDescription?: string;
  description?: string;
  materials?: string;
  dimensions?: string;
  category?: string;
}

const prompts: Record<GenerateField, (ctx: ProductContext) => string> = {
  description: (ctx) => `You are a professional copywriter for a premium reborn doll e-commerce store called "Reborn Dolls".
Write a rich, evocative, SEO-optimised product description for the following reborn doll listing.

Product name: ${ctx.name}
${ctx.shortDescription ? `Short description: ${ctx.shortDescription}` : ""}
${ctx.materials ? `Materials: ${ctx.materials}` : ""}
${ctx.dimensions ? `Dimensions: ${ctx.dimensions}` : ""}
${ctx.category ? `Category: ${ctx.category}` : ""}

Write 3-4 paragraphs of compelling HTML description (use <p> tags). Focus on the artistry and craftsmanship, emotional connection and collector appeal, materials and quality details, and why this is the perfect piece for a collector or gift.
Return ONLY the HTML content, no markdown, no extra text.`,

  shortDescription: (ctx) => `Write a single compelling sentence (max 160 characters) for a reborn doll product card.
Product name: ${ctx.name}
${ctx.category ? `Category: ${ctx.category}` : ""}
${ctx.materials ? `Materials: ${ctx.materials}` : ""}
Return ONLY the one sentence.`,

  seoTitle: (ctx) => `Write an SEO-optimised page title (50-60 characters) for this reborn doll product listing.
Product name: ${ctx.name}
${ctx.category ? `Category: ${ctx.category}` : ""}
Store name: Reborn Dolls
Format: [Product Name] | [Brief descriptor] | Reborn Dolls
Return ONLY the title string, nothing else.`,

  seoDescription: (ctx) => `Write an SEO meta description for this reborn doll product. Keep it concise, around 1-2 sentences.
Product name: ${ctx.name}
${ctx.shortDescription ? `Short description: ${ctx.shortDescription}` : ""}
${ctx.category ? `Category: ${ctx.category}` : ""}
Store name: Reborn Dolls
Include: product name, key feature, and a call to action.
Return ONLY the meta description text, nothing else.`,

  tags: (ctx) => `Generate 8-12 relevant SEO tags (comma-separated, lowercase) for this reborn doll product.
Product name: ${ctx.name}
${ctx.category ? `Category: ${ctx.category}` : ""}
${ctx.materials ? `Materials: ${ctx.materials}` : ""}
${ctx.description ? `Description snippet: ${ctx.description.slice(0, 200)}` : ""}
Include: doll type, materials, style, collector keywords.
Return ONLY the comma-separated tags, nothing else.`,

  materials: (ctx) => `Write a concise materials description for a reborn doll product.
Product name: ${ctx.name}
${ctx.category ? `Category: ${ctx.category}` : ""}
Typical reborn doll materials include: vinyl, silicone, mohair, glass eyes, weighted body, cloth body.
Return a single line like: "Vinyl head and limbs, cloth body, hand-rooted mohair hair, glass eyes, weighted with glass beads."
Return ONLY the materials string, nothing else.`,

  careInstructions: (_ctx) => `Write brief care instructions for a reborn doll collectible (2-3 sentences).
Cover: cleaning method, storage, sun exposure, temperature.
Return ONLY the care instructions text, nothing else.`,

  whatsIncluded: (ctx) => `Write a concise "What's Included" list for a reborn doll product.
Product name: ${ctx.name}
Return a single line like: "Doll, hand-knit outfit, matching blanket, personalised birth certificate, gift box."
Return ONLY the included items string, nothing else.`,
};

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured." }, { status: 503 });
    }

    const body = await request.json();
    const { field, context } = body as { field: GenerateField; context: ProductContext };

    if (!field || !context?.name) {
      return NextResponse.json({ error: "field and context.name are required." }, { status: 400 });
    }

    if (!prompts[field]) {
      return NextResponse.json({ error: `Unknown field: ${field}` }, { status: 400 });
    }

    const prompt = prompts[field](context);

    // Use plain fetch to Groq API (avoids SDK bundling issues on Vercel)
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("[AI_GENERATE] Groq API error:", groqRes.status, errText);
      return NextResponse.json(
        { error: `AI service error (${groqRes.status}). Please try again.` },
        { status: 500 }
      );
    }

    const data = await groqRes.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "";

    if (!result) {
      return NextResponse.json({ error: "AI returned empty response." }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[AI_GENERATE]", msg);
    return NextResponse.json({ error: `AI generation failed: ${msg}` }, { status: 500 });
  }
}
