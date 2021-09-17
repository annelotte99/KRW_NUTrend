import $axios from '~/plugins/axios'

import filterFeaturesCollection from '~/lib/filter-features-collection'
import mapTimeseriesToGeoJSON from '~/lib/map-timeseries-to-geojson'

const { VUE_APP_API_VERSION } = process.env

export default {
  namespaced: true,

  state: () => ({
    activeMapLayer: null,
    mapLayerData: null,
    featuresCollection: [],
    selectedLayer: {
      id: "krw-wl-ntot-toets-lSGBP",
      paint: {
        "circle-radius": 6,
        "circle-stroke-color": "#000000",
        "circle-stroke-opacity": 1,
        "circle-color": [
          "match",
          [ "get", "value" ],
          "4",
          "#a0ee45",
          "3",
          "#ffff00",
          "2",
          "#EE9900",
          "1",
          "#E51B23",
          "#ccc",
        ],
      },
    },
  }),

  getters: {
    availableLayer(state, getters, rootState, rootGetters) {
      const waterBodies = rootGetters['filters/availableWaterBodies']
      const layer = state.selectedLayer
      if (layer.data) {
        const featuresCollection = filterFeaturesCollection(
          layer.data,
          waterBodies,
        )
        const data = { data: featuresCollection }
        return { ...layer, ...data }
      }
    },
  },

  actions: {
    getTimeSeries(context, payload) {
      const { url } = payload

      return $axios.get(url)
        .then(response => response?.data)
        .then(mapTimeseriesToGeoJSON)
        .then(json => context.commit('SET_MAP_LAYER_DATA', { mapLayerData: json }))
    },
    getDefaultMapLayer({ commit, state, rootState }) {
      const { id } = state.selectedLayer
      const { selectedTimestamp } = rootState.filters
      const params = {
        filterId: id,
        startTime: selectedTimestamp,
        endTime: selectedTimestamp,
        documentFormat: 'PI_JSON',
      }

      return $axios
        .get(`/FewsWebServices/rest/fewspiservice/${ VUE_APP_API_VERSION }/timeseries`, { params })
        .then(response => response?.data)
        .then(mapTimeseriesToGeoJSON)
        .then((timeSeries) => {
          commit('ADD_FEATURES_TO_LAYER', timeSeries)
        })
    },
    setActiveMapLayer(context, payload) {
      context.commit('SET_ACTIVE_MAP_LAYER', payload)
    },
  },

  mutations: {
    ADD_FEATURES_TO_LAYER(state, features) {
      const data = { data: features }
      state.selectedLayer = { ...state.selectedLayer, ...data }
    },
    SET_ACTIVE_MAP_LAYER(state, { activeMapLayer }) {
      state.activeMapLayer = activeMapLayer
    },
    SET_MAP_LAYER_DATA(state, { mapLayerData }) {
      state.mapLayerData = mapLayerData
    },
  },
}
