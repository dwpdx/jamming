import React, { Component } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchResults: [],
      playlistName: 'Daniels Playlist',
      playlistTracks: []
    };

    this.addTrack = this.addTrack.bind(this);

    this.resetPlaylist = this.resetPlaylist.bind(this);
    
    this.removeTrack = this.removeTrack.bind(this);
    
    this.savePlaylist = this.savePlaylist.bind(this);

    this.search = this.search.bind(this);

    this.updatePlaylistName = this.updatePlaylistName.bind(this);

    Spotify.getAccessToken();
  }

  addTrack(track) {
    let currentTracks = this.state.playlistTracks;
    const trackFound = this.state.playlistTracks.filter(listTrack => listTrack.id === track.id).length > 0;
    
    if (!trackFound) {
      currentTracks.push(track);
      this.setState({
        playlistTracks: currentTracks
      })
    }
  }

  removeTrack(track) {
    this.setState({
      playlistTracks: this.state.playlistTracks.filter(listTrack => listTrack.id !== track.id)
    })
  }

  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map(track => track.uri);
    const playlistName = this.state.playlistName;
    Spotify.savePlaylist(playlistName, trackURIs).then(snapshotId => {
      this.resetPlaylist();
      console.log(`Saved ${playlistName} with ${trackURIs.length} song(s).`);
    })
  }

  resetPlaylist() {
    this.setState({
      playlistName: 'New Playlist',
      playlistTracks: []
    });
  }

  search(term) {
    Spotify.search(term).then(results => {
      this.setState({
        searchResults: results
      });
    });
  }

  updatePlaylistName(name) {
    this.setState({
      playlistName: name
    })
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist playlistTracks={this.state.playlistTracks} 
                      playlistName={this.state.playlistName}
                      onRemove={this.removeTrack} 
                      onNameChange={this.updatePlaylistName}
                      onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
