import React, {useEffect} from 'react'
import { genMap } from '../helpers/map'
import { Cluster } from '../types/cluster'
interface Props {
    id?: string
    clusters: Cluster[]
    today: string
    lang: 'en' | 'cn'
}

const ClusterMap: React.RefForwardingComponent<HTMLDivElement, Props> = (props, ref) => {
  const {
    id = 'map',
    clusters,
    today,
    lang,
  } = props
  useEffect(() => {
    const map = document.querySelector(`#${id}`)
    if (map) {
      map.childNodes.forEach(n => map.removeChild(n))
    }
    setTimeout(() => {
      genMap(id, {
        clusters,
        today,
        lang,
      })
    })
  }, [id, clusters, today, lang])
  return <div id={id} ref={ref}/>
}
export default React.forwardRef(ClusterMap)