//scrapes a single page from yellow pages for contact info and prints to console
const express = require('express')
const cheerio = require('cheerio')
const PORT = 8787

const app = express()

const url = 'https://www.yellowpages.ca/search/si/1/plumber/Halifax+NS'

{/* <li class="mlr__item mlr__item--more mlr__item--phone jsMapBubblePhone">
<a href="javascript:void(0)" class="mlr__item__cta jsMlrMenu" title="Get the Phone Number" data-analytics-placeholder="{&quot;lk_listing_id&quot;:&quot;2137994&quot;,&quot;lk_non-ad-rollup&quot;:&quot;0&quot;,&quot;lk_page_num&quot;:&quot;1&quot;,&quot;lk_pos&quot;:&quot;in_listing&quot;,&quot;lk_directory_heading&quot;:[{&quot;091300&quot;:[{&quot;01030400&quot;:&quot;1&quot;}]}],&quot;lk_geo_tier&quot;:&quot;dir&quot;,&quot;lk_area&quot;:&quot;left_1&quot;,&quot;lk_relevancy&quot;:&quot;1&quot;,&quot;lk_name&quot;:&quot;revealphonenumber&quot;,&quot;lk_pos_num&quot;:&quot;12&quot;,&quot;lk_se_id&quot;:&quot;67137c47-9e11-453b-b315-596f231b466c_cGx1bWJlcg_SGFsaWZheCBOUw&quot;,&quot;lk_ev&quot;:&quot;link&quot;,&quot;event_name&quot;:&quot;click - Call - Reveal Phone Number&quot;,&quot;lk_product&quot;:&quot;l1&quot;}" data-phone="902-453-4800">
<span class="ypicon ypicon-phone mlr__icon"></span><span class="serpMessage">Phone Number</span></a>

<ul class="mlr__submenu">
<li class="mlr__submenu__item" tabindex="0"><h4>902-453-4800</h4>
</li></ul>
</li> */}

fetch(url)
.then(response=>response.text())
.then(html=>{
    //console.log(html)
    const articles = []
    const $ = cheerio.load(html)
    $('.listing_right_section', html).each(function(){
        //const title = $(this).text()
        //const link = $(this).find('a').attr('data-phone')
        const businessName = $(this).find('h3').text()
        // const address = $(this).find('span').attr('')
        const streetAddress = $(this).find('[itemprop="streetAddress"]').text()
        const city = $(this).find('[itemprop="addressLocality"]').text()
        const provinceCode = $(this).find('[itemprop="addressRegion"]').text()
        const postalCode = $(this).find('[itemprop="postalCode"]').text()
        const phoneNumber = $(this).find('h4').text()
        articles.push({
            businessName,
            streetAddress,
            city,
            provinceCode,
            postalCode,
            phoneNumber
        })
        console.log(articles)
    }).catch(err => console.log(err))
})

app.listen(PORT, ()=>console.log(`Server is alive on ${PORT}`))

