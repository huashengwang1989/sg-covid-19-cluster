import React, {useEffect} from 'react'
import ErrorBoundary from './ErrorBoundary'
import { genMap } from '../helpers/map'
import { Cluster } from '../types/cluster'
interface Props {
    id: string
    pitch: boolean,
    clusters: Cluster[]
    today: string
    lang: 'en' | 'cn'
}

const ClusterMap: React.FC<Props> = (props) => {
  const {
    id,
    clusters,
    pitch,
    today,
    lang,
  } = props
  useEffect(() => {
    const map = document.querySelector(`#${id}`)
    if (map) {
      map.innerHTML = ''
    }
    setTimeout(() => {
      genMap(id, {
        clusters,
        pitch,
        today,
        lang,
      })
    })
    return () => {
      const m = document.querySelector(`#${id}`)
      console.log('unmount', m)
    }
  }, [id, clusters, today, lang, pitch])
  return <ErrorBoundary><div id={id}/></ErrorBoundary>
}
export default ClusterMap