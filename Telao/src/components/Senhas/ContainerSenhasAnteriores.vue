<template>
  <div>
    <div
      id="containerSenhasAnteriores"
      class="container-senhas-anteriores ps-3 rounded"
      :style="(store.tema_estiloCustomFonte, store.tema_estiloCustomContainer)"
    >
      <div class="mb-4 mt-5" @dblclick="telaCheia">
        <label class="border-bottom border-secondary fw-bold mt-3">
          Senhas Anteriores
        </label>
      </div>

      <div>
        <div class="pb-2 ps-1 w-100">
          <div class="mb-4 mb-md-2" v-for="(paciente, i) in listaSenhasAnteriores" :key="i">
            <span class="container-senhas-anteriores__senha">
              <label class="me-4 cor-customizada">
                {{ paciente.nome.substring(0, 25).replace("Senha ", "") }}
              </label>
              <label class="fs-5 cor-customizada">
                {{ paciente.hora }}
              </label>
            </span>
            <br />
            <span class="container-senhas-anteriores__local">
              <label class="mx-2">
                <i class="bi bi-arrow-return-right sombra-texto"></i>
              </label>
              <label class="sombra-texto">
                {{ paciente.local.substring(0, 20) }}
              </label>
            </span>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>


<script setup>
/* eslint-disable vue/no-unused-components */
/* eslint-disable no-unused-vars */

// Imports
import { defineProps } from "vue";
import { store } from "../../store";

// Colocar em tela cheia
function telaCheia() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Props
const props = defineProps(["listaSenhasAnteriores"]);

</script>