// Cena do quarto (cozinha) da Casa de Frank, onde o jogador interage com ingredientes e puzzles
export default class SceneQuarto extends Phaser.Scene {
    constructor() {
        super("SceneQuarto"); // Define a cena com chave única
        this.CONFIG = {
            CAMERA_ZOOM: 1, // Zoom inicial da câmera
            JOGADOR_SCALE: 4, // Escala do sprite do jogador
            VELOCIDADE_MOVIMENTO: 280, // Velocidade de movimento do jogador
            PULO: {
                VELOCIDADE_INICIAL: -300, // Velocidade inicial do pulo (negativa para subir)
                GRAVIDADE: 600, // Gravidade aplicada ao pulo
                TEMPO_MAXIMO: 1 // Tempo máximo do pulo em segundos
            },
            PORTA: {
                X: 1880, // Posição X da porta
                Y: 830, // Posição Y da porta
                LARGURA: 30, // Largura da porta
                ALTURA: 280, // Altura da porta
                CENA_DESTINO: "SceneJogo", // Cena para onde a porta leva
                POSICAO_SAIDA: { x: 490, y: 500 } // Posição de saída na próxima cena
            },
            POPUP: {
                X: 880, // Posição X do popup do Frank
                Y: 920, // Posição Y do popup do Frank
                ESCALA: 1.6 // Escala do popup
            },
            INGREDIENTES: [
                { key: "cacau", x: 1000, y: 500, escala: 0.5, cena: "ScenePuzzleCozinhaCacau" }, // Configuração do cacau
                { key: "acucar", x: 1253, y: 500, escala: 0.6, cena: "ScenePuzzleCozinhaAcucar" }, // Configuração do açúcar
                { key: "manteiga", x: 1130, y: 510, escala: 0.3, cena: "ScenePuzzleCozinhaManteiga" } // Configuração da manteiga
            ]
        };
    }

    // Carrega os assets antes de iniciar a cena
    preload() {
        this.load.image("setaPopUpProximo", "src/assets/imagens/imagesBotoes/proximoPopUp.png"); // Seta de avançar popup
        this.load.image("setaPopUpAnterior", "src/assets/imagens/imagesBotoes/voltarPopUp.png"); // Seta de voltar popup
        this.load.image("cozinha", "src/assets/imagens/imagesCasa/imagesIncregientes/fundoCozinha.png"); // Fundo da cozinha
        this.load.image("cacau", "src/assets/imagens/imagesCasa/imagesIncregientes/cacau.png"); // Imagem do cacau
        this.load.image("acucar", "src/assets/imagens/imagesCasa/imagesIncregientes/acucar.png"); // Imagem do açúcar
        this.load.image("manteiga", "src/assets/imagens/imagesCasa/imagesIncregientes/manteiga.png"); // Imagem da manteiga
        this.load.image("popupManteiga", "src/assets/imagens/imagesPopUps/popUpManteiga.png"); // Popup da manteiga
        this.load.image("popupAcucar", "src/assets/imagens/imagesPopUps/popUpAcucar.png"); // Popup do açúcar
        this.load.image("popupCacau", "src/assets/imagens/imagesPopUps/popUpCacau.png"); // Popup do cacau
        this.load.image("frankPopup", "src/assets/imagens/imagesPopUps/popupfrank.png"); // Popup do Frank
        this.load.image("popupTutorial", "src/assets/imagens/imagesPopUps/popUpTutorial.png"); // Popup de tutorial
        this.load.image("btnFecharWhite", "src/assets/imagens/imagesBotoes/btnFecharWhite.png"); // Botão de fechar
        this.load.atlas(
            "jogadorAtlas",
            "src/assets/sprites/spritesheet.png",
            "src/assets/sprites/sprites.json"
        ); // Atlas do jogador com animações
        this.load.audio("musicaCozinha", "src/assets/sounds/fase2.mp3"); // Música da cozinha

        this.load.on("complete", () => console.log("Todos os assets da SceneQuarto foram carregados")); // Loga sucesso
        this.load.on("loaderror", (file) => console.error("Erro ao carregar o arquivo:", file.key)); // Loga erros
    }

    // Configura a cena ao iniciar
    create() {
        this.sound.stopAll(); // Para qualquer áudio anterior
        this.adicionarFundo(); // Adiciona o fundo da cozinha
        this.criarJogador(); // Cria o sprite do jogador
        this.criarAnimacoes(); // Configura as animações do jogador
        this.configurarCamera(); // Configura a câmera para seguir o jogador
        this.configurarPorta(); // Cria a porta de saída
        this.configurarObstaculos(); // Adiciona colisores do cenário
        this.configurarFisica(); // Configura a física entre jogador e obstáculos
        this.configurarControles(); // Habilita os controles do teclado
        this.configurarCaixaDeFala(); // Configura a caixa de diálogo (não usada no update)
        this.adicionarIngredientes(); // Adiciona os ingredientes interativos
        this.configurarPopup(); // Configura o popup do Frank
        this.adicionarPopupTutorial(); // Adiciona o popup de tutorial

        if (this.cache.audio.exists("musicaCozinha")) {
            console.log("Áudio 'musicaCozinha' encontrado no cache"); // Loga se o áudio está disponível
            this.musica = this.sound.add("musicaCozinha", { loop: true, volume: 0.5 }); // Adiciona a música
            this.musica.play(); // Toca a música em loop
        } else {
            console.error("Áudio 'musicaCozinha' não encontrado no cache."); // Loga erro se o áudio não carregar
        }

        this.containerPopup.setVisible(true); // Mostra o popup do Frank ao iniciar
    }

    // Para a música ao sair da cena
    shutdown() {
        if (this.musica && this.musica.isPlaying) {
            this.musica.stop(); // Para a música
            console.log("Música 'musicaCozinha' parada ao sair da SceneQuarto"); // Loga a parada
        }
    }

    // Adiciona o fundo da cozinha
    adicionarFundo() {
        this.fundo = this.add.image(
            this.cameras.main.width / 2, // Centraliza horizontalmente
            this.cameras.main.height / 2, // Centraliza verticalmente
            "cozinha" // Imagem do fundo
        )
            .setOrigin(0.5, 0.5) // Define o ponto de origem no centro
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height); // Ajusta ao tamanho da tela
    }

    // Cria o sprite do jogador
    criarJogador() {
        this.jogadorSprite = this.physics.add.sprite(150, 840, "jogadorAtlas", "frente0000")
            .setScale(this.CONFIG.JOGADOR_SCALE) // Aplica a escala definida
            .setOrigin(0.5, 1) // Ponto de origem na base central
            .setCollideWorldBounds(true); // Impede que saia dos limites do mundo
    }

    // Configura a câmera para seguir o jogador
    configurarCamera() {
        this.cameras.main.setBounds(0, 0, this.fundo.width, this.fundo.height); // Define os limites da câmera
        this.cameras.main.startFollow(this.jogadorSprite, true, 0.05, 0.05); // Segue o jogador com suavização
        this.cameras.main.setZoom(this.CONFIG.CAMERA_ZOOM); // Aplica o zoom definido
    }

    // Configura a porta de saída
    configurarPorta() {
        this.porta = this.add.rectangle(
            this.CONFIG.PORTA.X, // Posição X da porta
            this.CONFIG.PORTA.Y, // Posição Y da porta
            this.CONFIG.PORTA.LARGURA, // Largura da porta
            this.CONFIG.PORTA.ALTURA, // Altura da porta
            0xff0000, // Cor vermelha (invisível)
            0 // Opacidade zero
        );
        this.physics.add.existing(this.porta, true); // Torna a porta um objeto físico estático
        this.physics.add.overlap(
            this.jogadorSprite, // Sprite do jogador
            this.porta, // Objeto da porta
            () => {
                this.registry.set("posicaoSaida", this.CONFIG.PORTA.POSICAO_SAIDA); // Define a posição de saída
                this.scene.start(this.CONFIG.PORTA.CENA_DESTINO); // Inicia a cena destino
            },
            null,
            this
        ); // Verifica sobreposição para transição
    }

    // Configura os obstáculos do cenário
    configurarObstaculos() {
        this.grupoColisores = this.physics.add.staticGroup(); // Cria um grupo de colisores estáticos
        this.grupoColisores.add(
            this.physics.add.existing(this.add.rectangle(920, 440, 1800, 440, 0xff0000, 0), true)
        ); // Adiciona um retângulo invisível como obstáculo
    }

    // Configura a física entre jogador e obstáculos
    configurarFisica() {
        this.physics.add.collider(this.jogadorSprite, this.grupoColisores); // Define colisão entre jogador e colisores
    }

    // Configura os controles do teclado
    configurarControles() {
        this.cursors = this.input.keyboard.createCursorKeys(); // Habilita teclas de direção
        this.teclaEspaco = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Habilita barra de espaço
        this.vy0 = this.CONFIG.PULO.VELOCIDADE_INICIAL; // Velocidade inicial do pulo
        this.ay = this.CONFIG.PULO.GRAVIDADE; // Gravidade do pulo
        this.noChao = true; // Flag para verificar se está no chão
        this.tempoPulo = 0; // Contador de tempo do pulo
    }

    // Adiciona os ingredientes interativos
    adicionarIngredientes() {
        this.CONFIG.INGREDIENTES.forEach(({ key, x, y, escala, cena }) => {
            const ingrediente = this.add.image(x, y, key).setScale(escala).setInteractive(); // Cria o ingrediente
            if (!this.scene.get(cena)) {
                import(`./${cena}.js`).then((module) => this.scene.add(cena, module.default, false));
            } // Carrega dinamicamente a cena do puzzle se não estiver carregada
            ingrediente.on("pointerdown", () => this.scene.launch(cena)); // Inicia o puzzle ao clicar
        });
    }

    // Configura a caixa de diálogo (não usada no update)
    configurarCaixaDeFala() {
        this.caixaDeFala = this.add.rectangle(300, 380, 500, 100, 0xffffff, 1)
            .setStrokeStyle(2, 0x000000) // Borda preta de espessura 2
            .setVisible(false) // Inicia invisível
            .setDepth(1); // Camada acima do fundo
        this.textoDialogo = this.add.text(300, 380, "", {
            fontFamily: "Jersey",
            fontSize: "18px",
            fill: "#000000",
            wordWrap: { width: 450, useAdvancedWrap: true },
            align: "center"
        })
            .setOrigin(0.5) // Centraliza o texto
            .setVisible(false) // Inicia invisível
            .setDepth(2); // Camada acima da caixa
    }

    // Configura o popup do Frank com textos e setas
    configurarPopup() {
        this.containerPopup = this.add.container(this.CONFIG.POPUP.X, this.CONFIG.POPUP.Y); // Container do popup
        this.fundoPopup = this.add.image(0, 0, "frankPopup")
            .setOrigin(0.5) // Centraliza o fundo
            .setScale(this.CONFIG.POPUP.ESCALA); // Aplica a escala definida
        this.textosPopup = [
            "Choco, agora é com você! Adicione os ingredientes nas medidas corretas e crie a primeira barra de chocolate da Mars!",
            "Use o mouse para selecionar os ingredientes e a barra de espaço para controlar a parada da seta, mas veja o tutorial antes! Clique primeiro no cacau, em seguida na manteiga e por fim no Açúcar!"
        ]; // Textos do popup
        this.etapaAtual = 0; // Índice do texto atual
        this.textoPopup = this.add.text(-400, -100, this.textosPopup[0], {
            fontSize: "28px",
            fill: "#000000",
            fontFamily: "Jersey",
            fontStyle: "bold",
            wordWrap: { width: this.fundoPopup.displayWidth * 0.5, useAdvancedWrap: true },
            align: "left"
        }).setOrigin(0, 0); // Texto inicial alinhado à esquerda
        this.setaProximo = this.add.image(110, 80, "setaPopUpProximo")
            .setOrigin(0.5)
            .setScale(1)
            .setInteractive()
            .on("pointerdown", () => this.avancarTexto()) // Avança o texto
            .on("pointerover", () => this.setaProximo.setScale(1.2)) // Aumenta ao passar o mouse
            .on("pointerout", () => this.setaProximo.setScale(1)); // Volta ao normal
        this.setaAnterior = this.add.image(40, 80, "setaPopUpAnterior")
            .setOrigin(0.5)
            .setScale(1)
            .setInteractive()
            .on("pointerdown", () => this.voltarTexto()) // Volta o texto
            .on("pointerover", () => this.setaAnterior.setScale(1.2)) // Aumenta ao passar o mouse
            .on("pointerout", () => this.setaAnterior.setScale(1)); // Volta ao normal
        this.containerPopup.add([this.fundoPopup, this.textoPopup, this.setaProximo, this.setaAnterior]); // Adiciona ao container
        this.containerPopup.setDepth(5); // Camada alta para ficar acima de tudo
    }

    // Adiciona o popup de tutorial
    adicionarPopupTutorial() {
        this.popupTutorial = this.add.image(
            800 / 0.9, // Posição X ajustada (~888.89)
            600 / 1.12, // Posição Y ajustada (~535.71)
            "popupTutorial" // Imagem do tutorial
        ).setVisible(false); // Inicia invisível
        this.btnFecharWhite = this.add.image(
            this.popupTutorial.x + 220, // Posição X relativa ao popup
            this.popupTutorial.y - 300, // Posição Y relativa ao popup
            "btnFecharWhite" // Botão de fechar
        )
            .setInteractive()
            .setVisible(false) // Inicia invisível
            .on("pointerdown", () => {
                this.popupTutorial.setVisible(false); // Esconde o popup
                this.btnFecharWhite.setVisible(false); // Esconde o botão
            });
    }

    // Avança o texto do popup do Frank
    avancarTexto() {
        if (this.etapaAtual < this.textosPopup.length - 1) {
            this.etapaAtual++; // Avança para o próximo texto
            this.textoPopup.setText(this.textosPopup[this.etapaAtual]); // Atualiza o texto
        } else if (this.etapaAtual === this.textosPopup.length - 1) {
            this.containerPopup.setVisible(false); // Esconde o popup do Frank
            this.popupTutorial.setVisible(true); // Mostra o tutorial
            this.btnFecharWhite.setVisible(true); // Mostra o botão de fechar
            this.btnFecharWhite.setScale(1.6); // Aumenta o botão
        }
    }

    // Volta o texto do popup do Frank
    voltarTexto() {
        if (this.etapaAtual > 0) {
            this.etapaAtual--; // Volta para o texto anterior
            this.textoPopup.setText(this.textosPopup[this.etapaAtual]); // Atualiza o texto
        }
    }

    // Cria as animações do jogador
    criarAnimacoes() {
        const ANIMACOES = ["frente", "costas", "direita", "esquerda"]; // Lista de animações
        ANIMACOES.forEach((animacao) => {
            this.anims.create({
                key: animacao,
                frames: this.anims.generateFrameNames("jogadorAtlas", {
                    prefix: animacao,
                    start: 0,
                    end: 3,
                    zeroPad: 4
                }), // Gera frames do atlas
                frameRate: 10, // 10 frames por segundo
                repeat: -1 // Repete infinitamente
            });
        });
    }

    // Atualiza a cena a cada frame
    update() {
        this.atualizarMovimento(); // Controla o movimento do jogador
        this.atualizarPulo(); // Controla o pulo do jogador
    }

    // Atualiza o movimento horizontal e vertical do jogador
    atualizarMovimento() {
        this.jogadorSprite.setVelocity(0); // Reseta a velocidade
        if (this.cursors.left.isDown) {
            this.jogadorSprite.setVelocityX(-this.CONFIG.VELOCIDADE_MOVIMENTO); // Move para esquerda
            this.jogadorSprite.anims.play("esquerda", true); // Toca animação
        } else if (this.cursors.right.isDown) {
            this.jogadorSprite.setVelocityX(this.CONFIG.VELOCIDADE_MOVIMENTO); // Move para direita
            this.jogadorSprite.anims.play("direita", true); // Toca animação
        } else if (this.cursors.up.isDown) {
            this.jogadorSprite.setVelocityY(-this.CONFIG.VELOCIDADE_MOVIMENTO); // Move para cima
            this.jogadorSprite.anims.play("costas", true); // Toca animação
        } else if (this.cursors.down.isDown) {
            this.jogadorSprite.setVelocityY(this.CONFIG.VELOCIDADE_MOVIMENTO); // Move para baixo
            this.jogadorSprite.anims.play("frente", true); // Toca animação
        } else {
            this.jogadorSprite.anims.stop(); // Para a animação se não houver movimento
        }
    }

    // Atualiza a mecânica de pulo do jogador
    atualizarPulo() {
        if (this.teclaEspaco.isDown && this.noChao) {
            this.noChao = false; // Marca que não está mais no chão
            this.tempoPulo = 0; // Reseta o tempo do pulo
            this.jogadorSprite.setVelocityY(this.vy0); // Aplica velocidade inicial do pulo
        }
        if (!this.noChao) {
            this.tempoPulo += this.game.loop.delta / 1000; // Incrementa o tempo do pulo
            const vy = this.vy0 + this.ay * this.tempoPulo; // Calcula velocidade com gravidade
            this.jogadorSprite.setVelocityY(vy); // Aplica a velocidade
            if (this.tempoPulo >= this.CONFIG.PULO.TEMPO_MAXIMO) {
                this.noChao = true; // Volta ao chão
                this.tempoPulo = 0; // Reseta o tempo
                this.jogadorSprite.setVelocityY(0); // Para o movimento vertical
            }
        }
    }
}       



