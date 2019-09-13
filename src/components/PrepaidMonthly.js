// import React, { Component } from "react";
// import axios from "axios";
// import "../styles/normalize.css";
// import "../styles/barebones.css";
// import "../styles/styles.css";

// export default class PrepaidMonthly extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       apiKey: "",
//       workspaces: [],
//       workspace: "",
//       clients: []
//     };
//   }
//   getWorkspaces = () => {
//     axios
//       .get(
//         "https://cors-anywhere.herokuapp.com/https://www.toggl.com/api/v8/workspaces",
//         {
//           headers: {
//             Authorization: "Basic " + btoa(this.state.apiKey + ":api_token"),
//             "Content-Type": "application/json"
//           }
//         }
//       )
//       .then(res => {
//         const workspaces = res.data;
//         this.saveState("workspaces", workspaces);
//       });

//     axios
//       .get(
//         "https://cors-anywhere.herokuapp.com/https://www.toggl.com/api/v8/me",
//         {
//           headers: {
//             Authorization: "Basic " + btoa(this.state.apiKey + ":api_token"),
//             "Content-Type": "application/json"
//           }
//         }
//       )
//       .then(user => {
//         console.log(user);
//         const workspace = user.data.data.default_wid;
//         this.saveState("workspace", workspace);
//       });
//   };
//   getClients = () => {
//     axios
//       .get(
//         `https://www.toggl.com/api/v8/workspaces/${this.state.workspace}/clients`,
//         {
//           headers: {
//             Authorization: "Basic " + btoa(this.state.apiKey + ":api_token"),
//             "Content-Type": "application/json"
//           }
//         }
//       )
//       .then(res => {
//         let clients = res.data;
//         clients.sort((a, b) => {
//           if (a.name < b.name) {
//             return -1;
//           } else {
//             return 1;
//           }
//         });
//         // get billable $ per client and save into array
//         this.saveState("clients", clients);
//       });
//   };
//   saveApiKey = e => {
//     this.saveState("apiKey", e.target.value);
//   };
//   saveState = (key, value) => {
//     this.setState({ [key]: value });
//     localStorage.setItem(key, JSON.stringify(value));
//   };
//   getStateFromLocal = () => {
//     let localState = {};
//     for (let key in this.state) {
//       if (localStorage.getItem(key)) {
//         let value = localStorage.getItem(key);
//         if (value[0] == "[") {
//           value = JSON.parse(value);
//         }
//         localState[key] = value;
//       }
//     }
//     this.setState(localState);    
//     if(this.state.apiKey && this.state.workspace) {
//       this.getClients();
//     }
//   };
//   componentDidUpdate(_, prevState) {
//     if (prevState.apiKey != this.state.apiKey) {
//       this.getWorkspaces();
//     }
//   }
//   componentDidMount() {
//     this.getStateFromLocal();
//   }
//   render() {
//     return (
//       <div className="container">
//         <h1>Toggl API experiments!</h1>
//         <div className="grid-container halves">
//           <div>
//             <label for="apiKey">API key</label>
//             <input
//               id="apiKey"
//               className="u-full-width"
//               type="text"
//               value={this.state.apiKey}
//               onChange={this.saveApiKey}
//             />
//           </div>
//           <div>
//             <label for="workspace">Workspace</label>
//             <select class="u-full-width" id="exampleRecipientInput" value={this.state.workspace}>
//               {this.state.workspaces &&
//                 this.state.workspaces.map((ws, id) => (
//                   <option
//                     value={id}
//                   >
//                     {ws.name}
//                   </option>
//                 ))}
//             </select>
//           </div>
//         </div>
//         <div>
//           <h2>Prepaid clients</h2>
//           <button onClick={this.getClients}>Fetch client data</button>
//           <table class="u-full-width">
//             <thead>
//               <tr>
//                 <th>Client</th>
//                 <th>$ Paid</th>
//                 <th>$ Spent</th>
//                 <th>$ Remaining</th>
//               </tr>
//             </thead>
//             <tbody>
//               {this.state.clients &&
//                 this.state.clients.map((client, id) => (
//                   <tr>
//                     <td>{client.name}</td>
//                     <td>TBC</td>
//                     <td>TBC</td>
//                     <td>TBC</td>
//                   </tr>
//                 ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   }
// }
