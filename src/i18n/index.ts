import { translate } from './helpers';

const messages = {
  list: {
    title: {
      en: 'Singapore COVID-19 Clusters',
      cn: '新加坡 COVID-19 感染群',
    },
    dataUpdated: {
      en: 'Updated: ',
      cn: '数据更新：',
    },
    dormNote: {
      en: 'Dorms & Lodges: {n}',
      cn: '客工宿舍：{n} 间',
    },
  },
}

function trans(
  lang: 'en' | 'cn',
  key: string,
  replaces: Record<string, string | number>,
) {
  return translate(messages, key, lang, {
    defaultLang: 'en',
    replaces,
  })
}

export default trans;