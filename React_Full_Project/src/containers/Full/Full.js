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

// TODO: For authentication
import Page403 from '../../views/Pages/Page403/';

//var server = "http://13.59.251.84:8080";
var server = "http://127.0.0.1:8080";

class Full extends Component {
    constructor(props) {
        super(props);
        this.addToRecordLabels = this.addToRecordLabels.bind(this);
        this.addToEndTabLabels = this.addToEndTabLabels.bind(this);
        this.addToContainerReports = this.addToContainerReports.bind(this);
        this.flush = this.flush.bind(this);

        this.getFurtherAuthorization = this.getFurtherAuthorization.bind(this);
        this.state = {
            //recordLabels: [{id:1,test:"FOR TESTING"}, {id:2,test:"FOR TESTING"},{id:3,test:"FOR TESTING"}],
            recordLabels: [],
            //endTabLabels: [{id:1,test:"FOR TESTING"}, {id:2,test:"FOR TESTING"},{id:3,test:"FOR TESTING"}, {id:4,test:"FOR TESTING"},{id:5,test:"FOR TESTING"}, {id:6,test:"FOR TESTING"},{id:7,test:"FOR TESTING"}, {id:8,test:"FOR TESTING"}],
            endTabLabels: [],
            //containerReports: [{id:1,test:"FOR TESTING"},{id:2,test:"FOR TESTING"}],
            containerReports: [],
            colours: {},
            authorization:false,
            isAdmin: false,
            isRMC: false,
            isRegular: false
        };
    }

    componentWillMount() {
        var request = new XMLHttpRequest();
        request.open('GET', server + '/records/colours', false);
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

        //TODO: Paul's authentication Code

        this.getAuthorization();

    }


    getFurtherAuthorization() {
        return {authorization:this.state.authorization};
    }

    // TODO: disallow duplicates
    addToRecordLabels(data) {
        //console.log("this is running with data:" + data);

        for (var i = 0; i < data.length; i++) {
            var newState = Object.assign({}, this.state); // Clone the state obj in newState
            newState["recordLabels"].push(data[i]);             // modify newState
            this.setState(newState);
        }
    }

    addToEndTabLabels(data) {
        for (var i = 0; i < data.length; i++) {
            var newState = Object.assign({}, this.state);
            newState["endTabLabels"].push(data[i]);
            this.setState(newState);
        }
    }

    addToContainerReports(data) {
        console.log("this is running");
        for (var i = 0; i < data.length; i++) {
            var newState = Object.assign({}, this.state);
            newState["containerReports"].push(data[i]);
            this.setState(newState);
        }
    }

    flush() {
        this.setState({
            recordLabels: [],
            endTabLabels: [],
            containerReports: []
        });
        console.log("flush is running in full");
    }


    //TODO: Paul's Authentication Code




    getAuthorization() {
        var request = new XMLHttpRequest();
        request.open('GET', 'http://localhost:8080/users/authorization', false);
        request.setRequestHeader("Content-type", "application/json");
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                console.log("Authentication from Server:");
                console.log(JSON.parse(request.response));

                /*
                // TODO: For Testing Purpose
                //var testAuthorization = {results: 'Access Denied'};
                //var testAuthorization = {results: 'Administrator'};
                //var testAuthorization = {results: 'Records Management Clerk'};
                //var testAuthorization = {results: 'Regular User'};
                //console.log(testAuthorization);

                 if (testAuthorization.results == 'Access Denied') {
                 this.setState({
                 authorization: false
                 });
                 }
                 else {
                 this.setState({
                 authorization: true
                 });
                 }

                 //For admin:
                 if (testAuthorization.results == 'Administrator') {
                 this.setState({
                 isAdmin: true
                 });
                 }
                 else {
                 this.setState({
                 isAdmin: false
                 });
                 }

                 //For RMC:
                 if (testAuthorization.results == 'Records Management Clerk') {
                 this.setState({
                 isRMC: true
                 });
                 }
                 else {
                 this.setState({
                 isRMC: false
                 });
                 }

                 //For regular user:
                 if (testAuthorization.results == 'Regular User') {
                 this.setState({
                 isRegular: true
                 });
                 }
                 else {
                 this.setState({
                 isRegular: false
                 });
                 }
*/

                if (JSON.parse(request.response)['results'] == 'Access Denied') {
                    this.setState({
                        authorization: false
                    });
                }
                else {
                    this.setState({
                        authorization: true
                    });
                }

                //For admin:
                if (JSON.parse(request.response)['results'] == 'Administrator') {
                    this.setState({
                        isAdmin: true
                    });
                }
                else {
                    this.setState({
                        isAdmin: false
                    });
                }

                //For RMC:
                if (JSON.parse(request.response)['results'] == 'Records Management Clerk') {
                    this.setState({
                        isRMC: true
                    });
                }
                else {
                    this.setState({
                        isRMC: false
                    });
                }

                //For regular user:
                if (JSON.parse(request.response)['results'] == 'Regular User') {
                    this.setState({
                        isRegular: true
                    });
                }
                else {
                    this.setState({
                        isRegular: false
                    });
                }

            } else {
                console.error('Response received and there was an error');
            }
        }.bind(this);
        request.onerror = function () {
            //TODO: display error to user
            console.error('Request error for locationDropDown');
        };
        request.send(); //don't forget to send the httprequest lmao
    }

//<div>{this.props.authorization}</div>
//<Dashboard addToRecordLabels={this.addToRecordLabels} addToEndTabLabels={this.addToEndTabLabels} addToContainerReports={this.addToContainerReports} getFurtherAuthorization={this.getFurtherAuthorization}  />
    render() {

        if (this.state.authorization) {

            //This line is to check for asynchronous empty output

            var eliminateAsync = true;
            while (eliminateAsync) {
                if ((this.state.isAdmin == true || this.state.isAdmin == false)
                    && (this.state.isRMC == true || this.state.isRMC == false)
                    && (this.state.isRegular == true || this.state.isRegular == false)) {
                    eliminateAsync = false;
                    var getDashboard = <Route path="/dashboard" name="Dashboard"
                                              component={() => <Dashboard addToRecordLabels={this.addToRecordLabels}
                                                                          addToEndTabLabels={this.addToEndTabLabels}
                                                                          addToContainerReports={this.addToContainerReports}
                                                                          isAdmin = {this.state.isAdmin}
                                                                          isRMC = {this.state.isRMC}
                                                                            isRegular = {this.state.isRegular}/>}/>
                    break;
                } else {
                    eliminateAsync = true;
                    var getDashboard = null;
                }
            }

            return (
                <div className="app">
                    <Header />
                    <div className="app-body">
                        <Sidebar {...this.props}/>
                        <main className="main">
                            <Breadcrumb />
                            <Container fluid>
                                <Switch>
                                    {getDashboard}
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
                        {!this.state.isRegular?
                            <PrintQueue state={this.state} flush={this.flush}
                                        recordLabels={this.state.recordLabels}
                                        endTabLabels={this.state.endTabLabels}
                                        containerReports={this.state.containerReports}
                            /> : null
                        }
                    </div>
                    <Footer />
                </div>
            );
        }

        if (!this.state.authorization) {
            return (
                <div className="app">
                    <Header />
                    <div className="app-body">
                        <main className="main">
                            <Breadcrumb />
                            <Container fluid>
                                <Switch>
                                    <Route path="/403" name="Page403" component={Page403}/>
                                    <Redirect from="/" to="/403"/>
                                </Switch>
                            </Container>
                        </main>
                    </div>
                    <Footer />
                </div>
            );
        }
    }


}

export default Full;
