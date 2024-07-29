<template>
  <div class="d-flex justify-content-center rounded">
    <div class="mb-0 me-2 mt-5 px-3 text-center w-100">

      <div id="containerSenhaAtual" class="container-senha-atual mx-auto py-4 rounded w-50" :style="(store.tema_estiloCustomFonte, store.tema_estiloCustomContainer)">
        <div class="mb-0">
          <label class="cor-customizada">{{ senhaAtual.nome.substring(0, 20).replace("Senha ", "") }} </label>
        </div>
        <div class="mt-3 cor-customizada">
          {{ senhaAtual.local.substring(0, 25) }}
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// Imports
import { defineProps } from "vue";
import { store } from "../../store";

// Props
const props = defineProps(["senhaAtual"]);
</script>