import React from 'react'

import { genClassNamesStr } from '../helpers/utils/class'
import { getClusterLinkage } from '../helpers/clusters'
import { Cluster } from '../types/cluster'

import { prefixZero, groupWithConsecutivesConmined } from '../helpers/utils'

import '../styles/components/ClusterLinkage.scss'
interface Props {
  clusters: Cluster[]
  count: number
  today: string // YYYY-MM-DD
  order: 'asc' | 'desc' | 'desc-updated-first'
}

const ClusterLinkage: React.RefForwardingComponent<HTMLDivElement, Props> = (
  props,
  ref
) => {
  const { clusters, count, today, order } = props
  const linkage = getClusterLinkage(clusters, count)
  const clusterList: Record<string, Cluster> = clusters.reduce((acc, c) => {
    acc[c.uid] = c
    return acc
  }, {} as Record<string, Cluster>)
  const dormClusters = clusters.filter((c) => c.type.includes('dorm'))
  // const dormPeople = Array.from(new Set(([] as number[]).concat(...dormClusters.map((d) => d.people))))
  return (
    <div
      id="clusters"
      className={genClassNamesStr('cluster-linkage')}
      ref={ref}
    >
      <div className="update-line">
        <div className="title">Singapore COVID-19 Clusters 新加坡感染群</div>
        <div className="flex-spacer"></div>
        <div className="update-date">Updated: {today}</div>
      </div>
      <div className="update-line">
        <div className="title"></div>
        <div className="flex-spacer"></div>
        <div className="update-date">
          客工宿舍: {dormClusters.length} 间{' '}
          <span style={{ color: 'red' }}>
            *最新通告无感染者具体信息，故感染者和LINK的数据截止于4/19)
          </span>
        </div>
      </div>
      <div className="clusters-wrapper">
        {clusters
          .map((cluster) => ({
            ...cluster,
            people: cluster.people.sort((a, b) => a - b),
          }))
          .sort((a, b) => {
            const asc = (a.people[0] || 0) - (b.people[0] || 0)
            const desc = (b.people[0] || 0) - (a.people[0] || 0)
            switch (order) {
              case 'asc':
                return asc
              case 'desc':
                return desc
              case 'desc-updated-first':
                const updateA = a.updates?.[today] || 0
                const updateB = b.updates?.[today] || 0
                // Both have updated
                if (updateA > 0 && updateB > 0) {
                  const ttA = a.total ?? a.people.length
                  const ttB = b.total ?? b.people.length
                  // both new: desc order by updated number first, then desc
                  if (updateA === ttA && updateB === ttB) {
                    return updateB - updateA || desc
                  }
                  // Or: new first
                  if (updateA === ttA) {
                    return -1
                  }
                  if (updateB === ttB) {
                    return 1
                  }
                  // Otherwise, by updated number order
                  return updateB - updateA || desc
                }
                if (updateA > 0) {
                  return -1
                }
                if (updateB > 0) {
                  return 1
                }
                return desc
              default:
                return desc
            }
          })
          .map((cluster) => {
            const todayUpdate = cluster.updates?.[today] || 0
            const isNew =
              todayUpdate === (cluster.total ?? cluster.people.length)
            return (
              <div key={cluster.uid} className="cluster">
                <h4 className="title-cluster">
                  <div className="main-name">
                    {cluster.name}
                    <span className="count">
                      ({cluster.total ?? cluster.people.length})
                    </span>
                    {isNew && <span className="new-tag">NEW</span>}
                    {!isNew && todayUpdate > 0 && (
                      <span className="update-tag">+{todayUpdate}</span>
                    )}
                  </div>
                  {!!cluster.cnName && (
                    <div className="cn-name">{cluster.cnName}</div>
                  )}
                </h4>

                {cluster.addresses &&
                  cluster.addresses.map((add, idx) => {
                    return (
                      <p className="cluster-address" key={idx}>
                        {add}
                      </p>
                    )
                  })}
                {cluster.originType === 'import' && (
                  <div className="import-tag-line">
                    <span className="import-tag">Imported</span>
                    {(cluster.origin || []).length > 0 && (
                      <span className="import-origin">
                        {(cluster.origin || []).join(', ')}
                      </span>
                    )}
                    {cluster.originNote && (
                      <span className="import-note">{cluster.originNote}</span>
                    )}
                  </div>
                )}
                {cluster.originType === 'cluster' &&
                  (cluster.origin || []).length > 0 && (
                    <div className="source-cluster-tag-line">
                      <span className="source-tag">Source</span>
                      {(cluster.origin || []).length > 0 && (
                        <span className="import-origin">
                          {(cluster.origin || [])
                            .map((key) => clusterList[key]?.name || key)
                            .join(', ')}
                        </span>
                      )}
                      {cluster.originNote && (
                        <span className="import-note">
                          {cluster.originNote}
                        </span>
                      )}
                    </div>
                  )}
                {linkage[cluster.uid] &&
                  Object.keys(linkage[cluster.uid]).map((uid) => {
                    return (
                      <p className="linked-cluster" key={uid}>
                        <span className="cluster-name">
                          {clusterList[uid].name + ': '}
                        </span>
                        <span className="cluster-people">
                          {linkage[cluster.uid][uid].join(', ')}
                        </span>
                      </p>
                    )
                  })}
                <div className="main-cluster-people">
                  {groupWithConsecutivesConmined(cluster.people, {
                    combineWithLengthSameOrMoreThan: 4,
                    consecutiveSpaceOccupation: 2,
                    numberPerGroup: 15,
                  }).map((grp, idx, arr) => {
                    return (
                      <p className="cluster-people-row" key={idx}>
                        {grp
                          .map((n) =>
                            typeof n === 'number'
                              ? prefixZero(n)
                              : n === null
                              ? 'x'
                              : [n[0], n[n.length - 1]]
                                  .map((num) => prefixZero(num))
                                  .join('~')
                          )
                          .join(' ') + (idx < arr.length - 1 ? '' : '')}
                      </p>
                    )
                  })}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default React.forwardRef(ClusterLinkage)
