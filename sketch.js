let tela = "inicial"; // "inicial", "login", "cadastro", "jogos"
let botaoLogin, botaoCriar, botaoVoltar;
let inputConta, inputSenha, inputConfirmarSenha;

// Lista de usuários (Vai carregar o que estiver salvo no computador)
let usuariosCadastrados = []; 
let mensagemErro = "";

let estrelas = [];
let botoesJogos = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Carrega as contas que já estão salvas no computador
  let dadosSalvos = localStorage.getItem("meusUsuarios");
  if (dadosSalvos !== null) {
    usuariosCadastrados = JSON.parse(dadosSalvos);
  }

  // Criando as estrelas de fundo
  for (let i = 0; i < 100; i++) {
    estrelas.push({
      x: random(width),
      y: random(height),
      tamanho: random(1, 3),
      brilho: random(100, 255),
      velocidadePiscar: random(2, 5)
    });
  }
  
  // Criando os botões principais
  botaoLogin = createButton('Entrar');
  botaoLogin.size(140, 45);
  configurarEstiloBotao(botaoLogin, "#0070f3", "#0056b3");
  botaoLogin.mousePressed(aoClicarNoBotaoPrincipal);
  
  botaoCriar = createButton('Criar Conta');
  botaoCriar.size(140, 45);
  configurarEstiloBotao(botaoCriar, "#23a455", "#1a7c3f");
  botaoCriar.mousePressed(aoClicarNoBotaoSecundario);

  botaoVoltar = createButton('Voltar');
  botaoVoltar.size(80, 35);
  configurarEstiloBotao(botaoVoltar, "#2c313c", "#1a1d24");
  botaoVoltar.mousePressed(() => {
    mensagemErro = "";
    alternarTela("inicial");
  });
  
  inputConta = createInput('');
  inputConta.attribute('placeholder', 'Sua conta (Nome de usuário)');
  configurarEstiloInput(inputConta);
  
  inputSenha = createInput('', 'password');
  inputSenha.attribute('placeholder', 'Sua senha');
  configurarEstiloInput(inputSenha);
  
  inputConfirmarSenha = createInput('', 'password');
  inputConfirmarSenha.attribute('placeholder', 'Confirme sua senha');
  configurarEstiloInput(inputConfirmarSenha);
  
  atualizarElementos();
}

function draw() {
  if (tela === "jogos") {
    redesenharPainelJogos();
    return;
  }

  // Fundo Espacial com degradê
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let cor = inter < 0.5 ? lerpColor(color("#08051a"), color("#140d36"), inter * 2) : lerpColor(color("#140d36"), color("#03020a"), (inter - 0.5) * 2);
    stroke(cor);
    line(0, y, width, y);
  }
  noStroke();
  
  // Estrelas piscando
  for (let i = 0; i < estrelas.length; i++) {
    let e = estrelas[i];
    e.brilho += e.velocidadePiscar;
    if (e.brilho > 255 || e.brilho < 100) e.velocidadePiscar *= -1;
    fill(255, 255, 255, e.brilho);
    ellipse(e.x, e.y, e.tamanho, e.tamanho);
  }

  // Caixa Central (Card)
  let larguraBox = 420;
  let alturaBox = tela === "cadastro" ? 460 : 390;
  let xBox = (width - larguraBox) / 2;
  let yBox = (height - alturaBox) / 2;
  
  fill("#111216ee"); 
  rect(xBox, yBox, larguraBox, alturaBox, 16);
  
  fill("#ffffff");
  textAlign(CENTER, TOP);
  
  if (tela === "inicial") {
    textSize(26);
    text("Bem-vindo", width / 2, yBox + 60);
    textSize(14);
    fill("#8a94a6");
    text("Escolha uma opção para acessar a plataforma", width / 2, yBox + 105);
    
  } else if (tela === "login") {
    textSize(24);
    text("Acessar Conta", width / 2, yBox + 50);
    textSize(14);
    fill("#8a94a6");
    text("Insira as credenciais da sua conta", width / 2, yBox + 90);
    
  } else if (tela === "cadastro") {
    textSize(24);
    text("Nova Conta", width / 2, yBox + 40);
    textSize(14);
    fill("#8a94a6");
    text("Escolha um nome de conta e senha", width / 2, yBox + 75);
  }

  if (mensagemErro !== "" && tela !== "inicial") {
    fill("#ff4757");
    textSize(13);
    textAlign(CENTER, TOP);
    text(mensagemErro, width / 2, yBox + (tela === "cadastro" ? 315 : 255));
  }
}

function aoClicarNoBotaoPrincipal() {
  if (tela === "inicial") {
    alternarTela("login");
  } else if (tela === "login") {
    let contaDigitada = inputConta.value().trim();
    let senhaDigitada = inputSenha.value();

    if (contaDigitada === "" || senhaDigitada === "") {
      mensagemErro = "❌ Preencha todos os campos!";
      return;
    }

    let usuarioEncontrado = usuariosCadastrados.find(u => u.conta === contaDigitada);

    if (!usuarioEncontrado) {
      mensagemErro = "❌ Conta não encontrada! Cadastre-se primeiro.";
    } else if (usuarioEncontrado.senha !== senhaDigitada) {
      mensagemErro = "❌ Senha incorreta!";
    } else {
      mensagemErro = "";
      IniciarPainelJogos(); 
    }
  }
}

function aoClicarNoBotaoSecundario() {
  if (tela === "inicial") {
    alternarTela("cadastro");
  } else if (tela === "cadastro") {
    let contaDigitada = inputConta.value().trim();
    let senhaDigitada = inputSenha.value();
    let confirmacao = inputConfirmarSenha.value();

    if (contaDigitada === "" || senhaDigitada === "" || confirmacao === "") {
      mensagemErro = "❌ Preencha todos os campos!";
      return;
    }

    if (senhaDigitada !== confirmacao) {
      mensagemErro = "❌ As senhas não coincidem!";
      return;
    }

    // ========================================================
    // TRANCANDO NOMES DUPLICADOS:
    // Transforma tudo para letras minúsculas (.toLowerCase) 
    // para evitar que criem "Admin" e "admin" como contas diferentes.
    // ========================================================
    let jaExiste = usuariosCadastrados.some(
      u => u.conta.toLowerCase() === contaDigitada.toLowerCase()
    );
    
    if (jaExiste) {
      mensagemErro = "❌ Este nome de conta já existe!";
      return;
    }
    // ========================================================

    // Se passou no teste do nome único, adiciona na lista
    usuariosCadastrados.push({ conta: contaDigitada, senha: senhaDigitada });
    
    // Atualiza o banco local do computador
    localStorage.setItem("meusUsuarios", JSON.stringify(usuariosCadastrados));

    mensagemErro = "";
    alert("✅ Conta criada com sucesso!");
    alternarTela("login"); 
  }
}

function alternarTela(novaTela) {
  tela = novaTela;
  atualizarElementos();
}

function atualizarElementos() {
  let larguraBox = 420;
  let alturaBox = tela === "cadastro" ? 460 : 390;
  let yBox = (height - alturaBox) / 2;
  
  botaoLogin.hide();
  botaoCriar.hide();
  botaoVoltar.hide();
  inputConta.hide();
  inputSenha.hide();
  inputConfirmarSenha.hide();
  
  if (tela === "inicial") {
    botaoLogin.show();
    botaoCriar.show();
    botaoLogin.html("Entrar"); 
    botaoLogin.position(width / 2 - 145, yBox + 220);
    botaoCriar.position(width / 2 + 5, yBox + 220);
    
  } else if (tela === "login") {
    inputConta.show();
    inputSenha.show();
    botaoLogin.show();
    botaoVoltar.show();
    
    inputConta.position(width / 2 - 160, yBox + 130);
    inputSenha.position(width / 2 - 160, yBox + 195);
    
    botaoLogin.html("Acessar"); 
    botaoLogin.position(width / 2 - 145, yBox + 295);
    botaoVoltar.position(width / 2 + 65, yBox + 300);
    
  } else if (tela === "cadastro") {
    inputConta.show();
    inputSenha.show();
    inputConfirmarSenha.show();
    botaoCriar.show();
    botaoVoltar.show();
    
    inputConta.position(width / 2 - 160, yBox + 115);
    inputSenha.position(width / 2 - 160, yBox + 175);
    inputConfirmarSenha.position(width / 2 - 160, yBox + 235);
    
    botaoCriar.position(width / 2 - 145, yBox + 360);
    botaoVoltar.position(width / 2 + 65, yBox + 365);
  }
}

function IniciarPainelJogos() {
  tela = "jogos";
  botaoLogin.hide();
  botaoCriar.hide();
  botaoVoltar.hide();
  inputConta.hide();
  inputSenha.hide();
  inputConfirmarSenha.hide();
  estrelas = [];
  
  let nomesJogos = ["Jogo do Dinossauro", "Flappy Bird", "Tetris Retrô", "Corrida Espacial", "Pac-Man 2D", "Ping Pong"];
  let coresJogos = ["#ff4757", "#ffa502", "#2ed573", "#1e90ff", "#9b59b6", "#2c3e50"];
  
  for (let i = 0; i < nomesJogos.length; i++) {
    let btn = createButton(nomesJogos[i]);
    btn.size(220, 140);
    btn.style('background-color', coresJogos[i]);
    btn.style('color', '#ffffff');
    btn.style('font-weight', 'bold');
    btn.style('font-size', '18px');
    btn.style('border', 'none');
    btn.style('border-radius', '16px');
    btn.style('cursor', 'pointer');
    btn.style('box-shadow', '0px 8px 15px rgba(0,0,0,0.3)');
    btn.style('transition', 'transform 0.2s ease');
    
    btn.mouseOver(() => btn.style('transform', 'scale(1.05)'));
    btn.mouseOut(() => btn.style('transform', 'scale(1)'));
    btn.mousePressed(() => alert("Iniciando o " + nomesJogos[i] + "..."));
    
    botoesJogos.push(btn);
  }
  
  PosicionarBotoesJogos();
}

function PosicionarBotoesJogos() {
  if (tela !== "jogos") return;
  let colunas = 3, larguraBotao = 220, alturaBotao = 140, espacamentoX = 40, espacamentoY = 40;
  let larguraTotal = (colunas * larguraBotao) + ((colunas - 1) * espacamentoX);
  let xInicial = (width - larguraTotal) / 2;
  let yInicial = 180;
  
  for (let i = 0; i < botoesJogos.length; i++) {
    let col = i % colunas;
    let lin = floor(i / colunas);
    botoesJogos[i].position(xInicial + col * (larguraBotao + espacamentoX), yInicial + lin * (alturaBotao + espacamentoY));
  }
}

function redesenharPainelJogos() {
  background("#0a0b0d");
  fill("#ffffff");
  textSize(32);
  textAlign(CENTER, TOP);
  text("🎮 Central de Jogos", width / 2, 50);
  textSize(16);
  fill("#666d7a");
  text("Selecione um título abaixo para começar a jogar", width / 2, 100);
}

function configurarEstiloBotao(botao, corNormal, corAtiva) {
  botao.style('background-color', corNormal);
  botao.style('color', '#ffffff');
  botao.style('border', 'none');
  botao.style('border-radius', '8px');
  botao.style('font-weight', '600');
  botao.style('font-size', '15px');
  botao.style('cursor', 'pointer');
  botao.style('transition', 'background 0.1s ease, transform 0.1s ease');
  botao.mousePressed(() => {
    botao.style('background-color', corAtiva);
    botao.style('transform', 'scale(0.95)');
  });
  botao.mouseReleased(() => {
    botao.style('background-color', corNormal);
    botao.style('transform', 'scale(1)');
  });
}

function configurarEstiloInput(campo) {
  campo.size(320, 45);
  campo.style('background-color', '#1a1c23');
  campo.style('color', '#ffffff');
  campo.style('border', 'none');
  campo.style('border-radius', '8px');
  campo.style('padding-left', '15px');
  campo.style('font-size', '14px');
  campo.style('box-sizing', 'border-box');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  atualizarElementos();
  PosicionarBotoesJogos();
}