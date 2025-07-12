import { OPENAI_API_KEY } from '../utils/constants';

export const useOpenAI = () => {
    const callOpenAI = async (messages, includeVision = false) => {
      if (!OPENAI_API_KEY) {
        throw new Error('API key da OpenAI não configurada no sistema');
      }
  
      try {
        console.log('🔄 Chamando OpenAI API...', { includeVision });
        
        let formattedMessages = [];
        
        if (typeof messages === 'string') {
          formattedMessages = [{ role: 'user', content: messages }];
        } else if (Array.isArray(messages)) {
          formattedMessages = messages;
        } else {
          throw new Error('Formato de mensagens inválido');
        }
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: includeVision ? 'gpt-4o' : 'gpt-4o-mini',
            messages: formattedMessages,
            max_tokens: includeVision ? 1500 : 800,
            temperature: 0.7
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ OpenAI API Error:', errorData);
          
          if (response.status === 404) {
            throw new Error('Modelo não encontrado. Verifica se tens acesso ao GPT-4o.');
          } else if (response.status === 401) {
            throw new Error('API Key inválida ou sem permissões.');
          } else if (response.status === 429) {
            throw new Error('Limite de requests excedido. Tenta novamente em alguns segundos.');
          }
          
          throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
        
      } catch (error) {
        console.error('💥 OpenAI API Error:', error);
        throw error;
      }
    };
  
    const generateOutfitRecommendation = async (data, wardrobe, mode = 'guided') => {
      let prompt;
      
      if (mode === 'freetext') {
        prompt = `Como consultor de moda expert, analisa esta situação específica e cria uma recomendação detalhada de outfit:
  
  SITUAÇÃO: "${data.description}"
  
  ARMÁRIO DISPONÍVEL:
  ${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}
  
  Por favor, fornece:
  1. OUTFIT ESPECÍFICO: Peças exatas do armário ou sugestões específicas
  2. JUSTIFICAÇÃO: Porquê esta escolha é perfeita para a situação
  3. DICAS EXTRAS: 3-4 dicas específicas para esta situação
  4. ALTERNATIVAS: 1-2 variações do look principal
  
  Responde de forma clara e prática, focando nas peças disponíveis no armário.`;
      } else {
        // Guided mode with structured data
        const { occasion, weather, mood, timeOfDay, colors, formality } = data;
        
        prompt = `Como consultor de moda expert, cria uma recomendação de outfit baseada nestas especificações:
  
  CRITÉRIOS:
  - Ocasião: ${occasion}
  - Tempo/Clima: ${weather}
  - Humor/Estilo: ${mood}
  - Período do dia: ${timeOfDay}
  - Cores preferidas: ${colors?.join(', ') || 'Nenhuma preferência'}
  - Nível de formalidade: ${formality}
  
  ARMÁRIO DISPONÍVEL:
  ${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}
  
  Por favor, cria uma recomendação que inclua:
  1. OUTFIT PRINCIPAL: Peças específicas do armário que combinam perfeitamente
  2. JUSTIFICAÇÃO: Porque esta combinação funciona para os critérios dados
  3. STYLING TIPS: Como usar/combinar as peças (dobrar mangas, meter por dentro, etc.)
  4. ACESSÓRIOS: Sugestões que complementem o look
  5. ALTERNATIVAS: 1-2 variações usando outras peças do armário
  
  Foca nas peças que realmente existem no armário!`;
      }
  
      return await callOpenAI(prompt);
    };
  
    const generateStyleAdvice = async (question, userContext = {}) => {
      const { wardrobe = [], recentOutfits = [], preferences = {} } = userContext;
      
      const prompt = `Como especialista em moda e styling pessoal, responde a esta pergunta:
  
  PERGUNTA: "${question}"
  
  CONTEXTO DO UTILIZADOR:
  - Peças no armário: ${wardrobe.length} itens
  - Outfits recentes: ${recentOutfits.length}
  - Preferências: ${Object.entries(preferences).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Não especificadas'}
  
  ${wardrobe.length > 0 ? `
  ALGUMAS PEÇAS DISPONÍVEIS:
  ${wardrobe.slice(0, 10).map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}
  ${wardrobe.length > 10 ? `... e mais ${wardrobe.length - 10} peças` : ''}
  ` : ''}
  
  Por favor, fornece conselhos práticos e personalizados, considerando as peças que a pessoa tem disponíveis.
  Sê específico, útil e inspirador. Se relevante, sugere combinações ou menciona tendências atuais.`;
  
      return await callOpenAI(prompt);
    };
  
    const analyzeOutfitPhoto = async (imageBase64, context = '') => {
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Como especialista em moda, analisa este outfit e fornece feedback construtivo:
              
              ${context ? `CONTEXTO: ${context}` : ''}
              
              Por favor, comenta sobre:
              1. COMBINAÇÃO: Como as peças funcionam juntas
              2. FIT: Como as roupas assentam
              3. CORES: Harmonia e contraste
              4. ESTILO: Adequação ao contexto/ocasião
              5. SUGESTÕES: Melhorias ou alternativas
              
              Sê honesto mas encorajador, focando em dicas práticas.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
                detail: 'high'
              }
            }
          ]
        }
      ];
  
      return await callOpenAI(messages, true);
    };
  
    return {
      callOpenAI,
      generateOutfitRecommendation,
      generateStyleAdvice,
      analyzeOutfitPhoto
    };
  };