import { reactive } from 'vue';
import { createStore } from 'vuex'

export const store = reactive({
  // Vídeo
  video_linkStreaming: '',
  video_nomeVideoLocal: '',
  video_semVideoDefinido: false,
  video_tipoVideo: (localStorage.getItem('video_tipoVideo')) ? localStorage.getItem('video_tipoVideo') : 'semVideo',
  video_streaming_yt_videoId: '',

  // Rodapé
  rodape_tipoRodape: (localStorage.getItem('rodape_tipoRodape')) ? localStorage.getItem('rodape_tipoRodape') : 'rss',
  rodape_localRss: (localStorage.getItem('rodape_localRss')) ? localStorage.getItem('rodape_localRss') : 'G1',

  // Tema
  tema_temaSelecionado: '',
  tema_estiloCustomFonte: '',
  tema_estiloCustomContainer: '',
  tema_estiloCustomFundo: '',
  tema_estruturaTemaBanco: '',

  // Telão
  telaoSelecionado: (localStorage.getItem('telaoSelecionado')) ? localStorage.getItem('telaoSelecionado') : null,
});

const state = {
  localRss: null
}

const mutations = {
  alterarLocalRss(state, local) {
    state.localRss = local
  }
}

const actions = {
  alterarLocalRss: ({ commit }, local) => commit('alterarLocalRss', local)
}

const getters =  {
  localRss: state => state.localRss
}

export const storeRodape = createStore({
  state,
  mutations,
  actions,
  getters
});