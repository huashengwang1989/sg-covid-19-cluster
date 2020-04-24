import React, { useState } from 'react'
import ClusterList from './components/ClusterList'
import Header from './components/Header'
import ClusterMap from './components/ClusterMap'

import { Radio } from 'antd'
import { clusters } from './data/clusters'
import { getClustersWeeklyUpdates } from './helpers/clusters'
import Chart from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Line } from 'react-chartjs-2'

Chart.plugins.register(ChartDataLabels)

const App = () => {
  const [order, setOrder] = useState(
    'desc-updated-first' as 'asc' | 'desc' | 'desc-updated-first'
  )
  const [view, setView] = useState('list' as 'list' | 'chart' | 'map')
  const [mapLang, setMapLang] = useState('en' as 'en' | 'cn')

  const today = '2020-04-24'
  const chartConfigs = getClustersWeeklyUpdates(clusters, {
    today,
    count: 17,
    showTotal: true,
    log: false,
    stack: true,
  })

  const canvasIds = {
    list: 'clusters',
    chart: 'chart',
    map: 'map',
  }

  const views = {
    list: () => (
      <div id="clusters-wrapper">
        <ClusterList
          clusters={clusters}
          count={20000}
          order={order}
          today={today}
        />
      </div>
    ),
    chart: () => {
      // @ts-ignore
      const chart = <Line {...chartConfigs} />
      return <div id="chart">{chart}</div>
    },
    map: () => (
      <div id="map">
        <ClusterMap clusters={clusters} today={today} lang={mapLang} />
      </div>
    ),
  }

  return (
    <div>
      <Header canvasId={canvasIds[view]} disableDownload={view === 'map'}>
        <Radio.Group
          defaultValue="list"
          style={{ marginRight: 16 }}
          onChange={(e) => {
            setView(e.target.value)
          }}
        >
          <Radio.Button value="list">List</Radio.Button>
          <Radio.Button value="chart">Chart</Radio.Button>
          <Radio.Button value="map">Map</Radio.Button>
        </Radio.Group>
        {view === 'list' && (
          <Radio.Group
            defaultValue={order}
            value={order}
            onChange={(e) => {
              setOrder(e.target.value)
            }}
          >
            <Radio.Button value="asc">Ascending</Radio.Button>
            <Radio.Button value="desc">Descending</Radio.Button>
            <Radio.Button value="desc-updated-first">
              Updated First
            </Radio.Button>
          </Radio.Group>
        )}
        {view === 'map' && (
          <Radio.Group
            defaultValue={mapLang}
            value={mapLang}
            onChange={(e) => {
              setMapLang(e.target.value)
            }}
          >
            <Radio.Button value="en">EN</Radio.Button>
            <Radio.Button value="cn">CN</Radio.Button>
          </Radio.Group>
        )}
      </Header>
      {views[view]()}
    </div>
  )
}
export default App
