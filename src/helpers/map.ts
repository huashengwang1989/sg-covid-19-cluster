import mapboxgl from 'mapbox-gl'
import { Position } from 'geojson'
import { Cluster } from '../types/cluster'
import dayjs from 'dayjs'
import Color from 'color'

interface GeodataFeatureProperties {
  name: string
  short?: string
  cnName?: string
  value: number
  todayUpdateNum: number
  severity: Severity
  recent: Recent
  geopoint: number[]
  height: number
  base_height: number
  opacity: number
  color: string
  labelColor: string
  fontSize: number
  haloWidth: number
  isNew: boolean
}

interface GeodataFeature {
  type: 'Feature'
  properties: GeodataFeatureProperties
  geometry: {
    coordinates: [Position[]]
    type: 'Polygon'
  }
  id: string
}

type Severity =
  | 'light'
  | 'mild'
  | 'medium'
  | 'severe'
  | 'dangerous'
  | 'huge'
  | 'exploded'
type Recent = 'recent' | 'week' | 'fortnight' | 'month' | 'far'

// Public Token
mapboxgl.accessToken =
  'pk.eyJ1IjoiaHVhc2hlbmd3YW5nMTk4OSIsImEiOiJjangxdGp2YjYwZGs5M3lyenplNDB3ZjhrIn0.GLEclLn-kGsLzfCjyoqouQ'
function isWithinDays(
  updates: Record<string, number> | undefined,
  days: string[]
) {
  return !!Object.keys(updates || {}).find(
    (d) => days.includes(d) && (updates?.[d] || 0) > 0
  )
}

const severities: Severity[] = [
  'light',
  'mild',
  'medium',
  'severe',
  'dangerous',
  'huge',
  'exploded',
]
const colorsBySeverity: Record<Severity, string> = {
  light: '#FFBF00',
  mild: '#FF8000',
  medium: '#FE2E2E',
  severe: '#8A0829',
  dangerous: '#8A0868',
  huge: '#3B0B2E',
  exploded: '#000',
}

const recents: Recent[] = ['recent', 'week', 'fortnight', 'month', 'far']

const opacitiesByRecent: Record<Recent, number> = {
  recent: 0.8,
  week: 0.6,
  fortnight: 0.4,
  month: 0.26,
  far: 0.22,
}

const haloWidthsByRecent: Record<Recent, number> = {
  recent: 2,
  week: 2,
  fortnight: 1,
  month: 0.5,
  far: 0.5,
}

function getLabelColorsByRecent(labelColor: string): Record<Recent, string> {
  return {
    recent: labelColor,
    week: Color(labelColor).whiten(.15).hex(),
    fortnight: Color(labelColor).whiten(.25).hex(),
    month: '#a77',
    far: '#a77',
  }
}

const fontSizesBySeverity: Record<Severity, number> = {
  light: 10,
  mild: 11,
  medium: 12,
  severe: 13,
  dangerous: 16,
  huge: 20,
  exploded: 24,
}

const opacities = recents.map((r) => opacitiesByRecent[r])
function genMap(
  containerId: string,
  options: {
    pitch: boolean
    clusters: Cluster[]
    today: string
    lang: 'en' | 'cn'
  }
) {
  const { clusters, today, lang, pitch } = options

  const todayDayjs = dayjs(today, 'YYYY-MM-DD')
  const consecutiveDays = Array(40)
    .fill(null)
    .map((_, idx) => todayDayjs.add(-idx, 'day'))
    .map((d) => d.format('YYYY-MM-DD'))
  const recent3Days = consecutiveDays.filter((_, i) => i < 3)
  const recent7Days = consecutiveDays.filter((_, i) => i < 7)
  const recent14Days = consecutiveDays.filter((_, i) => i < 14)
  const clustersWithGeoInfo = clusters.filter(
    (cl) => (cl.geopoints?.length || 0) > 0
  )
  const size = 0.005
  const heightScale = (total: number) => total * 10

  const geodataFeatures: GeodataFeature[][] = clustersWithGeoInfo.map(
    (cluster) => {
      const total = cluster.total ?? cluster.people.length
      const { geopoints = [[0, 0]], updates } = cluster
      const [y, x] = geopoints[0]
      const coordinates: Position[] = [
        [x - size / 2, y - size / 2],
        [x + size / 2, y - size / 2],
        [x + size / 2, y + size / 2],
        [x - size / 2, y + size / 2],
        [x - size / 2, y - size / 2],
      ]
      const smallerCoordinates: Position[] = [
        [x - size / 2.1, y - size / 2.1],
        [x + size / 2.1, y - size / 2.1],
        [x + size / 2.1, y + size / 2.1],
        [x - size / 2.1, y + size / 2.1],
        [x - size / 2.1, y - size / 2.1],
      ]
      const isWiRecent3Days = isWithinDays(updates, recent3Days)
      const isWiRecent7Days = isWithinDays(updates, recent7Days)
      const isWiRecent14Days = isWithinDays(updates, recent14Days)

      const todayUpdateNum = updates?.[today] || 0
      const newColor = '#449944'
      const recent: Recent = isWiRecent3Days
        ? 'recent'
        : isWiRecent7Days
        ? 'week'
        : isWiRecent14Days
        ? 'fortnight'
        : 'far'
      const opacity = opacitiesByRecent[recent]
      const severity: Severity =
        total < 20
          ? 'light'
          : total < 50
          ? 'mild'
          : total < 100
          ? 'medium'
          : total < 250
          ? 'severe'
          : total < 500
          ? 'dangerous'
          : total < 1000
          ? 'huge'
          : 'exploded'
      const isNew = cluster.updates?.[today] === total
      const color = isNew ? newColor : colorsBySeverity[severity]

      const geoData: GeodataFeature = {
        type: 'Feature' as 'Feature',
        properties: {
          name: cluster.name,
          short: cluster.short,
          cnName: cluster.cnName,
          value: total,
          todayUpdateNum,
          severity,
          recent,
          geopoint: cluster.geopoints?.[0] || [],
          height: heightScale(total),
          base_height: 0,
          opacity,
          color,
          labelColor: isNew ? '#446633' : getLabelColorsByRecent(color)[recent],
          fontSize: fontSizesBySeverity[severity],
          haloWidth: haloWidthsByRecent[recent],
          isNew,
        },
        geometry: {
          coordinates: [coordinates],
          type: 'Polygon' as 'Polygon',
        },
        id: cluster.uid,
      }

      if (isNew || !todayUpdateNum) {
        return [geoData]
      }
      const base: GeodataFeature = {
        ...geoData,
        properties: {
          ...geoData.properties,
          height: heightScale(total - todayUpdateNum),
        },
      }
      const update: GeodataFeature = {
        ...geoData,
        properties: {
          ...geoData.properties,
          height: heightScale(total),
          color: Color(newColor).mix(Color(color), pitch ? .35 : .5).hex(),
        },
        geometry: {
          ...geoData.geometry,
          coordinates: [smallerCoordinates],
        }
      }
      return [update, base]
    }
  )

  const geoLabelFeatures = geodataFeatures.map((gs) => {
    const g = gs[0]
    const {isNew, todayUpdateNum, value, name, cnName, short } = g.properties
    const nameDisplay = lang === 'cn'
      ? (cnName || short || name)
      : (short || name)
    const valueDisplay = isNew || !todayUpdateNum ? `${value}` : `${value}/+${todayUpdateNum}`
    const label = `${nameDisplay} (${valueDisplay})`
    return {
      type: 'Feature' as 'Feature',
      properties: {
        description: isNew ? `[NEW] ${label}` : label,
        icon: 'barrier',
        severity: g.properties.severity,
        opacity: g.properties.opacity,
        color: g.properties.labelColor,
        fontSize: g.properties.fontSize,
        haloWidth: g.properties.haloWidth,
      },
      geometry: {
        type: 'Point' as 'Point',
        coordinates: [g.properties.geopoint[1], g.properties.geopoint[0]],
      },
    }
  })

  const dateLabel = {
    type: 'Feature' as 'Feature',
    properties: {
      description: (lang === 'cn' ? '数据更新于 ' : 'Data Updated ') + today,
      opacity: 1,
      color: '#889211',
      fontSize: 24,
      haloWidth: 4,
    },
    geometry: {
      type: 'Point' as 'Point',
      coordinates: [103.875363, 1.271367],
    },
  }

  const map = new mapboxgl.Map({
    container: containerId,
    style: 'mapbox://styles/mapbox/light-v10',
    center: [103.811967, 1.355731],
    zoom: 11,
    pitch: pitch ? 30 : 0,
    bearing: 0,
    antialias: true,
  })
  map.on('load', function () {
    map.addSource('places', {
      type: 'geojson',
      data: {
        features: [
          ...geoLabelFeatures.filter(
            (l) => severities.indexOf(l.properties.severity) <= 3
          ),
          dateLabel,
        ],
        type: 'FeatureCollection',
      },
    })
    map.addSource('places-dangerous', {
      type: 'geojson',
      data: {
        features: geoLabelFeatures.filter(
          (l) => severities.indexOf(l.properties.severity) > 3
        ),
        type: 'FeatureCollection',
      },
    })
    opacities.forEach((opacity, idx) => {
      map.addSource(`heatbar-${idx}`, {
        type: 'geojson',
        data: {
          features: ([] as GeodataFeature[]).concat(
            ...geodataFeatures.filter(
              (gs) => gs[0].properties.opacity === opacity
            )
          ),
          type: 'FeatureCollection',
        },
      })
      map.addLayer({
        id: `heat-bar-${idx}`,
        type: 'fill-extrusion',
        source: `heatbar-${idx}`,
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': opacity,
        },
      })
    })
    map.addLayer({
      id: 'poi-labels',
      type: 'symbol',
      source: 'places',
      layout: {
        'text-field': ['get', 'description'],
        'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
        'text-radial-offset': 0.5,
        'text-justify': 'center',
        'icon-image': ['concat', ['get', 'icon'], '-15'],
        'text-size': ['get', 'fontSize'],
      },
      paint: {
        'text-color': ['get', 'color'],
        'text-halo-color': 'white',
        'text-halo-width': ['get', 'haloWidth'],
      },
    })
    map.addLayer({
      id: 'dangerous-labels',
      type: 'symbol',
      source: 'places-dangerous',
      layout: {
        'text-field': ['get', 'description'],
        'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
        'text-radial-offset': 0.5,
        'text-justify': 'center',
        'icon-image': ['concat', ['get', 'icon'], '-15'],
        'text-size': ['get', 'fontSize'],
      },
      paint: {
        'text-color': ['get', 'color'],
        'text-halo-color': 'white',
        'text-halo-width': ['get', 'haloWidth'],
      },
    })
  })
}

export { genMap }
