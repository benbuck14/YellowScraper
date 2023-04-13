//scrapes data from yellowpages.ca for contact info and adds to database
const express = require('express')
const cheerio = require('cheerio')
const { MongoClient, ServerApiVersion } = require('mongodb');
const PORT = 8787
const dbURL = `mongodb+srv://benbuck14:Blue1House@yellowscraper.rb29gx1.mongodb.net/?retryWrites=true&w=majority`
const database = new MongoClient(dbURL)

const client = new MongoClient(dbURL, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function connectDB()
{
    await client.connect()
}
connectDB()

const app = express()



//searchTerm & searchLocation to be entered by user, hard coded for now

let searchTerm = 'plumber'
let searchLocation = 'Halifax+NS'
let currentPage = 1

const url = `https://www.yellowpages.ca/search/si/1/${searchTerm}/${searchLocation}`

fetch(url)
.then(response=>response.text())
.then(html=>{
    const firstFetchArray = []
    //cheerio is a module to parse and manipulate html 
    // $ is conventional reference to html doc from cheerio
    const $ = cheerio.load(html)
    const pageCountText = $('.pageCount').find('span:nth-child(2)').text()
    const pageCountNum = parseInt(pageCountText)
    //following function steps through each search result (CSS class)
    $('.listing_right_section', html).each(function(){
        const extraNbusinessName = $(this).find('h3').text()
        //this result has extra characters, the following code removes them
        const arrayToRemoveCharacters = extraNbusinessName.split('')
        arrayToRemoveCharacters.shift()
        arrayToRemoveCharacters.pop()
        if(arrayToRemoveCharacters[1]==='\n')
        {
            arrayToRemoveCharacters.shift()
            arrayToRemoveCharacters.shift()
        }
        const businessName = arrayToRemoveCharacters.join('')
        const streetAddress = $(this).find('[itemprop="streetAddress"]').text()
        const city = $(this).find('[itemprop="addressLocality"]').text()
        const provinceCode = $(this).find('[itemprop="addressRegion"]').text()
        const postalCode = $(this).find('[itemprop="postalCode"]').text()
        const phoneNumber = $(this).find('h4').text()
        const id = phoneNumber
        //relevant data for first page captured above.  Push to array and update DB below
        firstFetchArray.push({
            _id: id,
            businessName: businessName,
            streetAddress: streetAddress,
            city: city,
            provinceCode: provinceCode,
            postalCode: postalCode,
            phoneNumber: phoneNumber,
            businessType: searchTerm,
            location: searchLocation
        })
    })
    
    try{
        client.db('YellowScraper').collection('yellowContacts').updateMany({},{"$set":firstFetchArray},{upsert: true})
                console.log('success')
            }
            catch(e){
                console.log("ERROR: " + e)
            }
    
            //{},firstFetchArray,{upsert: true}

    //If more than one page of results, loop through each page and repeat the above steps
    if(pageCountNum>1)
    {
        for(let i=2;i<=pageCountNum;i++) 
        {
            currentPage = i
            const loopUrl = `https://www.yellowpages.ca/search/si/${currentPage}/${searchTerm}/${searchLocation}`
                getNextPage(loopUrl)
                async function getNextPage(currentUrl){
                    const loopFetchArray = []
                    const response = await fetch(currentUrl)
                    const html = await response.text()
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
                            phoneNumber,
                            searchTerm,
                            searchLocation
                        })
                    })
                    //db.collection.updateMany(_id,loopFetchArray,upsert: true)
                    //console.table(loopFetchArray)
                }
            }
        }
    })

app.listen(PORT, ()=>console.log(`Server is alive on ${PORT}`))

