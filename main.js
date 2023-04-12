//scrapes a single page from yellow pages for contact info and prints to console
const express = require('express')
const cheerio = require('cheerio')
const PORT = 8787

const app = express()

let searchTerm = 'plumber'
let searchLocation = 'Halifax+NS'
let currentPage = 1

const url = `https://www.yellowpages.ca/search/si/1/${searchTerm}/${searchLocation}`

fetch(url)
.then(response=>response.text())
.then(html=>{
    //console.log(html)
    const articles = []
    const firstFetchArray = []
    const $ = cheerio.load(html)
    const pageCountText = $('.pageCount').find('span:nth-child(2)').text()
    const pageCountNum = parseInt(pageCountText)
    $('.listing_right_section', html).each(function(){
        const extraNbusinessName = $(this).find('h3').text()
        const arr = extraNbusinessName.split('')
        arr.shift()
        arr.pop()
        if(arr[1]==='\n')
        {
            arr.shift()
            arr.shift()
        }
        const businessName = arr.join('')
        const streetAddress = $(this).find('[itemprop="streetAddress"]').text()
        const city = $(this).find('[itemprop="addressLocality"]').text()
        const provinceCode = $(this).find('[itemprop="addressRegion"]').text()
        const postalCode = $(this).find('[itemprop="postalCode"]').text()
        const phoneNumber = $(this).find('h4').text()
        const _id = phoneNumber
        firstFetchArray.push({
            _id,
            businessName,
            streetAddress,
            city,
            provinceCode,
            postalCode,
            phoneNumber
        })
    })
    //db.collection.updateMany(_id,firstFetchArray,upsert: true)
    if(pageCountNum>1)
    {
        for(let i=2;i<=pageCountNum;i++)
        {
            currentPage = i
            const loopUrl = `https://www.yellowpages.ca/search/si/${currentPage}/${searchTerm}/${searchLocation}`
            console.log('This is loop: ' + i)
                getNextPage(loopUrl)
                async function getNextPage(currentUrl){
                    const loopFetchArray = []
                    const response = await fetch(currentUrl)
                    const html = await response.text()
                    console.log('This is fetch:'+ i)
                    let currentFetch = i
                    const $ = cheerio.load(html)
                    const pageCountText = $('.pageCount').find('span:nth-child(2)').text()
                    const pageCountNum = parseInt(pageCountText)
                    $('.listing_right_section', html).each(function(){
                        const extraNbusinessName = $(this).find('h3').text()
                        const arr = extraNbusinessName.split('')
                        arr.shift()
                        arr.pop()
                        const businessName = arr.join('')
                        const streetAddress = $(this).find('[itemprop="streetAddress"]').text()
                        const city = $(this).find('[itemprop="addressLocality"]').text()
                        const provinceCode = $(this).find('[itemprop="addressRegion"]').text()
                        const postalCode = $(this).find('[itemprop="postalCode"]').text()
                        const phoneNumber = $(this).find('h4').text()
                        const _id = phoneNumber
                        loopFetchArray.push({
                            _id,
                            businessName,
                            streetAddress,
                            city,
                            provinceCode,
                            postalCode,
                            phoneNumber
                        })
                    })
                    //db.collection.updateMany(_id,loopFetchArray,upsert: true)
                    console.table(loopFetchArray)
                }
            }
        }
    })

app.listen(PORT, ()=>console.log(`Server is alive on ${PORT}`))

