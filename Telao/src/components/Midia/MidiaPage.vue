<template>
  <div>
    <div ref="containerMidia" id="divContainerMidia" style="height: 60vh;" v-show="showMidia" class="mt-3 w-100">
      <!-- src="https://www.youtube.com/embed/gOfOUEReKqs?&mute=1&autoplay=1&controls=1" -->
      <div v-show="store.video_semVideoDefinido == true"
        class="cor-customizada"
      >
        <b>
          <label class="bg-secondary p-2 rounded text-light">
            Sem vídeo definido!
            </label>
        </b>
        <br />
      </div>

      <!-- Youtube / Streaming -->
      <div
        id="divIframeMidiaStreaming"
        class="pb-3"
        v-show="store.video_tipoVideo == 'streaming'"
      >
        <div id="playerYT"></div>
      </div>

      <!-- Mídia Local -->
      <div v-show="store.video_tipoVideo == 'videoLocal'">
        <video
          ref="elementoMidiaLocal"
          id="videoLocal"
          class="rounded"
          autoplay
          controls
          loop
          muted
          type="video/mp4"
          accept="video/mp4"
        ></video>
      </div>

      <!-- Pl. Captura -->
      <div v-show="store.video_tipoVideo == 'placaCaptura'">
        <video
          id="vidPlacaCaptura"
          class="midia__tamanho-midia-captura rounded"
          autoplay
          controls
          muted
        >
          <!-- <source id="srcVideoLocal" src="" type="video/mp4" /> -->
        </video>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// Imports
import { onMounted, ref } from "vue";
import { store } from "../../store";
import { aplicarVideoCaptura } from "../../../public/util";

//
//let video_semVideoDefinido = ref(false);
let urlLinkStreaming = ref("");
let video_tipoVideo = ref("");
let containerMidia = ref(""); 
let elementoMidiaLocal = ref("");

// Props
const props = defineProps(["showMidia"]);

//
async function getVideoPDB() {
  pdb
    .get("blobVideoLocal")
    .then(function (doc) {
      return doc.blob;
    })
    .then(function (response) {
      var URL = window.URL || window.webkitURL;
      var vidURL = URL.createObjectURL(response);
      let videoDOM = document.getElementById("videoLocal");
      videoDOM.src = vidURL;
    })
    .catch(function (err) {
      console.log(err);
    });
}

//Redimenciona a midia local para caber no aspecto da janela.
function redimensionarMidia() {
  const larguraContainer = containerMidia.value?.clientWidth;
  const alturaContainer = containerMidia.value?.clientHeight;

  const larguraInicial = elementoMidiaLocal.value?.clientWidth;
  const alturaInicial = elementoMidiaLocal.value?.clientHeight;
  
  const aspecto = Math.min(larguraContainer / larguraInicial, alturaContainer / alturaInicial); //aspecto da imagem, usado para escalar a imagem original sem esticar.

  elementoMidiaLocal.value.style.height = (alturaInicial * aspecto) + 'px';
}

onMounted(async () => {

  video_tipoVideo.value = localStorage.getItem("video_tipoVideo");

  if (video_tipoVideo.value == null) {
    //video_semVideoDefinido.value = true;
    store.video_semVideoDefinido = true;
  }

  // Verifica vídeo streaming
  if (video_tipoVideo.value == "streaming") {
    urlLinkStreaming.value = localStorage.getItem("linkStreaming") ? localStorage.getItem("linkStreaming") : store.video_streaming_yt_videoId;
    if (urlLinkStreaming.value != "") {
      store.video_semVideoDefinido = false;
    }
  }

  // Verifica Mídia Local
  if (video_tipoVideo.value == "videoLocal") {
    store.video_semVideoDefinido = false;
    //getVideoIDB();
    getVideoPDB();
  }

  // Verifica Placa de Captura
  if (video_tipoVideo.value == "placaCaptura") {
    store.video_semVideoDefinido = false;

    let capturaId = localStorage.getItem("capturaID");
    if (capturaId) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return;
      }

      navigator.mediaDevices
        .enumerateDevices()
        .then(function (devices) {
          var sel = document.getElementById("selDispositivosVideo");
          sel.innerText = "";

          let arrDevices = [];
          devices.forEach(function (device) {
            if (device.kind == "videoinput" && device.deviceId != "") {
              arrDevices.push(device.deviceId);
            }
          });

          if (arrDevices.includes(capturaId)) {
            aplicarVideoCaptura(capturaId);
          }
        })
        .catch(function (err) {
          console.log(err.name + ": " + err.message);
        });
    }
  }


  window.addEventListener('resize', redimensionarMidia);
  redimensionarMidia();
});
</script>
