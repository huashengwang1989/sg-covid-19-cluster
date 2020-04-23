export function genClassNamesStr(baseCls: string, ...sufs: string[]) {
  let clsStr = baseCls

  if (!baseCls) {
    return ''
  }
  sufs.forEach((suf) => {
    if (!!suf) {
      clsStr += ` ${baseCls}--${suf}`
    }
  })
  return clsStr
}
