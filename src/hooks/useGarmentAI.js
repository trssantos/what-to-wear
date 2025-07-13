import { useState } from 'react';
import { useOpenAI } from './useOpenAI';
import { OPENAI_API_KEY, getClothingCategoriesByGender, COMMON_COLORS } from '../utils/constants';

export const useGarmentAI = () => {
  const { callOpenAI } = useOpenAI();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // NOVA FUNÇÃO: Gerar metadata completa com auto-preenchimento
  const generateGarmentMetadataWithFormData = async (imageData, userProfile = {}, itemInfo = {}) => {
    if (!OPENAI_API_KEY) {
      throw new Error('API key da OpenAI não configurada no sistema');
    }

    if (!imageData) {
      throw new Error('Imagem da peça é obrigatória');
    }

    setIsAnalyzing(true);
    
    try {
      // Obter categorias disponíveis baseadas no gênero
      const availableCategories = getClothingCategoriesByGender(userProfile?.gender);
      
      // Contexto do gênero
      const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

ANÁLISE ESPECÍFICA POR GÊNERO:
${userProfile.gender === 'female' ? `
- FOCAR EM: Como a peça se adequa ao styling feminino
- CONSIDERAR: Versatilidade para ocasiões femininas, layering feminino
- CATEGORIZAÇÃO: Priorizar categorias específicas femininas quando aplicável
- NAMING: Usar terminologia feminina apropriada
` : userProfile.gender === 'male' ? `
- FOCAR EM: Como a peça se adequa ao styling masculino
- CONSIDERAR: Adequação a dress codes masculinos, versatilidade
- CATEGORIZAÇÃO: Priorizar categorias específicas masculinas quando aplicável
- NAMING: Usar terminologia masculina apropriada
` : `
- FOCAR EM: Versatilidade neutra da peça
- CONSIDERAR: Adequação a diferentes expressões de gênero
- CATEGORIZAÇÃO: Usar categorias neutras e inclusivas
`}
` : '';

      const prompt = `Como especialista em análise de vestuário e catalogação digital, analisa esta imagem de uma peça de roupa e gera AUTOMATICAMENTE todos os dados necessários para pré-preencher o formulário de adição ao armário digital.

${genderContext}

CATEGORIAS DISPONÍVEIS:
${availableCategories.join(', ')}

CORES DISPONÍVEIS:
${COMMON_COLORS.join(', ')}

INFORMAÇÕES FORNECIDAS PELO UTILIZADOR:
- Nome: ${itemInfo.name || 'Não especificado'}
- Categoria: ${itemInfo.category || 'Não especificada'}
- Cor: ${itemInfo.color || 'Não especificada'}
- Marca: ${itemInfo.brand || 'Não especificada'}
- Tags: ${itemInfo.tags?.join(', ') || 'Nenhuma'}
- Notas do utilizador: ${itemInfo.notes || 'Nenhuma'}

INSTRUÇÕES CRÍTICAS:
1. **AUTO-PREENCHIMENTO**: Gera automaticamente TODOS os campos necessários
2. **CATEGORIA**: Escolhe a categoria MAIS ESPECÍFICA da lista disponível
3. **COR**: Identifica a cor PRINCIPAL/DOMINANTE da lista disponível
4. **NOME/ID**: Cria um nome curto, descritivo e útil para catalogação
5. **TAGS**: Sugere 3-5 tags relevantes da lista disponível
6. **METADATA**: Descrição técnica detalhada para futuras análises

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON válido):
{
  "formData": {
    "name": "string - Nome curto e descritivo da peça (ex: 'Camisa Azul Formal', 'Hoodie Cinzento Nike')",
    "category": "string - Categoria EXATA da lista disponível",
    "color": "string - Cor EXATA da lista disponível", 
    "brand": "string - Marca identificada ou 'Não identificada'",
    "suggestedTags": ["array", "de", "tags", "sugeridas"],
    "notes": "string - Notas automáticas sobre a peça"
  },
  "aiMetadata": "string - Descrição técnica detalhada da peça (100-150 palavras) incluindo: tipo exato, características visuais detalhadas, materiais aparentes, detalhes construtivos, estilo e versatilidade, potencial de combinação, cuidados recomendados. Esta informação será usada para recomendações automáticas de combinações.",
  "confidence": {
    "category": "number 1-10 - Confiança na categoria escolhida",
    "color": "number 1-10 - Confiança na cor identificada",
    "overall": "number 1-10 - Confiança geral na análise"
  }
}

IMPORTANTE: 
- Responde APENAS com o JSON válido, sem texto adicional
- Escolhe sempre uma categoria da lista disponível
- Escolhe sempre uma cor da lista disponível
- Cria um nome prático e identificável
- A metadata deve ser rica em detalhes para futuras análises

EXEMPLO de nome bem criado: "Blazer Preto Formal", "Jeans Azul Escuro Casual", "Ténis Brancos Nike"`;

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
                url: imageData
              }
            }
          ]
        }
      ];

      console.log('🔄 Gerando metadata completa com auto-preenchimento para:', itemInfo.name);
      const response = await callOpenAI(messages, true); // true para incluir vision
      
      try {
        // Tentar extrair JSON da resposta
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Resposta não contém JSON válido');
        }
        
        const analysis = JSON.parse(jsonMatch[0]);
        
        // Validar estrutura da resposta
        if (!analysis.formData || !analysis.aiMetadata) {
          throw new Error('Estrutura de resposta inválida');
        }
        
        // Adicionar à história de análises
        const analysisEntry = {
          id: Date.now(),
          itemName: analysis.formData.name,
          timestamp: new Date().toISOString(),
          metadata: analysis.aiMetadata.substring(0, 200) + '...'
        };
        
        setAnalysisHistory(prev => [analysisEntry, ...prev.slice(0, 9)]);
        
        console.log('✅ Metadata completa gerada com sucesso:', analysis);
        return analysis;
        
      } catch (parseError) {
        console.error('💥 Erro ao parsear resposta JSON:', parseError);
        console.log('🔍 Resposta recebida:', response);
        
        // Fallback: retornar dados básicos
        return {
          formData: {
            name: itemInfo.name || 'Peça Nova',
            category: availableCategories[0] || 'T-shirts',
            color: 'Preto',
            brand: 'Não identificada',
            suggestedTags: ['casual'],
            notes: 'Adicionado automaticamente'
          },
          aiMetadata: response.substring(0, 500),
          confidence: {
            category: 5,
            color: 5,
            overall: 5
          }
        };
      }
      
    } catch (error) {
      console.error('💥 Erro ao gerar metadata completa:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Função original mantida para compatibilidade
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
4. **DETALHES CONSTRUTIVOS E FUNCIONAIS**:
   - Tipo de costuras e acabamentos
   - Botões, fechos, zíperes
   - Bolsos
   - Gola, decote, mangas (se aplicável)
   - Corte e silhueta
6. **ANÁLISE DE ESTILO E VERSATILIDADE**:
   - Estilo específico (casual, formal, desportivo, etc.)
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

IMPORTANTE: Esta informação será usada para catalogação digital e recomendações automáticas de combinações por isso descreve de forma curta, objetiva mas com a informação relevante para outros prompts futuros como outfits se combina com o estilo de corpo etc.

FORMATO DE RESPOSTA: Texto corrido descritivo, sem listas ou bullets. Máximo 150 palavras.`;

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
                url: imageData
              }
            }
          ]
        }
      ];

      console.log('🔄 Gerando metadata AI para peça:', itemInfo.name);
      const metadata = await callOpenAI(messages, true); // true para incluir vision
      
      // Adicionar à história de análises
      const analysisEntry = {
        id: Date.now(),
        itemName: itemInfo.name,
        timestamp: new Date().toISOString(),
        metadata: metadata.substring(0, 200) + '...' // Preview
      };
      
      setAnalysisHistory(prev => [analysisEntry, ...prev.slice(0, 9)]); // Manter últimas 10
      
      console.log('✅ Metadata AI gerada com sucesso');
      return metadata;
      
    } catch (error) {
      console.error('💥 Erro ao gerar metadata AI:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeOutfitCombination = async (selectedItems, occasion = null, userProfile = {}) => {
    if (!OPENAI_API_KEY) {
      throw new Error('API key da OpenAI não configurada no sistema');
    }

    if (!selectedItems || selectedItems.length === 0) {
      throw new Error('Seleciona pelo menos uma peça para análise');
    }

    setIsAnalyzing(true);
    
    try {
      const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

ANÁLISE DE COMBINAÇÃO POR GÊNERO:
${userProfile.gender === 'female' ? `
- FOCAR: Styling feminino, coordination com accessories femininos
- INCLUIR: Como otimizar feminilidade, proporções femininas
- AVALIAR: Adequação a contextos e dress codes femininos
- SUGERIR: Acessórios femininos (joias, carteiras, sapatos)
` : userProfile.gender === 'male' ? `
- FOCAR: Styling masculino, coordination profissional masculina
- INCLUIR: Como otimizar sophistication masculina, dress codes
- AVALIAR: Adequação a contextos profissionais e masculinos
- SUGERIR: Acessórios masculinos (relógios, cintos, sapatos formais)
` : `
- FOCAR: Styling neutro e inclusivo
- INCLUIR: Versatilidade para diferentes expressões de gênero
`}
` : '';

      const prompt = `Como consultor de moda expert, analisa esta combinação de peças para criar um outfit.

${genderContext}

PEÇAS SELECIONADAS:
${selectedItems.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''})`).join('\n')}

OCASIÃO: ${occasion || 'Casual'}

ANÁLISE COMPLETA:
1. **HARMONIA GERAL**: Como as peças funcionam juntas
2. **ADEQUAÇÃO À OCASIÃO**: Se é apropriado para o contexto
3. **ESTILO RESULTANTE**: Que tipo de look cria
4. **PONTOS FORTES**: O que funciona bem na combinação
5. **MELHORIAS SUGERIDAS**: Como otimizar o look
6. **ACESSÓRIOS RECOMENDADOS**: Que acessórios completariam
7. **SCORE FINAL**: Nota de 1-10 para a combinação

Resposta em formato estruturado mas legível.`;

      const analysis = await callOpenAI([
        {
          role: 'system',
          content: 'És um consultor de moda profissional especializado em análise de combinações de roupa.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      console.log('✅ Análise de combinação concluída');
      return analysis;
      
    } catch (error) {
      console.error('💥 Erro na análise de combinação:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Função de análise rápida mantida
  const performQuickAnalysis = async (imageData, wardrobe = [], outfits = [], userProfile = {}) => {
    if (!OPENAI_API_KEY) {
      throw new Error('API key da OpenAI não configurada no sistema');
    }

    setIsAnalyzing(true);
    
    try {
      // Usar a nova função de metadata completa
      const result = await generateGarmentMetadataWithFormData(imageData, userProfile, {});
      
      // Adicionar análise de compatibilidade com armário existente
      if (wardrobe.length > 0) {
        const compatibilityPrompt = `Baseado nesta nova peça identificada como "${result.formData.name}" (${result.formData.category}, ${result.formData.color}), analisa rapidamente a compatibilidade com o armário existente:

ARMÁRIO ATUAL:
${wardrobe.slice(0, 10).map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

Responde em 2-3 frases: vale a pena adicionar? Que peças combinaria melhor?`;

        const compatibilityAnalysis = await callOpenAI([
          {
            role: 'user',
            content: compatibilityPrompt
          }
        ]);

        result.compatibilityAnalysis = compatibilityAnalysis;
      }

      console.log('✅ Análise rápida concluída');
      return result;
      
    } catch (error) {
      console.error('💥 Erro na análise rápida:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const batchAnalyzeCompatibility = async (wardrobe, userProfile = {}) => {
    if (!OPENAI_API_KEY) {
      throw new Error('API key da OpenAI não configurada no sistema');
    }

    if (!wardrobe || wardrobe.length === 0) {
      throw new Error('Armário vazio para análise');
    }

    setIsAnalyzing(true);
    
    try {
      const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

RECOMENDAÇÃO POR GÊNERO:
${userProfile.gender === 'female' ? `
- CONSIDERAR: Se a peça se adequa ao guarda-roupa feminino existente
- AVALIAR: Versatilidade para ocasiões femininas
- COMBINAR: Com que peças femininas do armário funcionaria melhor
- STYLING: Como estilizar femininely
` : userProfile.gender === 'male' ? `
- CONSIDERAR: Se a peça se adequa ao guarda-roupa masculino existente
- AVALIAR: Versatilidade para contextos masculinos
- COMBINAR: Com que peças masculinas do armário funcionaria melhor
- STYLING: Como estilizar masculinely
` : `
- CONSIDERAR: Versatilidade neutra da peça
- AVALIAR: Adequação a diferentes expressões de gênero
`}
` : '';

      const prompt = `Como personal stylist expert, analisa todas as peças deste armário e dá recomendações de compatibilidade.

${genderContext}

ARMÁRIO COMPLETO (${wardrobe.length} peças):
${wardrobe.map((item, index) => 
  `${index + 1}. ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''})${item.aiMetadata ? ' - ' + item.aiMetadata.substring(0, 100) + '...' : ''}`
).join('\n')}

Para cada peça, fornece:
1. **SCORE (1-10)** - baseado na compatibilidade geral
2. **COMPATIBILIDADE COR** - se harmoniza com outras peças
3. **VERSATILIDADE** - quantos looks diferentes permite
4. **RECOMENDAÇÃO** - manter, otimizar uso, ou considerar substituir

Responde de forma estruturada para cada peça.`;

      const analysis = await callOpenAI([
        {
          role: 'system',
          content: 'És um personal stylist especializado em análise de armários e compatibilidade de peças.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);
      
      console.log('✅ Análise batch de compatibilidade concluída');
      return analysis;
      
    } catch (error) {
      console.error('💥 Erro na análise batch:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    generateGarmentMetadata,
    generateGarmentMetadataWithFormData, // NOVA FUNÇÃO PRINCIPAL
    analyzeOutfitCombination,
    performQuickAnalysis,
    batchAnalyzeCompatibility,
    isAnalyzing,
    analysisHistory
  };
};