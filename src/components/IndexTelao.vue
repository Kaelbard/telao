<template>
  <div
    id="containerTelao"
    class="container-fluid"
    @contextmenu="mostrarModalConfig"
  >
    <!-- Main -->
    <div class="row">
      <!-- Esquerda -->
      <div class="col-3 min-vh-100">
        <container-senhas-anteriores :listaSenhasAnteriores="listaSenhasAnteriores"></container-senhas-anteriores>
      </div>

      <!-- Direita -->
      <div class="col-9 min-vh-100 text-center">
        <!-- Senha Atual-->
        <div>
          <senha-atual :senhaAtual="senhaAtual"></senha-atual>
        </div>

        <!-- Mídia -->
        <div>
          <midia-page :showMidia="showMidia"></midia-page>
        </div>
      </div>
    </div>

    <!-- Notícias -->
    <div class="row">
      <rodape-telao :showNews="showNews" :local-rss="localRss"></rodape-telao>
    </div>

    <!-- MODAIS -->
    <!-- Modal de Senha -->
    <modal-senha :paciente="paciente"></modal-senha>

    <!-- Modal de Config -->
    <modal-config :isFalarTexto="isFalarTexto" @telao-selecionado="iniciarChamada" @local-rss="definirRss"></modal-config>
  </div>
  <!-- FIM > NOVO -->
</template>

<script setup>
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// Imports
import { onMounted, reactive, ref } from "vue";
import {
  chamadaSenha,
  falarTexto,
  inativarChamadaSenha,
  sleep,
  tocarAlerta,
} from "../../public/util";

import MidiaPage from "./Midia/MidiaPage.vue";
import ModalConfig from "./Config/ModalConfig.vue";
import ModalSenha from "./Senhas/ModalSenha.vue";
import ContainerSenhasAnteriores from "./Senhas/ContainerSenhasAnteriores.vue";
import SenhaAtual from "./Senhas/SenhaAtual.vue";
import RodapeTelao from "./Rodape/RodapeTelao.vue";
import Swal from "sweetalert2";
import { store } from "../store";

// Vars
let listaChamada = ref([]);
const timerChamadaSenha = 6000;

const paciente = reactive({
  nome: "",
  local: "",
});

let listaSenhasAnteriores = reactive([]);

let senhaAtual = reactive({
  nome: "",
  local: "",
});

let telaoSelecionado = reactive("");
let localRss = reactive(null);

let showMidia = ref(true);
let showNews = ref(true);
let isChamadaSenha = ref(false);

// Ao abrir, buscar as 5 últimas senhas no localStorage
function buscarHistoricoSenha() {
  let historicoSenha = localStorage.getItem("historicoSenha");

  if (historicoSenha) {
    historicoSenha = historicoSenha.split(",").reverse();
  }

  if (historicoSenha && historicoSenha.length > 0) {
    historicoSenha.forEach((h) => {
      let tmpH = h.split("@@");
      popularHistoricoSenha(tmpH[0], tmpH[1], tmpH[2]);
    });
  }
}

// Chamar paciente
async function chamarPaciente() {
  let tipoVideo = store.video_tipoVideo;
  senhasAnteriores(senhaAtual);
  tocarAlerta();
  persistirSenhasLocal(senhaAtual.nome, senhaAtual.local, senhaAtual.hora);

  let texto = `${senhaAtual.nome}, ${senhaAtual.local}`;
  pauseVideo(tipoVideo);
  await falarTexto(texto);
  await mostrarModalSenha(senhaAtual.nome, senhaAtual.local);
  playVideo(tipoVideo);
}

// Persiste as 5 últimas senhas chamadas no localStorage para não perder o histórico quando reabrir/atualizar o telão
function persistirSenhasLocal(nome, local, hora) {
  let historicoSenha = localStorage.getItem("historicoSenha");

  if (!historicoSenha || historicoSenha === "") {
    localStorage.setItem("historicoSenha", "");
    historicoSenha = localStorage.getItem("historicoSenha");
  }

  let arrHistorico = historicoSenha.split(",");

  arrHistorico = arrHistorico.filter(valor => {
    const [nomeSalvo, localSalvo] = valor.split('@@');
    return nomeSalvo !== nome || localSalvo !== local
  })

  arrHistorico.unshift(`${nome}@@${local}@@${hora}`);

  arrHistorico = arrHistorico.filter((el) => {
    return el != "";
  });

  arrHistorico = arrHistorico.slice(0, 5);
  localStorage.setItem("historicoSenha", arrHistorico);
}

// Montar em tela as senhas no histórico
function popularHistoricoSenha(nome, local, hora) {
  listaSenhasAnteriores.unshift({
    nome: nome,
    local: local,
    hora: hora,
  });

  if (listaSenhasAnteriores.length > 5) {
    listaSenhasAnteriores.pop();
  }

  senhaAtual.nome = listaSenhasAnteriores[0].nome;
  senhaAtual.local = listaSenhasAnteriores[0].local;
  senhaAtual.hora = listaSenhasAnteriores[0].hora;
}

//
function mostrarModalConfig(e) {
  let x = document.getElementById('modalConfig').classList.value;

  if (!x.includes('show')){
    e.preventDefault();
    const modalConfig = bootstrap.Modal.getOrCreateInstance(
      document.getElementById("modalConfig")
    );

    document.getElementById("navLink-geral").click();
    modalConfig.show();
  }
}

// Mostra o modal de senha
async function mostrarModalSenha(nome, local) {
  const modalSenha = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modalNovaSenha")
  );

  paciente.nome = nome;
  paciente.local = local;

  modalSenha.show();

  showNews.value = !showNews.value;

  await new Promise((resolve) => {
    setTimeout(() => {
      showNews.value = !showNews.value;
      modalSenha.hide();
      resolve(true);
    }, 6000);
  });
}

// Atualiza a lista de senhas anteriores
function senhasAnteriores(senhaAtual) {
  const indexSenhaDuplicada = listaSenhasAnteriores.findIndex(senha => {
    return senhaAtual.nome === senha.nome && senhaAtual.local === senha.local 
  });

  if(indexSenhaDuplicada !== -1) {
    listaSenhasAnteriores.splice(indexSenhaDuplicada, 1)
    senhaAtual.hora = new Date().toLocaleTimeString("pt-BR", { hour: 'numeric', minute: 'numeric' });
  }

  listaSenhasAnteriores.unshift({
    nome: senhaAtual.nome,
    local: senhaAtual.local,
    hora: senhaAtual.hora,
  });

  if (listaSenhasAnteriores.length > 5) {
    listaSenhasAnteriores.pop();
  }
}

// Carregar a lista de pacientes
async function carregarListaPacientes() {
  isChamadaSenha.value = true;

  let opTelaoSelecionado = localStorage.getItem("telaoSelecionado");
  if (opTelaoSelecionado) {
    
    pararFluxoDeChamada();
    //
    chamadaSenha().then(async (res) => {
      if (res) {
        //
        listaChamada.value = [...res];
        listaChamada.value = listaChamada.value.sort((a, b) => a.codChamadaSenha - b.codChamadaSenha);
        while (listaChamada.value.length > 0) {
          let codChamada = listaChamada.value[0].codChamadaSenha;
          let dadosSenha = JSON.parse(listaChamada.value[0].textoChamada);
          let horaChamada = new Date().toLocaleTimeString("pt-BR", { hour: 'numeric', minute: 'numeric' });
          
          await sleep(2000);
          //console.log(listaChamada.value[0]);
          senhaAtual.nome = dadosSenha.paciente;
          senhaAtual.local = dadosSenha.estacao;
          senhaAtual.hora = horaChamada;
          await chamarPaciente();
          await sleep(500);

          if (listaChamada.value.length > 0) {
            await inativarChamadaSenha(codChamada).then((result) => {
              listaChamada.value.splice(0, 1);
            });
          }
        }
      }
      
      isChamadaSenha.value = false;
      iniciarFluxoDeChamada(timerChamadaSenha);
    }).catch(err => {
      console.log(err);
      iniciarFluxoDeChamada(timerChamadaSenha);
    });
  }
}

let intervaloDeChamada = null;

function iniciarFluxoDeChamada(interval) {
  intervaloDeChamada = setInterval(() => carregarListaPacientes(), interval);
}

function pararFluxoDeChamada() {
  clearInterval(intervaloDeChamada);
}

const isFalarTexto = ref("");
const primeiraExecucao =  reactive(true);

//capta o emit do modal de configuracao e se auto executa
function iniciarChamada(codTelao) {
  listaSenhasAnteriores.length = 0;
  pararFluxoDeChamada();
  buscarHistoricoSenha();
  // iniciarFluxoDeChamada(timerChamadaSenha);
  carregarListaPacientes();
}

function definirRss(Rss) {
  localRss = Rss;
}

// Hooks
onMounted(() => {
  //
  config_recuperarFundo();
  if (localStorage.getItem("temaTelao") == "siteCustomizado") {
    let estrutura = JSON.parse(localStorage.getItem("estruturaCorCustom"));
    //log(estrutura);

    if (estrutura != "") {
      // Fonte
      document.body.style.color = estrutura.fonte.color;

      // Fundo
      if (estrutura.tipo == "degrade") {
        document.body.style.background = estrutura.fundo.background;
      } else {
        document.body.style.background = "none";
        document.body.style.backgroundColor = estrutura.fundo.backgroundColor;
      }

      // Container
      document.getElementById(
        "containerSenhasAnteriores"
      ).style.backgroundColor = estrutura.container.backgroundColor;
      document.getElementById("containerSenhaAtual").style.backgroundColor =
        estrutura.container.backgroundColor;
    }
  }

  //
  config_recuperarTocarAlerta();
  let isTocarAlerta = localStorage.getItem("tocarAlerta");

  //
  config_recuperarFalarTexto();
  isFalarTexto.value = localStorage.getItem("falarTexto");
  
  //
  if(localStorage.getItem("telaoSelecionado")){
    buscarHistoricoSenha();
    carregarListaPacientes();
  } else {
    Swal.fire({
      title: "Nenhum telão definido!",
      html: "Acesse as configurações clicando com botão direito e escolha o<br> telão desejado na lista. <br><br>Caso o telão desejado não esteja na lista será necessário cadastrá-lo na <b>Biblioteca</b> do <b>LaudosUX</b>.",
      icon: "error",
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Fechar",
    });
    pararFluxoDeChamada();
  }

});
</script>