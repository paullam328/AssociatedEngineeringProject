import React, {Component} from "react";
import {Container, Row, Col, Button, Input, InputGroupAddon, InputGroup, InputGroupButton} from "reactstrap";

class Page403 extends Component {
  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              <div className="clearfix">
                <h1 className="float-left display-3 mr-4">403</h1>
                <h4 className="pt-3">Oops! You're lost.</h4>
                <p className="text-muted float-left">You have not been set up for this application.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Page403;
