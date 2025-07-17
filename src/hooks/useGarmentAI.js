// src/hooks/useGarmentAI.js - ATUALIZAÇÃO PARA SUPORTAR ACESSÓRIOS

import { useState } from 'react';
import { useOpenAI } from './useOpenAI';
import { 
  OPENAI_API_KEY, 
  getClothingCategoriesByGender, 
  getAccessoryCategoriesByGender, // ✨ NOVO
  COMMON_COLORS,
  ACCESSORIES_TAGS // ✨ NOVO
} from '../utils/constants';

export const useGarmentAI = () => {
  const { callOpenAI } = useOpenAI();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // ✨ NOVA FUNÇÃO: Gerar metadata para acessórios com auto-preenchimento
  const generateAccessoryMetadataWithFormData = async (imageData, userProfile = {}, itemInfo = {}) => {
    if (!OPENAI_API_KEY) {
      throw new Error('API key da OpenAI não configurada no sistema');
    }

    if (!imageData) {
      throw new Error('Imagem do acessório é obrigatória');
    }

    setIsAnalyzing(true);
    
    try {
      // Obter categorias disponíveis baseadas no gênero
      const availableCategories = getAccessoryCategoriesByGender(userProfile?.gender);
      
      // Contexto do gênero
      const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

ANÁLISE ESPECÍFICA POR GÊNERO:
${userProfile.gender === 'female' ? `
- FOCAR EM: Como o acessório complementa o styling feminino
- CONSIDERAR: Versatilidade para ocasiões femininas, elegância
- CATEGORIZAÇÃO: Priorizar categorias específicas femininas quando aplicável
- NAMING: Usar terminologia feminina apropriada para jóias/acessórios
` : userProfile.gender === 'male' ? `
- FOCAR EM: Como o acessório se adequa ao styling masculino
- CONSIDERAR: Adequação a dress codes masculinos, sophistication
- CATEGORIZAÇÃO: Priorizar categorias específicas masculinas quando aplicável
- NAMING: Usar terminologia masculina apropriada
` : `
- FOCAR EM: Versatilidade neutra do acessório
- CONSIDERAR: Adequação a diferentes expressões de gênero
- CATEGORIZAÇÃO: Usar categorias neutras e inclusivas
`}
` : '';

      const prompt = `Como especialista em análise de acessórios e joalharia, analisa esta imagem de um acessório e gera AUTOMATICAMENTE todos os dados necessários para pré-preencher o formulário de adição à coleção de acessórios.

${genderContext}

CATEGORIAS DISPONÍVEIS:
${availableCategories.join(', ')}

CORES DISPONÍVEIS:
${COMMON_COLORS.join(', ')}

TAGS ESPECÍFICAS PARA ACESSÓRIOS:
${ACCESSORIES_TAGS.join(', ')}

INFORMAÇÕES FORNECIDAS PELO UTILIZADOR:
- Nome: ${itemInfo.name || 'Não especificado'}
- Categoria: ${itemInfo.category || 'Não especificada'}
- Cor: ${itemInfo.color || 'Não especificada'}
- Marca: ${itemInfo.brand || 'Não especificada'}
- Tags: ${itemInfo.tags?.join(', ') || 'Nenhuma'}
- Notas do utilizador: ${itemInfo.notes || 'Nenhuma'}

INSTRUÇÕES CRÍTICAS:
1. **AUTO-PREENCHIMENTO**: Gera automaticamente TODOS os campos necessários
2. **CATEGORIA**: Escolhe a categoria MAIS ESPECÍFICA da lista disponível para acessórios
3. **COR**: Identifica a cor PRINCIPAL/DOMINANTE da lista disponível
4. **NOME/ID**: Cria um nome curto, descritivo e útil para catalogação de acessórios
5. **TAGS**: Sugere 3-5 tags relevantes da lista de tags específicas para acessórios
6. **MARCA**: Se conseguires identificar a marca pelo design/logo, sugere
7. **ANÁLISE AI**: Descrição técnica focada em acessórios (materiais, acabamentos, estilo, ocasiões de uso)

RESPOSTA EM JSON:
{
  "formData": {
    "name": "nome descritivo do acessório",
    "category": "categoria da lista disponível",
    "color": "cor principal da lista",
    "brand": "marca identificada ou sugestão",
    "suggestedTags": ["tag1", "tag2", "tag3"],
    "notes": "notas automáticas sobre o acessório"
  },
  "aiMetadata": "Análise técnica detalhada do acessório: tipo, materiais aparentes, acabamentos, estilo (clássico/moderno/vintage), ocasiões adequadas, cuidados recomendados, versatilidade de combinação. Máximo 150 palavras.",
  "confidence": {
    "category": "1-10",
    "color": "1-10", 
    "overall": "1-10"
  }
}`;

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

      console.log('🔄 Gerando metadata AI para acessório:', itemInfo.name);
      const response = await callOpenAI(messages, true);
      
      try {
        // Extrair JSON da resposta
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
          metadata: analysis.aiMetadata.substring(0, 200) + '...',
          type: 'accessory'
        };
        
        setAnalysisHistory(prev => [analysisEntry, ...prev.slice(0, 9)]);
        
        console.log('✅ Metadata de acessório gerada com sucesso:', analysis);
        return analysis;
        
      } catch (parseError) {
        console.error('💥 Erro ao parsear resposta JSON:', parseError);
        console.log('🔍 Resposta recebida:', response);
        
        // Fallback: retornar dados básicos
        return {
          formData: {
            name: itemInfo.name || 'Acessório Novo',
            category: availableCategories[0] || 'Relógios',
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
      console.error('💥 Erro ao gerar metadata de acessório:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Função original para roupas mantida
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
6. **MARCA**: Se conseguires identificar a marca pelo design/logo, sugere
7. **ANÁLISE AI**: Descrição técnica da peça (materiais, corte, estilo, ocasiões)

RESPOSTA EM JSON:
{
  "formData": {
    "name": "nome descritivo da peça",
    "category": "categoria da lista disponível",
    "color": "cor principal da lista",
    "brand": "marca identificada ou sugestão",
    "suggestedTags": ["tag1", "tag2", "tag3"],
    "notes": "notas automáticas sobre a peça"
  },
  "aiMetadata": "Análise técnica detalhada da peça: tipo, materiais aparentes, corte, estilo, ocasiões adequadas, versatilidade de combinação. Máximo 150 palavras.",
  "confidence": {
    "category": "1-10",
    "color": "1-10", 
    "overall": "1-10"
  }
}`;

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
      const response = await callOpenAI(messages, true);
      
      try {
        // Extrair JSON da resposta
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
          metadata: analysis.aiMetadata.substring(0, 200) + '...',
          type: 'clothing'
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

  // ✨ FUNÇÃO UNIVERSAL: Determina automaticamente se é roupa ou acessório
  const generateItemMetadataWithFormData = async (imageData, userProfile = {}, itemInfo = {}, itemType = 'auto') => {
    // Se o tipo não for especificado, tentar determinar pela categoria
    if (itemType === 'auto') {
      const accessoryCategories = getAccessoryCategoriesByGender(userProfile?.gender);
      const clothingCategories = getClothingCategoriesByGender(userProfile?.gender);
      
      if (itemInfo.category && accessoryCategories.includes(itemInfo.category)) {
        itemType = 'accessory';
      } else if (itemInfo.category && clothingCategories.includes(itemInfo.category)) {
        itemType = 'clothing';
      } else {
        // Default para roupa se não conseguir determinar
        itemType = 'clothing';
      }
    }

    if (itemType === 'accessory') {
      return await generateAccessoryMetadataWithFormData(imageData, userProfile, itemInfo);
    } else {
      return await generateGarmentMetadataWithFormData(imageData, userProfile, itemInfo);
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
      const prompt = `Como especialista em análise de vestuário e moda, analisa esta imagem de uma peça de roupa/acessório e gera uma descrição detalhada e metadata para catalogação digital.

INFORMAÇÕES FORNECIDAS PELO UTILIZADOR:
- Nome: ${itemInfo.name || 'Não especificado'}
- Categoria: ${itemInfo.category || 'Não especificada'}
- Cor: ${itemInfo.color || 'Não especificada'}
- Marca: ${itemInfo.brand || 'Não especificada'}
- Tags: ${itemInfo.tags?.join(', ') || 'Nenhuma'}
- Notas do utilizador: ${itemInfo.notes || 'Nenhuma'}

ANÁLISE REQUERIDA:
Cria uma descrição completa e técnica da peça/acessório que inclua:

1. **IDENTIFICAÇÃO E TIPO**: Que tipo de item é exatamente
2. **CARACTERÍSTICAS VISUAIS DETALHADAS**: 
   - Cores exatas e nuances observadas
   - Padrões, texturas, acabamentos
   - Materiais aparentes
3. **ANÁLISE DE ESTILO E VERSATILIDADE**:
   - Estilo específico (casual, formal, desportivo, etc.)
   - Nível de formalidade
4. **POTENCIAL DE COMBINAÇÃO**:
   - Como combinar com outras peças
   - Ocasiões adequadas
5. **CUIDADOS E MANUTENÇÃO RECOMENDADOS**

IMPORTANTE: Esta informação será usada para catalogação digital e recomendações automáticas.

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

      console.log('🔄 Gerando metadata AI para item:', itemInfo.name);
      const metadata = await callOpenAI(messages, true);
      
      // Adicionar à história de análises
      const analysisEntry = {
        id: Date.now(),
        itemName: itemInfo.name,
        timestamp: new Date().toISOString(),
        metadata: metadata.substring(0, 200) + '...',
        type: 'general'
      };
      
      setAnalysisHistory(prev => [analysisEntry, ...prev.slice(0, 9)]);
      
      console.log('✅ Metadata AI gerada com sucesso');
      return metadata;
      
    } catch (error) {
      console.error('💥 Erro ao gerar metadata AI:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ✨ NOVA FUNÇÃO: Análise combinada de outfit com acessórios
  const analyzeOutfitWithAccessories = async (selectedClothing, selectedAccessories, occasion = null, userProfile = {}) => {
    if (!OPENAI_API_KEY) {
      throw new Error('API key da OpenAI não configurada no sistema');
    }

    if ((!selectedClothing || selectedClothing.length === 0) && (!selectedAccessories || selectedAccessories.length === 0)) {
      throw new Error('Seleciona pelo menos uma peça ou acessório para análise');
    }

    setIsAnalyzing(true);
    
    try {
      const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}
- Preferências de estilo adaptadas ao gênero
` : '';

      const clothingInfo = selectedClothing ? selectedClothing.map(item => 
        `${item.name} (${item.category}, ${item.color})`
      ).join('\n') : 'Nenhuma peça de roupa selecionada';

      const accessoriesInfo = selectedAccessories ? selectedAccessories.map(item => 
        `${item.name} (${item.category}, ${item.color})`
      ).join('\n') : 'Nenhum acessório selecionado';

      const prompt = `Como consultor de moda especializado, analisa esta combinação de outfit completo incluindo roupas e acessórios.

${genderContext}

PEÇAS DE ROUPA SELECIONADAS:
${clothingInfo}

ACESSÓRIOS SELECIONADOS:
${accessoriesInfo}

OCASIÃO: ${occasion || 'Não especificada'}

ANÁLISE REQUERIDA:
1. **HARMONIA GERAL**: Como as peças funcionam juntas
2. **EQUILÍBRIO DE CORES**: Análise da paleta de cores
3. **ADEQUAÇÃO À OCASIÃO**: Se o conjunto é apropriado
4. **PONTOS FORTES**: O que funciona bem na combinação
5. **SUGESTÕES DE MELHORIA**: Como otimizar o look
6. **STYLING TIPS**: Dicas específicas para usar este outfit
7. **RATING**: Nota de 1-10 para o outfit geral

Responde de forma estruturada mas natural, focando em conselhos práticos e úteis.`;

      const messages = [
        {
          role: 'system',
          content: 'És um consultor de moda experiente, especializado em combinar roupas e acessórios para criar looks harmoniosos e adequados.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const analysis = await callOpenAI(messages);
      
      // Adicionar à história
      const analysisEntry = {
        id: Date.now(),
        itemName: `Outfit: ${selectedClothing?.length || 0} peças + ${selectedAccessories?.length || 0} acessórios`,
        timestamp: new Date().toISOString(),
        metadata: analysis.substring(0, 200) + '...',
        type: 'outfit'
      };
      
      setAnalysisHistory(prev => [analysisEntry, ...prev.slice(0, 9)]);
      
      return analysis;
      
    } catch (error) {
      console.error('💥 Erro ao analisar outfit:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    // Funções existentes
    generateGarmentMetadata,
    generateGarmentMetadataWithFormData,
    
    // ✨ NOVAS FUNÇÕES
    generateAccessoryMetadataWithFormData,
    generateItemMetadataWithFormData,
    analyzeOutfitWithAccessories,
    
    // Estados
    isAnalyzing,
    analysisHistory
  };
};