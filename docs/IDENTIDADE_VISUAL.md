# Identidade visual do Fillobby

## 1. Direção vigente

A landing de referência define a expressão visual a ser propagada pelo produto: um lobby escuro, profundo e calmo, com energia concentrada nas ações. O azul-ciano comunica decisão e movimento; o violeta-noturno aparece como profundidade e atmosfera, nunca como a cor principal de interface.

O Fillobby não deve se parecer com um dashboard genérico, um e-sport agressivo ou uma interface cheia de cartões. A identidade precisa evidenciar o valor real do produto: reduzir a indecisão do grupo e transformar intenção em uma partida combinada.

## 2. Posicionamento

**Ideia central:** _a sala está pronta_.

Fillobby é o ponto de encontro antes do jogo, não uma loja, rede social ou plataforma competitiva. A marca deve parecer:

- coletiva, acolhedora e direta;
- moderna, noturna e imersiva, sem cair em estética cyberpunk ou neon excessivo;
- ligada a jogos sem usar controles, pixels e troféus como linguagem principal;
- dinâmica na fila e votação, tranquila na organização.

**Público principal:** grupos de amigos que jogam online ou presencialmente, geralmente entre 18 e 35 anos, e querem decidir rápido o que jogar, confirmar participantes e preservar o histórico do grupo.

**Promessa verbal:** “Menos tempo decidindo. Mais tempo jogando.”  
**Assinatura alternativa:** “Todo mundo no mesmo jogo.”

## 3. Conceito visual: Lobby em órbita

A direção combina uma sala de jogos escura com movimentos lentos de metal líquido e reflexos violeta-noturno. O fundo cria escala e atmosfera; o conteúdo permanece legível, preciso e sem excesso de superfícies. Formas arredondadas representam pessoas e grupos; filas, trilhos e posições numeradas representam o movimento até a partida.

### Paleta principal

| Papel | Nome | Cor | Uso |
| --- | --- | --- | --- |
| Fundo-base | **Azul Abissal** | `#0F1C21` | fundo predominante das telas e base para profundidade |
| Superfície elevada | **Azul Profundo** | `#13282F` | diálogos, campos, painéis de tarefa e áreas que exigem separação real |
| Ação primária | **Ciano Lobby** | `#23B5D3` | CTAs, foco, seleção e avanço de fluxo |
| Violeta de ambiente | **Violeta-noturno** | `#241B3D` | reflexos, fundos decorativos, gráficos e detalhes de baixa ênfase |
| Reflexo violeta | **Violeta Bruma** | `#735A8F` | luz ambiente, hover muito sutil e gradientes de fundo |
| Texto principal | **Marfim Frio** | `#F5F1E8` | títulos, rótulos importantes e ícones ativos |
| Texto secundário | **Névoa Azulada** | `#AAB7B5` | descrições, metadados e ações secundárias |
| Contorno | **Linha Abissal** | `#30434A` | divisores, campos e botões secundários |

O Ciano Lobby é a única cor de ação recorrente. Violeta-noturno e Violeta Bruma pertencem à camada atmosférica: podem aparecer no Molten Metal, em gradientes muito escuros, ilustrações abstratas e gráficos, mas não devem competir com CTAs, estados críticos ou texto.

As cores de estado são semânticas e não substituem a marca: azul/ciano para votação e seleção, verde discreto para pronto, âmbar para espera, violeta para contexto de partida e vermelho apenas para erro ou cancelamento. Manter todos os tokens em hexadecimal, validar contraste WCAG AA e usar Marfim Frio sobre Ciano Lobby em textos pequenos somente quando o contraste for comprovado; caso contrário, usar Azul Abissal.

### Superfícies e interação

- A interface deve começar com fundo transparente. Navegação, ações de texto, filtros e linhas de lista não recebem preenchimento em repouso.
- O hover é o sinal de superfície: aplicar uma névoa de Ciano Lobby ou Violeta Bruma em baixa opacidade, junto de transição curta de cor. O estado ativo pode adicionar sublinhado, indicador lateral ou borda, sem transformar tudo em pílula.
- Usar preenchimento sólido apenas quando ele comunica prioridade ou contexto: CTA primário, diálogo, campo editável, painel de tarefa crítica, item selecionado ou área com dados densos.
- Cartões não são o padrão. Preferir espaçamento, divisores discretos, mudança de tipografia e agrupamentos por contexto. Quando necessários, os cartões usam Azul Profundo e borda Linha Abissal, sem sombra pesada.
- O botão primário é preenchido em Ciano Lobby. Botões secundários são transparentes com borda; botões terciários permanecem transparentes e ganham somente hover. Não usar fundo colorido em toda ação disponível.

### Biblioteca de componentes e efeitos

- **React Bits** é a biblioteca de referência para elementos modernos e diferenciados, como o fundo Molten Metal. Seus componentes devem ser usados como ponto de partida para fundos, animações e elementos visuais de destaque.
- A base de componentes funcionais continua sendo **shadcn/ui**. Integrar elementos da React Bits ao padrão de composição, tokens, acessibilidade e variantes já adotado pelo shadcn/ui; não introduzir um segundo sistema visual isolado.
- Usar React Bits com intenção: priorizar hero institucional, estados vazios, transições de contexto e detalhes de marca. Controles recorrentes — botões, campos, menus, diálogos e listas — permanecem nos componentes shadcn/ui adaptados à identidade do Fillobby.
- Todo efeito deve ter alternativa estática, respeitar `prefers-reduced-motion`, não bloquear interação e manter contraste e desempenho aceitáveis em dispositivos móveis.

### Tipografia

- **Archivo Variable** para interface e títulos. É legível em tamanhos pequenos, tem personalidade editorial e bons pesos sem parecer fonte de e-sport.
- **Roboto Mono** apenas para códigos de convite, posições, contadores e pequenos dados técnicos.
- Títulos em peso 650–700, texto em 400–500 e botões em 600. Usar caixa alta somente em rótulos curtos de estado, com espaçamento entre letras.
- A marca deve ter lettering próprio ou ajustes no nome “Fillobby”; não aplicar uma fonte display temática ao produto inteiro.

## 4. Direção de logo

Evitar um gamepad genérico. O símbolo recomendado é o **Lobby Ring**: quatro módulos arredondados, como assentos ou avatares, organizados ao redor de um espaço central. O vazio central forma discretamente um triângulo de _play_; uma abertura no anel indica entrada na sala e movimento de fila.

O símbolo deve funcionar em uma cor, em 16 px e sem detalhes internos. Versão principal: símbolo Ciano Lobby com wordmark Marfim Frio sobre Azul Abissal. Para o wordmark, explorar um encaixe sutil entre o final de “Fill” e o início de “lobby”, reforçando que fila e lobby viram uma única experiência. Não usar joystick, mascote agressivo, raio ou tipografia inspirada em fliperama. Enquanto o arquivo definitivo não existir, pontos de marca devem exibir apenas o nome Fillobby; não criar símbolo provisório nem reaproveitar um ícone genérico.

Entregáveis futuros: símbolo, composição horizontal, versão monocromática, favicon, área de respiro e regras para fundos.

## 5. Aplicação no produto

### Sistema visual

- Tratar o tema escuro como a expressão principal do produto. O tema claro, quando existir, deve preservar a mesma hierarquia de transparência, ciano e violeta, sem voltar a uma interface branca de cartões.
- Reduzir a quantidade de cartões contornados. Usar hierarquia por superfície, espaçamento, divisores e trilhos verticais.
- Dar à fila uma identidade própria: posição grande em mono, capa, votos e uma linha de progresso que conecta `Sugerido → Votação → Jogadores → Pronto → Jogando`.
- Transformar avatares em elemento recorrente para tornar a colaboração visível, especialmente em grupos, votos e prontidão.
- Reservar Ciano Lobby para decisões relevantes. Ações administrativas, filtros e navegação permanecem transparentes até interação.
- Usar cantos de 10–14 px em painéis e 8–10 px em controles; evitar pílulas em tudo.
- Preferir ícones Lucide funcionais. O símbolo da marca substitui `Gamepad2` apenas nos pontos de branding.

### Páginas prioritárias

1. **Landing:** contar a história “sugerir, decidir, reunir, jogar” sobre uma composição Molten Metal azul e violeta; mostrar uma fila realista e pessoas prontas, não um dashboard vazio.
2. **Grupo/fila:** tornar o estado atual e a próxima ação imediatamente visíveis. Este é o coração visual do produto.
3. **Autenticação:** usar o painel lateral como momento de marca, com o Lobby Ring ampliado e uma composição abstrata de assentos/fila.
4. **Lista de grupos:** diferenciar grupos por iniciais, participantes recentes e última atividade, em vez de repetir o mesmo ícone.
5. **Catálogo:** priorizar capas e descoberta, mantendo autoria e administração em segundo plano.

## 6. Movimento, imagem e voz

Movimentos devem sugerir entrada e avanço: itens novos deslizam poucos pixels para a fila, votos atualizam o contador e o estado “Pronto” confirma com uma pulsação única. Duração entre 160 e 240 ms, respeitando `prefers-reduced-motion`. Hover de componentes transparentes usa apenas mudança de cor, borda ou névoa de baixa opacidade; não deslocar o layout. Fundos animados ficam restritos ao hero institucional, em baixa velocidade e com alternativa estática; não usar brilhos contínuos ou parallax na interface do produto.

Fotografia, se usada, deve mostrar amigos no momento anterior ou posterior à partida, com luz doméstica e enquadramento documental. Ilustrações podem usar módulos geométricos da marca, capas e avatares. Personagens 3D ficam restritos à comunicação institucional, devem ser originais e compartilhar direção de arte, materiais e paleta; não usar mascotes genéricos como decoração da interface. A voz é breve, amistosa e orientada à ação: “A galera está pronta” funciona melhor que “Status alterado com sucesso”.

## 7. Plano de execução

### Fase 1 — Fundação e validação

- Validar conceito, paleta, tipografia e direção do logo com 3–5 usuários do público.
- Criar um _moodboard_ e três rascunhos monocromáticos do Lobby Ring.
- Definir tokens claros/escuros, escala tipográfica, espaçamento, raio, sombra e estados.
- Testar contraste, daltonismo e legibilidade em telas pequenas.

### Fase 2 — Protótipo do núcleo

- Criar em alta fidelidade a landing, a fila de um grupo e autenticação.
- Prototipar estados vazio, carregando, votação, prontidão e partida em andamento.
- Testar se uma pessoa identifica em poucos segundos o estado da fila e a próxima ação.

### Fase 3 — Implementação

- Substituir tokens em `src/styles.css` e carregar as fontes de forma otimizada.
- Criar componentes de marca, cabeçalho de grupo, trilho de estado e cartões de fila.
- Migrar primeiro landing/autenticação, depois grupo/fila e, por fim, catálogo/perfil.
- Atualizar favicon, metadados, imagens sociais e documentação visual.

### Fase 4 — Polimento e medição

- Revisar responsividade, foco por teclado, contraste e redução de movimento.
- Padronizar textos, vazios, confirmações e erros.
- Medir criação/entrada em grupo, primeiro jogo sugerido, primeiro voto e partida concluída; a identidade deve melhorar entendimento e confiança, não apenas aparência.

## 8. Critérios de sucesso

- A marca continua reconhecível sem capas de jogos ou ícones temáticos.
- Fila, voto, prontidão e partida têm hierarquia distinta e consistente.
- A principal ação de cada tela é identificada rapidamente.
- Tema escuro, claro e estados especiais preservam a mesma personalidade: Azul Abissal, Ciano Lobby e violeta-noturno em papéis consistentes.
- O violeta cria atmosfera, mas nenhuma decisão funcional depende de neon, de roxo tecnológico ou de decoração gamer genérica.

## 9. Decisões

1. O tema escuro é a expressão visual padrão; o usuário pode alternar para o claro conforme sua preferência
2. O tom da marca pode ser mais descontraído (“a galera”, “bora jogar”, etc)
3. O Fillobby deve, no futuro, permitir identidade própria por grupo (capa/cor)

## 10. Estado da implementação

A primeira etapa da fundação visual foi iniciada em agosto de 2026:

- tokens claros, escuros e semânticos foram definidos em hexadecimal em `src/styles.css`; a próxima revisão deve alinhar todos ao Azul Abissal, Ciano Lobby e violeta-noturno;
- Archivo e Roboto Mono foram configuradas no documento raiz;
- landing, autenticação e navegação receberam a nova paleta e hierarquia;
- os estados da fila deixaram de usar cores genéricas, incluindo o antigo violeta de “Jogando”;
- pontos de branding exibem somente o nome Fillobby até a entrega da logo oficial.

O núcleo da experiência também recebeu a segunda etapa:

- o detalhe do grupo agora funciona como um lobby, com identificação, convite e ações contextualizadas;
- a navegação interna usa abas lineares em vez de um seletor genérico;
- cada jogo apresenta posição, mensagem da etapa, votos, prontidão e um trilho de `Sugestão` até `Jogando`;
- votos e participantes permanecem visíveis de forma compacta e podem ser expandidos;
- ações principais mudam de ênfase conforme votação, prontidão e início da partida.

A terceira etapa propagou o sistema para as demais áreas principais:

- a lista de grupos apresenta cada lobby por iniciais, posição e papel do usuário;
- o catálogo ganhou hierarquia editorial, capas consistentes, contagem de resultados e estados vazios;
- o perfil reúne identidade pública, foto, informações pessoais e preferência visual;
- o tema ainda permite alternância e salva a escolha no dispositivo; a implementação deverá inverter a prioridade visual para o tema escuro conforme esta direção;
- o controle de tema está disponível na landing, autenticação, navegação e perfil;
- painéis Azul Lobby preservam a mesma identidade nos dois temas.

O próximo recorte recomendado é uma rodada de validação visual e responsiva com dados reais, seguida pelo refinamento de membros, histórico, configurações e diálogos. Depois disso, devem ser tratados favicon, imagens sociais e a aplicação da logo oficial quando ela estiver disponível.

### Hero da landing

A landing abre com uma composição imersiva centrada na promessa “Seus amigos. Seus jogos. Uma escolha simples.”. O hero contém apenas a mensagem, uma explicação breve, CTA primário, CTA secundário e a faixa contínua de plataformas. Essa contenção preserva a leitura sobre o fundo atmosférico e evita transformar o primeiro contato em dashboard.

O fundo Molten Metal usa Azul Abissal como base, reflexos de Violeta-noturno e Violeta Bruma e luzes pontuais de Ciano Lobby, com baixa velocidade e contraste controlado. Ele é decorativo: há um fundo estático equivalente, a animação pausa fora da tela e `prefers-reduced-motion` mantém apenas um quadro. O símbolo definitivo continua ausente até a entrega da logo oficial; o cabeçalho conserva o wordmark textual e ações transparentes, exceto pelo CTA primário em Ciano Lobby.
