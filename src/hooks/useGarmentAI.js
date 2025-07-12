import { useState } from 'react';
import { useOpenAI } from './useOpenAI';
import { OPENAI_API_KEY } from '../utils/constants';

export const useGarmentAI = () => {
  const { callOpenAI } = useOpenAI();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const generateGarmentMetadata = async (imageData, itemInfo = {}) => {
    if (!OPENAI_API_KEY) {
      throw new Error('API key da OpenAI não configurada no sistema');
    }

    if (!imageData) {
      throw new Error('Imagem da peça é obrigatória');
    }

    setIsAnalyzing(true);
    
    try {
      const prompt = `Como especialista em análise de vestuário e moda, analisa esta imagem de uma peça de roupa e gera uma descrição detalhada e metadata para catalogação digital.

INFORMAÇÕES FORNECIDAS PELO UTILIZADOR:
- Nome: ${itemInfo.name || 'Não especificado'}
- Categoria: ${itemInfo.category || 'Não especificada'}
- Cor: ${itemInfo.color || 'Não especificada'}
- Marca: ${itemInfo.brand || 'Não especificada'}
- Estado: ${itemInfo.condition || 'Não especificado'}
- Tags: ${itemInfo.tags?.join(', ') || 'Nenhuma'}
- Notas do utilizador: ${itemInfo.notes || 'Nenhuma'}

ANÁLISE REQUERIDA:
Cria uma descrição completa e técnica da peça que inclua:

1. **IDENTIFICAÇÃO E TIPO**: Que tipo de peça é exatamente (camisa social, t-shirt básica, calças de ganga, etc.)
2. **CARACTERÍSTICAS VISUAIS DETALHADAS**: 
   - Cores exatas e nuances observadas
   - Padrões (liso, listrado, estampado, etc.)
   - Texturas aparentes do tecido
   - Acabamentos e detalhes decorativos
3. **ANÁLISE DE MATERIAIS E CONSTRUÇÃO**:
   - Tipo de tecido aparente (algodão, poliéster, mistura, etc.)
   - Peso e caimento do tecido
   - Qualidade de construção observada
4. **DETALHES CONSTRUTIVOS E FUNCIONAIS**:
   - Tipo de costuras e acabamentos
   - Botões, fechos, zíperes
   - Bolsos (quantos, tipo, localização)
   - Gola, decote, mangas (se aplicável)
   - Corte e silhueta
5. **AVALIAÇÃO DE ESTADO**:
   - Condição visual geral
   - Sinais de desgaste, se visíveis
   - Qualidade de conservação
6. **ANÁLISE DE ESTILO E VERSATILIDADE**:
   - Estilo específico (casual, formal, desportivo, etc.)
   - Ocasiões apropriadas para uso
   - Estação do ano mais adequada
   - Nível de formalidade
7. **POTENCIAL DE COMBINAÇÃO**:
   - Tipos de peças que combinam bem
   - Estilos de looks possíveis
   - Acessórios que complementam
   - Cores que harmonizam
8. **CUIDADOS E MANUTENÇÃO RECOMENDADOS**:
   - Instruções de lavagem aparentes
   - Cuidados especiais necessários
   - Dicas de conservação

IMPORTANTE: Sê muito detalhado e técnico na análise. Esta informação será usada para catalogação digital e recomendações automáticas de combinações.

Formato da resposta: Texto corrido, bem estruturado, com todas as observações técnicas relevantes.`;

      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData,
                detail: 'high'
              }
            }
          ]
        }
      ];

      const analysis = await callOpenAI(messages, true);
      
      // Add to analysis history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        itemInfo,
        analysis,
        imageData: imageData.substring(0, 100) + '...' // Store just a reference
      };
      
      setAnalysisHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
      
      return analysis;
      
    } catch (error) {
      console.error('🔥 Garment AI Analysis Error:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateStyleTags = async (imageData, description = '') => {
    if (!OPENAI_API_KEY) {
      throw new Error('API key da OpenAI não configurada no sistema');
    }

    try {
      const prompt = `Analisa esta peça de roupa e gera tags de estilo relevantes.

${description ? `DESCRIÇÃO EXISTENTE: ${description}` : ''}

Com base na imagem, gera uma lista de tags que descrevam:
- Estilo (casual, formal, boho, minimalist, etc.)
- Ocasiões apropriadas (work, party, weekend, etc.)
- Características visuais (striped, floral, solid, etc.)
- Fit (oversized, fitted, loose, etc.)
- Vibe (comfy, elegant, edgy, romantic, etc.)

Responde apenas com uma lista de tags separadas por vírgulas, máximo 10 tags, em português.
Exemplo: casual, confortável, fim-de-semana, algodão, básico, versátil`;

      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData,
                detail: 'low'
              }
            }
          ]
        }
      ];

      const response = await callOpenAI(messages, true);
      return response.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
    } catch (error) {
      console.error('🏷️ Style Tags Generation Error:', error);
      throw error;
    }
  };

  const suggestItemCombinations = async (targetItem, wardrobeItems) => {
    if (!OPENAI_API_KEY) {
      throw new Error('API key da OpenAI não configurada no sistema');
    }

    try {
      const prompt = `Como especialista em styling, sugere combinações para esta peça específica:

PEÇA PRINCIPAL:
- Nome: ${targetItem.name}
- Categoria: ${targetItem.category}
- Cor: ${targetItem.color}
- Estilo: ${targetItem.tags?.join(', ') || 'N/A'}
${targetItem.aiMetadata ? `- Análise IA: ${targetItem.aiMetadata.substring(0, 200)}...` : ''}

OUTRAS PEÇAS DISPONÍVEIS NO ARMÁRIO:
${wardrobeItems.map(item => 
  `- ${item.name} (${item.category}, ${item.color}) - ${item.tags?.join(', ') || 'básico'}`
).join('\n')}

Por favor, sugere 3-5 combinações específicas usando a peça principal com outras peças do armário.

Para cada combinação, inclui:
1. Peças específicas a usar
2. Ocasião/contexto apropriado
3. Uma frase sobre porquê funciona bem

Formato:
**Look 1 - [Nome do Look]**
Peças: [lista das peças]
Ocasião: [contexto]
Porquê funciona: [explicação breve]

Foca em combinações práticas e variadas!`;

      const response = await callOpenAI(prompt);
      return response;
      
    } catch (error) {
      console.error('👔 Combination Suggestions Error:', error);
      throw error;
    }
  };

  const analyzeWardrobeGaps = async (wardrobeItems, userPreferences = {}) => {
    if (!OPENAI_API_KEY) {
      throw new Error('API key da OpenAI não configurada no sistema');
    }

    try {
      const prompt = `Como consultor de guarda-roupa, analisa este armário e identifica lacunas/oportunidades:

INVENTÁRIO ATUAL:
${wardrobeItems.map(item => 
  `- ${item.name} (${item.category}, ${item.color}) - ${item.condition || 'N/A'} - Tags: ${item.tags?.join(', ') || 'N/A'}`
).join('\n')}

ESTATÍSTICAS:
- Total de peças: ${wardrobeItems.length}
- Categorias: ${[...new Set(wardrobeItems.map(i => i.category))].join(', ')}
- Cores principais: ${[...new Set(wardrobeItems.map(i => i.color))].slice(0, 5).join(', ')}

PREFERÊNCIAS DO UTILIZADOR:
${Object.entries(userPreferences).map(([k, v]) => `- ${k}: ${v}`).join('\n') || 'Não especificadas'}

Por favor, fornece:

1. **ANÁLISE GERAL**: Pontos fortes do guarda-roupa atual
2. **LACUNAS IDENTIFICADAS**: Que peças/categorias estão em falta
3. **OPORTUNIDADES**: Sugestões específicas de compras prioritárias
4. **OTIMIZAÇÃO**: Como melhor usar o que já existe
5. **ESTRATÉGIA**: Plano de médio prazo para o guarda-roupa

Sê específico e prático nas recomendações!`;

      const response = await callOpenAI(prompt);
      return response;
      
    } catch (error) {
      console.error('📊 Wardrobe Analysis Error:', error);
      throw error;
    }
  };

  return {
    generateGarmentMetadata,
    generateStyleTags,
    suggestItemCombinations,
    analyzeWardrobeGaps,
    isAnalyzing,
    analysisHistory
  };
};