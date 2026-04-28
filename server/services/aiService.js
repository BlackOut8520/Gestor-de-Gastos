import { GoogleGenerativeAI } from "@google/generative-ai";

export const askGemini = async (pregunta, transacciones, historial = []) => {
    if (!process.env.GEMINI_API_KEY) throw new Error("Llave no encontrada");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
    
    // Mantenemos estrictamente el modelo 2.5 Flash como solicitaste
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        generationConfig: { 
            responseMimeType: "application/json", 
            temperature: 0.1 
        }
    });

    const hoy = new Date();
    const fechaHoyISO = hoy.toISOString().split('T')[0];

    const datosLimpios = transacciones.map(t => ({
        descripcion: t.description,
        monto: t.amount,
        tipo: t.type,
        fecha: t.date ? new Date(t.date).toISOString().split('T')[0] : 'Sin fecha',
        categoria: t.category || 'General'
    }));

    const promptSistema = `Eres el Analista Maestro de BlackLabs. Hoy es ${fechaHoyISO}.
Datos: ${JSON.stringify(datosLimpios)}.

REGLAS DE SALIDA:
1. Si el usuario pide analizar, comparar o ver tendencias, DEBES generar datos en el objeto 'visual'.
2. Si pide registrar un movimiento, genera el objeto 'action'.
3. Responde ÚNICAMENTE con este JSON:

{
  "texto": "Tu respuesta",
  "visual": { "renderizar": true/false, "tipo": "pie" o "bar", "titulo": "Título", "datos": [{"name": "Eje X", "value": 0}] },
  "action": null o {"type": "CONFIRM_TRANSACTION", "payload": {...}}
}`;

    try {
        let memory = [];
        
        // Inyectamos el prompt de sistema como el primer mensaje de la historia para forzar el contexto
        memory.push({ role: "user", parts: [{ text: `INSTRUCCIONES: ${promptSistema}` }] });
        memory.push({ role: "model", parts: [{ text: "{\"texto\": \"Sistema BlackLabs configurado.\", \"visual\": {\"renderizar\": false}, \"action\": null}" }] });

        // Procesamos el historial asegurando la alternancia User/Model
        let lastRole = "model";
        historial.forEach(m => {
            const currentRole = m.role === 'user' ? 'user' : 'model';
            const text = m.parts?.[0]?.text;
            
            if (text && currentRole !== lastRole) {
                memory.push({ role: currentRole, parts: [{ text }] });
                lastRole = currentRole;
            }
        });

        const chat = model.startChat({ history: memory });
        const result = await chat.sendMessage(pregunta);
        const responseText = result.response.text();

        // Limpieza de Markdown para evitar errores de parseo
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleanJson);

        return {
            texto: data.texto || "Análisis completado.",
            visual: data.visual || { renderizar: false, datos: [] },
            action: data.action || null
        };

    } catch (error) {
        console.error("--- ERROR EN AI SERVICE ---", error.message);
        return { 
            texto: "Error de comunicación con la IA. Intenta de nuevo.", 
            visual: { renderizar: false, datos: [] },
            action: null 
        };
    }
};