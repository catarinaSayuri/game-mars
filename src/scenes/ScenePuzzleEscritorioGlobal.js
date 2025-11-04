export default class ScenePuzzleEscritorioGlobal extends Phaser.Scene {
    constructor() {
        super({ key: "ScenePuzzleEscritorioGlobal" });
    }
    preload() {
        this.carregarAssetsPersonagens();
        this.carregarAssetsInterface();
        this.load.on('complete', () => console.log('Assets do minigame carregados'));
        this.load.on('loaderror', (file) => console.error('Erro ao carregar:', file.key));
    }
    carregarAssetsPersonagens() {
        const personagens = [
            "popUpAnaLima", "popUpAndreSilva", "popUpBeatrizSouza", "popUpBrunoTavares",
            "popUpElisaNunes", "popUpFernandaCosta", "popUpFranciscoMelo", "popUpGabrielAlves",
            "popUpVanessaCardoso", "popUpJoaoLima", "popUpJuliaAlves", "popUpLiaMendes",
            "popUpLucasRocha", "popUpMatheusReis", "popUpNataliaBarros", "popUpPedroNunes",
            "popUpSabrinaMelo", "popUpThiagoMendes"
        ];
        personagens.forEach(personagem => {
            this.load.image(personagem, `src/assets/imagens/imagensNivelTres/personagens/${personagem.split('popUp')[1]}.png`);
        });
    }
    carregarAssetsInterface() {
        this.load.image("pontoMarcado", "src/assets/imagens/imagensNivelTres/pontoMarcado.png");
        this.load.image("pontoVazio", "src/assets/imagens/imagensNivelTres/pontoVazio.png");
        this.load.image("popUpResultado", "src/assets/imagens/imagensNivelTres/popUpResultado.png");
    }
    create(data) {
        this.personagensPorSetor = {
            global: [
                { nome: "Ana Lima", soft: 3, hard: 3, imagem: "popUpAnaLima" },
                { nome: "Andre Silva", soft: 4, hard: 2, imagem: "popUpAndreSilva" },
                { nome: "Beatriz Souza", soft: 4, hard: 2, imagem: "popUpBeatrizSouza" },
                { nome: "Bruno Tavares", soft: 4, hard: 2, imagem: "popUpBrunoTavares" },
                { nome: "Elisa Nunes", soft: 4, hard: 2, imagem: "popUpElisaNunes" },
                { nome: "Fernanda Costa", soft: 1, hard: 5, imagem: "popUpFernandaCosta" }
            ]
        };
        this.setorAtual = "global";
        this.equipeSelecionada = [];
        this.personagensDisponiveis = [...this.personagensPorSetor[this.setorAtual]];
        this.personagemAtualIndex = 0;
        this.configurarInterface();
        this.exibirPersonagemAtual();
    }
    configurarInterface() {
        this.containerPersonagem = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY)
            .setDepth(1)
            .setVisible(false);
        this.containerResultado = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY)
            .setDepth(2)
            .setVisible(false);
    }
    exibirPersonagemAtual() {
        this.containerPersonagem.removeAll(true);
        const personagem = this.personagensDisponiveis[this.personagemAtualIndex];
        console.log(`Exibindo personagem: ${personagem.nome}`);
        const fundo = this.add.image(0, 0, personagem.imagem).setOrigin(0.5).setScale(2);
        const btnConfirmar = this.add.rectangle(-150, -38, 200, 80)
            .setInteractive()
            .on('pointerdown', () => this.confirmarPersonagem());
        const btnDescartar = this.add.rectangle(110, -38, 200, 80)
            .setInteractive()
            .on('pointerdown', () => this.descartarPersonagem());
        this.containerPersonagem.add([fundo, btnConfirmar, btnDescartar]);
        this.containerPersonagem.setVisible(true);
    }
    confirmarPersonagem() {
        const personagem = this.personagensDisponiveis[this.personagemAtualIndex];
        this.equipeSelecionada.push(personagem);
        this.personagensDisponiveis.splice(this.personagemAtualIndex, 1);
        if (this.equipeSelecionada.length === 4) {
            this.exibirResultado();
        } else {
            if (this.personagensDisponiveis.length > 0) {
                if (this.personagemAtualIndex >= this.personagensDisponiveis.length) {
                    this.personagemAtualIndex = 0;
                }
                this.exibirPersonagemAtual();
            } else {
                console.log("Sem personagens disponíveis, reiniciando loop...");
                this.personagemAtualIndex = 0;
                this.exibirPersonagemAtual();
            }
        }
    }
    descartarPersonagem() {
        this.avancarPersonagem();
        this.exibirPersonagemAtual();
    }
    avancarPersonagem() {
        this.personagemAtualIndex = (this.personagemAtualIndex + 1) % this.personagensDisponiveis.length;
    }
    
    exibirResultado() {
        this.containerPersonagem.setVisible(false);
        this.containerResultado.removeAll(true);
        const mediaSoft = this.equipeSelecionada.reduce((sum, p) => sum + p.soft, 0) / 4;
        const mediaHard = this.equipeSelecionada.reduce((sum, p) => sum + p.hard, 0) / 4;
        const fundo = this.add.image(0, 0, "popUpResultado").setOrigin(0.5).setScale(1.3);
        const textoTitulo = this.add.text(-30, -320, "Média de Talentos", {
            fontSize: "42px",
            fill: "#000",
            align: "center",
            fontFamily: "Jersey"
        }).setOrigin(0.5);
        const subtituloSoft = this.add.text(-200, -220, "Habilidades Interpessoais", {
            fontSize: "34px",
            fill: "#000",
            align: "center",
            fontFamily: "Jersey",
            wordWrap: { width: 200 }
        }).setOrigin(0.5);
        const pontoSpacing = 50;
        const softStartX = -290;
        const softY = -150;
        const pontosSoft = [];
        for (let i = 0; i < 5; i++) {
            const ponto = this.add.image(softStartX + i * pontoSpacing, softY,
                i < Math.round(mediaSoft) ? "pontoMarcado" : "pontoVazio").setScale(1.2);
            pontosSoft.push(ponto);
        }
        const subtituloHard = this.add.text(126, -220, "Habilidades Técnicas", {
            fontSize: "34px",
            fill: "#000",
            align: "center",
            fontFamily: "Jersey",
            wordWrap: { width: 200 }
        }).setOrigin(0.5);
        const hardStartX = 20;
        const hardY = -150;
        const pontosHard = [];
        for (let i = 0; i < 5; i++) {
            const ponto = this.add.image(hardStartX + i * pontoSpacing, hardY,
                i < Math.round(mediaHard) ? "pontoMarcado" : "pontoVazio").setScale(1.2);
            pontosHard.push(ponto);
        }
        const subtituloDesempenho = this.add.text(-30, 50, "Desempenho Geral", {
            fontSize: "42px",
            fill: "#000",
            align: "center",
            fontFamily: "Jersey"
        }).setOrigin(0.5);
        const diferenca = Math.abs(mediaSoft - mediaHard);
        let textoConclusao;
        const sucesso = diferenca <= 1;
        if (sucesso) {
            textoConclusao = this.add.text(-30, 150, "Excelente trabalho! Sua equipe estava bem equilibrada e o projeto foi um sucesso!", {
                fontSize: "42px",
                fill: "#000",
                align: "center",
                fontFamily: "Jersey",
                wordWrap: { width: 600 }
            }).setOrigin(0.5);
        } else {
            textoConclusao = this.add.text(-30, 150, "Essa equipe não estava bem distribuída. Ajuste melhor as habilidades e tente novamente!", {
                fontSize: "42px",
                fill: "#000",
                align: "center",
                fontFamily: "Jersey",
                wordWrap: { width: 600 }
            }).setOrigin(0.5);
        }
        this.containerResultado.add([
            fundo,
            textoTitulo,
            subtituloSoft,
            ...pontosSoft,
            subtituloHard,
            ...pontosHard,
            subtituloDesempenho,
            textoConclusao
        ]);
        this.containerResultado.setVisible(true);
        fundo.setInteractive().on('pointerdown', () => {
            this.events.emit("equipeConcluida", sucesso); // Dispara o evento com o resultado
            this.containerResultado.setVisible(false);
            this.scene.resume("SceneEscritorio");
            this.scene.stop("ScenePuzzleEscritorioGlobal");
            console.log("Retornando para SceneEscritorio");
        });
    }
}
