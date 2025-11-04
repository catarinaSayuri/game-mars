// Cena da fábrica da Mars, um minigame de escolhas com cartas para equilibrar indicadores
export default class SceneFabrica extends Phaser.Scene {
    constructor() {
        super({ key: "SceneFabrica" }); // Define a cena com chave única
        this.cartasJogadas = 0; // Contador de cartas jogadas
        this.tempoRestante = 300; // Tempo inicial do minigame (5 minutos em segundos)
        this.popupFechadoManualmente = false; // Controla se o popup inicial foi fechado
    }

    // Carrega os assets necessários para a cena
    preload() {
        this.load.atlas('cartasAtlas', 'src/assets/imagens/imagesCartas/cartas_atlas.png', 'src/assets/imagens/imagesCartas/cartas_atlas.json'); // Spritesheet das cartas
        this.load.json('cartasData', 'src/assets/imagens/imagesCartas/Escolhas.json'); // Dados das cartas em JSON
        this.load.image('fundoNivelDois', 'src/assets/imagens/imagesCartas/fundo.png'); // Imagem de fundo
        this.load.image('popUpForrest', 'src/assets/imagens/imagesPopUps/forrestpopup.png'); // Popup do Forrest
        this.load.audio('musicaFaseFabrica', "src/assets/sounds/tela3.mp3"); // Música da fábrica
        this.load.image("setaPopUpProximo", "src/assets/imagens/imagesBotoes/proximoPopUp.png"); // Botão de próximo
        this.load.image("setaPopUpAnterior", "src/assets/imagens/imagesBotoes/voltarPopUp.png"); // Botão de voltar
    }

    // Configura a cena ao iniciar
    create() {
        this.sound.stopAll(); // Para músicas de cenas anteriores
        console.log("Todas as músicas anteriores paradas ao entrar na SceneFabrica");

        // Inicializa os parâmetros do minigame
        this.parametros = {
            lucro: 40, // Indicador de lucro
            funcionarios: 40, // Indicador de funcionários
            publico: 40, // Indicador de público
            principios: 40, // Indicador de princípios
        };
        this.cartasJogadas = 0; // Reseta o contador de cartas
        window.innerWidth = 1920; // Define largura padrão da janela
        window.innerHeight = 1080; // Define altura padrão da janela
        this.tempoInicial = this.time.now; // Marca o tempo inicial

        const centerX = this.cameras.main.width / 2; // Centro horizontal da tela
        const centerY = this.cameras.main.height / 2; // Centro vertical da tela

        // Adiciona o fundo da cena
        this.add.image(centerX, centerY, 'fundoNivelDois')
            .setDisplaySize(window.innerWidth, window.innerHeight) // Ajusta ao tamanho da janela
            .setDepth(0); // Camada de fundo

        this.configurarInterface(); // Configura o popup
        this.exibirPopupInicial(); // Mostra o popup introdutório
        this.criarElementosMinigame(); // Prepara os elementos do minigame

        // Toca a música da cena
        if (this.cache.audio.has("musicaFaseFabrica")) {
            console.log("Áudio 'musicaFaseFabrica' encontrado no cache");
            this.musica = this.sound.add("musicaFaseFabrica", {
                loop: true, // Repete a música
                volume: 0.5 // Volume moderado
            });
            this.musica.play(); // Inicia a música
        } else {
            console.error("Áudio 'musicaFaseFabrica' não encontrado no cache. Verifique o caminho.");
        }
    }

    // Para a música ao sair da cena
    shutdown() {
        if (this.musica && this.musica.isPlaying) {
            this.musica.stop(); // Para a música
            console.log("Música 'musicaFaseFabrica' parada ao sair da SceneFabrica");
        }
    }

    // Configura a interface do popup
    configurarInterface(textoX = 0, textoY = 0) {
        this.containerPopup = this.add.container(0, 0).setDepth(10).setVisible(false); // Contêiner do popup
        this.fundoPopup = this.add.image(0, 0, 'popUpForrest')
            .setOrigin(0.5) // Centraliza a imagem
            .setScale(1.5) // Aumenta o tamanho
            .setInteractive(); // Torna interativo

        this.textoPopup = this.add.text(textoX, textoY, "", {
            fontSize: "40px",
            fill: "#000000",
            fontFamily: "Jersey",
            wordWrap: { width: 500, useAdvancedWrap: true },
            align: "center"
        }).setOrigin(0.5); // Texto centralizado no popup

        // Botão de avançar texto
        this.setaProximo = this.add.image(100, 100, "setaPopUpProximo")
            .setOrigin(0.5)
            .setScale(0.8)
            .setInteractive()
            .on("pointerdown", () => this.avancarTexto()) // Avança o texto
            .on("pointerover", () => this.setaProximo.setScale(0.9)) // Aumenta ao passar o mouse
            .on("pointerout", () => this.setaProximo.setScale(0.8)) // Volta ao normal
            .setVisible(false); // Invisível inicialmente

        // Botão de voltar texto
        this.setaAnterior = this.add.image(40, 100, "setaPopUpAnterior")
            .setOrigin(0.5)
            .setScale(0.8)
            .setInteractive()
            .on("pointerdown", () => this.voltarTexto()) // Volta o texto
            .on("pointerover", () => this.setaAnterior.setScale(0.9)) // Aumenta ao passar o mouse
            .on("pointerout", () => this.setaAnterior.setScale(0.8)) // Volta ao normal
            .setVisible(false); // Invisível inicialmente

        this.containerPopup.add([this.fundoPopup, this.textoPopup, this.setaProximo, this.setaAnterior]); // Agrupa elementos
    }

    // Mostra o popup inicial com instruções
    exibirPopupInicial(textoX = -140, textoY = 0) {
        const centerX = this.cameras.main.width / 2; // Centro horizontal
        const centerY = this.cameras.main.height / 2; // Centro vertical

        // Textos do popup inicial
        this.textosPopup = [
            "Olá, Choco! Bem-vindo à fábrica da Mars! Aqui começa sua aventura como gerente!",
            "Sua missão é manter a produção em perfeito equilíbrio. Você vai tomar decisões importantes para a empresa!",
            "Funciona assim: cada carta traz um desafio. Clique e segure com o mouse, depois arraste para a esquerda ou direita para ver suas opções de ação!",
            "Cada escolha afeta os quatro indicadores da Mars: Lucro, Funcionários, Público e Princípios. Cuidado: eles sobem ou descem com suas decisões!",
            "Para vencer, equilibre os quatro pilares por 12 cartas em até 300 segundos. Mas atenção: se um pilar chegar ao máximo ou ao zero, você perde!"
        ];
        this.etapaAtual = 0; // Inicia no primeiro texto

        this.fundoPopup.setTexture('popUpForrest'); // Define textura do Forrest
        this.textoPopup.setText(this.textosPopup[this.etapaAtual]); // Define texto inicial
        this.textoPopup.setPosition(textoX, textoY); // Ajusta posição do texto

        this.fundoPopup.off('pointerdown'); // Remove eventos de clique no fundo

        this.setaProximo.setVisible(true); // Mostra botão de avançar
        this.setaAnterior.setVisible(true); // Mostra botão de voltar

        this.containerPopup.setPosition(centerX, centerY); // Centraliza o popup
        this.containerPopup.setVisible(true); // Mostra o popup
    }

    // Avança para o próximo texto do popup
    avancarTexto() {
        if (this.textosPopup && this.textosPopup.length > 1) {
            if (this.etapaAtual < this.textosPopup.length - 1) {
                this.etapaAtual++; // Incrementa o índice
                this.textoPopup.setText(this.textosPopup[this.etapaAtual]); // Atualiza o texto
            } else {
                this.ocultarPopup(); // Fecha o popup
                this.popupFechadoManualmente = true; // Marca como fechado
                this.iniciarMinigame(); // Inicia o minigame
            }
        }
    }

    // Volta para o texto anterior do popup
    voltarTexto() {
        if (this.textosPopup && this.textosPopup.length > 1 && this.etapaAtual > 0) {
            this.etapaAtual--; // Decrementa o índice
            this.textoPopup.setText(this.textosPopup[this.etapaAtual]); // Atualiza o texto
        }
    }

    // Esconde o popup
    ocultarPopup() {
        this.containerPopup.setVisible(false); // Torna o popup invisível
        this.setaProximo.setVisible(false); // Esconde botão de avançar
        this.setaAnterior.setVisible(false); // Esconde botão de voltar
    }

    // Cria os elementos visuais do minigame
    criarElementosMinigame() {
        const centerX = this.cameras.main.width / 2; // Centro horizontal
        const centerY = this.cameras.main.height / 2; // Centro vertical
        const alturaCena = this.cameras.main.height; // Altura da tela

        // Fundo do minigame
        this.fundoJogo = this.add.rectangle(centerX, centerY, 650, alturaCena, 0x222222, 0.8)
            .setDepth(1) // Camada acima do fundo principal
            .setVisible(false); // Inicia invisível

        // Fundo das barras de status
        this.fundoBarras = this.add.rectangle(centerX, 63, 650, 150, 0xcf7800, 0.8)
            .setDepth(2) // Camada acima do fundo do jogo
            .setVisible(false); // Inicia invisível

        this.criarBarrasStatus(); // Cria as barras de indicadores (invisíveis inicialmente)
        this.criarTimer(); // Cria o timer (invisível inicialmente)

        // Texto de instrução
        this.textoInstrucao = this.add.text(
            centerX,
            alturaCena - 100,
            "Arraste a carta e faça sua escolha",
            {
                fontFamily: "Jersey",
                fill: '#fff',
                fontSize: "38px",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: this.cameras.main.width - 80 }
            }
        ).setOrigin(0.5).setDepth(3).setVisible(false); // Inicia invisível

        // Carrega e embaralha as cartas
        this.cartasData = this.cache.json.get('cartasData').cartas; // Dados das cartas
        this.cartas = Phaser.Utils.Array.Shuffle(this.cartasData); // Embaralha as cartas
        this.indiceCartaAtual = 0; // Índice da carta atual
    }

    // Inicia o minigame após o popup inicial
    iniciarMinigame() {
        console.log("Iniciando minigame...");

        this.fundoJogo.setVisible(true); // Mostra o fundo do jogo
        console.log("Fundo do jogo visível");

        this.fundoBarras.setVisible(true); // Mostra o fundo das barras
        console.log("Fundo das barras visível");

        // Torna as barras visíveis
        Object.values(this.barras).forEach(barra => barra.setVisible(true).setDepth(2));
        Object.values(this.fundosBarras).forEach(fundo => fundo.setVisible(true).setDepth(2));
        this.titulosBarras.forEach(titulo => titulo.setVisible(true).setDepth(2));
        console.log("Barras e títulos visíveis");

        // Ativa o timer
        this.textoTimer.setVisible(true).setDepth(5);
        this.timerEvento.paused = false; // Inicia o timer
        console.log("Timer visível e iniciado");

        this.exibirCartaAtual(); // Mostra a primeira carta
        console.log("Carta exibida");

        this.textoInstrucao.setVisible(true); // Mostra a instrução
    }

    // Cria o timer do minigame
    criarTimer() {
        // Texto do timer
        this.textoTimer = this.add.text(this.cameras.main.width - 1040, this.cameras.main.height - 40, `Tempo: ${this.tempoRestante}s`, {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: "Jersey"
        }).setDepth(5).setVisible(false); // Inicia invisível

        // Evento de contagem regressiva
        this.timerEvento = this.time.addEvent({
            delay: 1000, // Atualiza a cada segundo
            callback: () => {
                this.tempoRestante--; // Decrementa o tempo
                this.textoTimer.setText(`Tempo: ${this.tempoRestante}s`); // Atualiza o texto
                if (this.tempoRestante <= 0) {
                    this.exibirPopupGameOver("tempo"); // Mostra game over se o tempo acabar
                }
            },
            loop: true, // Repete indefinidamente
            paused: true // Inicia pausado
        });
    }

    // Cria as barras de status dos indicadores
    criarBarrasStatus() {
        this.barras = {}; // Objeto para as barras
        this.fundosBarras = {}; // Objeto para os fundos das barras
        this.titulosBarras = []; // Lista de títulos
        this.circulosIndicadores = {}; // Objeto para os círculos indicadores
        const nomes = ["lucro", "funcionarios", "publico", "principios"]; // Nomes dos indicadores
        const cores = [0x00ff00, 0xffcc00, 0x00aaff, 0xff3333]; // Cores das barras
        const espacamento = 150; // Espaço entre barras
        const centerX = this.cameras.main.width / 2; // Centro horizontal

        nomes.forEach((nome, index) => {
            let x = centerX - (nomes.length - 1) * espacamento / 2 + index * espacamento; // Calcula posição X
            const fundoBarra = this.add.rectangle(x, 100, 30, 100, 0x444444).setOrigin(0.5, 1).setDepth(2).setVisible(false); // Fundo da barra
            const barra = this.add.rectangle(x, 100, 30, this.parametros[nome], cores[index]).setOrigin(0.5, 1).setDepth(2).setVisible(false); // Barra
            const titulo = this.add.text(x, 110, nome, {
                fontSize: "24px",
                fill: '#fff',
                color: "#ffffff",
                fontFamily: "Jersey",
                align: "center"
            }).setOrigin(0.5, 0).setDepth(2).setVisible(false); // Título da barra

            this.fundosBarras[nome] = fundoBarra; // Armazena o fundo
            this.barras[nome] = barra; // Armazena a barra
            this.titulosBarras.push(titulo); // Armazena o título

            // Cria círculo indicador
            const circulo = this.add.circle(x, 180, 20, 0x444444, 0.7)
                .setVisible(false) // Inicia invisível
                .setDepth(3); // Camada acima das barras

            this.circulosIndicadores[nome] = circulo; // Armazena o círculo
        });
    }

    // Atualiza as barras de status com animação
    atualizarBarrasStatus() {
        Object.keys(this.parametros).forEach(nome => {
            let valor = Phaser.Math.Clamp(this.parametros[nome], 0, 100); // Limita o valor entre 0 e 100
            let novaAltura = (valor / 100) * 100; // Calcula a nova altura proporcional

            this.tweens.add({
                targets: this.barras[nome],
                displayHeight: novaAltura, // Ajusta a altura
                y: 100, // Mantém a base fixa
                duration: 300, // Duração da animação
                ease: "Power2" // Tipo de easing
            });
        });
    }

    // Exibe a carta atual do minigame
    exibirCartaAtual() {
        if (this.indiceCartaAtual >= this.cartas.length || this.tempoRestante <= 0) {
            console.log("Nenhuma carta exibida: índice fora do limite ou tempo esgotado.");
            return;
        }

        const centerX = this.cameras.main.width / 2; // Centro horizontal
        const centerY = this.cameras.main.height / 2; // Centro vertical
        const cartaAtual = this.cartas[this.indiceCartaAtual]; // Carta atual

        console.log("Exibindo carta:", cartaAtual.id);

        if (this.containerCarta) {
            this.containerCarta.destroy(); // Remove a carta anterior
            this.containerCarta = null;
        }

        // Cria elementos da carta
        let carta = this.add.sprite(0, 0, 'cartasAtlas', cartaAtual.id).setScale(1.0).setDepth(3); // Sprite da carta
        let retanguloTexto = this.add.graphics().setDepth(3); // Fundo do texto da escolha
        let textoEscolha = this.add.text(0, -300, '', {
            fontSize: "38px",
            color: "#ffffff",
            fontFamily: "Jersey",
            align: "center",
            wordWrap: { width: 480, useAdvancedWrap: true },
        }).setOrigin(0.5, 0.5).setVisible(false).setDepth(3); // Texto da escolha

        // Agrupa em um contêiner
        this.containerCarta = this.add.container(centerX, centerY + 40, [carta, retanguloTexto, textoEscolha]).setDepth(3).setScale(0.9);
        this.containerCarta.setSize(400, 600).setInteractive(); // Define tamanho e torna interativo
        this.input.setDraggable(this.containerCarta); // Habilita arrastar

        this.input.off("drag"); // Remove eventos anteriores de arrastar
        this.input.off("dragend"); // Remove eventos anteriores de soltar

        // Evento de arrastar a carta
        this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
            if (!this.containerCarta) return;

            const limiteEsquerda = this.cameras.main.width * 0.4; // Limite à esquerda
            const limiteDireita = this.cameras.main.width * 0.6; // Limite à direita
            const limiteSuperior = this.cameras.main.height * 0.59; // Limite superior
            const limiteInferior = this.cameras.main.height * 0.58; // Limite inferior

            let novoX = Phaser.Math.Clamp(dragX, limiteEsquerda, limiteDireita); // Limita posição X
            let novoY = Phaser.Math.Clamp(dragY, limiteSuperior, limiteInferior); // Limita posição Y
            let rotacao = Phaser.Math.Clamp((novoX - centerX) * 0.002, -0.25, 0.25); // Calcula rotação

            gameObject.x = novoX; // Atualiza posição X
            gameObject.y = novoY; // Atualiza posição Y
            gameObject.rotation = rotacao; // Aplica rotação

            // Mostra a escolha ao arrastar
            if (novoX < centerX - 50) {
                textoEscolha.setText(`Escolha: ${cartaAtual.opcoes[0].texto}`); // Texto da opção à esquerda
                this.ajustarRetangulo(retanguloTexto, textoEscolha); // Ajusta o fundo do texto
                retanguloTexto.setVisible(true); // Mostra o fundo
                textoEscolha.setVisible(true); // Mostra o texto
                this.destacarParametrosAfetados(cartaAtual.opcoes[0].efeitos); // Destaca indicadores afetados
            } else if (novoX > centerX + 50) {
                textoEscolha.setText(`Escolha: ${cartaAtual.opcoes[1].texto}`); // Texto da opção à direita
                this.ajustarRetangulo(retanguloTexto, textoEscolha);
                retanguloTexto.setVisible(true);
                textoEscolha.setVisible(true);
                this.destacarParametrosAfetados(cartaAtual.opcoes[1].efeitos);
            } else {
                retanguloTexto.setVisible(false); // Esconde o fundo
                textoEscolha.setVisible(false); // Esconde o texto
                this.resetarDestaquesParametros(); // Reseta os destaques
            }
        });

        // Evento ao soltar a carta
        this.input.on("dragend", (pointer, gameObject) => {
            let escolha = null;
            let limiteEscolha = 50; // Limite para considerar uma escolha

            if (!this.containerCarta) return;

            if (gameObject.x < centerX - limiteEscolha) {
                escolha = cartaAtual.opcoes[0]; // Escolha à esquerda
            } else if (gameObject.x > centerX + limiteEscolha) {
                escolha = cartaAtual.opcoes[1]; // Escolha à direita
            }

            if (escolha) {
                this.aplicarEfeitosCarta(escolha.efeitos); // Aplica os efeitos da escolha
                let anguloFinal = escolha === cartaAtual.opcoes[0] ? -0.1 : 0.1; // Ângulo final da animação
                let destinoX = escolha === cartaAtual.opcoes[0] ? -50 : this.cameras.main.width + 50; // Destino X

                this.tweens.add({
                    targets: this.containerCarta,
                    x: destinoX, // Move para fora da tela
                    rotation: anguloFinal, // Aplica rotação
                    alpha: 0, // Desaparece
                    duration: 400, // Duração da animação
                    ease: "Power2",
                    onComplete: () => {
                        this.containerCarta.destroy(); // Remove a carta
                        this.containerCarta = null;
                        this.indiceCartaAtual++; // Avança para a próxima carta
                        this.registrarCartaJogada(); // Registra a carta jogada
                        this.resetarDestaquesParametros(); // Reseta os destaques
                        this.exibirCartaAtual(); // Mostra a próxima carta
                    }
                });
            } else {
                this.tweens.add({
                    targets: this.containerCarta,
                    x: centerX, // Volta ao centro
                    y: centerY + 40,
                    rotation: 0, // Reseta rotação
                    alpha: 1, // Torna visível
                    duration: 400,
                    ease: "Back.Out",
                    onComplete: () => {
                        if (this.containerCarta) {
                            retanguloTexto.setVisible(false); // Esconde o fundo
                            textoEscolha.setVisible(false); // Esconde o texto
                        }
                    }
                });
            }
        });
    }

    // Ajusta o retângulo de fundo do texto da escolha
    ajustarRetangulo(retanguloTexto, textoEscolha) {
        let larguraTexto = 480; // Largura fixa do texto
        let alturaMinima = 80; // Altura mínima do retângulo
        let padding = 20; // Espaçamento interno
        let alturaTexto = textoEscolha.height; // Altura real do texto
        let novaAltura = Math.max(alturaMinima, alturaTexto + 2 * padding); // Calcula nova altura

        retanguloTexto.clear(); // Limpa o retângulo anterior
        retanguloTexto.fillStyle(0xcf7800, 0.8); // Cor laranja com opacidade
        retanguloTexto.fillRoundedRect(-larguraTexto / 2 - padding + 5, -350, larguraTexto + 2 * padding - 10, novaAltura, 15); // Desenha o retângulo
    }

    // Aplica os efeitos da escolha nos indicadores
    aplicarEfeitosCarta(efeitos) {
        const multiplicador = 3; // Multiplicador para os efeitos
        for (const [parametro, valor] of Object.entries(efeitos)) {
            if (this.parametros[parametro] !== undefined) {
                this.parametros[parametro] += Math.round(valor * multiplicador); // Aplica o efeito arredondado
                this.parametros[parametro] = Phaser.Math.Clamp(this.parametros[parametro], 0, 100); // Limita entre 0 e 100
            }
        }
        this.atualizarBarrasStatus(); // Atualiza as barras

        // Verifica condições de derrota
        for (const parametro in this.parametros) {
            if (this.parametros[parametro] === 0 || this.parametros[parametro] === 100) {
                this.exibirPopupGameOver(parametro); // Mostra game over
                return;
            }
        }
    }

    // Reseta o minigame para recomeçar
    resetarMinigame() {
        // Reseta os parâmetros
        this.parametros = {
            lucro: 40,
            funcionarios: 40,
            publico: 40,
            principios: 40,
        };
        this.cartasJogadas = 0; // Reseta o contador de cartas
        this.tempoRestante = 300; // Reseta o tempo
        this.indiceCartaAtual = 0; // Volta ao início das cartas
        this.cartas = Phaser.Utils.Array.Shuffle(this.cartasData); // Reembaralha as cartas
        if (this.popupGameOver) this.popupGameOver.destroy(); // Remove popup de derrota
        if (this.popupVitoria) this.popupVitoria.destroy(); // Remove popup de vitória
        if (this.textoTimer) this.textoTimer.destroy(); // Remove o timer atual

        this.criarTimer(); // Recria o timer
        this.atualizarBarrasStatus(); // Atualiza as barras
        this.iniciarMinigame(); // Reinicia o minigame
    }

    // Mostra o popup de game over
    exibirPopupGameOver(parametro) {
        // Mensagens de derrota por indicador
        let mensagens = {
            lucro: { 0: "Sua empresa faliu por falta de dinheiro!", 100: "A ganância destruiu sua empresa!" },
            funcionarios: { 0: "Todos os funcionários pediram demissão!", 100: "Os funcionários tomaram o controle!" },
            publico: { 0: "O público perdeu a confiança na marca!", 100: "A popularidade extrema gerou caos!" },
            principios: { 0: "Seus valores foram destruídos!", 100: "A rigidez nos valores engessou a empresa!" },
            tempo: { 0: "O tempo acabou! A empresa não sobreviveu." }
        };

        const centerX = this.cameras.main.width / 2; // Centro horizontal
        const centerY = this.cameras.main.height / 2; // Centro vertical

        let estadoFinal = parametro === "tempo" ? 0 : (this.parametros[parametro] === 0 ? 0 : 100); // Define o estado final
        let mensagemFinal = mensagens[parametro][estadoFinal]; // Seleciona a mensagem

        // Desativa a carta atual
        if (this.containerCarta) {
            this.containerCarta.disableInteractive(); // Desativa interação
            this.containerCarta.setActive(false); // Desativa a carta
            this.tweens.killTweensOf(this.containerCarta); // Para animações
            this.input.off("drag"); // Remove evento de arrastar
            this.input.off("dragend"); // Remove evento de soltar
            this.containerCarta.setDepth(-1); // Coloca a carta abaixo do popup
        }

        this.timerEvento.remove(); // Para o timer

        // Elementos do popup
        let bloqueioFundo = this.add.rectangle(centerX, centerY, 1200, 900, 0x000000, 0).setInteractive().setDepth(998); // Fundo bloqueador
        let fundoPopup = this.add.rectangle(centerX, centerY, 750, 450, 0x000000, 0.8).setDepth(999); // Fundo do popup
        let textoGameOver = this.add.text(centerX, centerY - 120, "Choco,", {
            fontSize: "60px",
            color: "#ff0000",
            fontFamily: "Jersey",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(999); // Título
        let textoMensagem = this.add.text(centerX, centerY - 30, mensagemFinal, {
            fontSize: "30px",
            color: "#ffffff",
            fontFamily: "Jersey",
            align: "center",
            wordWrap: { width: 600 }
        }).setOrigin(0.5).setDepth(999); // Mensagem
        let botaoRestart = this.add.text(centerX, centerY + 90, "Tente Novamente", {
            fontSize: "36px",
            color: "#ffffff",
            backgroundColor: "#ff0000",
            fontFamily: "Jersey",
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive().setDepth(999); // Botão de reiniciar

        botaoRestart.on("pointerdown", () => this.resetarMinigame()); // Reinicia ao clicar
        this.popupGameOver = this.add.container(0, 0, [bloqueioFundo, fundoPopup, textoGameOver, textoMensagem, botaoRestart]).setDepth(999); // Agrupa elementos
    }

    // Registra uma carta jogada e verifica vitória
    registrarCartaJogada() {
        this.cartasJogadas++; // Incrementa o contador
        if (this.cartasJogadas >= 12) {
            this.exibirTelaVitoria(); // Mostra tela de vitória se atingir 12 cartas
        }
    }

    // Mostra a tela de vitória
    exibirTelaVitoria() {
        let estrelas = this.calcularEstrelas(this.tempoRestante); // Calcula estrelas com base no tempo
        const centerX = this.cameras.main.width / 2; // Centro horizontal
        const centerY = this.cameras.main.height / 2; // Centro vertical

        // Desativa a carta atual
        if (this.containerCarta) {
            this.containerCarta.disableInteractive();
            this.containerCarta.setActive(false);
            this.tweens.killTweensOf(this.containerCarta);
            this.input.off("drag");
            this.input.off("dragend");
            this.containerCarta.setDepth(-1);
        }

        this.timerEvento.remove(); // Para o timer

        // Elementos da tela de vitória
        let bloqueioFundo = this.add.rectangle(centerX, centerY, 1200, 900, 0x000000, 0).setInteractive().setDepth(998); // Fundo bloqueador
        let popup = this.add.rectangle(centerX, centerY, 750, 450, 0x000000, 0.8).setDepth(999); // Fundo do popup
        let texto = this.add.text(centerX, centerY - 150, 'Vitória!', {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: "Jersey"
        }).setOrigin(0.5).setDepth(999); // Título
        let estrelasTexto = this.add.text(centerX, centerY - 75, `Estrelas: ${'⭐'.repeat(estrelas)}`, {
            fontSize: '36px',
            fill: '#fff',
            fontFamily: "Jersey"
        }).setOrigin(0.5).setDepth(999); // Texto das estrelas
        let botaoReiniciar = this.add.text(centerX, centerY + 45, 'Tentar novamente', {
            fontSize: '30px',
            fill: '#fff',
            backgroundColor: '#555',
            fontFamily: "Jersey",
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive().setDepth(999); // Botão de reiniciar
        let botaoContinuar = this.add.text(centerX, centerY + 120, 'Continuar', {
            fontSize: '30px',
            fill: '#fff',
            backgroundColor: '#00ff00',
            fontFamily: "Jersey",
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive().setDepth(999); // Botão de continuar

        // Ação do botão continuar
        botaoContinuar.on('pointerdown', () => {
            const posicaoEntrada = this.registry.get("posicaoEntrada"); // Verifica posição de entrada salva
            if (posicaoEntrada) {
                this.registry.set("posicaoSaida", posicaoEntrada); // Usa posição salva
            } else {
                this.registry.set("posicaoSaida", { x: 330, y: 1200 }); // Posição padrão
            }
            this.scene.start('SceneJogo'); // Volta para o mapa principal
        });

        botaoReiniciar.on('pointerdown', () => this.resetarMinigame()); // Reinicia o minigame

        this.popupVitoria = this.add.container(0, 0, [bloqueioFundo, popup, texto, estrelasTexto, botaoReiniciar, botaoContinuar]).setDepth(999); // Agrupa elementos
    }

    // Calcula o número de estrelas com base no tempo restante
    calcularEstrelas(tempoRestante) {
        if (tempoRestante > 200) return 3; // 3 estrelas se sobrar mais de 200s
        if (tempoRestante > 100) return 2; // 2 estrelas se sobrar mais de 100s
        return 1; // 1 estrela caso contrário
    }

    // Destaca os indicadores afetados pela escolha
    destacarParametrosAfetados(efeitos) {
        const tamanhoBase = 7; // Tamanho base do círculo
        const multiplicadorTamanho = 1.8; // Multiplicador baseado no valor do efeito
        const cor = 0xcf7800; // Cor laranja da Mars

        for (const nome in this.circulosIndicadores) {
            const valor = efeitos[nome];
            const circulo = this.circulosIndicadores[nome];

            if (valor !== undefined && valor !== 0) {
                const tamanho = tamanhoBase + Math.abs(valor) * multiplicadorTamanho; // Calcula tamanho do círculo

                circulo
                    .setVisible(true) // Mostra o círculo
                    .setRadius(tamanho) // Define o tamanho
                    .setScale(1) // Mantém escala padrão
                    .setFillStyle(cor, 0.8) // Preenche com cor laranja
                    .setStrokeStyle(2, 0x444444); // Adiciona contorno cinza
            } else {
                circulo.setVisible(false); // Esconde se não afetado
            }
        }
    }

    // Reseta os destaques dos indicadores
    resetarDestaquesParametros() {
        for (const nome in this.circulosIndicadores) {
            this.circulosIndicadores[nome].setVisible(false); // Esconde todos os círculos
        }
    }
}