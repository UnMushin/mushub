import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const supportedLocales = ['en', 'fr', 'es', 'de', 'ja']

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = cookieStore.get('mushub_locale')?.value ?? 'en'
  const safeLocale = supportedLocales.includes(locale) ? locale : 'en'

  return {
    locale: safeLocale,
    messages: (await import(`./messages/${safeLocale}.json`)).default,
  }
})
