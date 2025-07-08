export const useOpenAI = (apiKey) => {
    const callOpenAI = async (messages, includeVision = false) => {
      if (!apiKey) {
        throw new Error('API key da OpenAI não configurada');
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
            'Authorization': `Bearer ${apiKey}`
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
  4. ALTERNATIVAS: Se alguma peça não estiver disponível
  
  Foca na adequação à situação específica e no contexto social/profissional mencionado.`;
      } else {
        prompt = `Como consultor de moda expert, cria uma recomendação de outfit para:
  
  OCASIÃO: ${data.occasion}
  TEMPO: ${data.weather}
  ESTILO DESEJADO: ${data.style}
  CONTEXTO: ${data.context}
  
  ARMÁRIO DISPONÍVEL:
  ${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}
  
  Fornece:
  1. OUTFIT RECOMENDADO: Usando peças do armário ou sugestões específicas
  2. JUSTIFICAÇÃO: Porquê funciona para esta ocasião
  3. DICAS EXTRAS: Para maximizar o impacto
  4. ALTERNATIVAS: Opções de backup`;
      }
  
      return await callOpenAI([
        {
          role: 'system',
          content: 'És um consultor de moda expert com conhecimento profundo de estilo, cores, ocasiões e adequação social. Dás conselhos práticos e específicos.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);
    };
  
    const generateShoppingRecommendations = async (wardrobe) => {
      const prompt = `Como consultor de moda expert, analisa este armário e fornece recomendações personalizadas:
  
  ARMÁRIO ATUAL:
  ${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'} - ${item.notes || 'Sem notas'}`).join('\n')}
  
  Fornece:
  
  1. **GAPS NO ARMÁRIO**: Que peças essenciais estão em falta?
  
  2. **RECOMENDAÇÕES DE COMPRA** (máximo 5 peças):
  Para cada peça:
  - Nome específico
  - Justificação (porquê é importante)
  - Prioridade (Alta/Média/Baixa)
  - Faixa de preço estimada em euros
  - Onde comprar (tipo de loja)
  
  3. **NOVAS COMBINAÇÕES**: 6-8 combinações criativas usando peças existentes
  
  4. **DICAS DE STYLING**: Conselhos para maximizar o armário atual
  
  5. **INVESTIMENTOS A LONGO PRAZO**: 2-3 peças de qualidade para investir
  
  Foca em versatilidade, qualidade e adequação ao estilo pessoal evidenciado pelas peças atuais.`;
  
      return await callOpenAI([
        {
          role: 'system',
          content: 'És um consultor de moda expert e personal shopper. Dás conselhos práticos, específicos e adequados ao orçamento. Conheces bem marcas europeias e portuguesas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);
    };
  
    return {
      callOpenAI,
      generateOutfitRecommendation,
      generateShoppingRecommendations
    };
  };