import { OPENAI_API_KEY } from '../utils/constants';

export const useOpenAI = () => {
  const callOpenAI = async (prompt, includeVision = false) => {
    if (!OPENAI_API_KEY) {
      throw new Error('API key da OpenAI não configurada no sistema');
    }

    const isArrayPrompt = Array.isArray(prompt);
    
    const body = {
      model: includeVision ? 'gpt-4o' : 'gpt-4o-mini',
      messages: isArrayPrompt ? prompt : [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro na API da OpenAI');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erro na chamada OpenAI:', error);
      throw error;
    }
  };

  const generateOutfitRecommendation = async (data, wardrobe, userProfile = {}) => {
    let prompt;
    
    // Contexto do gênero
    const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

INSTRUÇÕES ESPECÍFICAS POR GÊNERO:
${userProfile.gender === 'female' ? `
- FOCAR EM: Recomendações femininas, combinações elegantes, acessórios como brincos, colares, pulseiras
- INCLUIR: Dicas de styling feminino, sugestões de maquilhagem que combinem, produtos para cabelo
- ACESSÓRIOS: Priorizar joias, carteiras femininas, sapatos femininos, lenços
` : userProfile.gender === 'male' ? `
- FOCAR EM: Styling masculino, combinações clássicas/modernas, acessórios como relógios, cintos
- INCLUIR: Dicas de grooming masculino, produtos para cabelo masculino, dress codes
- ACESSÓRIOS: Priorizar relógios, cintos, sapatos formais/casual masculinos, carteiras
` : `
- ADAPTAR: Recomendações neutras e inclusivas adequadas a qualquer expressão de gênero
- INCLUIR: Opções versáteis e acessórios neutros
`}
` : '';

    if (typeof data === 'string') {
      // Free text mode
      prompt = `Como consultor de moda expert, ajuda com esta situação de styling:

${genderContext}

SITUAÇÃO: "${data}"

ARMÁRIO DISPONÍVEL:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}

Por favor, fornece:
1. OUTFIT ESPECÍFICO: Peças exatas do armário ou sugestões específicas
2. JUSTIFICAÇÃO: Porquê esta escolha é perfeita para a situação
3. DICAS EXTRAS: 3-4 dicas específicas para esta situação considerando o gênero
4. ALTERNATIVAS: 1-2 variações do look principal

Responde de forma clara e prática, focando nas peças disponíveis no armário.`;
    } else {
      // Guided mode with structured data
      const { occasion, weather, mood, timeOfDay, colors, formality } = data;
      
      prompt = `Como consultor de moda expert, cria uma recomendação de outfit baseada nestas especificações:

${genderContext}

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
3. STYLING TIPS: Como usar/combinar as peças considerando o gênero
4. ACESSÓRIOS: Sugestões específicas baseadas no gênero
5. ALTERNATIVAS: 1-2 variações usando outras peças do armário

Foca nas peças que realmente existem no armário!`;
    }

    return await callOpenAI(prompt);
  };

  const generateStyleAdvice = async (question, userContext = {}) => {
    const { wardrobe = [], recentOutfits = [], userProfile = {} } = userContext;
    
    // Contexto do gênero
    const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

INSTRUÇÕES ESPECÍFICAS POR GÊNERO:
${userProfile.gender === 'female' ? `
- FOCAR EM: Conselhos de styling feminino, acessórios como joias, maquilhagem, cabelo
- INCLUIR: Dicas específicas para looks femininos, combinações elegantes
- PRODUTOS: Sugerir brincos, colares, pulseiras, produtos de beleza femininos
` : userProfile.gender === 'male' ? `
- FOCAR EM: Styling masculino, grooming, acessórios como relógios e cintos
- INCLUIR: Dicas de dress code masculino, combinações clássicas
- PRODUTOS: Sugerir relógios, cintos, produtos de grooming masculinos
` : `
- ADAPTAR: Conselhos neutros e inclusivos
- INCLUIR: Opções versáteis adequadas a qualquer expressão de gênero
`}
` : '';
    
    const prompt = `Como especialista em moda e styling pessoal, responde a esta pergunta:

${genderContext}

PERGUNTA: "${question}"

CONTEXTO DO UTILIZADOR:
- Peças no armário: ${wardrobe.length} itens
- Outfits recentes: ${recentOutfits.length}

${wardrobe.length > 0 ? `
ALGUMAS PEÇAS DISPONÍVEIS:
${wardrobe.slice(0, 10).map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}
${wardrobe.length > 10 ? `... e mais ${wardrobe.length - 10} peças` : ''}
` : ''}

Por favor, fornece conselhos práticos e personalizados, considerando as peças que a pessoa tem disponíveis e o seu gênero.
Sê específico, útil e inspirador. Se relevante, sugere combinações ou menciona tendências atuais.`;

    return await callOpenAI(prompt);
  };

  const analyzeOutfitPhoto = async (imageBase64, context = '', userProfile = {}) => {
    // Contexto do gênero
    const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

ANÁLISE ESPECÍFICA POR GÊNERO:
${userProfile.gender === 'female' ? `
- AVALIAR: Adequação para styling feminino, proporções, acessórios femininos
- SUGERIR: Joias que complementem, maquilhagem adequada, styling de cabelo
- FOCAR: Feminilidade, elegância, detalhes como decotes, comprimentos
` : userProfile.gender === 'male' ? `
- AVALIAR: Styling masculino, fit das peças, grooming geral
- SUGERIR: Acessórios masculinos como relógios, cintos, sapatos adequados
- FOCAR: Masculinidade, sophistication, dress codes apropriados
` : `
- AVALIAR: Styling neutro e inclusivo
- SUGERIR: Acessórios versáteis adequados a qualquer expressão
`}
` : '';

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Como especialista em moda, analisa este outfit e fornece feedback construtivo:
            
            ${genderContext}
            
            ${context ? `CONTEXTO: ${context}` : ''}
            
            Por favor, comenta sobre:
            1. COMBINAÇÃO: Como as peças funcionam juntas
            2. FIT: Como as roupas assentam
            3. CORES: Harmonia e contraste
            4. ESTILO: Adequação ao contexto/ocasião considerando o gênero
            5. SUGESTÕES: Melhorias ou alternativas específicas para o gênero
            
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