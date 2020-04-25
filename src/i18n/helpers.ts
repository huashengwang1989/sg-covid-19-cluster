interface Message {
    cn: string
    en: string
}

interface Messages {
  [key: string]: Messages | Message
}

export function translate(
  messages: Messages,
  key: string,
  lang: keyof Message,
  options?: {
    replaces?: Record<string, string | number>,
    defaultLang?: keyof Message,
  },
) {
  const { defaultLang = 'en', replaces = {} } = options || {};
  let message: Messages | Message = messages
  const keys = key.split('.')
  try {
    keys.forEach((k) => {
      message = message[k]
    })
    const finalMessage = message as any as Message
    let msg = finalMessage[lang] ?? finalMessage[defaultLang] ?? ''
    if (typeof msg !== 'string') {
      return key
    }
    const replaceKeys = Object.keys(replaces)
    if (replaceKeys.length) {
      replaceKeys.forEach((rK) => {
        msg = msg.replace(new RegExp(`/\{\s*${rK}\s*}/`), (replaces[rK]).toString())
      })
    }
    return msg
  } catch (err) {
    return key
  }
}