<template>
  <div>
    <div :class="showNews ? '' : 'visually-hidden'">
      <div class="rss-logomarca">
        <img
          id="imgLogomarcaRss"
          :class="!imgRss ? 'visually-hidden' : ''"
          :src="!imgRss ? '../img/imgJornal.png' : imgRss"
        />
      </div>
      <div class="noticia-container">
        <div
          id="lista-noticias"
          class="lista-noticias mt-2"
          :class="
            store.rodape_tipoRodape == 'rss'
              ? 'lista_noticias-duracao_media'
              : 'lista_noticias-duracao_TextoPadrao'
          "
        >
          <!-- rss -->
          <div v-show="store.rodape_tipoRodape == 'rss'">
            <div
              v-for="(item, i) in listaNoticias"
              :key="i"
              class="titulo-noticia espaco-direita-noticia"
            >
              📰 {{ item.title }}.
            </div>
          </div>

          <!-- Texto Padrão -->
          <div v-show="store.rodape_tipoRodape == 'textoPadrao'">
            <div class="titulo-noticia espaco-direita-noticia mt-2">
              {{ textoPadrao.value }}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// Imports
import { defineProps, onMounted, reactive, ref, watch, watchEffect } from "vue";
import { carregarRss, utf8Encode } from "../../../public/util";
import { store } from "../../store";
import { processSlotOutlet } from "@vue/compiler-core";
import { useStore } from "vuex";

// Props
const props = defineProps({
  showNews: {
    type: Boolean,
  },
  localRss: {
    type: String,
  }
});


const storeRodape = useStore();

// Vars
let imgRss = ref("");
let listaNoticias = ref("");
let textoPadrao = ref("");
const timerBuscarNoticias = 180000;
//const timerBuscarNoticias = 10000;
const maxNoticias = 50;

storeRodape.subscribe((mutation, state) => {
  buscarNoticiasRSS(state.localRss);
})

//
async function buscarNoticiasRSS() {
  // Carrega a lista de notícias
  carregarRss().then((res) => {
    // Pega o local do rss setado
    let localRss = localStorage.getItem("localRss");

    // Adapta a resposta ao tipo
    switch (localRss) {
      // Agência Brasil
      case "AgenciaBrasilGeral":
      case "AgenciaBrasilInternacional":
      case "AgenciaBrasilPolitica":
      case "AgenciaBrasilSaude":
      case "AgenciaBrasilUltimasNoticias":
        estruturaRSS("tipo1", res, "./img/logo_AgenciaBrasil.png");
        break;

      // BBC Brasil
      case "BBCBrasilPrimeiraPagina":
        estruturaRSS("tipo2", res, "./img/logo_BBCBrasil.png");
        break;

      // Correio Braziliense
      // case "CorreioBrazilienseBrasil":
      // case "CorreioBrasilienseDF":
      //   estruturaRSS("tipo2", res, "./img/logo_CorreioBraziliense.png");
      //   break;

      // Estado de Minas
      case "EstadoMinasEconomia":
      case "EstadoMinasInternacional":
      case "EstadoMinasNacional":
        estruturaRSS("tipo2", res, "./img/logo_EstadoDeMinas.png");
        break;

      // G1
      case "G1Brasil":
      case "G1CienciaSaude":
      case "G1Economia":
      case "G1Mundo":
      case "G1RegAC":
      case "G1RegAL":
      case "G1RegAM":
      case "G1RegAP":
      case "G1RegBA":
      case "G1RegCE":
      case "G1RegDF":
      case "G1RegES":
      case "G1RegGO":
      case "G1RegMT":
      case "G1RegMS":
      case "G1RegMA":
      case "G1RegMG":
      case "G1RegPA":
      case "G1RegPB":
      case "G1RegPR":
      case "G1RegPE":
      case "G1RegRJ":
      case "G1RegRN":
      case "G1RegRS":
      case "G1RegRO":
      case "G1RegRR":
      case "G1RegSC":
      case "G1RegSP":
      case "G1RegSE":
      case "G1RegTO":
        estruturaRSS("tipo4", res, "./img/logo_G1.png");
        break;

      // Gazeta do Povo
      case "GazetaDoPovoEconomia":
      case "GazetaDoPovoMundo":
      case "GazetaDoPovoRepublica":
        estruturaRSS("tipo2", res, "./img/logo_GazetaDoPovo.png");
        break;

      // Notícias ao Minuto
      case "NoticiasAoMinutoBrasil":
      case "NoticiasAoMinutoPolitica":
      case "NoticiasAoMinutoUltimaHora":
        estruturaRSS("tipo2", res, "./img/logo_NoticiasAoMinuto.png");
        break;

      // O Piauí
      case "OPauiBrasil":
      case "OPauiPiaui":
        estruturaRSS("tipo2", res, "./img/logo_OPiaui.png");
        break;


      // R7
      case "R7Noticias":
      case "R7DF":
      case "R7MG":
      case "R7SP":
      case "R7RJ":
        estruturaRSS("tipo5", res, "./img/logo_R7.png");
        break;

      // UOl
      case "UOLPrimeiraPagina":
        estruturaRSS("tipo3", res, "./img/logo_UOL.png");
        break;

      default:
        break;
    }

    // Limita o array de noticias
    if (listaNoticias.value.length > maxNoticias) {
      listaNoticias.value = listaNoticias.value.slice(0, maxNoticias);
    }

    // ---------------------------------------
    // Animação
    document.getElementById("lista-noticias").className = "";
    if (listaNoticias.value.length <= 15) {
      document.getElementById("lista-noticias").className =
        "lista-noticias mt-2 lista_noticias-duracao_curta";
    } else if (
      listaNoticias.value.length > 15 &&
      listaNoticias.value.length <= 30
    ) {
      document.getElementById("lista-noticias").className =
        "lista-noticias mt-2 lista_noticias-duracao_media";
    } else {
      document.getElementById("lista-noticias").className =
        "lista-noticias mt-2 lista_noticias-duracao_longa";
    }
  });

  // ---
}

function estruturaRSS(tipo, res, img) {
  switch (tipo) {
    // Tipo 1
    case "tipo1":
      {
        imgRss.value = img;
        res = res.data.rss.channel.item;
        let x = [];
        let y = "";
        res.forEach((e) => {
          y = { title: e.title };
          x.push(y);
        });
        listaNoticias.value = x;
      }
      break;

    // Tipo 2
    case "tipo2":
      {
        res = res.data.rss.channel.item;
        imgRss.value = img;

        let x = [];
        let y = "";
        res.forEach((e) => {
          y = JSON.stringify(e.title)
            .replaceAll('{"#cdata-section":"', "")
            ?.replaceAll('"}', "");
          y = { title: y };
          x.push(y);
        });
        listaNoticias.value = x;
      }
      break;

    // Tipo 3
    case "tipo3":
      {
        res = res.data.rss.channel.item;
        imgRss.value = img;

        let x = [];
        let y = "";
        res.forEach((e) => {
          y = JSON.stringify(e.description)
            .replaceAll('{"#cdata-section":"', "")
            ?.replaceAll('"}', "");
          y = { title: y };
          x.push(y);
        });
        listaNoticias.value = x;
      }
      break;

    // Tipo 4
    case "tipo4":
      {
        res = res.data.rss.channel;
        imgRss.value = img;
        res = res.item;
        listaNoticias.value = res;
      }
      break;

    // Tipo 5
    case "tipo5":
      {
        res = res.data.feed.entry;
        imgRss.value = img;

        let x = [];
        let y = "";
        res.forEach((e) => {
          y = JSON.stringify(e.title)
            .replaceAll('{"@type":"html","#text":"', "")
            ?.replaceAll('"}', "");

          y = { title: y };
          x.push(y);
        });

        listaNoticias.value = x;
      }
      break;

    //
    default:
      break;
  }
}

// Hooks
onMounted(() => {
  // Verifica o tipo de rodapé
  // Se = rSS
  if (store.rodape_tipoRodape == "rss") {
    buscarNoticiasRSS();
  }
  // Texto Padrão
  else if (store.rodape_tipoRodape == "textoPadrao") {
    //
    textoPadrao.value = localStorage.getItem("fraseTextoPadrao") ?? "";
  }
});

// Recarrega a lista de notícias a cada X minutos
setInterval(() => {
  carregarRss().then((res) => {
    buscarNoticiasRSS();
  });
}, timerBuscarNoticias);


</script>

<style lang="scss" scoped>
.espaco-direita-noticia {
  margin-right: 150px;
}

#imgLogomarcaRss {
  $valor: 54px;
  height: $valor;
  width: $valor;
}

.rss-logomarca {
  background-color: #111;
  position: fixed;
  bottom: 0px;
  height: 80px;
  left: 0px;
  padding-left: 10px;
  padding-top: 12px;
  width: 80px;
  z-index: 150;
}

$duracao_curta: 300s;
$duracao_media: 800s;
$duracao_longa: 1600s;
$duracaoTextoPadrao: 30s;

@-webkit-keyframes kfListaNoticias {
  0% {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    visibility: visible;
  }
  100% {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
}
@keyframes kfListaNoticias {
  0% {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    visibility: visible;
  }
  100% {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }
}

.noticia-container {
  background-color: rgba(20, 24, 28, 0.8);
  bottom: 0px;
  font-weight: bold;
  height: 80px;
  padding-top: 5px;
  overflow: hidden;
  padding-left: 100%;
  position: fixed;
  width: 100%;
}

.lista_noticias-duracao_curta {
  animation-duration: $duracao_curta;
}
.lista_noticias-duracao_media {
  animation-duration: $duracao_media;
}
.lista_noticias-duracao_longa {
  animation-duration: $duracao_longa;
}
.lista_noticias-duracao_TextoPadrao {
  animation-duration: $duracaoTextoPadrao;
}

.noticia-container .lista-noticias {
  display: inline-flex;
  height: 4rem;
  white-space: nowrap;
  padding-right: 100%;
  box-sizing: content-box;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-name: kfListaNoticias;
}

.noticia-container .titulo-noticia {
  display: inline-flex;
  align-items: center;
  padding: 0 2rem;
  font-size: 2rem;
  color: white;
}
</style>