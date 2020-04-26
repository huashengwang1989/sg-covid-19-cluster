import React, { useState, useEffect } from 'react'
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
  InfoCircleOutlined,
  TableOutlined,
} from '@ant-design/icons'

import { Radio, Switch } from 'antd'
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
  const [lang, setLang] = useState('en' as 'en' | 'cn')
  
  const [winWidh, setWinWidth] = useState(window.innerWidth)
  const [winHeight, setWinHeight] = useState(window.innerHeight)

  const legendDisplayThreshold = 1112 * 834 // iPad Pro 10.5

  const today = '2020-04-26'

  const [chartScale, setChartScale] = useState('linear' as 'linear' | 'log')
  const [chartFmt, setChartFmt] = useState('stack' as 'stack' | 'line')
  const [chartLabelDisplayed, setChartLabelDisplayed] = useState(true)
  const [chartLegendDisplayed, setChartLegendDisplayed] = useState(true)
  const [chatLegendDisplayApplicable, setChartLegendDisplayApplicable] = useState(winWidh * winHeight >= legendDisplayThreshold)

  
  const chartConfigs = genClustersChart(clusters, {
    today,
    count: 17,
    showTotal: true,
    log: chartScale === 'log',
    stack: chartFmt === 'stack',
    sideLabelPosition: !chartLabelDisplayed ? 'off' : winWidh >= 768 ? 'right' : 'left',
    displayLegend: chartLegendDisplayed && chatLegendDisplayApplicable
  })

  const canvasIds = {
    list: 'clusters',
    chart: 'chart',
    map: 'map',
  }

  useEffect(() => {
    function handleResize() {
      setWinWidth(window.innerWidth)
      setWinHeight(window.innerHeight)
      const isChartLegendApplicable = window.innerWidth * window.innerHeight >= legendDisplayThreshold
      setChartLegendDisplayApplicable(isChartLegendApplicable)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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
          lang={lang}
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
            style={{ marginRight: 8 }}
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
              defaultValue={lang}
              value={lang}
              onChange={(e) => {
                setLang(e.target.value)
              }}
            >
              <Radio.Button value="en">EN</Radio.Button>
              <Radio.Button value="cn">中</Radio.Button>
            </Radio.Group>
          )}
          {view === 'chart' && (
            <>
              <Radio.Group
                size="small"
                defaultValue={chartFmt}
                value={chartFmt}
                style={{ marginRight: 8 }}
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
              style={{ marginRight: 8 }}
              value={chartScale}
              onChange={(e) => {
                setChartScale(e.target.value)
              }}
            >
              <Radio.Button value="linear"><FundOutlined /></Radio.Button>
              <Radio.Button value="log">lg</Radio.Button>
            </Radio.Group>
            { chatLegendDisplayApplicable &&
              <Switch
                checkedChildren={<TableOutlined />}
                unCheckedChildren={<TableOutlined />}
                style={{ marginRight: 8}}
                defaultChecked={chartLegendDisplayed}
                onChange={bool => {setChartLegendDisplayed(bool)}}
              />
            }
            <Switch
                checkedChildren={<InfoCircleOutlined />}
                unCheckedChildren={<InfoCircleOutlined />}
                defaultChecked={chartLabelDisplayed}
                onChange={bool => {setChartLabelDisplayed(bool)}}
              />
            </>
          )}
        </div>
      </Header>
      {views[view]()}
    </div>
  )
}
export default App
