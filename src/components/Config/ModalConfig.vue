<script setup>
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import {
  aplicarVideoCaptura,
  buscarListaTelao,
  carregarRss,
  preencherDispositivosVideo,
  recuperarTemaBanco,
  salvarTemaBanco,
  sleep,
} from "../../../public/util";
import { onMounted, reactive, ref } from "vue";
import { store } from "../../store";
import { useStore } from "vuex";


const emit = defineEmits(["telaoSelecionado", "localRss"]);

let arquivoSelecionado = ref("");
let cameraId = ref("");
let conteudoTextoPadrao = ref("");
let corContainerTransparente = ref(false);
let listaVozesPC = ref([]);
let urlVideoStreaming = ref("");
let nomeVozConfigurada = ref("");
let erroDispCaptura = ref(localStorage.getItem("erroDispositivoImagem"));
let optTema = ref("");
let posicaoRange = ref("90");
let preferenciaTemaGlobal = ref(false);
let tipoFundoSelecionado = ref("solida");
let temaBancoDisponivel = ref(false);
let containerTransparente = ref(false);
let optRodape = ref("rss");
let listaTelao = ref([]);
const telaoSelecionado = ref(localStorage.getItem('telaoSelecionado') || null);
let isLoading = ref(true);

const storeRodape = useStore();

// ------------------------------------------------------
//
async function definirCorCustom(localTema) {
  // Setar as cores
  let corCustomFonte = document.getElementById("pickerFonteCorSolida").value;
  let corCustomContainer = containerTransparente.value
    ? "transparent"
    : document.getElementById("pickerCorContainer").value;

  // Se fundo degrade
  if (tipoFundoSelecionado.value == "degrade") {
    let cInc = document.getElementById("rangeFundoCorCustom").value;
    let cCor1 = document.getElementById("pickerFundoCorDegrade1").value;
    let cCor2 = document.getElementById("pickerFundoCorDegrade2").value;

    // Seta em tela
    document.body.style.background = `linear-gradient(${cInc}deg, ${cCor1} 0%, ${cCor2} 100%)`;

    // Salva na store
    store.tema_estiloCustomFundo = {
      background: `linear-gradient(${cInc}deg, ${cCor1} 0%, ${cCor2} 100%)`,
    };
  }
  // Se fundo cor sólida
  else {
    // Aplica em tela
    document.body.style.background = "none";
    document.body.style.backgroundColor = document.getElementById(
      "pickerFundoCorSolida"
    ).value;

    // Salva em tela
    store.tema_estiloCustomFundo = {
      background: "none",
      backgroundColor: document.getElementById("pickerFundoCorSolida").value,
    };
  }

  // Seta fonte e container tem tela
  document.body.style.color = corCustomFonte;
  document.getElementById("containerSenhasAnteriores").style.backgroundColor =
    corCustomContainer;
  document.getElementById("containerSenhaAtual").style.backgroundColor =
    corCustomContainer;

  // Fonte
  store.tema_estiloCustomFonte = {
    color: corCustomFonte,
  };

  // Container
  store.tema_estiloCustomContainer = {
    backgroundColor: corCustomContainer,
  };

  let objCoresCustom = {
    tipo: tipoFundoSelecionado.value,
    fonte: store.tema_estiloCustomFonte,
    container: store.tema_estiloCustomContainer,
    fundo: store.tema_estiloCustomFundo,
  };

  // Se for Global, salva no banco
  if (localTema == "global") {
    let salvarBanco = await salvarTemaBanco(objCoresCustom);
    if (salvarBanco) {
      Swal.fire({
        title: "Tema salvo com sucesso!",
        icon: "success",
        showConfirmButton: true,
        confirmButtonText: "Fechar",
      });
    } else {
      Swal.fire({
        title: "Erro ao salvar o tema no banco!",
        icon: "error",
        showConfirmButton: true,
        confirmButtonText: "Fechar",
      });
    }
  } else {
    Swal.fire({
      title: "Tema salvo com sucesso!",
      icon: "success",
      showConfirmButton: true,
      confirmButtonText: "Fechar",
    });
  }

  // Salva a estrutura no localStorage
  localStorage.setItem("estruturaCorCustom", JSON.stringify(objCoresCustom));

  //
  localStorage.setItem("localTemaCustomizado", localTema);
}

// Definir tipo de rodapé
function definirConfigRodape() {
  localStorage.setItem("rodape_tipoRodape", optRodape.value);
  store.rodape_tipoRodape = optRodape.value;

  if (optRodape.value == "rss") {
    let localRss = document.getElementById("selRssNoticias").value;
    localStorage.setItem("localRss", localRss);
    store.rodape_localRss = localRss;

    // buscarNoticiasRSS();
    //document.location.reload(true);
    storeRodape.dispatch("alterarLocalRss", localRss);
    emit("localRss", localRss);
  } else if (optRodape.value == "textoPadrao") {
    log("opcaotextoPadrao");
  }
}

// Definir tipo de video escolhido
function definirVideo(video_tipoVideo) {
  pauseVideo(store.video_tipoVideo);

  // Streaming
  if (video_tipoVideo == "streaming") {
    if (urlVideoStreaming.value.includes("youtu.be")  || urlVideoStreaming.value.includes("youtube")) {
      // https://youtu.be/gOfOUEReKqs
      let videoCode = "";
      if (urlVideoStreaming.value.includes("youtu.be")) {
        videoCode = urlVideoStreaming.value;
        videoCode = videoCode.replace("https://youtu.be/", "");
      }
      else if (urlVideoStreaming.value.includes("youtube")) {
        videoCode = urlVideoStreaming.value;
        videoCode = new URL(videoCode);
        videoCode = videoCode.searchParams.get("v");
      }

      if (document.getElementById("playerYT")) {
        trocarVideo(videoCode, 5, "large");
      }
      
      localStorage.setItem("linkStreaming", urlVideoStreaming.value);
      localStorage.setItem("video_streaming_yt_videoId", videoCode);
      store.video_streaming_yt_videoId = videoCode;
    } else {
      localStorage.setItem("linkStreaming", urlVideoStreaming.value);
    }

    // document.getElementById("iframeMidiaStreaming").src =
    //   localStorage.getItem("linkStreaming");

    store.video_linkStreaming = localStorage.getItem("linkStreaming");
  }

  // midia local
  if (video_tipoVideo == "videoLocal") {
    let arquivo = document.getElementById("txtVideoLocal").files[0];
    let URL = window.URL || window.webkitURL;
    let arquivoURL = URL.createObjectURL(arquivo);
    let videoDOM = document.getElementById("videoLocal");
    videoDOM.src = arquivoURL;

    putPDB(arquivo);
  }

  // Placa de Captura
  if (video_tipoVideo == "placaCaptura") {
    let selDV = document.getElementById("selDispositivosVideo").value;

    if (selDV != "") {
      localStorage.setItem("capturaID", selDV);
      aplicarVideoCaptura(selDV);
    }
  }

  // Nenhum
  if (video_tipoVideo == "nenhum") {
    document.getElementById("txtVideoLocal").value = "";
  }

  localStorage.setItem("video_tipoVideo", video_tipoVideo);
  store.video_tipoVideo = video_tipoVideo;
  store.video_semVideoDefinido = false;
}

// Define o tipo de voz da chamada
function definirVozChamada(event) {
  nomeVozConfigurada.value = event.target.value;
  localStorage.setItem("vozConfiguradaTelao", event.target.value);
}

// Pega o nome do arquivo escolhido para video local
function pegarNomeArquivo() {
  arquivoSelecionado.value =
    document.getElementById("txtVideoLocal").files[0].name;
}

// Preview da cor customizada
function previewFundoCorCustom(tipo) {
  // Fundo
  if (tipo == "solida") {
    document
      .getElementById("divPreviewFundoCorCustom")
      .removeAttribute("style");
    document.getElementById("divPreviewFundoCorCustom").style.backgroundColor =
      document.getElementById("pickerFundoCorSolida").value;
  } else if (tipo == "degrade") {
    let cor1 = document.getElementById("pickerFundoCorDegrade1").value;
    let cor2 = document.getElementById("pickerFundoCorDegrade2").value;
    let inc = document.getElementById("rangeFundoCorCustom").value;

    document.getElementById(
      "divPreviewFundoCorCustom"
    ).style.background = `linear-gradient(${inc}deg, ${cor1} 0%, ${cor2} 100%)`;
  }
  //
  else if (tipo == "container") {
    if (!containerTransparente.value) {
      document.getElementById("lblPreviewFonteCustom").style.backgroundColor =
        document.getElementById("pickerCorContainer").value;
    }
  }

  // Fonte
  if (tipo == "fonte") {
    document.getElementById("lblPreviewFonteCustom").style.color =
      document.getElementById("pickerFonteCorSolida").value;
  }
}

// Setar a preferencia para Local ou Global
async function setarPreferenciaGlobal() {
  preferenciaTemaGlobal.value
    ? localStorage.setItem("localTemaCustomizado", "global")
    : localStorage.setItem("localTemaCustomizado", "local");
  // Verifica se há algum tema no banco
  if (preferenciaTemaGlobal.value) {
    let tb = await recuperarTemaBanco();

    if (tb.length) {
      temaBancoDisponivel.value = true;
      store.tema_estruturaTemaBanco = JSON.parse(tb[0].VALOR);
    }
  }
}

// corContainerTransparente
async function setarCorContainer() {
  document.getElementById("containerSenhasAnteriores").style.backgroundColor =
    "transparent";
  document.getElementById("containerSenhaAtual").style.backgroundColor =
    "transparent";

  if (containerTransparente.value) {
    document.getElementById("lblPreviewFonteCustom").style.backgroundColor =
      "transparent";
  } else {
    document.getElementById("lblPreviewFonteCustom").style.backgroundColor =
      document.getElementById("pickerCorContainer").value;
  }

  corContainerTransparente.value
    ? localStorage.setItem("containerTransparente", "true")
    : localStorage.setItem("containerTransparente", "false");
}

// Setar tema salvo do banco no localStorage e Preview
async function setarTemaBancoEmLocal() {
  let tb = await recuperarTemaBanco();
  if (tb.length) {
    temaBancoDisponivel.value = true;
    store.tema_estruturaTemaBanco = JSON.parse(tb[0].VALOR);
    document.getElementById("opTemaCustomizado").click();

    // Prepara os dados
    let tipo = store.tema_estruturaTemaBanco.tipo;
    let fonte = store.tema_estruturaTemaBanco.fonte;
    let fundo = store.tema_estruturaTemaBanco.fundo;

    setarTemaNoPreview(tipo, fonte, fundo);
  }
}

// Alterar o preview para o tema recebido
function setarTemaNoPreview(tipo, fonte, fundo) {
  // Fonte
  document.getElementById("lblPreviewFonteCustom").style.color = fonte.color;
  document.getElementById("pickerFonteCorSolida").value = fonte.color;

  // Fundo
  if (tipo == "solida") {
    document.getElementById("btnTipoFundoSolida").click();
    document.getElementById("divPreviewFundoCorCustom").style = "";
    document.getElementById("divPreviewFundoCorCustom").style.background =
      "none";
    document.getElementById("divPreviewFundoCorCustom").style.backgroundColor =
      fundo.backgroundColor;
    document.getElementById("pickerFundoCorSolida").value =
      fundo.backgroundColor;
  } else if (tipo == "degrade") {
    document.getElementById("btnTipoFundoDegrade").click();
    document.getElementById("divPreviewFundoCorCustom").style.background =
      fundo.background;
    let f = fundo.background
      .replace("linear-gradient(", "")
      ?.replace(")", "")
      ?.replace("deg", "")
      .replaceAll("%", "");
    let inc = f.split(",")[0];
    let cor1 = f.split(",")[1].trim()?.split(" ")[0];
    let cor2 = f.split(",")[2].trim()?.split(" ")[0];

    document.getElementById("rangeFundoCorCustom").value = inc;
    document.getElementById("pickerFundoCorDegrade1").value = cor1;
    document.getElementById("pickerFundoCorDegrade2").value = cor2;
  }
}

// Setar o ID da camera escolhida
function setCameraId() {
  cameraId.value = document.getElementById("selDispositivosVideo").value;
}

// Falar texto da chamada de senha
function setFalarTexto() {
  let swt = document.getElementById("swtFalarTexto").checked ? "true" : "false";
  localStorage.setItem("falarTexto", swt);
  config_falarTexto(swt);
}

// Tocar o som de alerta antes da senha
function setTocarAlerta() {
  let swt = document.getElementById("swtTocarAlerta").checked
    ? "true"
    : "false";
  localStorage.setItem("tocarAlerta", swt);
  config_TocarAlerta(swt);
}

// Preenche a lista de telões cadastrados no UX
async function preencherListaTelao() {
  listaTelao.value = await buscarListaTelao();
}

// Salvar o vídeo local no PouchDB
function putPDB(blob) {
  pdb
    .get("blobVideoLocal")
    .then(function (doc) {
      return pdb.put({
        _id: "blobVideoLocal",
        _rev: doc._rev,
        blob: blob,
        force: true,
      });
    })
    .then(function (response) {
      //console.log("Vídeo Salvo");
    })
    .catch(function (err) {
      pdb
        .put({
          _id: "blobVideoLocal",
          blob: blob,
          force: true,
        })
        .then(function (response) {
          //console.log("Vídeo Salvo");
        })
        .catch(function (err) {
          console.log(err);
        });
    });
}

// Verificar a voz salva
function verificarVozSalva() {
  let vozConfTelao = localStorage.getItem("vozConfiguradaTelao");
  if (vozConfTelao != "") {
    document.getElementById("lblVozEscolhida").textContent = vozConfTelao;
  } else {
    document.getElementById("lblVozEscolhida").textContent = "Nenhuma";
  }
}

// Setar o telao selecionado e começar a chamar
function definirTelao(codTelao) {
  localStorage.setItem("telaoSelecionado", codTelao);
  emit("telaoSelecionado", codTelao);
}

// Ao montar o componente
onMounted(async () => {
  store.video_linkStreaming = localStorage.getItem("linkStreaming");
  urlVideoStreaming.value = store.video_linkStreaming;

  // Check na opção do tema
  let opTema = localStorage.getItem("temaTelao");
  if (opTema == "siteClaro") {
    document.getElementById("opTemaClaro").checked = true;
  } else if (opTema == "siteEscuro") {
    document.getElementById("opTemaEscuro").checked = true;
  } else if (opTema == "siteCustomizado") {
    document.getElementById("opTemaCustomizado").checked = true;
    optTema.value = "siteCustomizado";

    // Verifica se há estrutura salva
    if (
      localStorage.getItem("estruturaCorCustom") &&
      localStorage.getItem("estruturaCorCustom") != ""
    ) {
      // Aplica a estrutura encontrada nas opções de config e no preview
      let est = JSON.parse(localStorage.getItem("estruturaCorCustom"));

      // Fonte
      document.getElementById("pickerFonteCorSolida").value = est.fonte.color;
      document.getElementById("lblPreviewFonteCustom").style.color =
        est.fonte.color;

      // Container
      document.getElementById("pickerCorContainer").value =
        est.container.backgroundColor;
      document.getElementById("lblPreviewFonteCustom").style.backgroundColor =
        est.container.backgroundColor;
      if (est.container.backgroundColor == "transparent") {
        containerTransparente.value = true;
      }

      // Fundo
      if (est.tipo == "solida") {
        document.getElementById("pickerFundoCorSolida").value =
          est.fundo.backgroundColor;
        document.getElementById("divPreviewFundoCorCustom").background = "none";
        document.getElementById("divPreviewFundoCorCustom").backgroundColor =
          est.fundo.backgroundColor;
      } else if (est.tipo == "degrade") {
        let estFundo = est.fundo.background;
        estFundo = estFundo.replaceAll("linear-gradient(", "");
        estFundo = estFundo.replaceAll("deg", "");
        estFundo = estFundo.replace(")", "");
        estFundo = estFundo.split(",");
        let inc = estFundo[0];
        let cor1 = estFundo[1].trim().split(" ")[0];
        let cor2 = estFundo[2].trim().split(" ")[0];

        document.getElementById("pickerFundoCorDegrade1").value = cor1;
        document.getElementById("pickerFundoCorDegrade2").value = cor2;

        document.getElementById("divPreviewFundoCorCustom").backgroundColor =
          "none";
        document.getElementById("divPreviewFundoCorCustom").background =
          est.fundo.background;
      }
    }
  }

  // Check na opção de falar paciente
  let opFalarTexto = localStorage.getItem("falarTexto");
  if (opFalarTexto == "true") {
    document.getElementById("swtFalarTexto").checked = true;
  }

  // Check na opção de toca alerta
  let opTocarAlerta = localStorage.getItem("tocarAlerta");
  if (opTocarAlerta == "true") {
    document.getElementById("swtTocarAlerta").checked = true;
  }

  //
  await sleep(1000);

  // Local do arquivo de vídeo da Store
  arquivoSelecionado.value = store.video_nomeVideoLocal;

  // Verifica se é tema customizado para aplicar as cores
  if (localStorage.getItem("temaTela") == "siteCustomizado") {
    corContainerTransparente.value =
      localStorage.getItem("containerTransparente") != ""
        ? localStorage.getItem("containerTransparente")
        : false;

    //
    if (localStorage.getItem("containerTransparente") == "true")
      document.getElementById("lblPreviewFonteCustom").style.backgroundColor =
        "transparent";
    else
      document.getElementById("lblPreviewFonteCustom").style.backgroundColor =
        document.getElementById("pickerCorContainer").value;
  }

  //
  let vozesPC = window.speechSynthesis.getVoices();
  vozesPC.forEach((e) => {
    if (e.name.includes("Brazil")) {
      listaVozesPC.value.push(e.name);
    }
  });

  // Ao abrir o modal
  var modalConfig = document.getElementById("modalConfig");
  modalConfig.addEventListener("show.bs.modal", async function (event) {
    let tb = await recuperarTemaBanco();
    if (tb.length > 0) {
      temaBancoDisponivel.value = true;
    }

    // Verifica o tipo de tema (global ou local) para o switch de local preferencial
    if (
      localStorage.getItem("localTemaCustomizado") &&
      localStorage.getItem("localTemaCustomizado") == "global"
    ) {
      preferenciaTemaGlobal.value = true;
    }

    // Verifica o local de RSS
    let lsLocalRss = localStorage.getItem("localRss");
    if (lsLocalRss && lsLocalRss != "") {
      document.getElementById("selRssNoticias").value = lsLocalRss;
    }
  });

  // Init Tippy do BS5
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
</script>

<template>
  <div id="modalConfig" class="modal fade text-dark" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content shadow-lg">
        <div class="modal-header">
          <h5 class="modal-title">Configurações</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body">
          <div class="d-flex align-items-start">
            <!-- Btns Nav Modal Config -->
            <div
              class="flex-column me-3 nav nav-pills"
              id="v-pills-tab"
              role="tablist"
            >
              <!-- -->
              <button
                class="nav-link active"
                id="navLink-geral"
                data-bs-toggle="pill"
                data-bs-target="#navContent-geral"
                type="button"
                role="tab"
                @click="preencherListaTelao"
              >
                Geral
              </button>

              <!-- -->
              <button
                class="nav-link"
                id="navLink-tema"
                data-bs-toggle="pill"
                data-bs-target="#navContent-tema"
                type="button"
                role="tab"
              >
                Tema
              </button>

              <!-- -->
              <button
                class="nav-link"
                id="navLink-som"
                data-bs-toggle="pill"
                data-bs-target="#navContent-som"
                type="button"
                role="tab"
                @click="verificarVozSalva"
              >
                Som
              </button>

              <!-- -->
              <button
                class="nav-link"
                id="navLink-som"
                data-bs-toggle="pill"
                data-bs-target="#navContent-video"
                type="button"
                role="tab"
              >
                Vídeo
              </button>

              <!-- -->
              <button
                class="nav-link"
                id="navLink-rodape"
                data-bs-toggle="pill"
                data-bs-target="#navContent-rodape"
                type="button"
                role="tab"
              >
                Rodapé
              </button>
            </div>

            <!-- Conteudo modal config -->
            <div id="v-pills-tabContent" class="tab-content w-100">
              <!-- Geral -->
              <div
                class="tab-pane fade show active"
                id="navContent-geral"
                role="tabpanel"
              >
                <!-- Nome Telao -->
                <div>
                  <label class="fw-bold">Selecione o nome deste telão</label>
                  <div
                    id="divContainerListaTeloes"
                    class="form-check p-2"
                  >
                  <!-- <template v-if="listaTelao.value">"Não há telões cadastrados"</template>
                  <template v-else> -->
                    <form>
                      <div v-for="t in listaTelao" :key="t.id">
                        <input :checked="t.codTelao == telaoSelecionado ? true : false" type="radio" :id="`${t.codTelao}`" name="rdNomeTelao" @click="definirTelao(t.codTelao);" class="mb-1 me-2">
                        <label @click="document.getElementById(`${t.codTelao}`).click();">{{ t.descricao }}</label>
                      </div>
                    </form>
                  <!-- </template> -->
                </div>
                </div>
              </div>

              <!-- Tema e Fundos -->
              <div class="tab-pane fade" id="navContent-tema" role="tabpanel">
                <!-- Temas -->
                <div>
                  <div class="form-check form-switch mb-2">
                    <input
                      id="swtPreferenciaUsarTemaGlobal"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      @change="setarPreferenciaGlobal"
                      v-model="preferenciaTemaGlobal"
                    />
                    <label class="form-check-label" for="swtUsarTemaGlobal">
                      Preferir tema CUSTOMIZADO GLOBAL (salvo no banco) ao invés de tema
                      LOCAL.
                    </label>
                  </div>
                  <div v-show="temaBancoDisponivel">
                    <button
                      class="btn btn-secondary"
                      @click="setarTemaBancoEmLocal"
                    >
                      Baixar tema encontrado no banco
                    </button>
                  </div>
                  <hr />
                  <!-- -->
                  <div class="form-check">
                    <input
                      id="opTemaClaro"
                      name="opTema"
                      class="form-check-input"
                      type="radio"
                      onclick="config_definirTema('siteClaro');"
                      @click="optTema = 'siteClaro'"
                      checked
                    />
                    <label
                      class="form-check-label"
                      onclick="document.getElementById('opTemaClaro').click();"
                    >
                      Tema Claro
                    </label>
                  </div>

                  <!-- -->
                  <div class="form-check">
                    <input
                      id="opTemaEscuro"
                      name="opTema"
                      class="form-check-input"
                      onclick="config_definirTema('siteEscuro');"
                      @click="optTema = 'siteEscuro'"
                      type="radio"
                    />
                    <label
                      class="form-check-label"
                      onclick="document.getElementById('opTemaEscuro').click();"
                    >
                      Tema Escuro
                    </label>
                  </div>

                  <!-- -->
                  <div class="form-check">
                    <input
                      id="opTemaCustomizado"
                      name="opTema"
                      class="form-check-input"
                      onclick="config_definirTema('siteCustomizado');"
                      @click="optTema = 'siteCustomizado'"
                      type="radio"
                    />
                    <label
                      class="form-check-label"
                      onclick="document.getElementById('opTemaCustomizado').click();"
                    >
                      Tema Customizado
                    </label>
                  </div>
                  <div
                    class="
                      ms-4
                      me-4
                      p-2
                      border
                      borda-cinza_clara
                      rounded-bottom
                      p-2
                    "
                    v-show="optTema == 'siteCustomizado'"
                  >
                    <ul class="nav nav-tabs" role="tablist">
                      <li class="nav-item" role="presentation">
                        <button
                          class="nav-link active"
                          data-bs-toggle="tab"
                          data-bs-target="#configFundo"
                          type="button"
                          role="tab"
                        >
                          Fundo Telão
                        </button>
                      </li>
                      <li class="nav-item" role="presentation">
                        <button
                          class="nav-link"
                          data-bs-toggle="tab"
                          data-bs-target="#configContainer"
                          type="button"
                          role="tab"
                        >
                          Container
                        </button>
                      </li>
                      <li class="nav-item" role="presentation">
                        <button
                          class="nav-link"
                          data-bs-toggle="tab"
                          data-bs-target="#configFonte"
                          type="button"
                          role="tab"
                        >
                          Fonte
                        </button>
                      </li>
                    </ul>
                    <div class="tab-content" id="myTabContent">
                      <!-- Fundo -->
                      <div
                        id="configFundo"
                        class="
                          tab-pane
                          fade
                          show
                          active
                          p-2
                          border
                          borda-cinza_clara
                          rounded-bottom
                        "
                        role="tabpanel"
                      >
                        <nav>
                          <div class="nav nav-tabs">
                            <button
                              id="btnTipoFundoSolida"
                              class="nav-link active"
                              data-bs-toggle="tab"
                              data-bs-target="#divTemaCustomFundoSolida"
                              @click="
                                previewFundoCorCustom('solida'),
                                  (tipoFundoSelecionado = 'solida')
                              "
                              type="button"
                            >
                              Cor Sólida
                            </button>

                            <button
                              id="btnTipoFundoDegrade"
                              class="nav-link"
                              data-bs-toggle="tab"
                              data-bs-target="#divTemaCustomFundoDegrade"
                              @click="
                                previewFundoCorCustom('degrade'),
                                  (tipoFundoSelecionado = 'degrade')
                              "
                              type="button"
                            >
                              Degradê
                            </button>
                          </div>
                        </nav>
                        <div
                          class="
                            tab-content
                            border
                            borda-cinza_clara
                            rounded-bottom
                            p-2
                          "
                        >
                          <!-- Fundo Cor Sólida -->
                          <div
                            id="divTemaCustomFundoSolida"
                            class="tab-pane fade show active p-2"
                          >
                            <label class="fw-bold ms-1">Cor: </label><br />
                            <input
                              id="pickerFundoCorSolida"
                              class="border-0 colorPicker"
                              @blur="previewFundoCorCustom('solida')"
                              type="color"
                              value="#000000"
                            />
                          </div>

                          <!-- Fundo Degradê -->
                          <div
                            id="divTemaCustomFundoDegrade"
                            class="tab-pane fade"
                          >
                            <div class="d-flex p-2">
                              <div>
                                <label class="fw-bold ms-1">Cor 1: </label
                                ><br />
                                <input
                                  id="pickerFundoCorDegrade1"
                                  class="border-0 colorPicker"
                                  @blur="previewFundoCorCustom('degrade')"
                                  type="color"
                                  value="#000000"
                                />
                              </div>
                              <div>
                                <label></label><br />
                                <img
                                  class="mx-3 mt-0"
                                  src="../../../public/img/icon_arrow-right.svg"
                                  height="32"
                                />
                              </div>
                              <div>
                                <label class="fw-bold ms-1">Cor 2: </label
                                ><br />
                                <input
                                  id="pickerFundoCorDegrade2"
                                  class="border-0 colorPicker"
                                  @blur="previewFundoCorCustom('degrade')"
                                  type="color"
                                  value="#BEBEBE"
                                />
                              </div>
                            </div>

                            <div class="p-2">
                              <div>
                                <span class="me-2">
                                  <label class="fw-bold me-2"
                                    >Inclinação:</label
                                  >
                                  <label>{{ posicaoRange }}º</label>
                                </span>
                              </div>
                              <div>
                                <input
                                  id="rangeFundoCorCustom"
                                  class="form-range w-50"
                                  min="0"
                                  max="360"
                                  @change="previewFundoCorCustom('degrade')"
                                  @blur="previewFundoCorCustom('degrade')"
                                  v-model="posicaoRange"
                                  type="range"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Container -->
                      <div
                        id="configContainer"
                        class="
                          tab-pane
                          fade
                          p-2
                          border
                          borda-cinza_clara
                          rounded-bottom
                        "
                        role="tabpanel"
                      >
                        <div class="me-2">
                          <label class="fw-bold ms-1">Cor: </label><br />
                          <input
                            id="pickerCorContainer"
                            class="border-0 colorPicker me-2 rounded"
                            @blur="previewFundoCorCustom('container')"
                            type="color"
                            value="#9b0000"
                          />
                        </div>
                        <div class="form-check form-switch pt-4">
                          <input
                            id="swtContainerTransparente"
                            class="form-check-input"
                            type="checkbox"
                            role="switch"
                            @change="setarCorContainer"
                            v-model="containerTransparente"
                          />
                          <label
                            class="form-check-label"
                            for="swtContainerTransparente"
                          >
                            Container transparente
                          </label>
                        </div>
                      </div>

                      <!-- Fonte -->
                      <div
                        id="configFonte"
                        class="
                          tab-pane
                          fade
                          p-2
                          border
                          borda-cinza_clara
                          rounded-bottom
                        "
                        role="tabpanel"
                      >
                        <label class="fw-bold ms-1">Cor: </label><br />
                        <input
                          id="pickerFonteCorSolida"
                          class="border-0 colorPicker rounded"
                          @blur="previewFundoCorCustom('fonte')"
                          type="color"
                          value="#FFFFFF"
                        />
                      </div>
                    </div>

                    <hr class="w-100" />
                    <!-- Preview -->
                    <div>
                      <div class="fw-bold">Preview</div>
                      <div class="p-1">
                        <!-- Fundo -->
                        <div
                          id="divPreviewFundoCorCustom"
                          class="previewCoresCustomFundo p-4 rounded"
                        >
                          <!-- Label -->
                          <div>
                            <label
                              id="lblPreviewFonteCustom"
                              class="
                                previewCoresCustomContainer
                                fw-bold
                                p-3
                                rounded
                              "
                            >
                              Cor da fonte do telão
                            </label>
                          </div>
                        </div>
                        <div class="mt-2">
                          <!-- Aplicar Local -->
                          <button
                            class="btn btn-secondary mb-1 me-2"
                            @click="definirCorCustom('local')"
                            data-bs-toggle="tooltip"
                            data-bs-placement="bottom"
                            data-bs-html="true"
                            title="<div class='p-2'><h6>As configurações estarão disponíveis apenas para este telão</h6></div>"
                          >
                            Aplicar Local
                          </button>

                          <!-- Aplicar Global -->
                          <button
                            class="btn btn-secondary mb-1 temaCustomLabel"
                            data-bs-toggle="tooltip"
                            data-bs-placement="bottom"
                            data-bs-html="true"
                            title="<div class='p-2'><h6>As configurações serão salvas no banco e estarão disponíveis para todos os telões</h6></div>"
                            @click="definirCorCustom('global')"
                          >
                            Aplicar Global
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Som -->
              <div id="navContent-som" class="tab-pane fade" role="tabpanel">
                <div>
                  <!-- -->
                  <div class="form-check form-switch mb-2">
                    <input
                      id="swtFalarTexto"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      @click="setFalarTexto"
                    />
                    <label
                      class="form-check-label"
                      for="flexSwitchCheckChecked"
                    >
                      Falar nome do paciente e local de atendimento.
                    </label>
                  </div>

                  <!-- -->
                  <div class="form-check form-switch mb-2">
                    <input
                      id="swtTocarAlerta"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      @click="setTocarAlerta"
                    />
                    <label
                      class="form-check-label"
                      for="flexSwitchCheckChecked"
                    >
                      Tocar som de alerta antes de falar o nome do paciente.
                    </label>
                  </div>
                  <hr />
                  <div>
                    <div>
                      <label class="fw-bold">Voz escolhida:</label>
                      <br />
                      <label id="lblVozEscolhida" class="ms-1"></label>
                    </div>
                    <div class="mt-2">
                      <label class="fw-bold">
                        Lista de vozes disponíveis:
                      </label>
                    </div>
                    <div>
                      <select
                        id="selListaVozes"
                        class="form-select form-select-sm"
                        @change="definirVozChamada"
                      >
                        <option
                          v-for="(voz, index) in listaVozesPC"
                          :key="index"
                        >
                          {{ voz }}
                        </option>
                      </select>
                    </div>
                    <!-- <div>
                      <label class="me-2">Voz Atual:</label>
                      {{ nomeVozConfigurada.value }}
                    </div> -->
                  </div>
                </div>
              </div>

              <!-- Video -->
              <div id="navContent-video" class="tab-pane fade" role="tabpanel">
                <div>
                  <nav>
                    <div class="nav nav-tabs" role="tablist">
                      <button
                        @click="video_tipoVideo = 'streaming'"
                        class="nav-link active"
                        data-bs-toggle="tab"
                        data-bs-target="#videoNavConteudoStreaming"
                        type="button"
                        role="tab"
                      >
                        Streaming
                      </button>
                      <button
                        @click="video_tipoVideo = 'videoLocal'"
                        class="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#videoNavConteudoArquivoLocal"
                        type="button"
                        role="tab"
                      >
                        Mídia Local
                      </button>
                      <button
                        @click="
                          video_tipoVideo = 'placaCaptura';
                          preencherDispositivosVideo();
                        "
                        class="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#videoNavConteudoPlacaCaptura"
                        type="button"
                        role="tab"
                      >
                        Placa de Captura
                      </button>
                    </div>
                  </nav>

                  <div class="pt-2 tab-content w-100">
                    <div
                      id="videoNavConteudoStreaming"
                      class="tab-pane fade show active"
                      role="tabpanel"
                    >
                      <input
                        id="txtvideo_linkStreaming"
                        v-model="urlVideoStreaming"
                        class="form-control"
                        placeholder="Link do vídeo"
                        size="80"
                        type="text"
                      />
                      <br />
                      <div>
                        <b>Link Definido:</b>
                        {{ store.video_linkStreaming }}
                      </div>
                      <span>
                        <b>Para obter o link correto do <u>YouTube</u>:</b>
                        <ol>
                          <li>
                            Abra a página do vídeo desejado e clique em
                            <b>Compartilhar</b>;
                          </li>
                          <li>
                            Será mostrada uma janela com várias opções de
                            compartilhamento e um link no formato
                            "https://youtu.be/gOfOUEReKqs" abaixo
                          </li>
                          <li>
                            Clique no botão <b>Copiar</b> ao lado do link gerado
                            e cole no campo acima.
                          </li>
                        </ol>
                      </span>
                      <hr />
                      <button
                        class="btn btn-sm btn-secondary"
                        @click="definirVideo('streaming')"
                        :disabled="urlVideoStreaming == ''"
                      >
                        Aplicar Vídeo
                      </button>
                      <button
                        class="btn btn-sm btn-danger ms-2 me-2"
                        @click="definirVideo('nenhum')"
                      >
                        Desabilitar Vídeo
                      </button>
                    </div>

                    <div
                      id="videoNavConteudoArquivoLocal"
                      class="tab-pane fade p-2"
                      role="tabpanel"
                    >
                      <div>
                        <label for="txtVideoLocal" class="btn btn-secondary"
                          >Selecionar arquivo de vídeo</label
                        >
                        <input
                          id="txtVideoLocal"
                          type="file"
                          accept="video/mp4"
                          @change="pegarNomeArquivo"
                          hidden
                        />
                      </div>
                      <div class="mt-2">
                        <div class="fw-bold ms-2">Arquivo selecionado:</div>
                        <div class="ms-2">{{ arquivoSelecionado }}</div>
                      </div>
                      <hr />
                      <button
                        class="btn btn-sm btn-secondary"
                        @click="definirVideo('videoLocal')"
                      >
                        Aplicar Vídeo
                      </button>
                      <button
                        class="btn btn-sm btn-danger ms-2 me-2"
                        @click="definirVideo('nenhum')"
                      >
                        Desabilitar Vídeo
                      </button>
                    </div>

                    <div
                      id="videoNavConteudoPlacaCaptura"
                      class="tab-pane fade"
                      role="tabpanel"
                    >
                      <div id="divConteudoPlCaptura">
                        <select
                          id="selDispositivosVideo"
                          @change="setCameraId"
                        ></select>
                      </div>
                      <hr />
                      <!-- <button
                        class="btn btn-sm btn-secondary"
                        @click="definirVideo('placaCaptura')"
                        :disabled="cameraId == ''"
                      >
                        Aplicar Vídeo
                      </button> -->
                      <button
                        class="btn btn-sm btn-secondary"
                        @click="definirVideo('placaCaptura')"
                      >
                        Aplicar Vídeo
                      </button>
                      <button
                        class="btn btn-sm btn-danger ms-2 me-2"
                        @click="definirVideo('nenhum')"
                      >
                        Desabilitar Vídeo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Rodapé -->
              <div id="navContent-rodape" class="tab-pane fade" role="tabpanel">
                <div>
                  <nav>
                    <div class="nav nav-tabs" role="tablist">
                      <button
                        class="nav-link active"
                        data-bs-toggle="tab"
                        data-bs-target="#navNoticiasRss"
                        type="button"
                        role="tab"
                        @click="optRodape = 'rss'"
                      >
                        Notícias
                      </button>
                      <button
                        hidden
                        class="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#navTextoPadrao"
                        type="button"
                        role="tab"
                        @click="optRodape = 'textoPadrao'"
                      >
                        Texto Padrão
                      </button>
                    </div>
                  </nav>

                  <div class="tab-content">
                    <!-- RSS -->
                    <div
                      id="navNoticiasRss"
                      class="tab-pane p-2 fade show active"
                      role="tabpanel"
                    >
                      <select id="selRssNoticias" class="form-select mt-1 w-50">
                        <optgroup label="Agência Brasil">
                          <option value="AgenciaBrasilGeral">AG - Geral</option>
                          <option value="AgenciaBrasilInternacional">AG - Internacional</option>
                          <option value="AgenciaBrasilPolitica">AG - Política</option>
                          <option value="AgenciaBrasilSaude">AG - Saúde</option>
                          <option value="AgenciaBrasilUltimasNoticias">AG - Últimas Notícias</option>
                          <option value=""></option>
                        </optgroup>

                        <optgroup label="BBC Brasil">
                          <option value="BBCBrasilPrimeiraPagina">BBC - Primeira Página</option>
                          <option value=""></option>
                        </optgroup>

                        <!-- <optgroup label="Correio Braziliense">
                          <option value="CorreioBrazilienseBrasil">CB - Brasil</option>
                          <option value="CorreioBrasilienseDF">CB - Distrito Federal</option>
                          <option value=""></option>
                        </optgroup> -->

                        <optgroup label="Estado de Minas">
                          <option value="EstadoMinasEconomia">EM - Economia</option>
                          <option value="EstadoMinasInternacional">EM - Internacional</option>
                          <option value="EstadoMinasNacional">EM - Nacional</option>
                          <option value=""></option>
                        </optgroup>

                        <optgroup label="G1 - Geral">
                          <option value="G1Brasil" selected>G1 - Brasil</option>
                          <option value="G1CienciaSaude">G1 - Ciência e Saúde</option>
                          <option value="G1Economia">G1 - Economia</option>
                          <option value="G1Mundo">G1 - Mundo</option>
                          <option value=""></option>
                        </optgroup>

                        <optgroup label="G1 - Regional">
                          <option value="G1RegAC">G1 - Acre</option>
                          <option value="G1RegAL">G1 - Alagoas</option>
                          <option value="G1RegAM">G1 - Amazonas</option>
                          <option value="G1RegAP">G1 - Amapá</option>
                          <option value="G1RegBA">G1 - Bahia</option>
                          <option value="G1RegCE">G1 - Ceará</option>
                          <option value="G1RegDF">G1 - Distrito Federal</option>
                          <option value="G1RegES">G1 - Espírito Santo</option>
                          <option value="G1RegGO">G1 - Goiás</option>
                          <option value="G1RegMT">G1 - Mato Grosso</option>
                          <option value="G1RegMS">G1 - Mato Grosso do Sul</option>
                          <option value="G1RegMA">G1 - Maranhão</option>
                          <option value="G1RegMG">G1 - Minas Gerais</option>
                          <option value="G1RegPA">G1 - Pará</option>
                          <option value="G1RegPB">G1 - Paraíba</option>
                          <option value="G1RegPR">G1 - Paraná</option>
                          <option value="G1RegPE">G1 - Pernambuco</option>
                          <option value="G1RegRJ">G1 - Rio de Janeiro</option>
                          <option value="G1RegRN">G1 - Rio Grande do Norte</option>
                          <option value="G1RegRS">G1 - Rio Grande do Sul</option>
                          <option value="G1RegRO">G1 - Rondônia</option>
                          <option value="G1RegRR">G1 - Roraima</option>
                          <option value="G1RegSC">G1 - Santa Catarina</option>
                          <option value="G1RegSP">G1 - São Paulo</option>
                          <option value="G1RegSE">G1 - Sergipe</option>
                          <option value="G1RegTO">G1 - Tocantins</option>
                          <option value=""></option>
                        </optgroup>

                        <optgroup label="Gazeta do Povo">
                          <option value="GazetaDoPovoEconomia">GdP - Economia</option>
                          <option value="GazetaDoPovoMundo">GdP - Mundo</option>
                          <option value="GazetaDoPovoRepublica">GdP - República</option>
                          <option value=""></option>
                        </optgroup>

                        <optgroup label="Notícias ao Minuto">
                          <option value="NoticiasAoMinutoBrasil">NM - Brasil</option>
                          <option value="NoticiasAoMinutoPolitica">NM - Política</option>
                          <option value="NoticiasAoMinutoUltimaHora">NM - Última Hora</option>
                          <option value=""></option>
                        </optgroup>

                        <optgroup label="O Piauí">
                          <option value="OPauiBrasil">OP - Brasil</option>
                          <option value="OPauiPiaui">OP - Piauí</option>
                          <option value="NoticiasAoMinutoUltimaHora">OP - </option>
                          <option value=""></option>
                        </optgroup>

                        <optgroup label="R7">
                          <option value="R7Noticias">R7 - Notícias</option>
                          <option value="R7DF">R7 - Distrito Federal</option>
                          <option value="R7MG">R7 - Minas Gerais</option>
                          <option value="R7SP">R7 - São Paulo</option>
                          <option value="R7RJ">R7 - Rio de Janeiro</option>
                          <option value=""></option>
                        </optgroup>

                        <optgroup label="UOL">
                          <option value="UOLPrimeiraPagina">UOL - Primeira Página</option>
                          <option value=""></option>
                        </optgroup>
                      </select>
                    </div>

                    <!-- Texto Padrão -->
                    <div
                      id="navTextoPadrao"
                      class="tab-pane p-2 fade"
                      role="tabpanel"
                    >
                      <div><label>Texto Padrão:</label></div>
                      <div>
                        <input
                          class="form-control"
                          v-model="conteudoTextoPadrao"
                          onkeypress="document.getElementById('opTextoPadrao').click()"
                          maxlength="120"
                          type="text"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <hr />
                <button
                  class="btn btn-sm btn-secondary"
                  @click="definirConfigRodape"
                >
                  Aplicar Rodapé
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary bg-danger"
            data-bs-dismiss="modal"
            @click="carregarListaPacientes"
          >
            Fechar
          </button>
        </div>
      </div>

    </div>
  </div>
</template>