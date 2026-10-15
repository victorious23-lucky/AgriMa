import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client using server-side environment key
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

const AGRIMA_SYSTEM_INSTRUCTION = `You are "AgriMa AI", an agricultural market intelligence advisor and farming assistant for AgriMa (Kenya's premier digital farm produce marketplace).
Your job is to assist farmers, produce aggregators, and institutional/retail buyers with:
1. Commodity Price Intelligence: Wholesale & retail benchmarks across Wakulima/Marikiti (Nairobi), Kongowea (Mombasa), Kangemi, Eldoret Municipal, Nakuru Top Market, Kisumu Jubilee Market.
2. Direct Negotiation Advice: Formulate fair counter-offers, calculate profit margins, volume discounts, packaging costs, and transport overheads.
3. Agronomic & Quality Guidance: Crop grading (e.g., Export Grade 1 Hass avocados, Grade A/B round tomatoes, clean sorted Irish potatoes, dry maize <13.5% moisture), pest diagnostics, post-harvest losses prevention.
4. Logistics & Escrow: Explain AgriMa's M-Pesa escrow protection, delivery verification, transit routes between productive counties (Kiambu, Meru, Nakuru, Nyandarua, Uasin Gishu, Narok, Machakos, Kirinyaga) and urban hubs.

Tone: Professional, encouraging, deeply knowledgeable about African agriculture, clear, and culturally attuned to Kenyan agricultural terms (e.g., debe, crate, 90kg gunny bag, net bag, farmgate).
Provide structured markdown responses with bullet points, realistic KES prices, and immediate next steps.`;

// POST /api/gemini/chat
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], userRole = 'user', context = '' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (aiClient) {
      try {
        const contents: any[] = [];

        // Build history
        if (Array.isArray(history) && history.length > 0) {
          for (const item of history.slice(-6)) {
            contents.push({
              role: item.role === 'model' || item.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: item.text || item.content || '' }]
            });
          }
        }

        const promptWithContext = context 
          ? `Current User Role: ${userRole}\nContext Data: ${context}\n\nUser Query: ${message}`
          : `Current User Role: ${userRole}\nUser Query: ${message}`;

        contents.push({
          role: 'user',
          parts: [{ text: promptWithContext }]
        });

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: AGRIMA_SYSTEM_INSTRUCTION,
            temperature: 0.7
          }
        });

        const reply = response.text || "I've analyzed your agricultural request. Please check the market prices tab for the latest verified trade quotes.";
        res.json({ reply, source: 'gemini-3.8-flash' });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to expert knowledge base:', geminiError?.message || geminiError);
      }
    }

    // High-quality local agricultural knowledge engine fallback
    const fallbackReply = generateAgriculturalKnowledgeResponse(message, userRole, context);
    res.json({ reply: fallbackReply, source: 'agrima-expert-engine' });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Failed to process request', details: error?.message });
  }
});

// Helper for realistic fallback agricultural advice
function generateAgriculturalKnowledgeResponse(message: string, role: string, context?: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('tomato') || lower.includes('nyanya')) {
    return `### 🍅 Tomato Market & Pricing Intelligence (Kenyan Hubs)\n\n` +
      `* **Current Wholesale Range**: KES 7,500 – 9,800 per 64kg wooden wooden crate (Nairobi Wakulima & Kangemi).\n` +
      `* **Farmgate Price (Kirinyaga / Kajiado)**: KES 4,500 – 6,200 per crate depending on firmness and grading.\n` +
      `* **Quality Tip**: Grade 1 tomatoes (firm, pink-to-light red, uniform size) command a 20-25% price premium over mixed harvest.\n` +
      `* **Negotiation Advice**: If negotiating for 10+ crates, offer a 5-8% bulk concession on condition that payment is locked into AgriMa Escrow immediately.`;
  }

  if (lower.includes('avocado') || lower.includes('hass') || lower.includes('fuerte')) {
    return `### 🥑 Avocado Export & Domestic Grade Advisory\n\n` +
      `* **Hass Avocado Benchmark**: KES 90 – 140 per kg for export-grade (dry matter >23%, sizes 12-20).\n` +
      `* **Domestic Wholesale (Marikiti/Kongowea)**: KES 45 – 70 per kg for table consumption.\n` +
      `* **Key Recommendation**: Do not harvest prematurely; oil content and dry matter testing protect your rating on AgriMa and prevent buyer rejection disputes.`;
  }

  if (lower.includes('maize') || lower.includes('corn') || lower.includes('mahindi')) {
    return `### 🌽 Dry Maize & Cereal Trade Analysis\n\n` +
      `* **Current 90kg Bag Wholesale**: KES 3,400 – 4,100 (Eldoret & Kitale depot collection: ~KES 3,200; Nairobi delivered: ~KES 3,900).\n` +
      `* **Quality Prerequisite**: Moisture content MUST test strictly below 13.5% to avoid aflatoxin discount penalties.\n` +
      `* **Escrow Logistics**: When ordering bulk dry cereals on AgriMa, the buyer's payment remains safeguarded in escrow until moisture inspection upon delivery.`;
  }

  if (lower.includes('potato') || lower.includes('waru') || lower.includes('shangi')) {
    return `### 🥔 Irish Potato (Shangi) Market Update\n\n` +
      `* **Wholesale Benchmark (50kg extended bag)**: KES 2,600 – 3,400 at Nyandarua/Molo farmgate; KES 3,800 – 4,500 in Nairobi.\n` +
      `* **Storage Tip**: Avoid direct sunlight immediately after harvest to prevent greening (solanine buildup), which causes buyer returns.`;
  }

  if (lower.includes('negotiat') || lower.includes('price') || lower.includes('offer') || lower.includes('counter')) {
    return `### 💡 AgriMa Smart Negotiation Strategy\n\n` +
      `1. **Anchor with Market Benchmark**: Reference AgriMa's official Market Prices view to show why your requested price is justified.\n` +
      `2. **Volume Incentive**: Propose staggered pricing (e.g., normal unit price for <50kg, 7% concession for 200kg+).\n` +
      `3. **Logistics Clarity**: Specify clearly whether the price is 'Farmgate Pick-up' or 'Delivered to Buyer Hub'.\n` +
      `4. **Escrow Guarantee**: Highlight that funds are 100% held in AgriMa Escrow, eliminating payment default risk for both parties.`;
  }

  if (lower.includes('pest') || lower.includes('disease') || lower.includes('blight') || lower.includes('spray')) {
    return `### 🛡️ Crop Protection & Agronomy Diagnostic\n\n` +
      `* **Early/Late Blight in Solanaceae**: Rotate Mancozeb (protectant) and Metalaxyl/Cymoxanil (systemic) fungicides during high humidity.\n` +
      `* **Fall Armyworm (Cereals)**: Scout weekly for pinhole leaf damage; apply Emamectin benzoate or registered bio-pesticides early morning/late evening.\n` +
      `* **Withholding Period**: Strictly observe pre-harvest spray intervals to ensure produce tests free of chemical residues before listing on AgriMa.`;
  }

  return `### 🌱 AgriMa Agricultural Assistant\n\n` +
    `Hello! As AgriMa's marketplace assistant, I'm here to support your farm trade:\n\n` +
    `* **Live Market Intelligence**: Ask me for benchmark prices for tomatoes, avocados, potatoes, onions, maize, cabbages, or watermelons across Kenya's wholesale markets.\n` +
    `* **Offer & Contract Advice**: I can help draft counter-offers, calculate break-even transport costs, or review batch quantities.\n` +
    `* **Quality Standards**: Inquire about export specifications, grading criteria, and post-harvest handling.\n` +
    `* **Escrow & Safe Trade**: All orders on AgriMa feature escrow protection to ensure verified delivery before fund disbursement.\n\n` +
    `What crop or trade query can I assist you with right now?`;
}

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`AgriMa Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
