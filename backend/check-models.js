// backend/check-models.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ API Key missing in .env");
    process.exit(1);
}

// SDK ka internal ModelManager use karke list nikalte hain
// (Note: Ye feature sirf nayi SDK versions mein hai)
async function listAvailableModels() {
    console.log("🔍 Fetching available models for your API Key...");
    
    // Direct API URL hit karte hain (SDK bypass) taaki 100% sach pata chale
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", data.error.message);
            return;
        }

        if (!data.models) {
            console.log("⚠️ No models found. Check if API Key is valid.");
            return;
        }

        console.log("\n✅ AVAILABLE MODELS:");
        console.log("--------------------");
        const usefulModels = data.models
            .filter(m => m.name.includes('gemini')) // Sirf Gemini models dikhao
            .map(m => m.name.replace('models/', '')); // 'models/' prefix hatao

        console.log(usefulModels.join('\n'));

        console.log("\n💡 Recommendation: Upar wali list mein se koi bhi naam copy karke 'gemini.js' mein daal do.");

    } catch (error) {
        console.error("❌ Network Error:", error.message);
    }
}

listAvailableModels();