import React, { useState } from 'react'
import ClusterList from './components/ClusterList'
import Header from './components/Header'
import ClusterMap from './components/ClusterMap'
import {
  DownCircleOutlined,
  UpCircleOutlined,
  WarningOutlined,
  AreaChartOutlined,
  LineChartOutlined,
  PushpinOutlined,
  UnorderedListOutlined,
  FundOutlined,
} from '@ant-design/icons'

import { Radio } from 'antd'
import { clusters } from './data/clusters'
import { genClustersChart } from './helpers/clusters'
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

  const [chartScale, setChartScale] = useState('linear' as 'linear' | 'log')
  const [chartFmt, setChartFmt] = useState('stack' as 'stack' | 'line')

  const today = '2020-04-25'

  const chartConfigs = genClustersChart(clusters, {
    today,
    count: 17,
    showTotal: true,
    log: chartScale === 'log',
    stack: chartFmt === 'stack',
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
        <ClusterMap
          id="mapbox-map"
          clusters={clusters}
          today={today}
          lang={mapLang}
        />
      </div>
    ),
  }

  return (
    <div>
      <Header canvasId={canvasIds[view]} disableDownload={view === 'map'}>
        <div className="header-toggles">
          <Radio.Group
            size="small"
            defaultValue="list"
            style={{ marginRight: 16 }}
            onChange={(e) => {
              setView(e.target.value)
            }}
          >
            <Radio.Button value="list">
              <UnorderedListOutlined />
            </Radio.Button>
            <Radio.Button value="chart">
              <AreaChartOutlined />
            </Radio.Button>
            <Radio.Button value="map">
              <PushpinOutlined />
            </Radio.Button>
          </Radio.Group>
          {view === 'list' && (
            <Radio.Group
              size="small"
              defaultValue={order}
              value={order}
              onChange={(e) => {
                setOrder(e.target.value)
              }}
            >
              <Radio.Button value="asc">
                <UpCircleOutlined />
              </Radio.Button>
              <Radio.Button value="desc">
                <DownCircleOutlined />
              </Radio.Button>
              <Radio.Button value="desc-updated-first">
                <WarningOutlined />
              </Radio.Button>
            </Radio.Group>
          )}
          {view === 'map' && (
            <Radio.Group
              size="small"
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
          {view === 'chart' && (
            <>
              <Radio.Group
                size="small"
                defaultValue={chartFmt}
                value={chartFmt}
                onChange={(e) => {
                  setChartFmt(e.target.value)
                }}
              >
                <Radio.Button value="linear"><LineChartOutlined /></Radio.Button>
                <Radio.Button value="stack"><AreaChartOutlined /></Radio.Button>
              </Radio.Group>
              <Radio.Group
              size="small"
              defaultValue={chartScale}
              value={chartScale}
              onChange={(e) => {
                setChartScale(e.target.value)
              }}
            >
              <Radio.Button value="linear"><FundOutlined /></Radio.Button>
              <Radio.Button value="log">lg</Radio.Button>
            </Radio.Group>
            </>
          )}
        </div>
      </Header>
      {views[view]()}
    </div>
  )
}
export default App
