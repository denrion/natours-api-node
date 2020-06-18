/* eslint-disable */
const mapSection = document.getElementById('map');
const locations = JSON.parse(mapSection.dataset.locations);

mapboxgl.accessToken = process.env.MAPBOX_API_KEY;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/denrion91/ckbkse39v0w8e1ip8p01aorbp',
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create Marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add Marker to map
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extends the map bounds to include the current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
