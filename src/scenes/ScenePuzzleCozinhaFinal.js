// Cena final do puzzle da cozinha, exibindo a vitória do minigame da Casa de Frank
export default class ScenePuzzleCozinhaFinal extends Phaser.Scene {
    constructor() {
        super("ScenePuzzleCozinhaFinal"); // Define a cena com chave única
        this.CONFIG = {
            POPUP: {
                ESCALA: 0.8, // Escala do popup
                X: null, // Posição X será definida no create
                Y: null // Posição Y será definida no create
            },
            BOTAO: {
                ESCALA: 0.6, // Escala do botão
                OFFSET_Y: 210, // Deslocamento vertical do botão em relação ao popup
                CENA_DESTINO: "SceneJogo" // Cena para a qual o jogo retorna
            },
            TEXTO: {
                FONTE: "Jersey", // Fonte usada nos textos
                TAMANHO: "28px", // Tamanho da fonte
                COR: "#ffffff", // Cor do texto
                LARGURA_ENVELOPAMENTO: 350 // Largura máxima para quebra de linha
            }
        };
    }

    // Carrega os assets antes de iniciar a cena
    preload() {
        this.load.image("popUpFinal", "src/assets/imagens/imagesPopUps/popUpFinalNivelUm.png"); // Carrega o fundo do popup
        this.load.image("btnProximaFase", "src/assets/imagens/imagesBotoes/próximaFaseBotao.png"); // Carrega o botão de próxima fase

        this.load.on("complete", () => console.log("Assets da ScenePuzzleCozinhaFinal carregados com sucesso")); // Loga sucesso no carregamento
        this.load.on("loaderror", (file) => console.error("Erro ao carregar:", file.key)); // Loga erros de carregamento
    }

    // Configura os elementos visuais da cena
    create() {
        this.CONFIG.POPUP.X = this.cameras.main.centerX; // Define a posição X como centro da tela
        this.CONFIG.POPUP.Y = this.cameras.main.centerY; // Define a posição Y como centro da tela

        this.adicionarPopup(); // Adiciona o popup de vitória
        this.adicionarBotao(); // Adiciona o botão de próxima fase
        this.adicionarTextos(); // Adiciona os textos de parabéns e instrução
    }

    // Adiciona o popup de vitória
    adicionarPopup() {
        this.popUp = this.add.image(
            this.CONFIG.POPUP.X, // Posição X centralizada
            this.CONFIG.POPUP.Y, // Posição Y centralizada
            "popUpFinal" // Imagem do popup
        ).setScale(this.CONFIG.POPUP.ESCALA); // Aplica a escala definida
    }

    // Adiciona o botão de próxima fase
    adicionarBotao() {
        this.btnProximaFase = this.add.image(
            this.CONFIG.POPUP.X, // Centraliza horizontalmente
            this.CONFIG.POPUP.Y + this.CONFIG.BOTAO.OFFSET_Y, // Posiciona abaixo do popup
            "btnProximaFase" // Imagem do botão
        )
            .setScale(this.CONFIG.BOTAO.ESCALA) // Aplica a escala definida
            .setInteractive() // Torna interativo
            .setDepth(1) // Camada acima do popup
            .on("pointerdown", () => this.irParaProximaFase()); // Chama a função de transição ao clicar
    }

    // Adiciona os textos de parabéns e instrução
    adicionarTextos() {
        const estiloTexto = {
            fontFamily: this.CONFIG.TEXTO.FONTE, // Usa a fonte configurada
            fontSize: this.CONFIG.TEXTO.TAMANHO, // Usa o tamanho configurado
            fill: this.CONFIG.TEXTO.COR, // Usa a cor configurada
            align: "center", // Alinha ao centro
            wordWrap: { width: this.CONFIG.TEXTO.LARGURA_ENVELOPAMENTO, useAdvancedWrap: true } // Quebra de linha
        };

        this.textoInstrucao = this.add.text(
            this.cameras.main.width / 2, // Centraliza horizontalmente
            380, // Posição Y fixa
            "PARABÉNS!!! VOCÊ ADICIONOU A QUANTIDADE CORRETA DOS TRÊS INGREDIENTES E CONQUISTOU TODAS AS ESTRELAS!", // Mensagem de vitória
            estiloTexto // Aplica o estilo definido
        ).setOrigin(0.5); // Centraliza o texto em relação ao ponto (x, y)

        this.textoInstrucaoAbaixo = this.add.text(
            this.cameras.main.width / 2, // Centraliza horizontalmente
            650, // Posição Y fixa
            "AGORA CLIQUE NO BOTÃO ABAIXO PARA CONTINUAR SUA JORNADA!", // Instrução para continuar
            estiloTexto // Aplica o estilo definido
        ).setOrigin(0.5); // Centraliza o texto em relação ao ponto (x, y)
    }

    // Faz a transição para a próxima cena (SceneJogo)
    irParaProximaFase() {
        window.progresso.fase1 = true; // Marca a fase 1 como concluída no objeto global progresso

        console.log("Botão 'Próxima Fase' clicado"); // Loga o clique no botão

        this.sound.stopAll(); // Para todas as músicas
        console.log("Todas as músicas paradas antes de ir para SceneJogo"); // Loga a parada das músicas

        const pixelated = this.cameras.main.postFX.addPixelate(20); // Aplica efeito de pixelização
        this.cameras.main.fadeOut(300); // Inicia fade-out com duração de 300ms

        this.cameras.main.once("camerafadeoutcomplete", () => { // Executa após o fade-out
            console.log("Fade out concluído, iniciando transição"); // Loga o fim do fade
            this.add.tween({
                targets: pixelated, // Anima o efeito de pixelização
                duration: 700, // Duração da animação
                amount: 15, // Reduz a pixelização
                onComplete: () => {
                    console.log("Tween concluído, mudando para SceneJogo"); // Loga o fim da animação
                    this.scene.stop("ScenePuzzleCozinhaFinal"); // Para esta cena
                    this.scene.stop("SceneQuarto"); // Para a cena do quarto (se ativa)
                    this.scene.start(this.CONFIG.BOTAO.CENA_DESTINO); // Inicia SceneJogo
                }
            });
        });
    }


}