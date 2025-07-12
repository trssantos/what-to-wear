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

FORMATO DE RESPOSTA: Texto corrido descritivo, sem listas ou bullets. Máximo 100 palavras.`;

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

  const analyzeOutfitCombination = async (selectedItems, occasion = null) => {
    if (!OPENAI_API_KEY) {
      throw new Error('API key da OpenAI não configurada no sistema');
    }

    if (!selectedItems || selectedItems.length === 0) {
      throw new Error('Seleciona pelo menos uma peça para análise');
    }

    setIsAnalyzing(true);
    
    try {
      const itemDescriptions = selectedItems.map(item => 
        `${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''})`
      ).join(', ');

      const prompt = `Como especialista em styling e moda, analisa esta combinação de roupas e fornece feedback detalhado:

PEÇAS SELECIONADAS: ${itemDescriptions}
OCASIÃO: ${occasion || 'Não especificada'}

Analisa a combinação considerando:
1. **HARMONIA VISUAL**: Como as cores, padrões e texturas funcionam juntos
2. **ADEQUAÇÃO**: Se a combinação é apropriada para a ocasião
3. **ESTILO GERAL**: Que estilo esta combinação transmite
4. **SUGESTÕES DE MELHORIA**: Peças que poderiam ser adicionadas ou trocadas
5. **ACESSÓRIOS**: Que acessórios complementariam o look
6. **DICAS DE STYLING**: Como usar as peças para potencializar o visual

Sê específico e construtivo no feedback.`;

      const analysis = await callOpenAI(prompt);
      console.log('✅ Análise de combinação concluída');
      return analysis;
      
    } catch (error) {
      console.error('💥 Erro na análise de combinação:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    generateGarmentMetadata,
    analyzeOutfitCombination,
    isAnalyzing,
    analysisHistory
  };
};