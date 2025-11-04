// Cena inicial do jogo, com menu principal e configurações
export default class SceneInicial extends Phaser.Scene {
    constructor() {
        super("SceneInicial"); // Define a cena com chave única
    }

    // Configurações fixas da cena
    CONFIG = {
        FADE_DURATION: 1000, // Duração do efeito de fade em milissegundos
        PIXELATE_AMOUNT: 40, // Quantidade inicial de pixelização para transição
        PIXELATE_DURATION: 700, // Duração da animação de pixelização em milissegundos
        ASSETS: {
            botaoJogar: "src/assets/imagens/imagesBotoes/botao.png", // Botão "Jogar"
            fundo: "src/assets/imagens/imagesMapa/mapaInicial.png", // Fundo do menu
            botaoConfig: "src/assets/imagens/imagesBotoes/botaoc.png", // Botão "Configurações"
            botaoSair: "src/assets/imagens/imagesBotoes/botaosair.png", // Botão "Sair"
            configFundo: "src/assets/imagens/imagesPopUps/fundoConfig.png", // Fundo do popup de configurações
        },
        BOTOES: [
            { key: "botaoConfig", x: 100, y: 80, scale: 0.3, action: "openSettings" }, // Botão de configurações
            { key: "botaoSair", x: "center", y: 750, scale: 0.4, action: "fecharJogo" }, // Botão de sair
            { key: "botaoJogar", x: "center", y: 600, scale: 0.4, action: "startGame" } // Botão de jogar
        ]
    };

    // Carrega os assets antes de iniciar a cena
    preload() {
        this.carregarImagens(); // Carrega imagens e áudios
        this.load.on('complete', () => console.log('Todos os assets foram carregados com sucesso')); // Loga sucesso no carregamento
        this.load.on('loaderror', (file) => console.error('Erro ao carregar o arquivo:', file.key)); // Loga erros de carregamento
    }

    // Carrega as imagens e áudios definidos em CONFIG.ASSETS
    carregarImagens() {
        Object.entries(this.CONFIG.ASSETS).forEach(([key, path]) => {
            if (key === "musicaInicial") {
                console.log(`Carregando áudio: ${path}`); // Loga carregamento de áudio
                this.load.audio(key, path); // Carrega áudio se for "musicaInicial"
            } else {
                this.load.image(key, path); // Carrega imagem para outros assets
            }
        });
    }

    // Configura os elementos visuais e interativos da cena
    create() {
        this.sound.stopAll(); // Para músicas de cenas anteriores
        this.adicionarFundo(); // Adiciona o fundo da cena
        this.adicionarBotoes(); // Adiciona os botões do menu
        this.cameras.main.fadeIn(this.CONFIG.FADE_DURATION); // Aplica fade-in ao iniciar
        window.addEventListener("resize", this.redimensionarFundo.bind(this)); // Ajusta o fundo ao redimensionar a janela

        // Configura a música de fundo (se existir)
        if (this.cache.audio.has("musicaInicial")) {
            console.log("Áudio 'musicaInicial' encontrado no cache");
            this.musica = this.sound.add("musicaInicial", {
                loop: true, // Repete a música
                volume: 0.5 // Volume moderado
            });
            this.musica.play(); // Inicia a música
        } else {
            console.error("Áudio 'musicaInicial' não encontrado no cache.");
        }
    }

    // Para a música ao encerrar a cena
    shutdown() {
        if (this.musica?.isPlaying) {
            this.musica.stop(); // Para a música se estiver tocando
        }
    }

    // Adiciona o fundo da cena
    adicionarFundo() {
        this.fundo = this.add.image(0, 0, "fundo")
            .setOrigin(0, 0); // Posiciona no canto superior esquerdo
        this.redimensionarFundo(); // Ajusta o tamanho do fundo
    }

    // Adiciona os botões do menu principal
    adicionarBotoes() {
        this.CONFIG.BOTOES.forEach(({ key, x, y, scale, action }) => {
            const posX = x === "center" ? this.cameras.main.width / 2 : x; // Centraliza X se "center"
            const posY = y === "center" ? this.cameras.main.height / 2 : y; // Centraliza Y se "center"

            if (!this.textures.exists(key)) {
                console.error(`Textura não encontrada: ${key}`); // Loga erro se textura não existir
                return;
            }

            // Pega dimensões originais da imagem
            const frame = this.textures.get(key).getSourceImage();
            const larguraOriginal = frame.width;
            const alturaOriginal = frame.height;

            // Cria o botão
            const botao = this.add.image(posX, posY, key)
                .setScale(scale) // Aplica escala definida
                .setOrigin(0.5); // Centraliza o botão

            // Define margens para a área interativa
            const margemEsquerdaTela = 10;
            const margemCimaTela = 10;
            const margemBaixoTela = 10;

            const margemEsquerda = margemEsquerdaTela / scale;
            const margemCima = margemCimaTela / scale;
            const margemBaixo = margemBaixoTela / scale;

            const novaLargura = larguraOriginal - margemEsquerda;
            const novaAltura = alturaOriginal - margemCima - margemBaixo;

            // Configura a área interativa do botão
            botao.setInteractive({
                hitArea: new Phaser.Geom.Rectangle(0, 0, novaLargura, novaAltura), // Define área clicável
                hitAreaCallback: Phaser.Geom.Rectangle.Contains, // Verifica clique dentro da área
                useHandCursor: true // Mostra cursor de mão
            });

            // Ajusta a posição da área interativa
            botao.input.hitArea.setPosition(
                -larguraOriginal / 10 + margemEsquerda,
                -alturaOriginal / 3.4 + margemCima
            );

            // Define ações ao clicar no botão
            botao.on("pointerdown", () => {
                if (typeof this[action] === "function") {
                    this[action](); // Executa a ação associada
                } else {
                    console.warn(`Ação '${action}' não encontrada`); // Loga aviso se ação não existir
                }
            });

            // Efeitos visuais ao passar o mouse
            botao.on("pointerover", () => botao.setTint(0xaaaaaa)); // Escurece ao passar o mouse
            botao.on("pointerout", () => botao.clearTint()); // Remove efeito ao sair
        });
    }

    // Inicia o jogo com transição para a cena tutorial
    startGame() {
        const pixelated = this.cameras.main.postFX.addPixelate(this.CONFIG.PIXELATE_AMOUNT); // Aplica efeito de pixelização
        this.cameras.main.fadeOut(this.CONFIG.FADE_DURATION); // Aplica fade-out

        this.add.tween({
            targets: pixelated,
            duration: this.CONFIG.PIXELATE_DURATION,
            amount: 15, // Reduz a pixelização
            onComplete: () => this.scene.start("SceneTutorial") // Muda para a cena tutorial
        });
    }

    // Abre o menu de configurações
    openSettings() {
        this.aplicarEfeitoBlur(); // Aplica blur no fundo
        this.criarFiltroBlur(); // Adiciona filtro escurecido
        this.criarPopupConfig(); // Cria o popup de configurações
        this.configurarInteracoes(); // Configura interações do popup
    }

    // Aplica efeito de blur no fundo
    aplicarEfeitoBlur() {
        this.fundo.setPostPipeline("Blur"); // Adiciona pipeline de blur ao fundo
    }

    // Cria o filtro de blur sobreposto
    criarFiltroBlur() {
        this.filtroBlur = this.add.graphics()
            .fillStyle(0x000000, 0.8) // Cor preta com opacidade
            .fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height) // Preenche a tela
            .setDepth(1); // Camada acima do fundo
    }

    // Cria o popup de configurações
    criarPopupConfig() {
        this.configFundo = this.add.image(
            this.cameras.main.width / 2, // Centraliza horizontalmente
            this.cameras.main.height / 2, // Centraliza verticalmente
            "configFundo" // Imagem do fundo do popup
        )
            .setOrigin(0.5) // Centraliza a imagem
            .setInteractive() // Torna interativo
            .setDepth(2); // Camada acima do filtro

        this.settingsGroup = this.add.group(); // Grupo para os elementos do popup
        this.adicionarElementosConfig(); // Adiciona os elementos visuais
        this.redimensionarConfig(); // Ajusta o tamanho do popup
        this.resizeHandler = this.redimensionarTudo.bind(this); // Handler para redimensionamento
        window.addEventListener("resize", this.resizeHandler); // Escuta redimensionamento da janela
    }

    // Adiciona elementos visuais ao popup de configurações
    adicionarElementosConfig() {
        const centerX = this.cameras.main.width / 2; // Centro horizontal
        const centerY = this.cameras.main.height / 2; // Centro vertical
        const elementos = [
            { text: "Configurações", x: centerX, y: centerY - 150, size: 32 }, // Título
            { text: "Volume:", x: centerX - 100, y: centerY - 50, size: 24 }, // Rótulo de volume
            { text: "100%", x: centerX + 100, y: centerY - 50, size: 24, origin: { x: 1, y: 0.5 }, ref: "volumeValue" }, // Valor do volume
            { text: "+", x: centerX + 120, y: centerY - 50, size: 24, interactive: true, ref: "volumeUp" }, // Botão de aumentar volume
            { text: "-", x: centerX + 160, y: centerY - 50, size: 24, interactive: true, ref: "volumeDown" }, // Botão de diminuir volume
            { text: "Fechar", x: centerX, y: centerY + 50, size: 24, interactive: true, ref: "closeBtn" } // Botão de fechar
        ];

        this.volume = 1.0; // Volume inicial (100%)

        elementos.forEach(({ text, x, y, size, origin = { x: 0.5, y: 0.5 }, interactive, ref }) => {
            const elemento = this.add.text(x, y, text, {
                fontSize: `${size}px`,
                fontFamily: "Jersey",
                color: "#FFFFFF",
                align: "center"
            })
                .setOrigin(origin.x, origin.y) // Define origem do texto
                .setDepth(2); // Camada acima do fundo do popup

            if (interactive) elemento.setInteractive(); // Torna interativo se necessário
            if (ref) this[ref] = elemento; // Armazena referência ao elemento
            this.settingsGroup.add(elemento); // Adiciona ao grupo
        });
    }

    // Configura as interações dos botões do popup
    configurarInteracoes() {
        this.volumeUp.on("pointerdown", () => this.ajustarVolume(0.1)); // Aumenta o volume
        this.volumeDown.on("pointerdown", () => this.ajustarVolume(-0.1)); // Diminui o volume
        this.closeBtn.on("pointerdown", () => this.fecharConfig()); // Fecha o popup

        // Efeitos visuais ao passar o mouse
        [this.volumeUp, this.volumeDown, this.closeBtn].forEach(btn => {
            btn.on("pointerover", () => btn.setStyle({ color: "#FF0000" })); // Vermelho ao passar o mouse
            btn.on("pointerout", () => btn.setStyle({ color: "#FFFFFF" })); // Branco ao sair
        });
    }

    // Ajusta o volume do jogo
    ajustarVolume(delta) {
        this.volume = Math.max(0, Math.min(1.0, this.volume + delta)); // Limita entre 0 e 1
        this.volumeValue.setText(`${Math.round(this.volume * 100)}%`); // Atualiza o texto do volume
        this.sound.volume = this.volume; // Ajusta o volume geral
        if (this.musica) {
            this.musica.setVolume(this.volume); // Ajusta o volume da música
        }
    }

    // Fecha o popup de configurações
    fecharConfig() {
        this.settingsGroup.clear(true, true); // Remove todos os elementos do grupo
        window.removeEventListener("resize", this.resizeHandler); // Remove listener de redimensionamento
        this.configFundo.destroy(); // Remove o fundo do popup
        this.filtroBlur.destroy(); // Remove o filtro de blur
        this.fundo.removePostPipeline("Blur"); // Remove o efeito de blur do fundo
    }

    // Tenta fechar o jogo ou redireciona
    fecharJogo() {
        try {
            window.close(); // Tenta fechar a janela
        } catch (error) {
            window.location.href = "https://www.mars.com/about/the-five-principles"; // Redireciona se falhar
        }
    }

    // Redimensiona o fundo para se adaptar à tela
    redimensionarFundo() {
        const largura = this.scale.width; // Largura atual da tela
        const altura = this.scale.height; // Altura atual da tela
        const escalaX = largura / this.fundo.width; // Escala horizontal
        const escalaY = altura / this.fundo.height; // Escala vertical
        const escala = Math.max(escalaX, escalaY); // Usa a maior escala para cobrir a tela
        this.fundo.setScale(escala).setPosition(0, 0); // Aplica escala e repositiona
    }

    // Redimensiona o popup de configurações
    redimensionarConfig() {
        const { innerWidth: largura, innerHeight: altura } = window; // Dimensões da janela
        const escala = Math.max(largura / this.configFundo.width, altura / this.configFundo.height) * 0.5; // Calcula escala reduzida
        this.configFundo.setScale(escala).setPosition(largura / 2, altura / 2); // Aplica escala e centraliza

        const centerX = largura / 2; // Centro horizontal
        const centerY = altura / 2; // Centro vertical
        this.settingsGroup.getChildren().forEach((elemento, index) => {
            const posicoes = [
                { x: centerX, y: centerY - 150 }, // Título
                { x: centerX - 100, y: centerY - 50 }, // "Volume:"
                { x: centerX + 100, y: centerY - 50 }, // Valor do volume
                { x: centerX + 120, y: centerY - 50 }, // "+"
                { x: centerX + 160, y: centerY - 50 }, // "-"
                { x: centerX, y: centerY + 50 } // "Fechar"
            ];
            elemento.setPosition(posicoes[index].x, posicoes[index].y); // Reposiciona cada elemento
        });
    }

    // Redimensiona todos os elementos da cena
    redimensionarTudo() {
        this.redimensionarFundo(); // Ajusta o fundo
        if (this.filtroBlur) {
            this.filtroBlur.clear()
                .fillStyle(0x000000, 0.8) // Redesenha o filtro
                .fillRect(0, 0, window.innerWidth, window.innerHeight);
        }
        if (this.configFundo) this.redimensionarConfig(); // Ajusta o popup se aberto
    }
}