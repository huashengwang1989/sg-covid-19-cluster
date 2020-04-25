import React from 'react'
import { Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import html2canvas from 'html2canvas'
import '../styles/components/Header.scss'
interface Props {
  canvasId: string
  size?: 'small' | 'middle' | 'large'
  canvasOutputScale?: number
  children?: React.ReactNode
  disableDownload?: boolean
}
const Header: React.RefForwardingComponent<HTMLDivElement, Props> = (
  props,
  ref
) => {
    const { size = 'small', canvasOutputScale = 1 } = props
  async function handleDownloadPic(ev: React.MouseEvent) {
    ev.preventDefault()
    if (!props.canvasId) {
      return
    }
    const tar = document.querySelector(`#${props.canvasId}`)
    if (!tar) {
      return
    }
    const canvas = tar instanceof HTMLCanvasElement
      ? tar
      : await html2canvas(tar as HTMLElement, {
      scale: canvasOutputScale,
    })

    const imageSrc = canvas.toDataURL('image/png')

    const contentType = 'image/png'

    const byteCharacters = atob(
      imageSrc.substr(`data:${contentType};base64,`.length)
    )
    const byteArrays: Uint8Array[] = []

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024)

      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)

      byteArrays.push(byteArray)
    }
    const blob = new Blob(byteArrays, { type: contentType })
    const blobUrl = URL.createObjectURL(blob)
    if (window) {
      window.open(blobUrl, '_blank')
    }
  }

  return (
    <div ref={ref} className="header">
      {props.children}
      <div className="flex-spacer" />
      <Button
        size={size}
        icon={<DownloadOutlined />}
        onClick={handleDownloadPic}
        shape="circle"
        type="link"
        disabled={props.disableDownload}
      />
    </div>
  )
}

export default React.forwardRef(Header)
