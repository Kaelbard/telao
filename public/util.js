/* eslint-disable no-unused-vars */
var log = console.log.bind(document);

import axios from 'axios';

// const de URL base do projeto asp.net
let compilacao = 'ClinicasWebMVC'; // 'IIS' ou 'ClinicasWebMVC'
let urlDev = (compilacao != 'IIS') ? 'https://localhost:64843' : 'https://localhost:59361';
export const url_LaudosUX = process.env.NODE_ENV === 'development' ? urlDev : location.origin;

// Carregar os scripts js/css para o head
export function carregarScriptsHead() {
  let scripts = [
    './bootstrap5.0.2.min.js',
    './sweetalert2.min.js',
  ];

  let css = [
    './css/bootstrap5.0.2.min.css',
    './css/sweetalert2.min.css',
  ];

  //
  scripts.forEach((el) => {
    let js = document.createElement('script');
    js.type = 'text/javascript';
    js.src = el;
    document.head.appendChild(js);
  });

  //
  css.forEach((el) => {
    let css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = el;
    document.head.appendChild(css);
  });
}



// Métodos -----------------------------------------------------------------------------------
// Aplica o video via placa de captura/webcam
export async function aplicarVideoCaptura(selDV) {
  var video = document.getElementById("vidPlacaCaptura"),
    vendorURL = window.URL || window.webkitURL;

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        //video: true,
        video: {
          deviceId: { exact: selDV },
        },
      })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}

// Busca a lista de telões cadastrados no UX
export async function buscarListaTelao() {
  const resp = await axios.get(`${url_LaudosUX}/TelaoMdw/ListarTeloesCadastrados`);
  return resp.data;
}

// Carregar feed rss via api
export async function carregarRss() {
  // Seta
  let localRss = (localStorage.getItem('localRss') && localStorage.getItem('localRss') != "") ? localStorage.getItem('localRss') : 'G1';

  // Pega o local do RSS
  localStorage.getItem('localRss');

  const resp = await axios.get(`${url_LaudosUX}/TelaoMdw/BuscarRss?local=${localRss}`);
  return resp;
}

// Função para verficiar se há senhas a serem chamadas
export async function chamadaSenha() {
  let codTelaoSelecionado = localStorage.getItem('telaoSelecionado');
  const resp = await axios.get(`${url_LaudosUX}/TelaoMdw/ChamadaSenha?codTelao=${codTelaoSelecionado}`);

  if (resp.status == 200)
    return resp.data;
  else
    return null;
}

// Função para inativar a senha recém-chamada
export async function inativarChamadaSenha(codChamada) {
  const resp = await axios.put(`${url_LaudosUX}/TelaoMdw/InativarChamadaSenha?codChamadaSenha=${codChamada}`);
  return resp.data;
}

// Função para criar strings aleatórias de acordo com um tamanho informado
export function criarString(tamanho) {
  var res1 = "";
  var res2 = "";
  var texto =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var tamanhoString = texto.length;
  for (var i = 0; i < tamanho; i++) {
    res1 += texto.charAt(Math.floor(Math.random() * tamanhoString));
    res2 += texto.charAt(Math.floor(Math.random() * tamanhoString));
  }

  let res = res1.toLowerCase().replace(/^\w/, (txt) => txt.toUpperCase()) + ' ' + res2.toLowerCase().replace(/^\w/, (txt) => txt.toUpperCase());
  return res;
}

// Carregar as vozes e falar o texto
var vozes = window.speechSynthesis.getVoices();
var fala;

// Função para falar texto
export async function falarTexto(texto) {
  let vozConfigurada = localStorage.getItem("vozConfiguradaTelao");

  return new Promise(resolve => {
    fala = new SpeechSynthesisUtterance(texto);
    vozes = window.speechSynthesis.getVoices();

    fala.default = false;
    fala.voice = vozes.filter(function (voice) {
      try {
        return voice.name.toUpperCase() == (vozConfigurada.toUpperCase() ?? vozes[0].name); // "Microsoft Maria - Portuguese (Brazil)";        
      } catch (error) {
        return voice.name == (vozConfigurada ?? vozes[0].name); // "Microsoft Maria - Portuguese (Brazil)";                
      }
    })[0];

    fala.lang = "pt-BR";
    fala.rate = 1.1; // 0.1 to 10
    fala.pitch = 1; // 0 a 2

    if (localStorage.getItem('falarTextoTelao') == 'true')
      fala.volume = 1; // 0 a 1
    else
      fala.volume = 0; // 0 a 1

    window.speechSynthesis.speak(fala);
    resolve(true);
  });
}

// Preenche os dispositivos de vídeo detectados pelo navegador
export async function preencherDispositivosVideo() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    alert('Nenhum dispositivo de entrada vídeo detectado pelo navegador!');
    localStorage.setItem('erroDispositivoImagem', 'true');
    return;
  }

  navigator.mediaDevices
    .enumerateDevices()
    .then(function (devices) {
      localStorage.setItem('erroDispositivoImagem', 'false');

      var sel = document.getElementById("selDispositivosVideo");
      sel.innerText = "";

      let idCaptura = localStorage.getItem('capturaID');

      //
      devices.forEach(function (device) {
        if (device.kind == "videoinput" && device.deviceId != "") {
          var opt = document.createElement("option");
          opt.value = device.deviceId;
          opt.innerHTML = device.label;
          opt.selected = idCaptura && idCaptura == device.deviceId;
          sel.appendChild(opt);
        }
      });

      //sel.selectedIndex = -1;
      sel.onchange();

      sel.style.display = sel.childNodes.length == 1 ? "none" : "block";
    })
    .catch(function (err) {
      console.log(err.name + ": " + err.message);
    });
}

// Função para recuperar tema do banco
export async function recuperarTemaBanco() {
  const resp = await axios.get(`${url_LaudosUX}/TelaoMdw/Recuperar_TemaCustomizadoTelao`);
  return resp.data;
}

// Função para salvar tema no banco
export async function salvarTemaBanco(objEstruturaTema) {
  const resp = await axios.put(`${url_LaudosUX}/TelaoMdw/Definir_TemaCustomizadoTelao`, objEstruturaTema);
  return resp.data;
}

// Função para "pausa"
export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Função para tocar 'alerta' antes de chamar a senha
export async function tocarAlerta() {
  if (localStorage.getItem('tocarAlerta') == 'true') {
    let audio = new Audio(process.env.NODE_ENV === 'development' ? '../sound/beep1.wav' : url_LaudosUX + '/telao/sound/beep1.wav');
    audio.volume = 1;
    audio.play();
  }
}

// Função para salvar URL de video Streaming
export async function salvarvideo_linkStreaming() {
  let link = localStorage.getItem('linkStreaming');

  if (!link) {
    // localStorage.setItem('linkStreaming', 'https://www.youtube.com/embed/gOfOUEReKqs?&mute=1&autoplay=1&controls=1');
    localStorage.setItem('linkStreaming', '');
  }

  link = localStorage.getItem('linkStreaming');
}

//
export function utf8Encode(unicodeString) {
  if (typeof unicodeString != 'string')
    throw new TypeError('parameter ‘unicodeString’ is not a string');

  const utf8String = unicodeString
    .replace(/[\u0080-\u07ff]/g, (c) => {
      let cc = c.charCodeAt(0);
      return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
    })
    .replace(/[\u0800-\uffff]/g, (c) => {
      let cc = c.charCodeAt(0);
      return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
    });
  return utf8String;
}