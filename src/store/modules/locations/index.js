import $axios from '~/plugins/axios'

import filterEmptyLocations from '~/lib/filter-empty-locations'
import getMonitoringLocationsForEveryLocation from '~/lib/get-monitoring-locations-for-every-location'
import filterMonitoringLocationsBasedOnLocation from '~/lib/filter-monitoring-locations-based-on-location'

const { VUE_APP_API_VERSION } = process.env

export default {
  namespaced: true,

  state: () => ({
    locations: [],
  }),
  getters: {
    availableMonitoringLocations(state) {
      const { locations } = state
      return getMonitoringLocationsForEveryLocation(locations)
    },
    selectedMonitoringLocations(state, getters, rootState) {
      const { availableMonitoringLocations } = getters
      const { activeMapLocation } = rootState.layers
      const { locationId } = activeMapLocation
      return filterMonitoringLocationsBasedOnLocation(availableMonitoringLocations, locationId)
    },
    
  },

  actions: {
    getLocations(context) {
      const params = {
        showAttributes: 'true',
        includeLocationRelations: 'true',
        documentFormat: 'PI_JSON',
      }

      return $axios.get(`/FewsWebServices/rest/fewspiservice/${ VUE_APP_API_VERSION }/locations`, { params })
        .then(response => response?.data?.locations)
        .then(filterEmptyLocations)
        .then(locations => context.commit('SET_LOCATIONS', { locations }))
    },
  },

  mutations: {
    SET_LOCATIONS(state, { locations }) {
      state.locations = locations
    },
  },
}
