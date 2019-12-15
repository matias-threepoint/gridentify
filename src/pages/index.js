import React from "react"
import Layout from "../components/layout"
import "bootstrap/dist/css/bootstrap.min.css"
import "./index.css"
import Grid from "../components/grid/grid"
import Score from "../components/score"
import Intro from "../components/intro"
import ScoreFeed from "../components/score_feed"
import socketIOClient from "socket.io-client"
import Container from "react-bootstrap/Container"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import { isMobile } from "react-device-detect"
import Swal from "sweetalert2"

const GRID_SIZE = 5

class IndexPage extends React.Component {
  score = null
  score_feed = null
  alert_username = true
  constructor(props) {
    super(props)
    this.state = {
      endpoint: process.env.BACKEND_ENDPOINT,
      username: "username",
      connected: false,
    }
    this.send_score = () => {}
  }
  componentDidMount = () => {
    Swal.fire({
      title: "Choose a nick",
      input: "text",

      inputAttributes: {
        maxlength: 20,
      },
      inputValidator: value => {
        return new Promise(resolve => {
          if (value.length > 0) {
            resolve()
          } else {
            resolve("Your nick can't be empty!")
          }
        })
      },
    }).then(nick => {
      this.setState({
        endpoint: this.state.endpoint,
        username: nick.value,
        connected: this.state.connected,
      })
    })
    const socket = socketIOClient(this.state.endpoint)
    socket.on("connect", () => {
      this.setConnected(true)
    })
    socket.on("disconnect", () => {
      this.setConnected(false)
    })
    socket.on("score", data => {
      this.setConnected(true)
      this.receive_score(data)
    })
    socket.on("record", data => {
      this.setConnected(true)
      this.receive_record(data)
    })
    this.send_score = input => {
      const data = {
        score: this.score.state.value,
        username: this.state.username,
        initial_state: input.initial_state,
        moves: input.moves,
        seed: input.seed,
      }
      socket.emit("score", data)
    }
  }
  setConnected(value) {
    this.setState({
      endpoint: this.state.endpoint,
      username: this.state.username,
      connected: value,
    })
  }
  receive_score(data) {
    this.score_feed.new_score(data)
  }
  receive_record(data) {
    this.score_feed.update_records(data)
  }
  increase_score(score) {
    if (this.score == null) {
      return Promise(1)
    } else {
      return this.score.add_score(score)
    }
  }
  render() {
    return (
      <Layout>
        <Container id="main_container" className="pt-5">
          <Intro />
          <Row id="grid_row">
            <Col style={{ textAlign: "center" }}>
              <div className="grid">
                <Grid grid_size={GRID_SIZE} parent={this} />
              </div>
              <Score
                ref={b => {
                  this.score = b
                }}
              />
            </Col>
          </Row>
          <Row>
            <ScoreFeed
              ref={b => {
                this.score_feed = b
              }}
              connected={this.state.connected}
            />
          </Row>
          <footer class="mt-5 mb-4 text-center" style={{ width: "100%" }}>
            This site uses cookies. Learn more.
          </footer>
        </Container>
      </Layout>
    )
  }
}

export default IndexPage
