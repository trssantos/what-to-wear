import { useState } from 'react';
import { useOpenAI } from './useOpenAI';

export const useGarmentAI = (openaiApiKey) => {
  const { callOpenAI } = useOpenAI(openaiApiKey);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const generateGarmentMetadata = async (imageData, itemInfo = {}) => {
    if (!openaiApiKey) {
      throw new Error('API key da OpenAI não configurada');
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
8. **CARACTERÍSTICAS DISTINTIVAS**:
   - Elementos únicos ou marcantes
   - Detalhes que tornam a peça especial
   - Pontos fortes do design

FORMATO DA RESPOSTA:
Fornece uma descrição corrida e natural (não em lista numerada) que seja suficientemente detalhada e técnica para que:
- Outras AIs possam entender completamente a peça sem ver a imagem
- Um personal stylist possa fazer recomendações precisas
- O utilizador possa encontrar a peça facilmente através de pesquisa
- Seja possível fazer análises de compatibilidade com outras peças

A descrição deve ser profissional mas acessível, rica em detalhes visuais e técnicos, e focada em características que são importantes para styling, coordenação de outfits e gestão de armário.

EXEMPLO DE BOA DESCRIÇÃO:
"Camisa social feminina de manga longa em algodão branco com textura ligeiramente texturizada e fio aparente. Apresenta corte clássico com silhueta ligeiramente ajustada ao corpo, gola italiana tradicional bem estruturada e abotoamento frontal completo com botões brancos nacarados de qualidade. As mangas têm punhos ajustáveis com dois botões cada, permitindo diferentes estilos de dobra. O tecido é de peso médio com excelente caimento e respirabilidade, ideal para uso profissional durante todo o ano. A construção revela costuras bem acabadas e uma qualidade superior na montagem. Esta peça encontra-se em excelente estado de conservação sem sinais visíveis de desgaste, píling ou deformação. Trata-se de uma peça versátil de alta qualidade que serve perfeitamente para ambientes de trabalho formais, reuniões de negócios ou eventos sociais semi-formais. Combina magistralmente com calças de alfaiataria em tons neutros, saias lápis ou pencil, blazers estruturados e jeans dark wash de corte reto. Pode ser usada tanto por dentro como por fora da calça, oferecendo múltiplas possibilidades de styling. A cor branca clássica permite fácil coordenação com qualquer paleta de cores, tornando-se uma peça fundamental e investimento no armário."`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um especialista em análise de vestuário, catalogação de moda e personal styling. És especializado em criar descrições técnicas detalhadas de peças de roupa para sistemas inteligentes de gestão de armário digital. As tuas descrições são usadas por AIs de styling para fazer recomendações precisas.'
        },
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
                url: imageData
              }
            }
          ]
        }
      ], true);

      // Store analysis in history for potential future improvements
      const analysis = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        imageData: imageData.substring(0, 100) + '...', // Store partial for reference
        itemInfo,
        generatedMetadata: response,
        model: 'gpt-4o' // Track which model was used
      };

      setAnalysisHistory(prev => [analysis, ...prev.slice(0, 9)]); // Keep last 10

      return response;

    } catch (error) {
      console.error('Erro na análise AI da peça:', error);
      throw new Error(`Erro na análise AI: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateStyleAnalysis = async (imageData, wardrobeContext = []) => {
    if (!openaiApiKey) {
      throw new Error('API key da OpenAI não configurada');
    }

    setIsAnalyzing(true);
    
    try {
      const prompt = `Como especialista em personal styling, analisa esta peça de roupa no contexto do armário fornecido e gera recomendações de styling específicas.

CONTEXTO DO ARMÁRIO:
${wardrobeContext.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''})`).join('\n')}

ANÁLISE DE STYLING REQUERIDA:

1. **ANÁLISE DA PEÇA NO CONTEXTO**: Como esta peça se encaixa no estilo geral do armário
2. **COMBINAÇÕES ESPECÍFICAS**: Quais peças do armário combinam melhor com esta
3. **GAPS IDENTIFICADOS**: Que peças estão em falta para maximizar o potencial desta peça
4. **OCASIÕES DE USO**: Situações específicas onde esta peça brilharia
5. **STYLING TIPS**: Dicas concretas de como usar e combinar
6. **INVESTIMENTOS FUTUROS**: Sugestões de compras que complementariam esta peça

Fornece uma análise focada em aplicação prática e styling real.`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um personal stylist expert que analisa peças no contexto de armários completos e fornece conselhos práticos de styling.'
        },
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
                url: imageData
              }
            }
          ]
        }
      ], true);

      return response;

    } catch (error) {
      console.error('Erro na análise de styling:', error);
      throw new Error(`Erro na análise de styling: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeCompatibility = async (item1Data, item2Data) => {
    if (!openaiApiKey) {
      throw new Error('API key da OpenAI não configurada');
    }

    setIsAnalyzing(true);
    
    try {
      const prompt = `Como especialista em styling e teoria das cores, analisa a compatibilidade entre estas duas peças de roupa.

PEÇA 1: ${item1Data.name} - ${item1Data.description || 'Sem descrição'}
PEÇA 2: ${item2Data.name} - ${item2Data.description || 'Sem descrição'}

Analisa:
1. **COMPATIBILIDADE DE CORES**: Harmonia cromática entre as peças
2. **COMPATIBILIDADE DE ESTILOS**: Se os estilos funcionam juntos
3. **COMPATIBILIDADE DE OCASIÃO**: Se são apropriadas para as mesmas situações
4. **SCORE DE COMPATIBILIDADE**: De 1-10 (com justificação)
5. **SUGESTÕES DE MELHORIA**: Como melhorar a combinação
6. **TERCEIRAS PEÇAS**: Que outras peças ajudariam a unir estas duas

Formato JSON:
{
  "compatibility_score": 8,
  "color_harmony": "Excelente - tons complementares",
  "style_match": "Boa - ambas casuais modernas",
  "occasion_fit": "Perfeita para casual elegante",
  "improvements": ["Adicionar acessório dourado", "Considerar sapatos neutros"],
  "suggested_third_pieces": ["Blazer estruturado", "Sapatos nude"],
  "overall_assessment": "Combinação muito boa com pequenos ajustes"
}`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um especialista em styling e análise de compatibilidade entre peças de roupa. Respondes sempre em JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], true);

      try {
        return JSON.parse(response);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          compatibility_score: 7,
          color_harmony: "Análise manual necessária",
          style_match: "Análise manual necessária", 
          occasion_fit: "Análise manual necessária",
          improvements: ["Análise manual recomendada"],
          suggested_third_pieces: ["Consultar stylist"],
          overall_assessment: response.substring(0, 200) + "..."
        };
      }

    } catch (error) {
      console.error('Erro na análise de compatibilidade:', error);
      throw new Error(`Erro na análise de compatibilidade: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateOutfitSuggestions = async (baseItem, wardrobeItems, occasion = 'casual') => {
    if (!openaiApiKey) {
      throw new Error('API key da OpenAI não configurada');
    }

    setIsAnalyzing(true);
    
    try {
      const prompt = `Como personal stylist, cria 3 outfits diferentes usando esta peça base para a ocasião "${occasion}".

PEÇA BASE: ${baseItem.name} - ${baseItem.aiMetadata || baseItem.description || 'Sem descrição detalhada'}

ARMÁRIO DISPONÍVEL:
${wardrobeItems.map(item => `- ${item.name} (${item.category}, ${item.color}${item.aiMetadata ? ' - ' + item.aiMetadata.substring(0, 100) + '...' : ''})`).join('\n')}

Para cada outfit, especifica:
1. Peças exatas do armário a usar
2. Justificação da escolha
3. Dicas de styling
4. Acessórios sugeridos (se aplicável)
5. Calçado recomendado

Formato JSON:
{
  "outfits": [
    {
      "name": "Look Casual Chique",
      "pieces": ["peça1", "peça2", "peça3"],
      "justification": "Porquê funciona",
      "styling_tips": "Como usar",
      "accessories": "Sugestões de acessórios",
      "footwear": "Tipo de calçado"
    }
  ]
}`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um personal stylist expert em criar outfits usando peças específicas de armários reais. Respondes sempre em JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], true);

      try {
        return JSON.parse(response);
      } catch (parseError) {
        // Fallback com resposta estruturada
        return {
          outfits: [
            {
              name: "Look Recomendado",
              pieces: [baseItem.name],
              justification: "Análise automática temporariamente indisponível",
              styling_tips: "Consulta um stylist para combinações específicas",
              accessories: "A determinar",
              footwear: "Conforme ocasião"
            }
          ]
        };
      }

    } catch (error) {
      console.error('Erro na geração de outfits:', error);
      throw new Error(`Erro na geração de outfits: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeWardrobeGaps = async (wardrobeItems, userProfile = {}) => {
    if (!openaiApiKey) {
      throw new Error('API key da OpenAI não configurada');
    }

    setIsAnalyzing(true);
    
    try {
      const prompt = `Como consultor de moda expert, analisa este armário e identifica gaps e oportunidades de melhoria.

ARMÁRIO ATUAL:
${wardrobeItems.map(item => `- ${item.name} (${item.category}, ${item.color}${item.aiMetadata ? ' - ' + item.aiMetadata.substring(0, 80) + '...' : ''})`).join('\n')}

PERFIL DO UTILIZADOR:
${userProfile.bodyShape ? `Body Shape: ${userProfile.bodyShape}` : ''}
${userProfile.colorSeason ? `Estação de cor: ${userProfile.colorSeason}` : ''}
${userProfile.lifestyle ? `Lifestyle: ${userProfile.lifestyle}` : ''}

Analisa e identifica:
1. **BASICS EM FALTA**: Peças essenciais que faltam
2. **DESEQUILÍBRIOS**: Categorias com muitas/poucas peças  
3. **GAPS DE OCASIÃO**: Situações para as quais não tem roupa adequada
4. **OPORTUNIDADES DE COR**: Cores que melhorariam o armário
5. **INVESTIMENTOS PRIORITÁRIOS**: Top 5 peças a comprar primeiro
6. **QUALIDADE vs QUANTIDADE**: Avaliação geral da qualidade

Formato JSON:
{
  "missing_basics": ["item1", "item2"],
  "category_imbalances": {"categoria": "excesso/falta"},
  "occasion_gaps": ["ocasião1", "ocasião2"],
  "color_opportunities": ["cor1", "cor2"],
  "priority_investments": [
    {"item": "nome", "priority": "alta/média/baixa", "reason": "justificação"}
  ],
  "overall_assessment": "avaliação geral",
  "recommendations": ["dica1", "dica2"]
}`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um consultor de moda expert especializado em análise de armários e identificação de gaps. Respondes sempre em JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], true);

      try {
        return JSON.parse(response);
      } catch (parseError) {
        // Fallback analysis
        return {
          missing_basics: ["Análise pendente"],
          category_imbalances: {"geral": "análise necessária"},
          occasion_gaps: ["A determinar"],
          color_opportunities: ["Consultar especialista"],
          priority_investments: [
            {
              item: "Análise detalhada",
              priority: "alta",
              reason: "Análise automática temporariamente indisponível"
            }
          ],
          overall_assessment: "Consulta manual recomendada",
          recommendations: ["Usa as funcionalidades de AI individual por peça"]
        };
      }

    } catch (error) {
      console.error('Erro na análise de gaps do armário:', error);
      throw new Error(`Erro na análise de gaps: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    // Main functions
    generateGarmentMetadata,
    generateStyleAnalysis,
    analyzeCompatibility,
    generateOutfitSuggestions,
    analyzeWardrobeGaps,
    
    // State
    isAnalyzing,
    analysisHistory,
    
    // Utilities
    clearHistory: () => setAnalysisHistory([]),
    getLastAnalysis: () => analysisHistory[0] || null
  };
};