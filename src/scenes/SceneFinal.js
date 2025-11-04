// Cena final do jogo, com créditos e conclusão da jornada
export default class SceneFinal extends Phaser.Scene {
    constructor() {
        super("SceneFinal"); // Define a cena com chave única
    }

    // Configurações fixas da cena
    CONFIG = {
        VELOCIDADE_MOVIMENTO: 38, // Velocidade do jogador ao caminhar
        VELOCIDADE_CREDITOS: 50, // Velocidade de rolagem dos créditos
        DESTINO_X: 1880, // Posição X da porta final
    };

    // Carrega os assets necessários para a cena
    preload() {
        this.load.image("background", "src/assets/imagens/imagensTelaFinal/FundoFinal.png"); // Imagem de fundo
        this.load.atlas("jogadorAtlas", "src/assets/sprites/spritesheet.png", "src/assets/sprites/sprites.json"); // Spritesheet do jogador
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'); // Carrega a fonte Jersey via Google Fonts
        this.load.audio("musicaFinal", "src/assets/sounds/Final.wav"); 
    }

    // Configura a cena ao iniciar
    create() {
        this.sound.stopAll(); // Para músicas de cenas anteriores
        this.adicionarFundo(); // Adiciona o fundo da cena
        this.criarJogador(); // Cria o sprite do jogador
        this.criarAnimacoes(); // Configura as animações do jogador
        this.criarPortaFinal(); // Cria a porta que recarrega a página

        if (this.cache.audio.exists("musicaFinal")) {
            console.log("Áudio 'musicaFinal' encontrado no cache");
            this.musica = this.sound.add("musicaFinal", {
                loop: true, // Repete a música
                volume: 0.5 // Volume reduzido
            });
            this.musica.play();
        } else {
            console.error("Áudio 'musicaFinal' não encontrado no cache. Verifique o caminho ou o carregamento.");
        }

        
        // Carrega a fonte Jersey e cria os créditos quando pronta
        WebFont.load({
            google: {
                families: ['Jersey'] // Fonte usada nos créditos
            },
            active: () => {
                this.criarCreditos(); // Cria os créditos após a fonte carregar
            }
        });

        this.cursors = this.input.keyboard.createCursorKeys(); // Configura controles (não usados diretamente aqui)
    }

    shutdown() {
        if (this.musica && this.musica.isPlaying) {
            this.musica.stop();
        }
    }

    // Adiciona o fundo da cena
    adicionarFundo() {
        const { width, height } = this.sys.game.config; // Pega largura e altura da tela
        this.background = this.add.image(0, 0, "background")
            .setOrigin(0, 0) // Posiciona no canto superior esquerdo
            .setDisplaySize(width, height); // Ajusta ao tamanho da tela
    }

    // Cria o sprite do jogador
    criarJogador() {
        this.jogadorSprite = this.physics.add.sprite(
            100, // Posição inicial X
            this.sys.game.config.height - 450, // Posição inicial Y (ajustada para o chão)
            "jogadorAtlas" // Spritesheet do jogador
        )
            .setScale(3) // Aumenta o tamanho do sprite
            .setCollideWorldBounds(true); // Impede que o jogador saia da tela
    }

    // Cria a porta final que recarrega a página
    criarPortaFinal() {
        this.porta = this.physics.add.staticSprite(
            this.CONFIG.DESTINO_X, // Posição X definida no CONFIG
            this.sys.game.config.height - 150, // Posição Y (perto do chão)
            null // Sem imagem visível
        )
            .setSize(50, 100) // Define o tamanho da área de colisão
            .setVisible(false); // Torna invisível

        // Define a interação com a porta
        this.physics.add.overlap(this.jogadorSprite, this.porta, () => {
            window.location.reload(); // Recarrega a página ao colidir
        });
    }

    // Configura a animação de caminhar do jogador
    criarAnimacoes() {
        this.anims.create({
            key: "caminhar", // Nome da animação
            frames: this.anims.generateFrameNames("jogadorAtlas", {
                prefix: "direita", // Frames da direção "direita"
                start: 0,
                end: 3,
                zeroPad: 4 // Preenche com zeros (ex.: direita0000)
            }),
            frameRate: 10, // Velocidade da animação
            repeat: -1 // Repete indefinidamente
        });
        this.jogadorSprite.play("caminhar"); // Inicia a animação
    }

    // Cria o texto dos créditos
    criarCreditos() {
        // Texto dos créditos com enredo e agradecimentos
        this.creditosTexto = this.add.text(
            this.sys.game.config.width / 2, // Centraliza horizontalmente
            1600, // Posição inicial Y (abaixo da tela)
            "O enredo\n\nA jornada de Choco pelos três estágios do jogo representa, metaforicamente, o percurso de um candidato no processo seletivo da Mars. Cada fase dissolve gradualmente o nervosismo e constrói a confiança: começamos na Casa de Frank, enfrentando desafios práticos que desconstroem os primeiros medos e trabalham o princípio qualidade da Mars; seguimos para a Fábrica de 1929, onde colocamos o jogador para tomar decisões difíceis de um administrador e trabalhamos os valores da responsabilidade e eficiência; e finalmente chegamos à Empresa do futuro, onde somos testados em uma posição temporária de contratante. Ao sermos bem-sucedidos, conquistamos os princípios essenciais de mutualidade e liberdade, demonstrando que o candidato está emocionalmente preparado para encarar a entrevista com autenticidade e tranquilidade.\n\nCréditos Finais\n\nDesenvolvedores:\nAnny Cerazi\nCatarina Sayuri\nEduardo Duarte\nJoão Freitas\nLuigi Garotti\nPaulo Henrique\n\nOrientação:\nFabiana Martins – Módulo 1, Grupo 2, Turma 17\n\nAgradecimentos Especiais:\nA Mars, por inspirar a criação deste jogo e por seus valores fundamentais que foram trabalhados ao longo do projeto. Aos nossos colegas, professores e todos que contribuíram diretamente ou indiretamente para o sucesso desta jornada.\nAgradecimento Final: Gostaríamos de expressar nossa sincera gratidão ao Inteli, à Mars e a todos que tornaram possível a criação deste projeto. Através deste jogo, buscamos transmitir os valores centrais da Mars, guiando os jogadores por uma linha do tempo que começa em 1911, na casa de Frank Mars, e segue até os dias atuais no escritório de pet care. Cada fase foi pensada para proporcionar uma experiência imersiva e educativa aos candidatos ao processo seletivo de estágio. Agradecemos especialmente ao nosso time, que se dedicou e trabalhou incansavelmente para transformar este projeto em realidade. O aprendizado e o crescimento ao longo do processo foram imensuráveis, e este projeto é o reflexo de nosso compromisso e esforço coletivo. A todos que nos apoiaram, nosso muito obrigado!",
            {
                fontFamily: "Jersey", // Fonte usada
                fontSize: "30px", // Tamanho da fonte
                fill: "#FFFFFF", // Cor do texto (branco)
                wordWrap: { width: 600, useAdvancedWrap: true }, // Quebra de linha com largura máxima
                align: "center" // Alinhamento centralizado
            }
        )
            .setOrigin(0.5) // Centraliza horizontalmente
            .setDepth(1); // Camada acima do fundo
    }

    // Atualiza a cena a cada frame
    update() {
        this.jogadorSprite.setVelocityX(this.CONFIG.VELOCIDADE_MOVIMENTO); // Move o jogador para a direita

        // Faz os créditos subirem
        if (this.creditosTexto) {
            this.creditosTexto.y -= this.CONFIG.VELOCIDADE_CREDITOS * this.game.loop.delta / 1000; // Ajusta a posição Y com base no tempo
        }

        // Recarrega a página se o jogador atingir a posição final
        if (this.jogadorSprite.x >= this.CONFIG.DESTINO_X) {
            window.location.reload(); // Recarrega a página
        }
    }
}