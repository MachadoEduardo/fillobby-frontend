# Identidade visual do Fillobby

## 1. Diagnóstico atual

O produto já comunica organização, mas ainda se parece com um dashboard genérico: roxo como cor principal, Inter, ícone pronto de controle, cartões brancos e pouca diferenciação entre fila, votação e partida. A identidade precisa evidenciar o valor real do Fillobby: reduzir a indecisão do grupo e transformar intenção em uma partida combinada.

## 2. Posicionamento

**Ideia central:** _a sala está pronta_.

Fillobby é o ponto de encontro antes do jogo, não uma loja, rede social ou plataforma competitiva. A marca deve parecer:

- coletiva, acolhedora e direta;
- moderna sem depender de neon, gradientes roxo/azul ou estética cyberpunk;
- ligada a jogos sem usar controles, pixels e troféus como linguagem principal;
- dinâmica na fila e votação, tranquila na organização.

**Público principal:** grupos de amigos que jogam online ou presencialmente, geralmente entre 18 e 35 anos, e querem decidir rápido o que jogar, confirmar participantes e preservar o histórico do grupo.

**Promessa verbal:** “Menos tempo decidindo. Mais tempo jogando.”  
**Assinatura alternativa:** “Todo mundo no mesmo jogo.”

## 3. Conceito visual: Lobby aceso

A direção combina o ambiente escuro e confortável de uma sala de jogos com um sinal quente de convite. Formas arredondadas representam pessoas e grupos; filas, trilhos e posições numeradas representam o movimento até a partida. A interface deve ter personalidade por composição, estados e conteúdo — não por decoração excessiva.

### Paleta principal

| Papel          | Nome            | Cor       | Uso                                                  |
| -------------- | --------------- | --------- | ---------------------------------------------------- |
| Marca/base     | **Azul Lobby**  | `#17313A` | logotipo, navegação, títulos, superfícies escuras    |
| Ação/sinal     | **Brasa**       | `#D8663B` | CTA, voto selecionado, destaques e foco              |
| Fundo claro    | **Marfim Tela** | `#F5F1E8` | fundo principal; mais acolhedor que branco puro      |
| Apoio coletivo | **Azul Mesa**   | `#4F7D83` | pessoas, links secundários e informação colaborativa |
| Texto          | **Carvão**      | `#202A2E` | texto principal                                      |
| Superfície     | **Névoa**       | `#DCE3DF` | bordas, divisores e fundos secundários               |

Para o modo escuro, usar `#0F1C21` no fundo, `#17272D` em cartões, `#F3EEE4` no texto e manter Brasa como sinal. Evitar preto puro e aumentar a luminosidade do Azul Mesa. As cores de estado são semânticas e não devem substituir a marca: ocre para espera, azul para votação, verde musgo para pronto, Brasa para jogando e vermelho apenas para erro/cancelamento.

Manter todos os tokens de cor em hexadecimal para facilitar leitura e manutenção, e validar contraste WCAG AA. Não usar Brasa com texto branco pequeno sem teste; prefira Azul Lobby sobre Brasa.

### Tipografia

- **Archivo Variable** para interface e títulos. É legível em tamanhos pequenos, tem personalidade editorial e bons pesos sem parecer fonte de e-sport.
- **Roboto Mono** apenas para códigos de convite, posições, contadores e pequenos dados técnicos.
- Títulos em peso 650–700, texto em 400–500 e botões em 600. Usar caixa alta somente em rótulos curtos de estado, com espaçamento entre letras.
- A marca deve ter lettering próprio ou ajustes no nome “Fillobby”; não aplicar uma fonte display temática ao produto inteiro.

## 4. Direção de logo

Evitar um gamepad genérico. O símbolo recomendado é o **Lobby Ring**: quatro módulos arredondados, como assentos ou avatares, organizados ao redor de um espaço central. O vazio central forma discretamente um triângulo de _play_; uma abertura no anel indica entrada na sala e movimento de fila.

O símbolo deve funcionar em uma cor, em 16 px e sem detalhes internos. Versão principal: símbolo Brasa com wordmark Azul Lobby sobre Marfim. No modo escuro, símbolo Brasa e nome Marfim. Para o wordmark, explorar um encaixe sutil entre o final de “Fill” e o início de “lobby”, reforçando que fila e lobby viram uma única experiência. Não usar joystick, mascote agressivo, raio ou tipografia inspirada em fliperama. Enquanto o arquivo definitivo não existir, pontos de marca devem exibir apenas o nome Fillobby; não criar símbolo provisório nem reaproveitar um ícone genérico.

Entregáveis futuros: símbolo, composição horizontal, versão monocromática, favicon, área de respiro e regras para fundos.

## 5. Aplicação no produto

### Sistema visual

- Reduzir a quantidade de cartões contornados. Usar hierarquia por superfície, espaçamento e trilhos verticais.
- Dar à fila uma identidade própria: posição grande em mono, capa, votos e uma linha de progresso que conecta `Sugerido → Votação → Jogadores → Pronto → Jogando`.
- Transformar avatares em elemento recorrente para tornar a colaboração visível, especialmente em grupos, votos e prontidão.
- Reservar Brasa para decisões relevantes. Ações administrativas e filtros permanecem neutros.
- Usar cantos de 10–14 px em painéis e 8–10 px em controles; evitar pílulas em tudo.
- Preferir ícones Lucide funcionais. O símbolo da marca substitui `Gamepad2` apenas nos pontos de branding.

### Páginas prioritárias

1. **Landing:** contar a história “sugerir, decidir, reunir, jogar”; mostrar uma fila realista e pessoas prontas, não um dashboard vazio.
2. **Grupo/fila:** tornar o estado atual e a próxima ação imediatamente visíveis. Este é o coração visual do produto.
3. **Autenticação:** usar o painel lateral como momento de marca, com o Lobby Ring ampliado e uma composição abstrata de assentos/fila.
4. **Lista de grupos:** diferenciar grupos por iniciais, participantes recentes e última atividade, em vez de repetir o mesmo ícone.
5. **Catálogo:** priorizar capas e descoberta, mantendo autoria e administração em segundo plano.

## 6. Movimento, imagem e voz

Movimentos devem sugerir entrada e avanço: itens novos deslizam poucos pixels para a fila, votos atualizam o contador e o estado “Pronto” confirma com uma pulsação única. Duração entre 160 e 240 ms, respeitando `prefers-reduced-motion`. Não usar brilhos contínuos, fundos animados ou parallax.

Fotografia, se usada, deve mostrar amigos no momento anterior ou posterior à partida, com luz doméstica e enquadramento documental. Ilustrações podem usar módulos geométricos da marca, capas e avatares; não usar personagens 3D genéricos. A voz é breve, amistosa e orientada à ação: “A galera está pronta” funciona melhor que “Status alterado com sucesso”.

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
- Interface clara e escura preservam a mesma personalidade.
- Nenhuma decisão depende de neon, roxo tecnológico ou decoração gamer genérica.

## 9. Decisões

1. O produto deve nascer com modo claro como padrão, permitindo que o usuário alterne conforme sua preferência
2. O tom da marca pode ser mais descontraído (“a galera”, “bora jogar”, etc)
3. O Fillobby deve, no futuro, permitir identidade própria por grupo (capa/cor)

## 10. Estado da implementação

A primeira etapa da fundação visual foi iniciada em agosto de 2026:

- tokens claros, escuros e semânticos foram definidos em hexadecimal em `src/styles.css`;
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
- o tema claro permanece como padrão, o usuário pode alternar para o escuro e a escolha fica salva no dispositivo;
- o controle de tema está disponível na landing, autenticação, navegação e perfil;
- painéis Azul Lobby preservam a mesma identidade nos dois temas.

O próximo recorte recomendado é uma rodada de validação visual e responsiva com dados reais, seguida pelo refinamento de membros, histórico, configurações e diálogos. Depois disso, devem ser tratados favicon, imagens sociais e a aplicação da logo oficial quando ela estiver disponível.
