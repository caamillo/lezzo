require('dotenv').config()
const express = require('express')
const { google } = require('googleapis')

const app = express()
const APP_PORT = 3000

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
)

app.get('/', (req, res) => {
    res.send('Ciao succhiacazzi')
})

app.get('/auth', (req, res) => {
    const scopes = ['https://www.googleapis.com/auth/youtube.readonly']
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    })
    res.redirect(url)
})

app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query
    if (code) {
        try {
            const { tokens } = await oauth2Client.getToken(code)
            oauth2Client.setCredentials(tokens)
            res.redirect('/playlists')
        } catch (err) {
            console.error('Error retrieving access token', err)
            res.send('Error retrieving access token')
        }
    } else {
        res.send('No code provided')
    }
})

app.get('/playlists', async (req, res) => {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })
    try {
        const response = await youtube.playlists.list({
            mine: true,
            part: 'snippet,contentDetails',
            maxResults: 25
        })
        res.json(response.data)
    } catch (err) {
        console.error('Error fetching playlists', err)
        res.send('Error fetching playlists')
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${ APP_PORT }`)
})
