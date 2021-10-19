/**
 * Get monitoring locations from locations response .
 *
 * Steps:
 * 1. Filter by relations that contain monnet
 * 2. Use .map() to return the monitoring locations and the waterbodies that have in their relations
 * 3. Filter by attributues OWMIDENT to get the waterbodyLocations
 * 4. Map every waterbody and filter the monitoringLocations if the include the waterbody in their array of waterbodies
 * 

 */
export default (locations) => {
  if (!locations.length) {
    return []
  }

  const filterByMonnetParent = ({ id }) => id.includes('monnet') === true
  
  const monitoringLocations = locations
    .filter(({ relations }) => relations.find(filterByMonnetParent))
    .map((location) => {
      
      const monitoringLocationId = location.locationId
      const monitoringLocationName = location.attributes[1].value
                                     
      const waterbodies = location.relations
                          .map((relation) => {
                            return relation.relatedLocationId})
      return {
        'monitoringLocationId': monitoringLocationId,
        'monitoringLocationName': monitoringLocationName,
        'waterbodies': waterbodies,
      }
    
    })
  

  const filterByBodyOfWater = ({ name }) => name === 'OWMIDENT'
  const waterbodyLocations = locations
    .filter(({ attributes }) => attributes.find(filterByBodyOfWater))
    .map(({ attributes }) => {
      const match = attributes.find(filterByBodyOfWater)
      return match?.value || null
    })
 

  const waterbodiesWithMonitoringLocations = waterbodyLocations
                                              .map((waterbody)=> {
                                                
                                                const filteredMonitoringLocations = monitoringLocations
                                                  .filter((monLoc) =>{
                                                    return monLoc.waterbodies.includes(waterbody)
                                                  })
                                                
                                                return {
                                                  'waterbody': waterbody,
                                                  'monitoringLocations': filteredMonitoringLocations,
                                                }
                                                
                                              })
  
  return waterbodiesWithMonitoringLocations
}
