export default class ScenePuzzleEscritorioPet extends Phaser.Scene {
    constructor() {
        super({ key: "ScenePuzzleEscritorioPet" });
    }

    preload() {
        this.carregarAssetsPersonagens();
        this.carregarAssetsInterface();
        this.load.on('complete', () => console.log('Assets do minigame Pet carregados'));
        this.load.on('loaderror', (file) => console.error('Erro ao carregar:', file.key));
    }

    carregarAssetsPersonagens() {
        const personagens = [
            "popUpFranciscoMelo", "popUpGabrielAlves", "popUpVanessaCardoso",
            "popUpJoaoLima", "popUpJuliaAlves", "popUpLiaMendes"
        ];

        personagens.forEach(personagem => {
            this.load.image(personagem, `src/assets/imagens/imagensNivelTres/personagens/${personagem.split('popUp')[1]}.png`);
        });
    }

    carregarAssetsInterface() {
        this.load.image("pontoMarcado", "src/assets/imagens/imagensNivelTres/pontoMarcado.png");
        this.load.image("pontoVazio", "src/assets/imagens/imagensNivelTres/pontoVazio.png");
        this.load.image("popUpResultado", "src/assets/imagens/imagensNivelTres/popUpResultado.png");
        this.load.image("popupFinalTres", "src/assets/imagens/imagensNivelTres/popUpFinalTres.png");
        this.load.image("popupFinalTresGeral", "src/assets/imagens/imagensNivelTres/popUpFinalGeral.png");
        this.load.image("setaPopUpProximo", "src/assets/imagens/imagesBotoes/proximoPopUp.png");
    }

    create(data) {
        this.personagensPorSetor = {
            pet: [
                { nome: "Francisco Melo", soft: 2, hard: 4, imagem: "popUpFranciscoMelo" },
                { nome: "Gabriel Alves", soft: 3, hard: 3, imagem: "popUpGabrielAlves" },
                { nome: "Vanessa Cardoso", soft: 5, hard: 1, imagem: "popUpVanessaCardoso" },
                { nome: "Joao Lima", soft: 2, hard: 4, imagem: "popUpJoaoLima" },
                { nome: "Julia Alves", soft: 4, hard: 2, imagem: "popUpJuliaAlves" },
                { nome: "Lia Mendes", soft: 3, hard: 3, imagem: "popUpLiaMendes" }
            ]
        };

        this.setorAtual = "pet";
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

        if (this.personagensDisponiveis.length === 0) {
            console.log("Todos os personagens foram selecionados ou descartados.");
            return;
        }

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

        this.personagensDisponiveis.splice(this.personagemAtualIndex, 1); // Corrige o splice incompleto

        if (this.equipeSelecionada.length === 4) {
            this.exibirResultado();
        } else {
            if (this.personagensDisponiveis.length > 0) {
                if (this.personagemAtualIndex >= this.personagensDisponiveis.length) {
                    this.personagemAtualIndex = 0;
                }
                this.exibirPersonagemAtual();
            } else {
                console.log("Sem personagens disponíveis.");
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

    concluirEquipe(equipe) {
        const sucesso = this.verificarEquipeEquilibrada(equipe); // Sua lógica
        this.events.emit("equipeConcluida", sucesso);
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

        const pontoSpacing = 40;
        const softStartX = -270;
        const softY = -150;
        const pontosSoft = [];
        for (let i = 0; i < 5; i++) {
            const ponto = this.add.image(softStartX + i * pontoSpacing, softY,
                i < Math.round(mediaSoft) ? "pontoMarcado" : "pontoVazio").setScale(1);
            pontosSoft.push(ponto);
        }

        const subtituloHard = this.add.text(126, -220, "Habilidades Técnicas", {
            fontSize: "34px",
            fill: "#000",
            align: "center",
            fontFamily: "Jersey",
            wordWrap: { width: 200 }
        }).setOrigin(0.5);

        const hardStartX = 40;
        const hardY = -150;
        const pontosHard = [];
        for (let i = 0; i < 5; i++) {
            const ponto = this.add.image(hardStartX + i * pontoSpacing, hardY,
                i < Math.round(mediaHard) ? "pontoMarcado" : "pontoVazio").setScale(1);
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
        if (diferenca <= 1) {
            textoConclusao = this.add.text(-30, 150, "Excelente trabalho! Sua equipe estava bem equilibrada e o projeto foi um sucesso!", {
                fontSize: "42px",
                fill: "#000",
                align: "center",
                fontFamily: "Jersey",
                wordWrap: { width: 600 }
            }).setOrigin(0.5);

            fundo.setInteractive().on('pointerdown', () => {
                this.containerResultado.setVisible(false);
                this.exibirPopupFinalTres();
            });
        } else {
            textoConclusao = this.add.text(-30, 150, "Essa equipe não estava bem distribuída. Ajuste melhor as habilidades e tente novamente!", {
                fontSize: "42px",
                fill: "#000",
                align: "center",
                fontFamily: "Jersey",
                wordWrap: { width: 600 }
            }).setOrigin(0.5);

            fundo.setInteractive().on('pointerdown', () => {
                this.containerResultado.setVisible(false);
                this.scene.resume("SceneEscritorio");
                this.scene.stop("ScenePuzzleEscritorioPet");
                console.log("Retornando para SceneEscritorio");
            });
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
    }

    exibirPopupFinalTres() {
        const popupFinal = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "popupFinalTres")
            .setOrigin(0.5)
            .setScale(1.3)
            .setDepth(3);

        const setaProximo = this.add.image(this.cameras.main.centerX + -30, this.cameras.main.centerY + 200, "setaPopUpProximo")
            .setOrigin(0.5)
            .setScale(1.5)
            .setDepth(4) // Aumenta a profundidade para garantir que fique acima do popup
            .setInteractive()
            .on('pointerdown', () => {
                popupFinal.destroy();
                setaProximo.destroy();
                this.exibirPopupFinalTresGeral();
            });

        popupFinal.setInteractive().on('pointerdown', () => {
            popupFinal.destroy();
            setaProximo.destroy();
            this.exibirPopupFinalTresGeral();
        });
    }

    exibirPopupFinalTresGeral() {
        const popupFinalGeral = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "popupFinalTresGeral")
            .setOrigin(0.5)
            .setScale(1.3)
            .setDepth(3);

        const setaProximoGeral = this.add.image(this.cameras.main.centerX + -30, this.cameras.main.centerY + 200, "setaPopUpProximo")
            .setOrigin(0.5)
            .setScale(1.5)
            .setDepth(4) // Aumenta a profundidade para garantir que fique acima do popup
            .setInteractive()
            .on('pointerdown', () => {
                popupFinalGeral.destroy();
                setaProximoGeral.destroy();
                this.scene.stop("ScenePuzzleEscritorioPet");
                this.scene.start("SceneFinal");
                console.log("Indo para SceneCreditos");
            });

        popupFinalGeral.setInteractive().on('pointerdown', () => {
            // Clicar no popupFinalGeral não faz nada além de permitir o clique na seta
        });
    }

    verificarEquipeEquilibrada(equipe) {
        const mediaSoft = equipe.reduce((sum, p) => sum + p.soft, 0) / equipe.length;
        const mediaHard = equipe.reduce((sum, p) => sum + p.hard, 0) / equipe.length;
        return Math.abs(mediaSoft - mediaHard) <= 1;
    }
}