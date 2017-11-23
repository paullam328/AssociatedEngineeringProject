import React, {Component} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import {Container} from 'reactstrap';
import Header from '../../components/Header/';
import Sidebar from '../../components/Sidebar/';
import Breadcrumb from '../../components/Breadcrumb/';
import Aside from '../../components/Aside/';
import Footer from '../../components/Footer/';
import Dashboard from '../../views/Dashboard/';
import Charts from '../../views/Charts/';
import Widgets from '../../views/Widgets/';
import Buttons from '../../views/Components/Buttons/';
import Cards from '../../views/Components/Cards/';
import Forms from '../../views/Components/Forms/';
import Modals from '../../views/Components/Modals/';
import SocialButtons from '../../views/Components/SocialButtons/';
import Switches from '../../views/Components/Switches/';
import Tables from '../../views/Components/Tables/';
import Tabs from '../../views/Components/Tabs/';
import FontAwesome from '../../views/Icons/FontAwesome/';
import SimpleLineIcons from '../../views/Icons/SimpleLineIcons/';
import PrintQueue from '../../components/PrintQueue/';

class Full extends Component {
    constructor(props) {
        super(props);
        this.addToRecordLabels = this.addToRecordLabels.bind(this);
        this.addToEndTabLabels = this.addToEndTabLabels.bind(this);
        this.addToContainerReports = this.addToContainerReports.bind(this);
        this.flush = this.flush.bind(this);
        this.state = {
            recordLabels: [{id:1,test:"FOR TESTING"}, {id:2,test:"FOR TESTING"}],
            endTabLabels: [{id:1,test:"FOR TESTING"}, {id:2,test:"FOR TESTING"},{id:3,test:"FOR TESTING"}, {id:4,test:"FOR TESTING"},{id:5,test:"FOR TESTING"}, {id:6,test:"FOR TESTING"},{id:7,test:"FOR TESTING"}, {id:8,test:"FOR TESTING"}],
            containerReports: [{id:1,test:"FOR TESTING"},{id:2,test:"FOR TESTING"}],
            colours: {}
        };
    }

    componentWillMount() {
        var request = new XMLHttpRequest();
        request.open('GET', 'http://127.0.0.1:8080/records/colours', false);
        request.setRequestHeader("Content-type", "application/json");
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                var results = JSON.parse(request.response)["results"];
                var tempdata = {};

                results.forEach((result) => {
                    tempdata[result.key] = result.colour;
                });
                tempdata["v"] = "faae25";
                var newState = Object.assign({}, this.state); // Clone the state obj in newState
                newState["colours"] = tempdata;
                this.setState(newState);


            } else {
                console.error('Response received and there was an error');
            }

        }.bind(this); //have to bind to the callback function so that it will callback properly

        request.send();
    }


    // TODO: disallow duplicates
    addToRecordLabels(data) {
        var newState = Object.assign({}, this.state); // Clone the state obj in newState
        newState["recordLabels"].push(data);             // modify newState
        this.setState(newState);
        //console.log(this.state);
    }

    addToEndTabLabels(data) {
        var newState = Object.assign({}, this.state);
        newState["endTabLabels"].push(data);
        this.setState(newState);
        //console.log(this.state);
    }

    addToContainerReports(data) {
        var newState = Object.assign({}, this.state);
        newState["containerReports"].push(data);
        this.setState(newState);
        //console.log(this.state);
    }

    flush() {
        this.setState({
            recordLabels: [],
            endTabLabels: [],
            containerReports: []
        });
    }

    render() {
        return (
            <div className="app">
                <Header />
                <div className="app-body">
                    <Sidebar {...this.props}/>
                    <main className="main">
                        <Breadcrumb />
                        <Container fluid>
                            <Switch>
                                <Route path="/dashboard" name="Dashboard" component={() => <Dashboard addToRecordLabels={this.addToRecordLabels} addToEndTabLabels={this.addToEndTabLabels} addToContainerReports={this.addToContainerReports}  />}/>
                                <Route path="/components/buttons" name="Buttons" component={Buttons}/>
                                <Route path="/components/cards" name="Cards" component={Cards}/>
                                <Route path="/components/forms" name="Forms" component={Forms}/>
                                <Route path="/components/modals" name="Modals" component={Modals}/>
                                <Route path="/components/social-buttons" name="Social Buttons" component={SocialButtons}/>
                                <Route path="/components/switches" name="Swithces" component={Switches}/>
                                <Route path="/components/tables" name="Tables" component={Tables}/>
                                <Route path="/components/tabs" name="Tabs" component={Tabs}/>
                                <Route path="/icons/font-awesome" name="Font Awesome" component={FontAwesome}/>
                                <Route path="/icons/simple-line-icons" name="Simple Line Icons" component={SimpleLineIcons}/>
                                <Route path="/widgets" name="Widgets" component={Widgets}/>
                                <Route path="/charts" name="Charts" component={Charts}/>
                                <Redirect from="/" to="/dashboard"/>
                            </Switch>
                        </Container>
                    </main>
                    <PrintQueue state={this.state} flush={this.flush}/>
                </div>
                <Footer />
            </div>
        );
    }
}

export default Full;