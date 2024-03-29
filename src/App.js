import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import InputForm from "./components/InputForm/InputForm";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import Rank from "./components/Rank/Rank";
import Particles from "react-tsparticles";
import { Component } from "react/cjs/react.production.min";

const particleOptions = {
  fpsLimit: 80,
  particles: {
    color: {
      value: "#ffffff",
    },
    links: {
      color: "#ffffff",
      distance: 150,
      enable: true,
      opacity: 0.4,
      width: 1,
    },
    collisions: {
      enable: false,
    },
    move: {
      direction: "none",
      enable: true,
      outMode: "bounce",
      random: false,
      speed: 1,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 700,
      },
      value: 60,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: "circle",
    },
    size: {
      random: true,
      value: 2,
    },
  },
  detectRetina: true,
};

const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: "signIn",
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  },
};
class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    });
  };

  calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const faceImage = document.getElementById("inputimage");
    const width = Number(faceImage.width);
    const height = Number(faceImage.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  displayBox = (box) => {
    this.setState({ box: box });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    fetch(`${endpoint}/imageurl`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageurl: this.state.input }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response) {
          fetch(`${endpoint}/image`, {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: this.state.user.id }),
          })
            .then((response) => response.json())
            .then((count) => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            })
            .catch(console.log);
        }
        this.displayBox(this.calculateFaceLocation(response));
      })
      .catch((err) => console.log(err));
  };

  onRouteChange = (route) => {
    if (route === "home") {
      this.setState({ isSignedIn: true, route: "home" });
    } else if (route === "signOut") {
      this.setState(initialState);
    } else {
      this.setState({ route: route });
    }
  };

  render() {
    console.log("app", this.state.user);
    return (
      <div className="App">
        <Navigation
          onRouteChange={this.onRouteChange}
          isSignedIn={this.state.isSignedIn}
        />
        <Particles className="particles" options={particleOptions} />
        {this.state.route === "home" ? (
          <div>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <InputForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition
              imageUrl={this.state.imageUrl}
              box={this.state.box}
            />
          </div>
        ) : this.state.route === "signIn" ? (
          <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
        ) : (
          <Register
            onRouteChange={this.onRouteChange}
            loadUser={this.loadUser}
          />
        )}
      </div>
    );
  }
}

export default App;
export const endpoint = 'https://face-recognition-server-3x5o.onrender.com';
