import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react'
import { render } from 'react-dom'


class App extends Component {
  
  constructor() {
    super();
    this.state = {
      data: [], // Initialize an empty array to store fetched data
      updated: '',
      address: '' // Initialize an empty string to store the user input
    };
    this.getData = this.getData.bind(this); // Bind the getData function to the this keyword
  }


  componentDidMount() {
    
    this.getData();
  }

  getData() {
    // Use fetch or axios for making the request
    // we are ASSUMING that the address uses 'space' as the separator
    
     
     
    let encodedAddress = encodeURIComponent(this.state.address);
    let query = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=1&polygon_svg=1`;

    
    fetch(query, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        // Update the state with the fetched data
        this.setState({ data });

      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });  };
 

      render() {
        const { data, address } = this.state;
      
        return (
          <div className="App">
  <input type="text" value={address} onChange={(e) => this.setState({address: e.target.value})} /> 
  <button onClick={() => this.getData()}>Get Location</button> 
  {/* Use a ternary operator to render different paragraphs based on the data state variable */}
  {data.length === 0 ? ( // Remove the data property
  <p>No results found for {address}</p>
) : data.error ? ( // Remove the data property
  <p style={{ color: "red" }}>{data.error}</p>
) : (
  // Render your data here
  <ul>
    {data.map((item) => ( // Remove the data property
      <li key={item.osm_id}>
        Latitude: <strong>{item.lat}</strong>, Longitude: <strong>{item.lon}</strong>
      </li>
    ))}
  </ul>
)}

</div>

        );
      }
      
}

export default App;
