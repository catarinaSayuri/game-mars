// Cena principal do jogo, hub central onde o jogador explora o mapa e acessa os níveis
export default class SceneJogo extends Phaser.Scene {
    constructor() {
        super("SceneJogo"); // Define o nome da cena
        this.instrucoesVisiveis = true; // Controla a visibilidade das instruções na tela
        this.instrucaoAtual = 0; // Acompanha o índice da instrução atual
        this.portasVisitadas = {
            frank: false, // Estado da porta do nível do Frank (não visitada inicialmente)
            forrest: false, // Estado da porta do nível do Forrest
            olivia: false // Estado da porta do nível da Olivia
        };
        this.posicoesSaida = {
            frank: { x: 490, y: 500 }, // Coordenadas onde o jogador aparece ao sair do nível do Frank
            forrest: { x: 330, y: 950 }, // Coordenadas para o nível do Forrest
            olivia: { x: 1620, y: 280 } // Coordenadas para o nível da Olivia
        };
    }

    // Carrega todos os assets usados na cena
    preload() {
        this.load.image("imagemFundo", "src/assets/imagens/imagesMapa/mapaoficial.png"); // Carrega a imagem do mapa
        this.load.image('frankPopup', 'src/assets/imagens/imagesPopUps/popupfrank.png'); // Popup do personagem Frank
        this.load.image('forrestPopup', 'src/assets/imagens/imagesPopUps/forrestpopup.png'); // Popup do personagem Forrest
        this.load.image('oliviaPopup', 'src/assets/imagens/imagesPopUps/popupolivia.png'); // Popup da personagem Olivia
        this.load.atlas("jogadorAtlas", "src/assets/sprites/spritesheet.png", "src/assets/sprites/sprites.json"); // Spritesheet com as animações do jogador
        this.load.audio('musicaFaseJogo', "src/assets/sounds/fase1.mp3"); // Música de fundo da cena
        this.load.image("setaPopUpProximo", "src/assets/imagens/imagesBotoes/proximoPopUp.png"); // Botão para avançar textos do popup
        this.load.image("setaPopUpAnterior", "src/assets/imagens/imagesBotoes/voltarPopUp.png"); // Botão para voltar textos do popup
        this.load.image("setaIndicadora", "src/assets/imagens/imagesPopUps/indicadorNivel.png"); // Seta que aponta para o próximo nível

        // Registra erros de carregamento para facilitar debug
        this.load.on("loaderror", (arquivo) => {
            console.error(`Erro ao carregar o arquivo: ${arquivo.key}`);
        });
    }

    // Configura o ambiente, o jogador, as portas e os elementos interativos
    create() {
        this.sound.stopAll(); // Para qualquer música de cenas anteriores
        console.log("Todas as músicas anteriores paradas ao entrar na SceneJogo");

        // Define a resolução base e ajusta o zoom para diferentes telas
        const baseWidth = 1920; // Largura padrão do mapa
        const baseHeight = 1080; // Altura padrão do mapa
        const largura = this.scale.width; // Largura atual da janela
        const altura = this.scale.height; // Altura atual da janela
        const scaleX = largura / baseWidth; // Escala horizontal
        const scaleY = altura / baseHeight; // Escala vertical
        const scale = Math.min(scaleX, scaleY); // Usa a menor escala para manter proporção
        this.cameras.main.setZoom(scale); // Aplica o zoom à câmera
        this.cameras.main.setBounds(0, 0, baseWidth, baseHeight); // Define os limites da câmera
        this.physics.world.setBounds(0, 0, baseWidth, baseHeight); // Define os limites do mundo físico

        // Adiciona o fundo do mapa
        this.fundo = this.add.image(0, 0, "imagemFundo")
            .setOrigin(0, 0) // Posiciona a origem no canto superior esquerdo
            .setDisplaySize(this.game.config.width, this.game.config.height); // Ajusta ao tamanho da tela

        // Configura as teclas de movimento
        this.teclaW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W); // Tecla W
        this.teclaA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); // Tecla A
        this.teclaS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); // Tecla S
        this.teclaD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); // Tecla D
        this.teclasCursor = this.input.keyboard.createCursorKeys(); // Setas do teclado

        // Define a posição inicial do jogador
        const posicaoSaida = this.registry.get("posicaoSaida"); // Verifica se há uma posição de saída salva
        let jogadorX = 100; // Posição X padrão
        let jogadorY = 695; // Posição Y padrão
        if (posicaoSaida) {
            jogadorX = posicaoSaida.x; // Usa a posição de saída, se disponível
            jogadorY = posicaoSaida.y;
            this.registry.remove("posicaoSaida"); // Limpa a posição salva
        }

        // Cria o sprite do jogador com física
        this.jogadorSprite = this.physics.add.sprite(jogadorX, jogadorY, "jogadorAtlas")
            .setScale(1.6) // Aumenta o tamanho do sprite
            .setOrigin(0.5, 0.5) // Centraliza o sprite
            .setCollideWorldBounds(true); // Impede o jogador de sair do mapa

        // Configura a câmera para seguir o jogador
        this.cameras.main.setBounds(0, 0, this.fundo.displayWidth, this.fundo.displayHeight); // Ajusta os limites ao tamanho do fundo
        this.cameras.main.startFollow(this.jogadorSprite, true, 0.05, 0.05); // Faz a câmera seguir o jogador com suavização
        this.cameras.main.setZoom(2); // Aplica um zoom fixo para destacar o jogador

        this.criarAnimacoes(); // Inicializa as animações do jogador

        // Cria o contêiner para o popup
        const screenWidth = this.game.config.width; // Largura da tela
        const screenHeight = this.game.config.height; // Altura da tela
        this.containerPopup = this.add.container(0, 0); // Contêiner para agrupar elementos do popup
        this.fundoPopup = this.add.image(0, 0, 'frankPopup')
            .setOrigin(0.5) // Centraliza a imagem
            .setScale(0.96); // Ajusta o tamanho
        this.textoPopup = this.add.text(0, 0, "", {
            fontSize: "20px",
            fill: "#000000",
            fontFamily: "Jersey",
            wordWrap: { width: 290, useAdvancedWrap: true },
            align: "left"
        }).setOrigin(0, 0); // Texto do popup alinhado à esquerda

        // Adiciona botões de navegação ao popup
        this.setaProximo = this.add.image(70, 50, "setaPopUpProximo")
            .setOrigin(0.5) // Centraliza a seta
            .setScale(0.6) // Reduz o tamanho
            .setInteractive() // Habilita interatividade
            .on("pointerdown", () => this.avancarTexto()) // Avança o texto ao clicar
            .on("pointerover", () => this.setaProximo.setScale(0.7)) // Aumenta ao passar o mouse
            .on("pointerout", () => this.setaProximo.setScale(0.6)); // Volta ao normal

        this.setaAnterior = this.add.image(28, 50, "setaPopUpAnterior")
            .setOrigin(0.5)
            .setScale(0.6)
            .setInteractive()
            .on("pointerdown", () => this.voltarTexto()) // Volta o texto ao clicar
            .on("pointerover", () => this.setaAnterior.setScale(0.7)) // Aumenta ao passar o mouse
            .on("pointerout", () => this.setaAnterior.setScale(0.6)); // Volta ao normal

        // Agrupa os elementos do popup no contêiner
        this.containerPopup.add([this.fundoPopup, this.textoPopup, this.setaProximo, this.setaAnterior]);
        this.containerPopup.setDepth(5); // Coloca o popup acima de outros elementos
        this.containerPopup.setVisible(false); // Inicia invisível

        // Cria a seta que indica o próximo nível
        this.setaIndicadora = this.add.image(0, 0, 'setaIndicadora')
            .setOrigin(0.5, 0.5) // Centraliza a seta
            .setScale(0.2) // Reduz o tamanho
            .setDepth(5) // Camada acima do mapa
            .setVisible(false); // Inicia invisível

        // Cria grupo de colisores para obstáculos
        this.grupoColisores = this.physics.add.staticGroup();

        // Define os obstáculos do mapa
        const obstaculosData = [
            { x: 325, y: 935, largura: 310, altura: 200 }, // Obstáculo 1
            { x: 325, y: 810, largura: 100, altura: 40 }, // Obstáculo 2
            { x: 585, y: 350, largura: 320, altura: 180 }, // Obstáculo 3
            { x: 1635, y: 150, largura: 330, altura: 230 }, // Obstáculo 4
            { x: 965, y: 590, largura: 85, altura: 55 }, // Obstáculo 5
            { x: 500, y: 120, largura: 1200, altura: 300 }, // Obstáculo 6
            { x: 1200, y: 200, largura: 100, altura: 75 }, // Obstáculo 7
            { x: 1300, y: 130, largura: 35, altura: 35 }, // Obstáculo 8
            { x: 160, y: 490, largura: 100, altura: 80 }, // Obstáculo 9
            { x: 350, y: 550, largura: 70, altura: 145 }, // Obstáculo 10
            { x: 315, y: 620, largura: 50, altura: 20 }, // Obstáculo 11
            { x: 428, y: 475, largura: 25, altura: 20 }, // Obstáculo 12
            { x: 378, y: 415, largura: 40, altura: 40 }, // Obstáculo 13
            { x: 330, y: 405, largura: 30, altura: 15 }, // Obstáculo 14
            { x: 67, y: 360, largura: 35, altura: 25 }, // Obstáculo 15
            { x: 85, y: 815, largura: 100, altura: 80 }, // Obstáculo 16
            { x: 110, y: 240, largura: 100, altura: 80 }, // Obstáculo 17
            { x: 180, y: 340, largura: 70, altura: 90 }, // Obstáculo 18
            { x: 520, y: 790, largura: 90, altura: 50 }, // Obstáculo 19
            { x: 640, y: 805, largura: 90, altura: 50 }, // Obstáculo 20
            { x: 780, y: 825, largura: 70, altura: 90 }, // Obstáculo 21
            { x: 1385, y: 755, largura: 70, altura: 90 }, // Obstáculo 22
            { x: 700, y: 670, largura: 58, altura: 43 }, // Obstáculo 23
            { x: 730, y: 915, largura: 20, altura: 60 }, // Obstáculo 24
            { x: 1850, y: 850, largura: 800, altura: 220 }, // Obstáculo 25
            { x: 1330, y: 870, largura: 220, altura: 45 }, // Obstáculo 26
            { x: 1120, y: 890, largura: 180, altura: 45 }, // Obstáculo 27
            { x: 1000, y: 940, largura: 70, altura: 45 }, // Obstáculo 28
            { x: 960, y: 960, largura: 70, altura: 45 }, // Obstáculo 29
            { x: 920, y: 1000, largura: 70, altura: 45 }, // Obstáculo 30
            { x: 860, y: 1030, largura: 70, altura: 45 }, // Obstáculo 31
            { x: 810, y: 1080, largura: 70, altura: 45 }, // Obstáculo 32
            { x: 65, y: 1000, largura: 150, altura: 45 }, // Obstáculo 33
            { x: 365, y: 367, largura: 30, altura: 15 }, // Obstáculo 34
            { x: 810, y: 370, largura: 65, altura: 60 }, // Obstáculo 35
            { x: 625, y: 965, largura: 60, altura: 13 }, // Obstáculo 36
            { x: 625, y: 980, largura: 13, altura: 50 }, // Obstáculo 37
            { x: 890, y: 430, largura: 20, altura: 60 }, // Obstáculo 38
            { x: 1070, y: 440, largura: 60, altura: 50 }, // Obstáculo 39
            { x: 1330, y: 245, largura: 60, altura: 13 }, // Obstáculo 40
            { x: 1330, y: 270, largura: 13, altura: 40 }, // Obstáculo 41
            { x: 1338, y: 150, largura: 28, altura: 15 }, // Obstáculo 42
            { x: 1240, y: 470, largura: 28, altura: 25 }, // Obstáculo 43
            { x: 1220, y: 485, largura: 28, altura: 10 }, // Obstáculo 44
            { x: 1250, y: 450, largura: 115, altura: 70 }, // Obstáculo 45
            { x: 1410, y: 480, largura: 115, altura: 70 }, // Obstáculo 46
            { x: 1170, y: 520, largura: 80, altura: 30 }, // Obstáculo 47
            { x: 1400, y: 20, largura: 100, altura: 80 }, // Obstáculo 48
            { x: 1875, y: 20, largura: 100, altura: 80 }, // Obstáculo 49
            { x: 1715, y: 670, largura: 100, altura: 80 }, // Obstáculo 50
            { x: 1795, y: 670, largura: 100, altura: 80 }, // Obstáculo 51
            { x: 1865, y: 620, largura: 100, altura: 80 }, // Obstáculo 52
            { x: 1153, y: 755, largura: 100, altura: 80 }, // Obstáculo 53
            { x: 1040, y: 705, largura: 60, altura: 50 }, // Obstáculo 54
            { x: 1135, y: 390, largura: 70, altura: 70 }, // Obstáculo 55
            { x: 1875, y: 180, largura: 50, altura: 40 }, // Obstáculo 56
            { x: 1875, y: 275, largura: 50, altura: 25 }, // Obstáculo 57
            { x: 1590, y: 850, largura: 220, altura: 90 }, // Obstáculo 58
            { x: 1845, y: 450, largura: 50, altura: 40 }, // Obstáculo 59
            { x: 870, y: 835, largura: 35, altura: 25 }, // Obstáculo 60
            { x: 490, y: 530, largura: 200, altura: 10 }, // Obstáculo 61
            { x: 700, y: 530, largura: 120, altura: 10 }, // Obstáculo 62
            { x: 870, y: 320, largura: 10, altura: 150 }, // Obstáculo 63
            { x: 770, y: 500, largura: 10, altura: 40 }, // Obstáculo 64
            { x: 825, y: 460, largura: 70, altura: 10 }, // Obstáculo 65
            { x: 285, y: 370, largura: 10, altura: 120 }, // Obstáculo 66
            { x: 300, y: 430, largura: 45, altura: 10 }, // Obstáculo 67
        ];

        // Adiciona cada obstáculo ao grupo de colisores
        obstaculosData.forEach((obstaculo) => {
            const colisor = this.add.rectangle(obstaculo.x, obstaculo.y, obstaculo.largura, obstaculo.altura, 0x000000, 0); // Invisível
            this.grupoColisores.add(colisor); // Adiciona ao grupo
        });

        // Define as portas com seus textos e posições
        this.portas = [
            {
                id: 'frank',
                x: 490,
                y: 440,
                textos: [
                    "Choco, fico feliz por ter você aqui! Agora, vamos para a cozinha. Criar o chocolate perfeito exige muito mais do que apenas misturar ingredientes, cada detalhe faz a diferença. Aqui, a precisão é essencial!",
                    "Para criar essa barra especial, você precisará encontrar a medida exata de 3 ingredientes essenciais: cacau, açúcar e manteiga. Se errarmos a quantidade, o sabor e a textura podem ficar comprometidos.",
                    "Então, fique atento e experimente até chegar à combinação perfeita! Vamos lá, mãos à obra! Afinal, um chocolate de qualidade começa com os melhores ingredientes e a dose certa de cuidado. Conto com você!"
                ],
                etapaAtual: 0, // Texto inicial do popup
                concluido: false, // Estado do popup (não concluído)
                offsetX: 440, // Deslocamento X do popup
                offsetY: 180, // Deslocamento Y do popup
                textoOffsetX: -240, // Deslocamento X do texto
                textoOffsetY: -75 // Deslocamento Y do texto
            },
            {
                id: 'forrest',
                x: 330,
                y: 1020,
                textos: [
                    "Seja bem-vindo, Choco! Sou o Forrest Mars e esta é uma das nossas fábricas. Meu pai, Frank Mars, começou este negócio com dedicação e qualidade. Agora, temos um desafio: garantir que a Mars continue crescendo sem perder DIAGRAM seus valores.",
                    "Hoje, você será o responsável pelas decisões importantes aqui dentro. Cada escolha que fizer influenciará quatro pilares fundamentais: nosso lucro, valores, a satisfação dos consumidores e o bem-estar dos nossos colaboradores.",
                    "Neste nível, vamos trabalhar dois valores essenciais da Mars: responsabilidade e eficiência. Precisamos ser responsáveis com os consumidores e colaboradores, garantindo qualidade e segurança",
                    "Ao mesmo tempo, devemos buscar eficiência para manter o crescimento e a inovação da empresa."
                ],
                etapaAtual: 0,
                concluido: false,
                offsetX: 420,
                offsetY: -150,
                textoOffsetX: -260,
                textoOffsetY: -70
            },
            {
                id: 'olivia',
                x: 1620,
                y: 230,
                textos: [
                    "Olá, Choco! Eu sou Olivia, gerente do escritório da Mars. Bem-vindo ao coração das nossas operações! Aqui é onde as grandes ideias ganham vida e os projetos de chocolate tomam forma.",
                    "Sua missão aqui é montar equipes incríveis para gerenciar nossos projetos. Cada decisão que você tomar vai impactar nosso sucesso e a felicidade dos nossos consumidores!",
                    "Vamos trabalhar com relatórios de personalidade para escolher os melhores talentos. Preste atenção às habilidades dos integrantes e alinhe isso com as necessidades dos projetos. Está pronto para liderar com sabedoria? Mãos à obra!"
                ],
                etapaAtual: 0,
                concluido: false,
                offsetX: 500,
                offsetY: 180,
                textoOffsetX: -250,
                textoOffsetY: -74
            },
        ];

        this.verificarProximidadePortas(); // Checa portas próximas ao iniciar a cena

        // Define as portas que levam a outras cenas
        const portasData = [
            { x: 330, y: 1020, largura: 70, altura: 30, cena: "SceneFabrica", id: "forrest" }, // Porta da fábrica
            { x: 490, y: 440, largura: 40, altura: 30, cena: "SceneQuarto", id: "frank" }, // Porta da casa
            { x: 1620, y: 250, largura: 80, altura: 50, cena: "SceneEscritorio", id: "olivia" }, // Porta do escritório
            { x: 10, y: 700, largura: 20, altura: 50, cena: "SceneTutorial", id: "tutorial" }, // Porta do tutorial
        ];

        // Sincroniza o estado das portas com o progresso salvo
        this.portasVisitadas = this.registry.get("portasVisitadas") || {
            frank: window.progresso?.fase1 || false,
            forrest: window.progresso?.fase2 || false,
            olivia: window.progresso?.fase3 || false
        };
        this.registry.set("portasVisitadas", this.portasVisitadas); // Salva no registro
        console.log("Estado inicial de portasVisitadas:", this.portasVisitadas);

        // Cria as portas com física e lógica de transição
        this.conjuntoPortas = [];
        portasData.forEach((porta) => {
            let rect = this.add.rectangle(porta.x, porta.y, porta.largura, porta.altura, 0xff0000, 0.0); // Porta invisível
            this.physics.add.existing(rect, true); // Adiciona física estática
            this.conjuntoPortas.push(rect); // Armazena no array de portas

            // Define a interação ao colidir com a porta
            this.physics.add.overlap(this.jogadorSprite, rect, () => {
                if (this.posicoesSaida[porta.id]) {
                    this.registry.set("posicaoSaida", this.posicoesSaida[porta.id]); // Salva a posição de saída
                }

                if (porta.id === "frank") {
                    if (!window.progresso.fase1) {
                        window.progresso.fase1 = true; // Marca a fase 1 como concluída
                        this.portasVisitadas.frank = true; // Atualiza o estado local
                        this.registry.set("portasVisitadas", this.portasVisitadas); // Salva no registro
                        console.log("Fase 1 (Frank) marcada como visitada");
                    }
                    this.scene.start(porta.cena); // Muda para a cena da casa
                } else if (porta.id === "forrest") {
                    if (!window.progresso.fase1) {
                        console.log("Complete a Fase 1 (Frank) antes de acessar a Fase 2 (Forrest).");
                        return; // Bloqueia acesso sem completar a fase 1
                    }
                    if (!window.progresso.fase2) {
                        window.progresso.fase2 = true; // Marca a fase 2
                        this.portasVisitadas.forrest = true;
                        this.registry.set("portasVisitadas", this.portasVisitadas);
                        console.log("Fase 2 (Forrest) marcada como visitada");
                    }
                    this.scene.start(porta.cena); // Muda para a cena da fábrica
                } else if (porta.id === "olivia") {
                    if (!window.progresso.fase2) {
                        console.log("Complete a Fase 2 (Forrest) antes de acessar a Fase 3 (Olivia).");
                        return; // Bloqueia acesso sem completar a fase 2
                    }
                    if (!window.progresso.fase3) {
                        window.progresso.fase3 = true; // Marca a fase 3
                        this.portasVisitadas.olivia = true;
                        this.registry.set("portasVisitadas", this.portasVisitadas);
                        console.log("Fase 3 (Olivia) marcada como visitada");
                    }
                    this.scene.start(porta.cena); // Muda para a cena do escritório
                } else if (porta.id === "tutorial") {
                    this.scene.start(porta.cena); // Volta para o tutorial
                }
            }, null, this);
        });

        // Adiciona colisão entre jogador e obstáculos
        this.physics.add.collider(this.jogadorSprite, this.grupoColisores);

        // Cria o texto de instrução que guia o jogador
        this.instrucaoTexto = this.add.text(20 / this.cameras.main.zoom, 20 / this.cameras.main.zoom, "Dirija-se até a casa para iniciar o nível 1", {
            fontSize: "18px",
            fill: "#ffffff",
            fontFamily: "Jersey",
            padding: { x: 10, y: 5 }
        }).setDepth(100); // Camada acima de tudo

        // Configura variáveis para o pulo
        this.vy0 = -300; // Velocidade inicial do pulo (negativa para subir)
        this.ay = 600; // Gravidade aplicada ao pulo
        this.noChao = true; // Jogador começa no chão
        this.tempoPulo = 0; // Tempo decorrido no pulo
        this.teclaEspaco = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Tecla para pular

        // Inicia a música de fundo
        if (this.cache.audio.has("musicaFaseJogo")) {
            console.log("Áudio 'musicaFaseJogo' encontrado no cache");
            this.musica = this.sound.add("musicaFaseJogo", {
                loop: true, // Repete a música
                volume: 0.5 // Volume moderado
            });
            this.musica.play(); // Toca a música
        } else {
            console.error("Áudio 'musicaFaseJogo' não encontrado no cache. Verifique o caminho.");
        }
    }

    // Limpa recursos ao sair da cena
    shutdown() {
        if (this.musica && this.musica.isPlaying) {
            this.musica.stop(); // Para a música
            console.log("Música 'musicaFaseJogo' parada ao sair da SceneJogo");
        }
        this.registry.remove("posicaoSaida"); // Remove a posição de saída salva
    }

    // Verifica se o jogador está perto de uma porta para exibir o popup
    verificarProximidadePortas() {
        const distanciaMinima = 250 / this.cameras.main.zoom; // Distância ajustada pelo zoom
        let portaMaisProxima = null;
        let menorDistancia = Infinity;

        // Encontra a porta mais próxima
        this.portas.forEach(porta => {
            const distancia = Phaser.Math.Distance.Between(
                this.jogadorSprite.x, this.jogadorSprite.y,
                porta.x, porta.y
            );
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                portaMaisProxima = porta;
            }
        });

        // Exibe o popup se a porta estiver próxima e não concluída
        if (menorDistancia <= distanciaMinima && portaMaisProxima && !portaMaisProxima.concluido) {
            this.exibirPopup(portaMaisProxima.id, portaMaisProxima.textos, portaMaisProxima);
        } else {
            this.ocultarPopup(); // Esconde o popup se não houver porta próxima
        }
    }

    // Mostra o popup com o texto da porta
    exibirPopup(idPorta, textos, porta) {
        if (!this.containerPopup.visible || this.currentPopupId !== idPorta) {
            this.currentPopupId = idPorta; // Armazena o ID do popup atual
            this.textosPopup = textos; // Define os textos do popup
            this.portaAtual = porta; // Armazena a porta atual

            // Carrega a textura do popup correspondente
            const imagemPopup = `${idPorta}Popup`;
            try {
                this.fundoPopup.setTexture(imagemPopup);
            } catch (e) {
                console.error(`Erro ao carregar textura ${imagemPopup}:`, e);
            }

            // Define o texto inicial
            this.textoPopup.setText(this.textosPopup[this.portaAtual.etapaAtual]);
            this.textoPopup.setPosition(porta.textoOffsetX, porta.textoOffsetY);

            // Ajusta a posição das setas para o popup do Forrest
            if (idPorta === 'forrest') {
                this.setaProximo.setPosition(65, 60);
                this.setaAnterior.setPosition(28, 60);
            } else {
                this.setaProximo.setPosition(70, 50);
                this.setaAnterior.setPosition(28, 50);
            }

            this.containerPopup.setVisible(true); // Mostra o popup

            // Posiciona o popup com base na câmera e no zoom
            const screenWidth = this.game.config.width;
            const screenHeight = this.game.config.height;
            const zoom = this.cameras.main.zoom;
            const cameraScrollX = this.cameras.main.scrollX;
            const cameraScrollY = this.cameras.main.scrollY;

            let posicaoX = cameraScrollX + screenWidth / (2 * zoom) + porta.offsetX;
            let posicaoY = cameraScrollY + screenHeight / zoom + porta.offsetY;
            this.containerPopup.setPosition(posicaoX, posicaoY);

            // Mostra a seta indicadora com base no progresso
            if (!this.portasVisitadas.frank) {
                this.setaIndicadora.setPosition(440, 440); // Aponta para a casa
                this.setaIndicadora.setVisible(true);
            } else if (this.portasVisitadas.frank && !this.portasVisitadas.forrest) {
                this.setaIndicadora.setPosition(280, 1020); // Aponta para a fábrica
                this.setaIndicadora.setVisible(true);
            } else if (this.portasVisitadas.frank && this.portasVisitadas.forrest && !this.portasVisitadas.olivia) {
                this.setaIndicadora.setPosition(1570, 250); // Aponta para o escritório
                this.setaIndicadora.setVisible(true);
            } else {
                this.setaIndicadora.setVisible(false); // Esconde a seta se todas as fases foram concluídas
            }
        }
    }

    // Avança para o próximo texto do popup
    avancarTexto() {
        if (this.portaAtual.etapaAtual < this.textosPopup.length - 1) {
            this.portaAtual.etapaAtual++; // Incrementa o índice do texto
            this.textoPopup.setText(this.textosPopup[this.portaAtual.etapaAtual]); // Atualiza o texto
        } else if (this.portaAtual.etapaAtual === this.textosPopup.length - 1) {
            this.ocultarPopup(); // Esconde o popup
            this.portaAtual.concluido = true; // Marca a porta como concluída
        }
    }

    // Volta para o texto anterior do popup
    voltarTexto() {
        if (this.portaAtual.etapaAtual > 0) {
            this.portaAtual.etapaAtual--; // Decrementa o índice
            this.textoPopup.setText(this.textosPopup[this.portaAtual.etapaAtual]); // Atualiza o texto
            this.containerPopup.setVisible(true); // Garante que o popup esteja visível
        }
    }

    // Esconde o popup e a seta indicadora
    ocultarPopup() {
        this.containerPopup.setVisible(false); // Torna o popup invisível
        this.setaIndicadora.setVisible(false); // Esconde a seta indicadora
    }

    // Configura as animações do jogador
    criarAnimacoes() {
        const animacoes = ["frente", "costas", "direita", "esquerda"]; // Direções das animações
        animacoes.forEach((animacao) => {
            this.anims.create({
                key: animacao, // Nome da animação
                frames: this.anims.generateFrameNames("jogadorAtlas", {
                    prefix: animacao,
                    start: 0,
                    end: 3,
                    zeroPad: 4,
                }), // Define os frames do spritesheet
                frameRate: 10, // Velocidade da animação
                repeat: -1 // Repete indefinidamente
            });
        });
    }

    // Atualiza o jogo a cada frame
    update() {
        this.jogadorSprite.setVelocity(0); // Reseta a velocidade do jogador

        // Controla o movimento com as setas
        const cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            this.jogadorSprite.setVelocityX(-160); // Move para a esquerda
            this.jogadorSprite.anims.play("esquerda", true); // Toca a animação
        } else if (cursors.right.isDown) {
            this.jogadorSprite.setVelocityX(160); // Move para a direita
            this.jogadorSprite.anims.play("direita", true);
        } else if (this.noChao && cursors.up.isDown) {
            this.jogadorSprite.setVelocityY(-160); // Move para cima
            this.jogadorSprite.anims.play("costas", true);
        } else if (this.noChao && cursors.down.isDown) {
            this.jogadorSprite.setVelocityY(160); // Move para baixo
            this.jogadorSprite.anims.play("frente", true);
        } else {
            this.jogadorSprite.setVelocityX(0); // Para o movimento horizontal
            this.jogadorSprite.setVelocityY(0); // Para o movimento vertical
            this.jogadorSprite.anims.stop(); // Para a animação
        }

        // Gerencia o pulo
        if (this.teclaEspaco.isDown && this.noChao) {
            this.noChao = false; // Sai do chão
            this.tempoPulo = 0; // Reseta o tempo de pulo
            this.jogadorSprite.setVelocityY(this.vy0); // Aplica velocidade inicial
        }

        if (!this.noChao) {
            this.tempoPulo += this.game.loop.delta / 1000; // Incrementa o tempo
            const vy = this.vy0 + this.ay * this.tempoPulo; // Calcula velocidade com gravidade
            this.jogadorSprite.setVelocityY(vy); // Aplica a velocidade
        }

        if (this.tempoPulo >= 1) {
            this.noChao = true; // Volta ao chão
            this.tempoPulo = 0; // Reseta o tempo
            this.jogadorSprite.setVelocityY(0); // Para o movimento vertical
        }

        // Atualiza a posição do popup, se visível
        if (this.containerPopup.visible && this.portaAtual) {
            const screenWidth = this.game.config.width;
            const screenHeight = this.game.config.height;
            const cameraScrollX = this.cameras.main.scrollX;
            const cameraScrollY = this.cameras.main.scrollY;
            const zoom = this.cameras.main.zoom;

            const offsetX = this.portaAtual.offsetX;
            const offsetY = this.portaAtual.offsetY;

            this.containerPopup.setPosition(
                cameraScrollX + screenWidth / (2 * zoom) + offsetX,
                cameraScrollY + screenHeight / zoom + offsetY
            ); // Ajusta a posição com base na câmera
        }

        // Atualiza o texto de instrução com base no progresso
        this.instrucaoTexto.setPosition(this.jogadorSprite.x - 400, this.jogadorSprite.y - 200); // Segue o jogador
        if (!this.portasVisitadas.frank) {
            this.instrucaoTexto.setText("Dirija-se até a casa para iniciar o nível 1"); // Instrução inicial
        } else if (this.portasVisitadas.frank && !this.portasVisitadas.forrest) {
            this.instrucaoTexto.setText("Agora vá para a fábrica de 1929 (Forrest)"); // Próximo nível
        } else if (this.portasVisitadas.frank && this.portasVisitadas.forrest && !this.portasVisitadas.olivia) {
            this.instrucaoTexto.setText("Agora vá para a empresa Mars em 2025 (Olivia)"); // Último nível
        } else if (this.portasVisitadas.frank && this.portasVisitadas.forrest && this.portasVisitadas.olivia) {
            this.instrucaoTexto.setText("Parabéns, você completou todas as fases!"); // Mensagem de conclusão
        }

        this.verificarProximidadePortas(); // Verifica portas próximas a cada frame
    }
}