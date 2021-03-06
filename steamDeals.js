const cheerio = require('cheerio')
const axios = require('axios').default
const fs = require('fs')

;(async () => {

  // funkcja pobierająca kod strony z serwera
  const fethHtml = async (url) => {
    try {
      const { data } = await axios.get(url)
      return data
    } catch {
      console.error(
        `ERROR: An error occurred while trying to fetch the URL: ${url}`
      )
    }
  }

  // funkcja wyszukująca dane z pobranego kodu strony
  const scrapSteam = async () => {

    // adres url strony do pobrania
    const steamUrl = 'https://store.steampowered.com/search/?filter=weeklongdeals'


    // pobranie kodu strony z serwera
    const html = await fethHtml(steamUrl)

    // zamiana kodu strony z tekstu na dający się przeszukać za pomocą funkcji .find
    const $ = cheerio.load(html)

    // odnalezienie listy gier (deals) na tej stronie
    const searchResults = $('body').find(
      '#search_result_container > #search_resultsRows > a'
    )

    // dla każdego elementu z listy "deals" wyszykanie:
    // tytułu (title), linku w Steam (link), ceny (price) i ceny po zniżce (discountedPrice)
    const deals = searchResults
      .map((idx, el) => {
        const title = $(el)
          .find('.responsive_search_name_combined')
          .find("div[class='col search_name ellipsis'] > span[class='title']")
          .text()
          .trim()

        const link = $(el).attr('href').trim()

        const  [ price, discountedPrice ] = $(el)
          .find('.search_price.discounted')
          .text()
          .trim()
          .match(/\d+,\d{2}(\D+)?/g)


        return [
          title,
          link,
          price,
          discountedPrice,
        ]
        .join(', ')
      })
      .get()

    return deals
  }

  // uruchmienie głównej funkcji zbierającej dane
  let items = await scrapSteam()

  // formatowanie danych do zapisu
  items = items.join('\n')

  // zapis do pliku "dane.txt" w tym samym folderze
  fs.writeFileSync('./dane.txt', items, 'utf-8')

  // console.log({ items })
})()
