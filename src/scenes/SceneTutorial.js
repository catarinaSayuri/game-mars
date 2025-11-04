// Cena do tutorial do jogo, onde o jogador aprende os controles e a mecânica básica
export default class SceneTutorial extends Phaser.Scene {
    constructor() {
        super("SceneTutorial");
        // Configurações da cena, definidas como propriedade da instância
        this.CONFIG = {
            CAMERA_ZOOM: 1.2, // Zoom da câmera para destacar o jogador
            JOGADOR_SCALE: 3, // Escala do sprite do jogador
            VELOCIDADE_MOVIMENTO: 280, // Velocidade de movimento do jogador
            PULO: {
                VELOCIDADE_INICIAL: -300, // Velocidade inicial do pulo (negativa para subir)
                GRAVIDADE: 600, // Gravidade aplicada ao pulo
                TEMPO_MAXIMO: 1 // Tempo máximo do pulo em segundos
            },
            PORTA: {
                X: 1880, // Posição X da porta
                Y: 620, // Posição Y da porta
                LARGURA: 30, // Largura da porta
                ALTURA: 200, // Altura da porta
                CENA_DESTINO: "SceneJogo" // Cena para onde a porta leva
            },
            POPUP: {
                X: 1160, // Posição X base do popup
                Y_BASE: 1400, // Posição Y inicial do popup
                FOLLOW_FACTOR: 0.5, // Fator de acompanhamento do jogador
                ESCALA: 1.2 // Escala do popup
            }
        };
    }

    // Carrega os assets necessários para a cena
    preload() {
        this.load.image("imagemFundoTutorial", "src/assets/imagens/imagesMapa/mapaTutorial.png"); // Fundo do tutorial
        this.load.image("setaPopUpProximo", "src/assets/imagens/imagesBotoes/proximoPopUp.png"); // Botão de próximo
        this.load.image("setaPopUpAnterior", "src/assets/imagens/imagesBotoes/voltarPopUp.png"); // Botão de voltar
        this.load.atlas(
            "jogadorAtlas",
            "src/assets/sprites/spritesheet.png",
            "src/assets/sprites/sprites.json"
        ); // Spritesheet do jogador
        this.load.image("frankPopup", "src/assets/imagens/imagesPopUps/popupfrank.png"); // Imagem do popup
        this.load.audio("musicaInicial", "src/assets/sounds/fase1.mp3"); // Música de fundo
    }

    // Configura a cena, criando todos os elementos
    create() {
        this.adicionarFundo(); // Adiciona o fundo do tutorial
        this.criarJogador(); // Cria o sprite do jogador
        this.criarAnimacoes(); // Configura as animações do jogador
        this.configurarPopup(); // Configura o popup com instruções
        this.configurarCaixaDeFala(); // Configura a caixa de diálogo
        this.configurarPorta(); // Cria a porta para a próxima cena
        this.configurarObstaculos(); // Adiciona obstáculos do cenário
        this.configurarFisica(); // Configura as colisões físicas
        this.configurarControles(); // Define os controles do jogador

        // Toca a música de fundo se ela estiver carregada
        if (this.cache.audio.exists("musicaInicial")) {
            console.log("Áudio 'musicaInicial' encontrado no cache");
            this.musica = this.sound.add("musicaInicial", {
                loop: true, // Repete a música
                volume: 0.5 // Volume reduzido
            });
            this.musica.play();
        } else {
            console.error("Áudio 'musicaInicial' não encontrado no cache. Verifique o caminho ou o carregamento.");
        }

        this.containerPopup.setVisible(true); // Mostra o popup inicial
    }

    // Para a música quando a cena é encerrada
    shutdown() {
        if (this.musica && this.musica.isPlaying) {
            this.musica.stop();
        }
    }

    // Adiciona o fundo, ajustando ao tamanho da tela
    adicionarFundo() {
        this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "imagemFundoTutorial"
        )
            .setOrigin(0.5, 0.5) // Centraliza a imagem
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height); // Ajusta ao tamanho da câmera
    }

    // Cria o sprite do jogador com física
    criarJogador() {
        this.jogadorSprite = this.physics.add.sprite(100, 550, "jogadorAtlas")
            .setScale(this.CONFIG.JOGADOR_SCALE) // Aplica a escala definida
            .setCollideWorldBounds(true); // Impede o jogador de sair do mapa

        // Configura a câmera para seguir o jogador
        this.cameras.main.setBounds(0, 0, this.game.config.width, this.game.config.height);
        this.cameras.main.startFollow(this.jogadorSprite, true, 0.05, 0.05);
        this.cameras.main.setZoom(this.CONFIG.CAMERA_ZOOM);
    }

    // Cria a porta que leva à próxima cena
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

        // Detecta colisão com a porta e muda de cena
        this.physics.add.overlap(
            this.jogadorSprite,
            this.porta,
            () => this.scene.start(this.CONFIG.PORTA.CENA_DESTINO),
            null,
            this
        );
    }

    // Cria obstáculos no cenário
    configurarObstaculos() {
        const OBSTACULOS = [
            { x: 980, y: 820, largura: 435, altura: 240 },
            { x: 980, y: 340, largura: 450, altura: 290 },
            { x: 260, y: 350, largura: 380, altura: 230 },
            { x: 380, y: 180, largura: 900, altura: 230 },
            { x: 650, y: 880, largura: 140, altura: 180 },
            { x: 240, y: 780, largura: 200, altura: 200 },
            { x: 1500, y: 200, largura: 750, altura: 230 },
            { x: 1600, y: 860, largura: 220, altura: 160 },
            { x: 1850, y: 740, largura: 80, altura: 100 },
            { x: 590, y: 700, largura: 20, altura: 120 },
            { x: 1420, y: 460, largura: 20, altura: 120 }
        ];

        this.grupoColisores = this.physics.add.staticGroup(); // Grupo de colisores estáticos
        OBSTACULOS.forEach(({ x, y, largura, altura }) => {
            const rect = this.add.rectangle(x, y, largura, altura, 0xff0000, 0); // Invisível
            this.grupoColisores.add(this.physics.add.existing(rect, true));
        });
    }

    // Configura colisão entre jogador e obstáculos
    configurarFisica() {
        this.physics.add.collider(this.jogadorSprite, this.grupoColisores);
    }

    // Define as teclas de controle
    configurarControles() {
        this.cursors = this.input.keyboard.createCursorKeys(); // Setas do teclado
        this.teclaEspaco = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Barra de espaço
        this.vy0 = this.CONFIG.PULO.VELOCIDADE_INICIAL; // Velocidade inicial do pulo
        this.ay = this.CONFIG.PULO.GRAVIDADE; // Gravidade do pulo
        this.noChao = true; // Estado inicial do jogador (no chão)
        this.tempoPulo = 0; // Contador do tempo de pulo
    }

    // Cria a caixa de diálogo para textos futuros
    configurarCaixaDeFala() {
        this.caixaDeFala = this.add.rectangle(300, 380, 500, 100, 0xffffff, 1)
            .setStrokeStyle(2, 0x000000) // Borda preta
            .setVisible(false) // Invisível inicialmente
            .setDepth(1); // Camada acima do fundo

        this.textoDialogo = this.add.text(300, 380, "", {
            fontSize: "18px",
            fill: "#000000",
            wordWrap: { width: 450, useAdvancedWrap: true },
            align: "center"
        })
            .setOrigin(0.5) // Centraliza o texto
            .setVisible(false) // Invisível inicialmente
            .setDepth(2); // Camada acima da caixa
    }

    // Configura o popup com instruções iniciais
    configurarPopup() {
        this.containerPopup = this.add.container(760, 600); // Contêiner para o popup

        // Fundo do popup
        this.fundoPopup = this.add.image(0, 0, "frankPopup")
            .setOrigin(0.5)
            .setScale(this.CONFIG.POPUP.ESCALA);

        // Lista de textos do popup
        this.textosPopup = [
            "Querido candidato, bem-vindo a Do Cacau às Estrelas: Uma História de Sucesso! Primeiramente use o clique do mouse para passar as caixas de diálogo apertando as setas!",
            "Você guiará Choco em uma aventura pela história da Mars, explorando seus cinco princípios fundamentais e superando desafios que marcaram o sucesso da empresa.",
            "Use as setas para movimentar o personagem, além dos cliques do mouse para interagir com os objetos e a barra de espaço para pular!"
        ];

        this.etapaAtual = 0; // Índice do texto atual

        // Texto do popup
        this.textoPopup = this.add.text(-300, -100, this.textosPopup[0], {
            fontSize: "27px",
            fill: "#000000",
            fontFamily: "Jersey",
            fontStyle: "bold",
            wordWrap: { width: this.fundoPopup.displayWidth * 0.5, useAdvancedWrap: true },
            align: "left"
        }).setOrigin(0, 0);

        // Botão de próximo
        this.setaProximo = this.add.image(80, 50, "setaPopUpProximo")
            .setOrigin(0.5)
            .setScale(0.8)
            .setInteractive()
            .on("pointerdown", () => this.avancarTexto()) // Avança o texto
            .on("pointerover", () => this.setaProximo.setScale(1.1)) // Aumenta ao passar o mouse
            .on("pointerout", () => this.setaProximo.setScale(0.8)); // Volta ao normal

        // Botão de voltar
        this.setaAnterior = this.add.image(20, 50, "setaPopUpAnterior")
            .setOrigin(0.5)
            .setScale(0.8)
            .setInteractive()
            .on("pointerdown", () => this.voltarTexto()) // Volta o texto
            .on("pointerover", () => this.setaAnterior.setScale(1.1)) // Aumenta ao passar o mouse
            .on("pointerout", () => this.setaAnterior.setScale(0.8)); // Volta ao normal

        // Adiciona todos os elementos ao contêiner
        this.containerPopup.add([this.fundoPopup, this.textoPopup, this.setaProximo, this.setaAnterior]);
        this.containerPopup.setDepth(5); // Camada acima de tudo
        this.containerPopup.setVisible(false); // Invisível até ser ativado
    }

    // Avança para o próximo texto do popup
    avancarTexto() {
        this.etapaAtual++;
        if (this.etapaAtual < this.textosPopup.length) {
            this.textoPopup.setText(this.textosPopup[this.etapaAtual]);
        } else {
            this.containerPopup.setVisible(false); // Esconde o popup no final
        }
    }

    // Volta para o texto anterior do popup
    voltarTexto() {
        this.etapaAtual--;
        if (this.etapaAtual >= 0) {
            this.textoPopup.setText(this.textosPopup[this.etapaAtual]);
            this.containerPopup.setVisible(true); // Garante que o popup seja visível
        } else {
            this.etapaAtual = 0; // Impede índice negativo
        }
    }

    // Cria as animações do jogador
    criarAnimacoes() {
        const ANIMACOES = ["frente", "costas", "direita", "esquerda"];

        ANIMACOES.forEach((animacao) => {
            this.anims.create({
                key: animacao,
                frames: this.anims.generateFrameNames("jogadorAtlas", {
                    prefix: animacao,
                    start: 0,
                    end: 3,
                    zeroPad: 4
                }),
                frameRate: 10, // Velocidade da animação
                repeat: -1 // Repete indefinidamente
            });
        });
    }

    // Atualiza o estado do jogo a cada frame
    update() {
        this.atualizarMovimento(); // Controla o movimento do jogador
        this.atualizarPulo(); // Gerencia o pulo
        this.atualizarPopupPosicao(); // Ajusta a posição do popup
    }

    // Controla o movimento do jogador com as setas
    atualizarMovimento() {
        this.jogadorSprite.setVelocity(0); // Reseta a velocidade

        if (this.cursors.left.isDown) {
            this.jogadorSprite.setVelocityX(-this.CONFIG.VELOCIDADE_MOVIMENTO);
            this.jogadorSprite.anims.play("esquerda", true);
        } else if (this.cursors.right.isDown) {
            this.jogadorSprite.setVelocityX(this.CONFIG.VELOCIDADE_MOVIMENTO);
            this.jogadorSprite.anims.play("direita", true);
        } else if (this.noChao && this.cursors.up.isDown) {
            this.jogadorSprite.setVelocityY(-this.CONFIG.VELOCIDADE_MOVIMENTO);
            this.jogadorSprite.anims.play("costas", true);
        } else if (this.noChao && this.cursors.down.isDown) {
            this.jogadorSprite.setVelocityY(this.CONFIG.VELOCIDADE_MOVIMENTO);
            this.jogadorSprite.anims.play("frente", true);
        } else {
            this.jogadorSprite.anims.stop(); // Para a animação
        }
    }

    // Gerencia a mecânica de pulo
    atualizarPulo() {
        if (this.teclaEspaco.isDown && this.noChao) {
            this.noChao = false; // Sai do chão
            this.tempoPulo = 0; // Reseta o tempo de pulo
            this.jogadorSprite.setVelocityY(this.vy0); // Aplica velocidade inicial
        }

        if (!this.noChao) {
            this.tempoPulo += this.game.loop.delta / 1000; // Incrementa o tempo
            const vy = this.vy0 + this.ay * this.tempoPulo; // Calcula a velocidade com gravidade
            this.jogadorSprite.setVelocityY(vy);

            if (this.tempoPulo >= this.CONFIG.PULO.TEMPO_MAXIMO) {
                this.noChao = true; // Volta ao chão
                this.tempoPulo = 0; // Reseta o tempo
                this.jogadorSprite.setVelocityY(0); // Para o movimento vertical
            }
        }
    }

    // Ajusta a posição do popup para seguir o jogador
    atualizarPopupPosicao() {
        if (!this.containerPopup.visible) return; // Sai se o popup estiver invisível

        const { scrollX, scrollY, zoom } = this.cameras.main;
        const jogadorY = this.jogadorSprite.y;
        const targetY = this.CONFIG.POPUP.Y_BASE +
            (jogadorY - this.CONFIG.POPUP.Y_BASE) * this.CONFIG.POPUP.FOLLOW_FACTOR;

        this.containerPopup.setPosition(
            scrollX + this.CONFIG.POPUP.X / zoom,
            scrollY + targetY / zoom
        ); // Ajusta a posição com base no zoom e na câmera
    }
}