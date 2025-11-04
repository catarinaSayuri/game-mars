// Cena do puzzle de cozinha para adicionar manteiga, parte do minigame da Casa de Frank
export default class ScenePuzzleCozinhaManteiga extends Phaser.Scene {
    constructor() {
        super("ScenePuzzleCozinhaManteiga"); // Define a cena com chave única
    }

    // Configurações fixas da cena
    CONFIG = {
        FUNDO: { ESCALA: 0.8 }, // Escala do fundo do popup
        SETA: { ESCALA: 0.06, VELOCIDADE: 600 }, // Escala e velocidade da seta
        BARRA: { ESCALA: 0.8, OFFSET_Y: 2 }, // Escala e deslocamento vertical da barra
        ZONA_VERDE: { TAMANHO: 100 }, // Tamanho da zona de acerto
        BOTOES: { ESCALA: 0.6 }, // Escala dos botões de resultado
        TEXTOS: {
            INSTRUCAO: {
                TEXTO: "ADICIONE A QUANTIDADE NECESSÁRIA DE Manteiga PARA DARMOS CONTINUIDADE NA RECEITA!", // Instrução do puzzle
                X: 960, // Posição X da instrução
                Y: 340 // Posição Y da instrução
            },
            ACERTO: "PARABÉNS! VOCÊ ADICIONOU A QUANTIDADE CORRETA DOS INGREDIENTES!", // Mensagem de sucesso
            ERRO: "TENTE NOVAMENTE! A QUALIDADE É MUITO IMPORTANTE" // Mensagem de erro
        },
        ASSETS: {
            FUNDO: "src/assets/imagens/imagesPopUps/popUpManteiga.png", // Fundo do popup
            FECHAR: "src/assets/imagens/imagesBotoes/btnFecharWhite.png", // Botão de fechar
            BARRA: "src/assets/imagens/imagesCasa/imagesIncregientes/barra.png", // Imagem da barra
            SETA: "src/assets/imagens/imagesCasa/imagesIncregientes/seta.png", // Imagem da seta
            PROXIMA_FASE: "src/assets/imagens/imagesBotoes/próximaFaseBotao.png", // Botão de próxima fase
            REINICIAR: "src/assets/imagens/imagesBotoes/btnReiniciar.png" // Botão de reiniciar
        }
    };

    // Carrega os assets antes de iniciar a cena
    preload() {
        this.load.image("imagemFundoPuzzleManteiga", this.CONFIG.ASSETS.FUNDO); // Carrega o fundo
        this.load.image('btnFecharWhite', this.CONFIG.ASSETS.FECHAR); // Carrega o botão de fechar
        this.load.image('barra', this.CONFIG.ASSETS.BARRA); // Carrega a barra
        this.load.image('seta', this.CONFIG.ASSETS.SETA); // Carrega a seta
        this.load.image('btnProximaFase', this.CONFIG.ASSETS.PROXIMA_FASE); // Carrega o botão de próxima fase
        this.load.image('btnReiniciar', this.CONFIG.ASSETS.REINICIAR); // Carrega o botão de reiniciar
    }

    // Configura os elementos visuais e interativos da cena
    create() {
        this.adicionarFundo(); // Adiciona o fundo do popup
        this.adicionarBotaoFechar(); // Adiciona o botão de fechar
        this.adicionarInstrucao(); // Adiciona a instrução do puzzle
        this.criarBarraESeta(); // Cria a barra e a seta
        this.configurarLimites(); // Define os limites da barra e zona verde
        this.configurarControles(); // Configura os controles do teclado
        this.configurarResultado(); // Prepara o container de resultado
    }

    // Adiciona o fundo do popup
    adicionarFundo() {
        this.popupTutorial = this.add.image(
            this.cameras.main.width / 2, // Centraliza horizontalmente
            this.cameras.main.height / 2, // Centraliza verticalmente
            'imagemFundoPuzzleManteiga' // Imagem do fundo
        ).setScale(this.CONFIG.FUNDO.ESCALA); // Aplica a escala definida
    }

    // Adiciona o botão de fechar
    adicionarBotaoFechar() {
        this.btnFecharWhite = this.add.image(1140, 310, 'btnFecharWhite')
            .setScale(1.2) // Aumenta o tamanho
            .setInteractive() // Torna interativo
            .on('pointerdown', () => this.scene.stop()); // Para a cena ao clicar
    }

    // Adiciona o texto de instrução
    adicionarInstrucao() {
        this.textoInstrucao = this.add.text(
            this.CONFIG.TEXTOS.INSTRUCAO.X, // Posição X configurada
            this.CONFIG.TEXTOS.INSTRUCAO.Y, // Posição Y configurada
            this.CONFIG.TEXTOS.INSTRUCAO.TEXTO, // Texto da instrução
            {
                fontSize: "28px",
                fill: "#ffffff",
                fontFamily: "Jersey",
                align: "center",
                wordWrap: { width: 350, useAdvancedWrap: true } // Quebra de linha
            }
        ).setOrigin(0.5); // Centraliza o texto em relação ao ponto (x, y)
    }

    // Cria a barra e a seta do puzzle
    criarBarraESeta() {
        const popupX = this.popupTutorial.x; // Posição X do popup
        const popupY = this.popupTutorial.y; // Posição Y do popup
        const offsetY = 110; // Deslocamento vertical da barra

        this.barra = this.add.image(popupX, popupY + offsetY, 'barra')
            .setScale(this.CONFIG.BARRA.ESCALA); // Cria a barra com escala definida
        this.seta = this.physics.add.sprite(this.barra.x, this.barra.y, 'seta')
            .setScale(this.CONFIG.SETA.ESCALA) // Cria a seta com escala definida
            .setCollideWorldBounds(true) // Impede que a seta saia da tela
            .setVelocityX(this.CONFIG.SETA.VELOCIDADE); // Define velocidade inicial
    }

    // Define os limites da barra e da zona verde
    configurarLimites() {
        const larguraBarraEscalada = this.barra.width * this.CONFIG.BARRA.ESCALA; // Largura escalada da barra
        this.limiteEsquerdo = this.barra.x - (larguraBarraEscalada * 0.4); // Limite esquerdo da seta
        this.limiteDireito = this.barra.x + (larguraBarraEscalada * 0.4); // Limite direito da seta
        this.zonaVerdeEsquerda = this.barra.x - (this.CONFIG.ZONA_VERDE.TAMANHO / 2); // Início da zona verde
        this.zonaVerdeDireita = this.barra.x + (this.CONFIG.ZONA_VERDE.TAMANHO / 2); // Fim da zona verde
    }

    // Configura os controles do teclado
    configurarControles() {
        this.teclado = this.input.keyboard.createCursorKeys(); // Habilita teclas de cursor
        this.spacePressed = false; // Flag para evitar múltiplas paradas com a barra de espaço
    }

    // Configura o container de resultado
    configurarResultado() {
        this.resultadoContainer = this.add.container(
            this.cameras.main.width / 2, // Centraliza horizontalmente
            this.cameras.main.height / 2 // Centraliza verticalmente
        ).setDepth(10).setVisible(false); // Camada alta, inicia invisível

        this.textoResultado = this.add.text(10, 160, "", {
            fontSize: "22px",
            fill: "#000000",
            fontFamily: "Jersey",
            align: "center",
            wordWrap: { width: 400, useAdvancedWrap: true } // Quebra de linha
        }).setOrigin(0.5); // Centraliza o texto

        this.btnProximaFase = this.add.image(0, 230, 'btnProximaFase')
            .setScale(this.CONFIG.BOTOES.ESCALA) // Escala definida
            .setInteractive() // Torna interativo
            .on('pointerdown', () => this.irParaProximaFase()) // Vai para a próxima fase
            .setVisible(false); // Inicia invisível

        this.btnReiniciar = this.add.image(0, 230, 'btnReiniciar')
            .setScale(this.CONFIG.BOTOES.ESCALA) // Escala definida
            .setInteractive() // Torna interativo
            .on('pointerdown', () => this.reiniciarSeta()) // Reinicia o puzzle
            .setVisible(false); // Inicia invisível

        this.resultadoContainer.add([this.textoResultado, this.btnProximaFase, this.btnReiniciar]); // Agrupa elementos
    }

    // Atualiza a cena a cada frame
    update() {
        this.atualizarMovimentoSeta(); // Controla o movimento da seta
        this.verificarParada(); // Verifica se o jogador parou a seta
        this.manterSetaNaBarra(); // Mantém a seta alinhada com a barra
    }

    // Atualiza o movimento da seta entre os limites
    atualizarMovimentoSeta() {
        if (this.seta.x >= this.limiteDireito) {
            this.seta.setVelocityX(-this.CONFIG.SETA.VELOCIDADE); // Inverte para esquerda
        } else if (this.seta.x <= this.limiteEsquerdo) {
            this.seta.setVelocityX(this.CONFIG.SETA.VELOCIDADE); // Inverte para direita
        }
    }

    // Verifica se a barra de espaço foi pressionada para parar a seta
    verificarParada() {
        if (this.teclado.space.isDown && !this.spacePressed) {
            this.seta.setVelocityX(0); // Para a seta
            this.verificarAcerto(); // Verifica se acertou a zona verde
            this.spacePressed = true; // Marca como pressionado
        } else if (this.teclado.space.isUp) {
            this.spacePressed = false; // Reseta a flag quando soltar
        }
    }

    // Mantém a seta alinhada verticalmente com a barra
    manterSetaNaBarra() {
        this.seta.setVelocityY(0); // Impede movimento vertical
        this.seta.y = this.barra.y + this.CONFIG.BARRA.OFFSET_Y; // Ajusta posição Y
    }

    // Verifica se a seta parou na zona verde
    verificarAcerto() {
        if (this.seta.x >= this.zonaVerdeEsquerda && this.seta.x <= this.zonaVerdeDireita) {
            this.textoResultado.setText(this.CONFIG.TEXTOS.ACERTO.toUpperCase()); // Mensagem de acerto
            this.textoResultado.setStyle({
                fill: "#ffff", // Cor branca
                fontFamily: "Jersey",
                fontSize: "22px",
                wordWrap: { width: 400, useAdvancedWrap: true }
            });
            this.btnProximaFase.setVisible(true); // Mostra botão de próxima fase
            this.btnReiniciar.setVisible(false); // Esconde botão de reiniciar
            this.resultadoContainer.setVisible(true); // Mostra o resultado
        } else {
            this.textoResultado.setText(this.CONFIG.TEXTOS.ERRO.toUpperCase()); // Mensagem de erro
            this.textoResultado.setStyle({
                fill: "#ffff", // Cor branca
                fontFamily: "Jersey",
                fontSize: "22px",
                wordWrap: { width: 380, useAdvancedWrap: true }
            });
            this.btnProximaFase.setVisible(false); // Esconde botão de próxima fase
            this.btnReiniciar.setVisible(true); // Mostra botão de reiniciar
            this.resultadoContainer.setVisible(true); // Mostra o resultado
        }
    }

    // Avança para a próxima fase do puzzle
    irParaProximaFase() {
        this.scene.start("ScenePuzzleCozinhaAcucar"); // Inicia a próxima cena
    }

    // Reinicia o movimento da seta
    reiniciarSeta() {
        this.resultadoContainer.setVisible(false); // Esconde o resultado
        this.seta.setVelocityX(this.CONFIG.SETA.VELOCIDADE); // Reinicia a velocidade da seta
    }
}