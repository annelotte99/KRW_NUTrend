import $axios from '~/plugins/axios'

import services from '~/config/services.json'
import filterFeaturesCollection from '~/lib/filter-features-collection'
import mapTimeseriesToGeoJSON from '~/lib/map-timeseries-to-geojson'
import buildCirclesColor from '~/lib/build-circles-color'
import buildCirclesColorsRangeValues from '~/lib/build-circles-color-range-values'
import buildPaintObject from '~/lib/build-paint-object'
import buildPaintObjectDiffMaps from '~/lib/build-paint-object-diff-maps'
import mapTimeseriesToGeoJSONFloatValues from '~/lib/map-timeseries-to-geojson-float-values'

const { VUE_APP_API_VERSION } = process.env

export default {
  namespaced: true,

  state: () => ({
    activeMap: null,
    activeMapLocation: null,
    featuresCollection: [],
    legend: [],
    differenceMap: false,
  }),

  getters: {
    filteredMap(state, getters, rootState, rootGetters) {
      const waterBodies = rootGetters['filters/availableWaterBodies']
      const { selectedBodyOfWater, selectedType } = rootState.filters

      if (state.activeMap?.data && state?.legend.length) {
        const featuresCollection = filterFeaturesCollection(
          state.activeMap.data,
          waterBodies,
          selectedBodyOfWater,
        )
        const data = { data: featuresCollection }
        const circlesColor = selectedType === 'concentration' || selectedType === 'trends'
          ? buildCirclesColorsRangeValues(state.legend) //TODO change name to buildCirclesColorsRangeValues
          : buildCirclesColor(state.legend)

        const paint = state.differenceMap
          ? { paint: buildPaintObjectDiffMaps(circlesColor) }
          : { paint: buildPaintObject(circlesColor) }

        return { ...state.activeMap, ...data, ...paint }
      }
    },
    activeService(state, getters, rootState) {
      const { selectedParticle, selectedType } = rootState.filters
      const { id } = state.activeMap

      const service = services.find(service => service.id === selectedType)
      const particle = service.spatialPlots.find(plot => plot.id === selectedParticle)

      return particle.services.find(service => service.id === id)
    },
  },

  actions: {
    getTimeSeries({ commit, state, rootState }) {
      
      const { id } = state.activeMap
      const { selectedTimestamp, selectedType } = rootState.filters
      const params = {
        filterId: id,
        startTime: selectedTimestamp,
        endTime: selectedTimestamp,
        documentFormat: 'PI_JSON',
      }
      return $axios
        .get(`/FewsWebServices/rest/fewspiservice/${ VUE_APP_API_VERSION }/timeseries`, { params })
        .then(response => response?.data)
        .then(selectedType === 'concentration' ? mapTimeseriesToGeoJSONFloatValues : mapTimeseriesToGeoJSON)
        .then((timeSeries) => {
          commit('ADD_DATA_TO_ACTIVE_MAP', timeSeries)
        })
    },
    //TODO change name it is not used only for difference maps but also for trends getTimeSeriesStandardTime getTimeSeriesDifferenceMaps
    getTimeSeriesWithStandardTime({ commit, state, rootState }) {

      const { url } = state.activeMap
      const { selectedType } = rootState.filters
      return $axios
        .get(url)
        .then((response) => response?.data)
         .then(selectedType === 'trends' ? mapTimeseriesToGeoJSONFloatValues : mapTimeseriesToGeoJSON)
        .then((timeSeries) => {
          commit('ADD_DATA_TO_ACTIVE_MAP', timeSeries)
        })
    },
    getLegendGraphic({ commit, state }) {
      const { legendGraphicId } = state.activeMap
      const params = {
    	  request: 'GetLegendGraphic',
        service: 'WMS',
        format: 'application/json',
        layers: legendGraphicId,
      }

      return $axios
        .get('/FewsWebServices/wms?', { params })
        .then((response) => response?.data)
        .then(({ legend }) => {
          commit('SET_LEGEND_GRAPHIC', { legend })
        })
    },
    resetActiveMap(context) {
      context.commit('RESET_ACTIVE_MAP')
    },
    resetActiveMapLocation(context) {
      context.commit('RESET_ACTIVE_MAP_LOCATION')
    },
    resetLegend(context) {
      context.commit('RESET_LEGEND')
    },
    setActiveMap(context, payload) {
      context.commit('SET_ACTIVE_MAP', payload)
    },
    setActiveMapLocation(context, payload) {
      context.commit('SET_ACTIVE_MAP_LOCATION', payload)
    },
    setDifferenceMap(context, payload) {
      context.commit('SET_DIFFERENCE_MAP', payload)
    },
  },

  mutations: {
    ADD_DATA_TO_ACTIVE_MAP(state, features) {
      const data = { data: features }
      state.activeMap = { ...state.activeMap, ...data }
    },
    RESET_ACTIVE_MAP(state) {
      state.activeMap = null
    },
    RESET_ACTIVE_MAP_LOCATION(state) {
      state.activeMapLocation = null
    },
    RESET_LEGEND(state) {
      state.legend = []
    },
    SET_ACTIVE_MAP(state, { activeMap }) {
      state.activeMap = activeMap
    },
    SET_ACTIVE_MAP_LOCATION(state, activeMapLocation ) {
      state.activeMapLocation = activeMapLocation
    },
    SET_LEGEND_GRAPHIC(state, { legend }) {
      state.legend = legend
    },
    SET_DIFFERENCE_MAP(state, boolean) {
      state.differenceMap = boolean
    },
  },
}
