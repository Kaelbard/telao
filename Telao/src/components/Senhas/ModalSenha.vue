<template>
  <div id="modalNovaSenha" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content p-4">
        <div
          class="
            modal-body
            modal-senha__conteudo
            modal-senha__piscar-borda
            pt-5
            rounded
            text-center
          "
        >
          <div class="modal-senha__espacador-topo">
            <div id="divModalSenhaNome" class="mb-5 modal-senha__nome-paciente">
              <label class="fw-bold">
                {{ paciente.nome.substring(0, 30).toUpperCase() }}
              </label>
            </div>

            <div>
              <i class="bi bi-arrow-down display-1 fw-bold me-5 text-black"></i>
            </div>

            <div id="divModalSenhaLocal" class="modal-senha__local">
              <label class="fw-bold">
                {{ paciente.local.substring(0,25).toUpperCase() }}
              </label>
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
import { defineProps } from "vue";

// Props
const props = defineProps(["paciente"]);
</script>