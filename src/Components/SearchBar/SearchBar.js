import React, { Component } from 'react';
import './SearchBar.css';

export default class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      term: ''
    };

    this.handleTermChange = this.handleTermChange.bind(this);

    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.search = this.search.bind(this);
  }

  handleKeyDown(event) {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  handleTermChange(event) {
    this.setState({
      term: event.target.value
    })
  }

  search() {
    this.props.onSearch(this.state.term);
  }

  render() {
    return (
      <div className="SearchBar">
        <input placeholder="Enter A Song, Album, or Artist" onChange={this.handleTermChange} onKeyDown={this.handleKeyDown} />
        <a onClick={this.search} >SEARCH</a>
      </div>
    )
  }
}
