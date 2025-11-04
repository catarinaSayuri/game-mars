// Cena do escritório da Mars, onde o jogador monta equipes para projetos
export default class SceneEscritorio extends Phaser.Scene {
    constructor() {
        super({ key: "SceneEscritorio", physics: { default: "arcade", arcade: { debug: false } } }); // Define a cena com física Arcade
    }

    // Configurações fixas da cena
    CONFIG = {
        CAMERA_ZOOM: 2, // Zoom da câmera para destacar o jogador
        JOGADOR: {
            SCALE: 1.6, // Escala do sprite do jogador
            VELOCIDADE: 280, // Velocidade de movimento
            POSICAO_INICIAL: { X: 600, Y: 520 } // Posição inicial do jogador
        },
        PULO: {
            VELOCIDADE_INICIAL: -300, // Velocidade inicial do pulo (negativa para subir)
            GRAVIDADE: 600, // Gravidade aplicada ao pulo
            TEMPO_MAXIMO: 1 // Tempo máximo do pulo em segundos
        },
        PORTA: {
            X: 600, // Posição X da porta de saída
            Y: 580, // Posição Y da porta
            LARGURA: 130, // Largura da porta
            ALTURA: 20, // Altura da porta
            CENA_DESTINO: "SceneFinal", // Cena para onde a porta leva
            POSICAO_SAIDA: { x: 1630, y: 300 } // Posição ao voltar para o mapa principal
        },
    };

    // Carrega todos os assets antes de iniciar a cena
    preload() {
        this.carregarAssetsMapa(); // Carrega o mapa e tilesets
        this.carregarAssetsJogador(); // Carrega o spritesheet do jogador
        this.carregarAssetsInterface(); // Carrega imagens da interface
        this.configurarEventosCarregamento(); // Configura logs de carregamento
        this.sounds(); // Carrega a música
    }

    // Carrega o áudio da cena
    sounds() {
        this.load.audio('musicaFaseEscritorio', "src/assets/sounds/tela4.mp3"); // Música do escritório
    }

    // Carrega os assets do mapa Tiled
    carregarAssetsMapa() {
        this.load.tilemapTiledJSON("escritorio", "src/assets/imagens/imagesEscritorio/mapas/escritorio.json"); // Mapa do escritório
        this.load.image("chao", "src/assets/imagens/imagesEscritorio/tiles/chaoo.png"); // Tileset do chão
        this.load.image("paredes", "src/assets/imagens/imagesEscritorio/tiles/objetoss.png"); // Tileset das paredes
        this.load.image("objetos", "src/assets/imagens/imagesEscritorio/tiles/obj.png"); // Tileset dos objetos
        this.load.image("dogs", "src/assets/imagens/imagesEscritorio/tiles/dogs.png"); // Tileset dos cachorros
    }

    // Carrega o spritesheet do jogador
    carregarAssetsJogador() {
        this.load.atlas("jogadorAtlas", "src/assets/sprites/spritesheet.png", "src/assets/sprites/sprites.json"); // Spritesheet com animações
    }

    // Carrega imagens da interface e popups
    carregarAssetsInterface() {
        this.load.image("marsGlobal", "src/assets/imagens/imagensNivelTres/marsGlobal.png"); // Popup do Global Services
        this.load.image("marsPet", "src/assets/imagens/imagensNivelTres/marsPet.png"); // Popup do Pet
        this.load.image("marsWangley", "src/assets/imagens/imagensNivelTres/marsWangley.png"); // Popup do Snack
        this.load.image("popUpSecretaria", "src/assets/imagens/imagensNivelTres/popUpSecretaria.png"); // Popup da secretária
        this.load.image("setaPopUpProximo", "src/assets/imagens/imagesBotoes/proximoPopUp.png"); // Botão de próximo
        this.load.image("setaPopUpAnterior", "src/assets/imagens/imagesBotoes/voltarPopUp.png"); // Botão de voltar
    }

    // Configura logs para monitoramento do carregamento
    configurarEventosCarregamento() {
        this.load.on('complete', () => console.log('Assets carregados')); // Loga quando tudo carrega
        this.load.on('loaderror', (file) => console.error('Erro ao carregar:', file.key)); // Loga erros de carregamento
    }

    // Inicializa a cena com mapa, jogador e interface
    create() {
        this.sound.stopAll(); // Para músicas de cenas anteriores
        console.log("Todas as músicas anteriores paradas ao entrar na SceneEscritorio");

        this.criarMapa(); // Cria o mapa a partir do Tiled
        this.criarJogador(); // Cria o sprite do jogador
        this.criarAnimacoes(); // Configura as animações do jogador
        this.configurarControles(); // Define os controles
        this.configurarCamadaColisao(); // Ativa colisões do mapa
        this.configurarPorta(); // Cria a porta de saída
        this.inicializarDadosJogo(); // Inicializa variáveis de progresso
        this.configurarInterface(); // Configura o popup
        this.configurarObstaculos(); // Define obstáculos interativos

        // Toca a música da cena
        if (this.cache.audio.has("musicaFaseEscritorio")) {
            console.log("Áudio 'musicaFaseEscritorio' encontrado no cache");
            this.musica = this.sound.add("musicaFaseEscritorio", {
                loop: true, // Repete a música
                volume: 0.5 // Volume reduzido
            });
            this.musica.play(); // Inicia a música
        } else {
            console.error("Áudio 'musicaFaseEscritorio' não encontrado no cache. Verifique o caminho.");
        }

        // Escuta eventos de conclusão dos puzzles
        this.scene.get("ScenePuzzleEscritorioGlobal").events.on("equipeConcluida", (sucesso) => {
            if (sucesso) {
                this.marsGlobalPopupConcluido = true; // Marca Global Services como concluído
                console.log("Global Services concluído com sucesso!");
            }
            this.scene.resume("SceneEscritorio"); // Retoma esta cena
            this.scene.stop("ScenePuzzleEscritorioGlobal"); // Para o puzzle
        });

        this.scene.get("ScenePuzzleEscritorioWangley").events.on("equipeConcluida", (sucesso) => {
            if (sucesso) {
                this.marsWangleyPopupConcluido = true; // Marca Snack como concluído
                console.log("Snack concluído com sucesso!");
            }
            this.scene.resume("SceneEscritorio"); // Retoma esta cena
            this.scene.stop("ScenePuzzleEscritorioWangley"); // Para o puzzle
        });

        this.scene.get("ScenePuzzleEscritorioPet").events.on("equipeConcluida", (sucesso) => {
            if (sucesso) {
                this.marsPetPopupConcluido = true; // Marca Pet como concluído
                console.log("Pet concluído com sucesso!");
            }
            this.scene.resume("SceneEscritorio"); // Retoma esta cena
            this.scene.stop("ScenePuzzleEscritorioPet"); // Para o puzzle
        });
    }

    // Para a música ao sair da cena
    shutdown() {
        if (this.musica && this.musica.isPlaying) {
            this.musica.stop(); // Para a música
            console.log("Música 'musicaFaseEscritorio' parada ao sair da SceneEscritorio");
        }
    }

    // Inicializa variáveis de controle do jogo
    inicializarDadosJogo() {
        this.popupFechadoManualmente = false; // Controla se o popup foi fechado pelo jogador
        this.marsGlobalPopupConcluido = false; // Estado do Global Services
        this.marsWangleyPopupConcluido = false; // Estado do Snack
        this.marsPetPopupConcluido = false; // Estado do Pet
    }

    // Configura o popup para interação
    configurarInterface() {
        this.containerPopup = this.add.container(0, 0).setDepth(10).setVisible(false); // Contêiner do popup
        this.fundoPopup = this.add.image(0, 0, 'popUpSecretaria')
            .setOrigin(0.5) // Centraliza a imagem
            .setScale(0.7); // Reduz o tamanho

        this.textoPopup = this.add.text(38, -10, "", {
            fontSize: "20px",
            fill: "#000000",
            fontFamily: "Jersey",
            wordWrap: { width: 280, useAdvancedWrap: true },
            align: "center"
        }).setOrigin(0.5); // Texto centralizado no popup

        this.setaProximo = this.add.image(150, 20, "setaPopUpProximo")
            .setOrigin(0.5)
            .setScale(0.6)
            .setInteractive()
            .on("pointerdown", () => this.avancarTexto()) // Avança o texto
            .on("pointerover", () => this.setaProximo.setScale(0.7)) // Aumenta ao passar o mouse
            .on("pointerout", () => this.setaProximo.setScale(0.6)) // Volta ao normal
            .setVisible(false); // Invisível inicialmente

        this.setaAnterior = this.add.image(110, 20, "setaPopUpAnterior")
            .setOrigin(0.5)
            .setScale(0.6)
            .setInteractive()
            .on("pointerdown", () => this.voltarTexto()) // Volta o texto
            .on("pointerover", () => this.setaAnterior.setScale(0.7)) // Aumenta ao passar o mouse
            .on("pointerout", () => this.setaAnterior.setScale(0.6)) // Volta ao normal
            .setVisible(false); // Invisível inicialmente

        this.containerPopup.add([this.fundoPopup, this.textoPopup, this.setaProximo, this.setaAnterior]); // Agrupa elementos
    }

    // Define obstáculos interativos no mapa
    configurarObstaculos() {
        this.grupoColisores = this.physics.add.staticGroup(); // Grupo de colisores
        this.obstaculos = [
            {
                x: 380, y: 400, largura: 50, altura: 50, id: "secretaria",
                imagem: "popUpSecretaria", offsetX: 520, offsetY: 535,
                textos: [
                    "Boas-vindas ao escritório da Mars, aqui você montará equipes para gerenciar projetos importantes.",
                    "Explore o escritório e conheça os relatórios de personalidade dos integrantes da empresa.",
                    "Sua missão é montar equipes ideais, combinando habilidades dos funcionários com os projetos certos.",
                    "Cada equipe precisa ter 4 membros, você terá 6 opções por área, então escolha com sabedoria!",
                    "Começaremos pelo setor de Global Services, vamos lá!",
                ]
            },
            { x: 850, y: 400, largura: 50, altura: 50, id: "global", imagem: "marsGlobal", offsetX: 800, offsetY: 535 },
            { x: 320, y: 160, largura: 50, altura: 50, id: "pet", imagem: "marsPet", offsetX: 480, offsetY: 460 },
            { x: 850, y: 160, largura: 50, altura: 50, id: "wangley", imagem: "marsWangley", offsetX: 750, offsetY: 460 },
        ];

        // Cria colisores para cada obstáculo
        this.obstaculos.forEach(obstaculo => {
            const colisor = this.add.rectangle(obstaculo.x, obstaculo.y, obstaculo.largura, obstaculo.altura, 0x000000, 0)
                .setOrigin(0.5, 0.5); // Centraliza o colisor
            this.physics.add.existing(colisor, true); // Adiciona física estática
            this.grupoColisores.add(colisor); // Adiciona ao grupo
        });
    }

    // Atualiza o estado do jogo a cada frame
    update() {
        this.atualizarMovimento(); // Controla o movimento do jogador
        this.atualizarPulo(); // Gerencia o pulo
        this.verificarProximidadeObstaculos(); // Checa proximidade com obstáculos
    }

    // Cria o mapa a partir do arquivo Tiled
    criarMapa() {
        this.mapa = this.make.tilemap({ key: "escritorio" }); // Carrega o mapa
        const tilesets = {
            chao: this.mapa.addTilesetImage("chao", "chao"), // Tileset do chão
            paredes: this.mapa.addTilesetImage("paredes ", "paredes"), // Tileset das paredes
            objetos: this.mapa.addTilesetImage("objetos", "objetos"), // Tileset dos objetos
            dogs: this.mapa.addTilesetImage("dogs", "dogs") // Tileset dos cachorros
        };
        this.camadaChao = this.mapa.createLayer("chao", [tilesets.chao, tilesets.paredes], 0, 0); // Camada do chão
        this.camadaParedes = this.mapa.createLayer("parede", [tilesets.paredes, tilesets.objetos], 0, 0); // Camada das paredes
        this.camadaObjetos = this.mapa.createLayer("obj", [tilesets.paredes, tilesets.objetos, tilesets.dogs], 0, 0); // Camada dos objetos
    }

    // Configura colisões com as camadas do mapa
    configurarCamadaColisao() {
        [this.camadaParedes, this.camadaObjetos].forEach(camada => {
            if (camada) {
                camada.setCollisionByProperty({ collider: true }); // Ativa colisão nos tiles com propriedade "collider"
                this.physics.add.collider(this.jogadorSprite, camada); // Adiciona colisão com o jogador
            }
        });
    }

    // Cria o sprite do jogador
    criarJogador() {
        this.jogadorSprite = this.physics.add.sprite(
            this.CONFIG.JOGADOR.POSICAO_INICIAL.X,
            this.CONFIG.JOGADOR.POSICAO_INICIAL.Y,
            "jogadorAtlas",
            "costas0000" // Frame inicial
        )
            .setScale(this.CONFIG.JOGADOR.SCALE) // Aplica escala
            .setOrigin(0.5, 0.5) // Centraliza o sprite
            .setDepth(1) // Camada acima do chão
            .setCollideWorldBounds(true); // Impede saída do mapa

        // Configura a câmera para seguir o jogador
        this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels); // Limites do mapa
        this.cameras.main.startFollow(this.jogadorSprite, true, 0.05, 0.05); // Segue com suavização
        this.cameras.main.setZoom(this.CONFIG.CAMERA_ZOOM); // Aplica zoom
    }

    // Define as teclas de controle
    configurarControles() {
        this.teclas = {
            W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W), // Tecla W
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A), // Tecla A
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S), // Tecla S
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D), // Tecla D
            SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), // Tecla de pulo
            CURSOR: this.input.keyboard.createCursorKeys() // Setas do teclado
        };
        this.vy0 = this.CONFIG.PULO.VELOCIDADE_INICIAL; // Velocidade inicial do pulo
        this.ay = this.CONFIG.PULO.GRAVIDADE; // Gravidade do pulo
        this.noChao = true; // Estado inicial do jogador (no chão)
        this.tempoPulo = 0; // Contador do tempo de pulo
    }

    // Cria as animações do jogador
    criarAnimacoes() {
        const ANIMACOES = ["frente", "costas", "direita", "esquerda"]; // Direções das animações
        ANIMACOES.forEach(animacao => {
            this.anims.create({
                key: animacao,
                frames: this.anims.generateFrameNames("jogadorAtlas", {
                    prefix: `${animacao}`,
                    start: 0,
                    end: 3,
                    zeroPad: 4
                }), // Frames do spritesheet
                frameRate: 10, // Velocidade da animação
                repeat: -1 // Repete indefinidamente
            });
        });
    }

    // Controla o movimento do jogador
    atualizarMovimento() {
        this.jogadorSprite.setVelocity(0); // Reseta a velocidade
        const { CURSOR: cursor, W, A, S, D } = this.teclas;
        const velocidade = this.CONFIG.JOGADOR.VELOCIDADE;

        if (cursor.left.isDown || A.isDown) {
            this.jogadorSprite.setVelocityX(-velocidade); // Move para a esquerda
            this.reproduzirAnimacao("esquerda"); // Toca animação
        } else if (cursor.right.isDown || D.isDown) {
            this.jogadorSprite.setVelocityX(velocidade); // Move para a direita
            this.reproduzirAnimacao("direita");
        } else if (cursor.up.isDown || W.isDown) {
            this.jogadorSprite.setVelocityY(-velocidade); // Move para cima
            this.reproduzirAnimacao("costas");
        } else if (cursor.down.isDown || S.isDown) {
            this.jogadorSprite.setVelocityY(velocidade); // Move para baixo
            this.reproduzirAnimacao("frente");
        } else {
            this.jogadorSprite.anims.stop(); // Para a animação
        }
    }

    // Gerencia a mecânica de pulo
    atualizarPulo() {
        if (this.teclas.SPACE.isDown && this.noChao) {
            this.noChao = false; // Sai do chão
            this.tempoPulo = 0; // Reseta o tempo
            this.jogadorSprite.setVelocityY(this.vy0); // Aplica velocidade inicial
        }

        if (!this.noChao) {
            this.tempoPulo += this.game.loop.delta / 1000; // Incrementa o tempo
            const vy = this.vy0 + this.ay * this.tempoPulo; // Calcula velocidade com gravidade
            this.jogadorSprite.setVelocityY(vy); // Aplica velocidade

            if (this.tempoPulo >= this.CONFIG.PULO.TEMPO_MAXIMO) {
                this.noChao = true; // Volta ao chão
                this.tempoPulo = 0; // Reseta o tempo
                this.jogadorSprite.setVelocityY(0); // Para o movimento vertical
            }
        }
    }

    // Reproduz a animação correta do jogador
    reproduzirAnimacao(chaveAnimacao) {
        if (this.jogadorSprite.anims.currentAnim?.key !== chaveAnimacao) {
            this.jogadorSprite.anims.play(chaveAnimacao, true); // Toca a animação se não estiver ativa
        }
    }

    // Cria a porta de saída para a próxima cena
    configurarPorta() {
        this.porta = this.add.rectangle(
            this.CONFIG.PORTA.X,
            this.CONFIG.PORTA.Y,
            this.CONFIG.PORTA.LARGURA,
            this.CONFIG.PORTA.ALTURA,
            0xff0000,
            0 // Invisível
        );
        this.physics.add.existing(this.porta, true); // Adiciona física estática
        this.physics.add.overlap(
            this.jogadorSprite,
            this.porta,
            () => {
                this.registry.set("posicaoSaida", this.CONFIG.PORTA.POSICAO_SAIDA); // Salva posição de saída
                this.scene.start(this.CONFIG.PORTA.CENA_DESTINO); // Muda para a cena final
            },
            null,
            this
        );
    }

    // Verifica proximidade com obstáculos para mostrar popups
    verificarProximidadeObstaculos() {
        const distanciaMinima = 100; // Distância mínima para interação
        let obstaculoMaisProximo = null;
        let menorDistancia = Infinity;

        this.obstaculos.forEach(obstaculo => {
            const distancia = Phaser.Math.Distance.Between(
                this.jogadorSprite.x, this.jogadorSprite.y,
                obstaculo.x, obstaculo.y
            );
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                obstaculoMaisProximo = obstaculo;
            }
        });

        if (menorDistancia < distanciaMinima && !this.popupFechadoManualmente && !this.containerPopup.visible) {
            this.exibirPopup(obstaculoMaisProximo.id, obstaculoMaisProximo.imagem,
                obstaculoMaisProximo.offsetX, obstaculoMaisProximo.offsetY,
                obstaculoMaisProximo.textos); // Mostra o popup
        } else if (menorDistancia >= distanciaMinima) {
            this.ocultarPopup(); // Esconde o popup
            this.popupFechadoManualmente = false; // Reseta o estado
        }
    }

    // Exibe o popup com base no obstáculo
    exibirPopup(idObstaculo, imagem, offsetX, offsetY, textos) {
        if (!this.containerPopup.visible || this.currentPopupId !== idObstaculo) {
            console.log(`Exibindo pop-up para: ${idObstaculo}`);
            this.currentPopupId = idObstaculo; // Armazena o ID atual
            this.currentOffsetX = offsetX; // Define posição X do popup
            this.currentOffsetY = offsetY; // Define posição Y do popup
            this.textosPopup = textos || []; // Define os textos
            this.etapaAtual = 0; // Inicia no primeiro texto

            // Configura o popup com base no obstáculo e progresso
            if (idObstaculo === "secretaria") {
                this.fundoPopup.setTexture("popUpSecretaria"); // Textura da secretária
                this.textoPopup.setPosition(38, -30); // Ajusta posição do texto
                this.textoPopup.setText(this.textosPopup.length > 0 ? this.textosPopup[this.etapaAtual] : ""); // Define texto inicial
            } else if (idObstaculo === "global") {
                this.fundoPopup.setTexture("marsGlobal"); // Textura do Global Services
                this.textoPopup.setPosition(38, -10); // Ajusta posição
                this.textoPopup.setText(""); // Sem texto
            } else if (idObstaculo === "wangley") {
                if (!this.marsGlobalPopupConcluido) {
                    this.fundoPopup.setTexture("popUpSecretaria"); // Usa textura da secretária
                    this.textoPopup.setText("Volte para o Global Services primeiro!"); // Aviso de ordem
                } else {
                    this.fundoPopup.setTexture("marsWangley"); // Textura do Snack
                    this.textoPopup.setText(""); // Sem texto
                }
                this.textoPopup.setPosition(38, -10);
            } else if (idObstaculo === "pet") {
                if (!this.marsGlobalPopupConcluido) {
                    this.fundoPopup.setTexture("popUpSecretaria");
                    this.textoPopup.setText("Volte para o Global Services primeiro!");
                } else if (!this.marsWangleyPopupConcluido) {
                    this.fundoPopup.setTexture("popUpSecretaria");
                    this.textoPopup.setText("Volte para o Snack primeiro!");
                } else {
                    this.fundoPopup.setTexture("marsPet"); // Textura do Pet
                    this.textoPopup.setText(""); // Sem texto
                }
                this.textoPopup.setPosition(38, -10);
            }

            // Controla visibilidade das setas
            this.setaProximo.setVisible(idObstaculo === "secretaria" && this.textosPopup.length > 1);
            this.setaAnterior.setVisible(idObstaculo === "secretaria" && this.textosPopup.length > 1);

            this.fundoPopup.off('pointerdown'); // Remove eventos anteriores
            this.fundoPopup.setInteractive(); // Torna o popup clicável

            // Define ações ao clicar no popup
            if (idObstaculo === "secretaria") {
                this.fundoPopup.on('pointerdown', () => {
                    if (this.etapaAtual < this.textosPopup.length - 1) {
                        this.avancarTexto(); // Avança o texto
                    } else {
                        this.ocultarPopup(); // Fecha o popup
                        this.popupFechadoManualmente = true; // Marca como fechado
                        console.log("Popup da secretária fechado manualmente");
                    }
                });
            } else if (idObstaculo === "global") {
                this.fundoPopup.on('pointerdown', () => {
                    console.log("Clique detectado no popup do marsGlobal");
                    this.ocultarPopup(); // Fecha o popup
                    this.scene.pause("SceneEscritorio"); // Pausa esta cena
                    this.scene.launch("ScenePuzzleEscritorioGlobal"); // Inicia o puzzle
                    console.log("Tentativa de iniciar ScenePuzzleEscritorioGlobal como modal");
                });
            } else if (idObstaculo === "wangley") {
                this.fundoPopup.on('pointerdown', () => {
                    if (!this.marsGlobalPopupConcluido) {
                        this.ocultarPopup(); // Fecha se Global não concluído
                    } else {
                        console.log("Clique detectado no popup do marsWangley");
                        this.ocultarPopup();
                        this.scene.pause("SceneEscritorio");
                        this.scene.launch("ScenePuzzleEscritorioWangley"); // Inicia o puzzle
                        console.log("Tentativa de iniciar ScenePuzzleEscritorioWangley como modal");
                    }
                });
            } else if (idObstaculo === "pet") {
                this.fundoPopup.on('pointerdown', () => {
                    if (!this.marsGlobalPopupConcluido || !this.marsWangleyPopupConcluido) {
                        this.ocultarPopup(); // Fecha se pré-requisitos não cumpridos
                    } else {
                        console.log("Clique detectado no popup do marsPet");
                        this.ocultarPopup();
                        this.scene.pause("SceneEscritorio");
                        this.scene.launch("ScenePuzzleEscritorioPet"); // Inicia o puzzle
                        console.log("Tentativa de iniciar ScenePuzzleEscritorioPet como modal");
                    }
                });
            }

            this.containerPopup.setPosition(offsetX, offsetY); // Define posição do popup
            this.containerPopup.setVisible(true); // Mostra o popup
            console.log("Pop-up visível:", this.containerPopup.visible);
        }
    }

    // Avança para o próximo texto do popup da secretária
    avancarTexto() {
        if (this.textosPopup && this.textosPopup.length > 1 && this.currentPopupId === "secretaria") {
            if (this.etapaAtual < this.textosPopup.length - 1) {
                this.etapaAtual++; // Incrementa o índice
                this.textoPopup.setText(this.textosPopup[this.etapaAtual]); // Atualiza o texto
                console.log(`Texto avançado para: ${this.textosPopup[this.etapaAtual]}`);
            } else {
                this.ocultarPopup(); // Fecha o popup
                this.popupFechadoManualmente = true; // Marca como fechado
                console.log("Pop-up fechado após último texto");
            }
        }
    }

    // Volta para o texto anterior do popup da secretária
    voltarTexto() {
        if (this.textosPopup && this.textosPopup.length > 1 && this.currentPopupId === "secretaria" && this.etapaAtual > 0) {
            this.etapaAtual--; // Decrementa o índice
            this.textoPopup.setText(this.textosPopup[this.etapaAtual]); // Atualiza o texto
            console.log(`Texto retrocedido para: ${this.textosPopup[this.etapaAtual]}`);
        }
    }

    // Esconde o popup
    ocultarPopup() {
        this.containerPopup.setVisible(false); // Torna o popup invisível
        console.log("Popup ocultado");
    }
}