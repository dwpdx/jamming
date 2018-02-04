const clientId = 'REMOVED FOR GITHUB';

let userAccessToken;
let expiresIn;

const Spotify = {
  getAccessToken() {
    if (userAccessToken) {
      return userAccessToken;
    } else {
      let accessTokenRegex = /access_token=([^&]*)/ ;
      let expiresInRegex = /expires_in=([^&]*)/ ;
      let url = window.location.href;
      
      let tokenMatch = url.match(accessTokenRegex);
      let expiresMatch = url.match(expiresInRegex);

      if (tokenMatch) {
        userAccessToken = tokenMatch[1];
        expiresIn = expiresMatch[1];
        window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
        return userAccessToken;
      } else {
        let targetUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${this.getRedirectUri()}`;
        window.location.href = targetUrl;
      }
    }
  },

  getRedirectUri() {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      console.log('Development');
      return 'http://localhost:3000/';
    } else {
      console.log('Production');
      return 'https://dwpdxjamming.surge.sh/';
    }
  },

  async savePlaylist(name, trackURIs) {
    if (name && trackURIs.length > 0) {
      let userAccessToken = this.getAccessToken();
      let headers = { Authorization: `Bearer ${userAccessToken}` };
      let userId;
      let playlistId;

      // Get the user's ID from Spotify
      this.getUserName(headers).then(user_id => {
        userId = user_id;

        // Create a new playlist and get it's ID
        this.getPlaylistId(userId, name, headers).then(playlist_id => {
          playlistId = playlist_id;

          // Add tracks to new playlist
          this.addTracksToPlaylist(userId, playlistId, trackURIs, headers).then(snapshot_id => {
            console.log(`Success! ${snapshot_id}`)
          });
          
        });
      });
    } else {
      console.log(`Missing variables to save playlist. Name:${name}, Tracks:${trackURIs}`);
    }
  },

  async addTracksToPlaylist(userId, playlistId, trackURIs, headers) {
    let addTracksUrl = `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`;
    let payload = JSON.stringify({
      uris: trackURIs
    });

    try {
      let response = await fetch(addTracksUrl, {
        headers: headers,
        method: 'POST',
        'Content-Type': 'application/json',
        body: payload
      });

      if (response.ok) {
        let data = await response.json();
        if (data.snapshot_id) {
          return data.snapshot_id
        } else {
          throw new Error(`Unable to add tracks: ${trackURIs} to playist ID ${playlistId}.`);
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  },

  async getPlaylistId(userId, name, headers) {
    let playlistUrl = `https://api.spotify.com/v1/users/${userId}/playlists`;
    let payload = JSON.stringify({
      name: name
    });

    try {
      let response = await fetch(playlistUrl, {
        headers: headers,
        method: 'POST',
        'Content-Type': 'application/json',
        body: payload
      });

      if (response.ok) {
        let data = await response.json();
        if (data.id) {
          return data.id
        } else {
          throw new Error('Unable to get Playlist ID.');
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  },

  async getUserName(headers) {
    let userUrl = 'https://api.spotify.com/v1/me';

    try {
      let response = await fetch(userUrl, { headers: headers });

      if (response.ok) {
        let data = await response.json();
        if (data.id) {
          return data.id;
        }
      } else {
        throw new Error('Unable to get User object.');
      }
    }
    catch (error) {
      console.log(error);
    }
  },

  async search(term) {
    let searchUrl = `https://api.spotify.com/v1/search?type=track&q=${term}`;
    let userAccessToken = this.getAccessToken();

    try {
      let response = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${userAccessToken}` }
      });

      if (response.ok) {
        let data = await response.json();
        if (data.tracks.items) {
          return data.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
          }))
        }
        return [];
      }
    }
    catch (error) {
      console.log(error);
    }
  }
};

export default Spotify;
