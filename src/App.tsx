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

function lsBool(val: string | null) {
  if (!val) {
    return undefined
  }
  return val === 'on'
}

const App = () => {
  const [view, setView] = useState(
    (localStorage.getItem('sgcovid.view') || 'list') as 'list' | 'chart' | 'map'
  )
  const [lang, setLang] = useState(
    (localStorage.getItem('sgcovid.lang') || 'en') as 'en' | 'cn'
  )

  const [winWidh, setWinWidth] = useState(window.innerWidth)
  const [winHeight, setWinHeight] = useState(window.innerHeight)

  const legendDisplayThreshold = 1112 * 834 // iPad Pro 10.5

  const today = '2020-04-27'

  const [chartScale, setChartScale] = useState(
    (localStorage.getItem('sgcovid.chart.scale') || 'linear') as
      | 'linear'
      | 'log'
  )
  const [order, setOrder] = useState(
    (localStorage.getItem('sgcovid.chart.order') || 'desc-updated-first') as 'asc' | 'desc' | 'desc-updated-first'
  )
  const [chartFmt, setChartFmt] = useState(
    (localStorage.getItem('sgcovid.chart.mode') || 'stack') as 'stack' | 'line'
  )
  const [chartLabelDisplayed, setChartLabelDisplayed] = useState(
    lsBool(localStorage.getItem('sgcovid.chart.label')) ?? true
  )
  const [chartLegendDisplayed, setChartLegendDisplayed] = useState(
    lsBool(localStorage.getItem('sgcovid.chart.legend')) ?? true
  )
  const [isMapPitched, setIsMapPitched] = useState(
    lsBool(localStorage.getItem('sgcovid.map.pitch')) ?? false
  )

  useEffect(() => {
    localStorage.setItem('sgcovid.view', view)
  }, [view])
  useEffect(() => {
    localStorage.setItem('sgcovid.lang', view)
  }, [lang])
  useEffect(() => {
    localStorage.setItem('sgcovid.chart.order', order)
  }, [order])
  useEffect(() => {
    localStorage.setItem('sgcovid.chart.scale', chartScale)
  }, [chartScale])
  useEffect(() => {
    localStorage.setItem('sgcovid.chart.mode', chartFmt)
  }, [chartFmt])
  useEffect(() => {
    localStorage.setItem(
      'sgcovid.chart.label',
      chartLabelDisplayed ? 'on' : 'off'
    )
  }, [chartLabelDisplayed])
  useEffect(() => {
    localStorage.setItem(
      'sgcovid.chart.legend',
      chartLegendDisplayed ? 'on' : 'off'
    )
  }, [chartLegendDisplayed])
  useEffect(() => {
    localStorage.setItem('sgcovid.map.pitch', isMapPitched ? 'on' : 'off')
  }, [isMapPitched])

  const [
    chatLegendDisplayApplicable,
    setChartLegendDisplayApplicable,
  ] = useState(winWidh * winHeight >= legendDisplayThreshold)

  const chartConfigs = genClustersChart(clusters, {
    today,
    count: 17,
    showTotal: true,
    log: chartScale === 'log',
    stack: chartFmt === 'stack',
    sideLabelPosition: !chartLabelDisplayed
      ? 'off'
      : winWidh >= 768
      ? 'right'
      : 'left',
    displayLegend: chartLegendDisplayed && chatLegendDisplayApplicable,
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
      const isChartLegendApplicable =
        window.innerWidth * window.innerHeight >= legendDisplayThreshold
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
          pitch={isMapPitched}
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
            defaultValue={view}
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
            <>
              <Radio.Group
                size="small"
                defaultValue={lang}
                value={lang}
                style={{ marginRight: 8 }}
                onChange={(e) => {
                  setLang(e.target.value)
                }}
              >
                <Radio.Button value="en">EN</Radio.Button>
                <Radio.Button value="cn">中</Radio.Button>
              </Radio.Group>
              <Switch
                checkedChildren="3D"
                unCheckedChildren="3D"
                defaultChecked={isMapPitched}
                onChange={(bool) => {
                  setIsMapPitched(bool)
                }}
              />
            </>
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
                <Radio.Button value="linear">
                  <LineChartOutlined />
                </Radio.Button>
                <Radio.Button value="stack">
                  <AreaChartOutlined />
                </Radio.Button>
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
                <Radio.Button value="linear">
                  <FundOutlined />
                </Radio.Button>
                <Radio.Button value="log">lg</Radio.Button>
              </Radio.Group>
              {chatLegendDisplayApplicable && (
                <Switch
                  checkedChildren={<TableOutlined />}
                  unCheckedChildren={<TableOutlined />}
                  style={{ marginRight: 8 }}
                  defaultChecked={chartLegendDisplayed}
                  onChange={(bool) => {
                    setChartLegendDisplayed(bool)
                  }}
                />
              )}
              <Switch
                checkedChildren={<InfoCircleOutlined />}
                unCheckedChildren={<InfoCircleOutlined />}
                defaultChecked={chartLabelDisplayed}
                onChange={(bool) => {
                  setChartLabelDisplayed(bool)
                }}
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
