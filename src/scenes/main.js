// Importação das diferentes cenas do jogo
import SceneEscritorio from "./SceneEscritorio.js";
import SceneFabrica from "./SceneFabrica.js";
import SceneInicial from "./SceneInicial.js";
import SceneJogo from "./SceneJogo.js";
import ScenePuzzleCozinhaCacau from "./ScenePuzzleCozinha.js";
import ScenePuzzleCozinhaAcucar from "./ScenePuzzleCozinhaAcucar.js";
import ScenePuzzleCozinhaFinal from "./ScenePuzzleCozinhaFinal.js";
import ScenePuzzleCozinhaManteiga from "./ScenePuzzleCozinhaManteiga.js";
import ScenePuzzleEscritorioGlobal from "./ScenePuzzleEscritorioGlobal.js";
import ScenePuzzleEscritorioPet from "./ScenePuzzleEscritorioPet.js";
import ScenePuzzleEscritorioWangley from "./ScenePuzzleEscritorioWangley.js";
import SceneQuarto from "./SceneQuarto.js";
import SceneTutorial from "./SceneTutorial.js";
import SceneFinal from "./SceneFinal.js";
// Cada import traz uma classe de cena específica, representando uma parte do jogo (telas, puzzles ou ambientes).

// Objeto global para rastrear o progresso do jogador
window.progresso = {
  fase1: false, // Indica se a fase 1 foi concluída
  fase2: false, // Indica se a fase 2 foi concluída
  fase3: false  // Indica se a fase 3 foi concluída
}
// Definido no escopo global (window) para ser acessível por todas as cenas.

// Configuração do jogo Phaser
const config = {
  type: Phaser.AUTO, // Phaser escolhe entre WebGL ou Canvas para renderização
  pixelArt: true, // Garante bordas nítidas para gráficos pixelados, sem suavização
  width: 1920, // Define a resolução base do jogo como 1920x1080
  height: 1080, // Altura da resolução Full HD
  backgroundColor: "#000000", // Define o fundo do jogo como preto
  scale: {
    mode: Phaser.Scale.FIT, // Ajusta o jogo para caber na tela, mantendo a proporção
    autoCenter: Phaser.Scale.CENTER // Centraliza o jogo na janela
  },
  physics: {
    default: "arcade", // Usa o sistema de física Arcade, ideal para jogos 2D simples
    arcade: {
      gravity: { y: 0 }, // Desativa a gravidade vertical para um jogo sem quedas
      debug: false // Desativa linhas de depuração da física
    }
  },
  // Lista de cenas que o jogo usa, carregadas na ordem definida
  scene: [
    SceneInicial, // Tela de título do jogo
    SceneTutorial, // Cena que ensina o jogador a jogar
    SceneJogo, // Cena principal 
    SceneQuarto, // Ambiente da cozinha 
    SceneFabrica, // Ambiente da fábrica
    ScenePuzzleCozinhaCacau, // Puzzle sobre cacau
    ScenePuzzleCozinhaManteiga, // Puzzle sobre manteiga
    ScenePuzzleCozinhaAcucar, // Puzzle sobre açúcar
    ScenePuzzleCozinhaFinal, // Cena final dos puzzles da cozinha
    SceneEscritorio, // Ambiente do escritório
    ScenePuzzleEscritorioGlobal, // Puzzle específico no escritório
    ScenePuzzleEscritorioPet, // Puzzle no escritório com tema de pet
    ScenePuzzleEscritorioWangley, // Puzzle relacionado a "snack"
    SceneFinal // Cena de encerramento do jogo
  ]
};

// Cria o jogo com base na configuração fornecida
const game = new Phaser.Game(config);

// Ajusta o tamanho do jogo quando a janela do navegador é redimensionada
window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight); // Redimensiona para as dimensões da janela
});